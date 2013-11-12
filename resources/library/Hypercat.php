<?php
/*
 * Client Binding for the Interop API (Hypercat)
 */

// Check for following extensions, the Hypercat client won't function without them
if (! function_exists('json_decode')) {
  throw new Exception('Hypercat PHP API Client requires the JSON PHP extension');
}
if (! function_exists('http_build_query')) {
  throw new Exception('Hypercat PHP API Client requires http_build_query()');
}

class Hypercat {
  private $key = null;
  private $baseUrl = null;
  private $catalogueUri = null;
  private $fullCatalogueUrl = null;
  public $response_info;

  public function __construct($config= array()){
    $this->setKey($config["key"]);
    $this->setCatalogueUri($config["catalogueUri"]);
    $this->setBaseUrl($config["baseUrl"]);
    $this->setFullCatalogueUrl($this->baseUrl.$this->catalogueUri);      
  }

  /************************************ Getters and Setters *****************************/
  public function getKey(){
    return $this->key;
  }

  public function getBaseUrl(){
    return $this->baseUrl;
  }

  public function getCatalogueUri(){
    return $this->catalogueUri;
  }

  public function getFullCatalogueUrl(){
    return $this->fullCatalogueUrl;
  }

  public function setKey($key){
    $this->key=$key;
  }

  public function setBaseUrl($baseUrl){
    $this->baseUrl=$baseUrl;
  }

  public function setCatalogueUri($catalogueUri){
    $this->catalogueUri=$catalogueUri;
  }

  public function setFullCatalogueUrl($fullUrl){
    $this->fullCatalogueUrl=$fullUrl;
  }

  /****************************** Hypercat Client API Methods *****************************/

  /**
   * Get the JSON response of a target Catalogue
   * @param int $offset
   * @param int $limit
   * @return string JSON
   */
  public function getCatalogue ($offset, $limit) {
    $requestUrl="";
    $param= array(
      "offset"=>$offset,
      "limit"=>$limit
    );
    $query= http_build_query($param);
    $requestUrl=$this->getFullCatalogueUrl()."?".$query;
    $data=null;
    $key = $this->getKey();
    $response=$this->processHTTPRequest("GET",$requestUrl, $data, $key);
    // $this->checkHTTPcode(200);

    //log outputs
    // $this->logOutput("Request url: ".$requestUrl);
    // $this->logOutput("Response: ".$response);
    $json = json_decode($response, true);
    return $response;
  }

  /**
   * Get the JSON response by searching for a catalogue
   * @param string array $params (search parameters can only be "rel", "val", "href")
   * @param int $offset
   * @param int $limit
   * @return string JSON
   */
  public function searchCatalogue ($searchParams, $offset, $limit) {
  // public function searchCatalogue ($catalogue, $rel, $val, $href, $offset, $limit) {
    $offset= array(
      "offset"=>$offset,
      "limit"=>$limit
    );
    $param = array_merge($searchParams, $offset);
    $query= http_build_query($param);
    $requestUrl=$this->getFullCatalogueUrl()."?".$query;
    echo "request url: ".$requestUrl."\n";
    $data=null;
    $key = $this->getKey();
    $response=$this->processHTTPRequest("GET",$requestUrl, $data, $key);
    // $this->checkHTTPcode(200);
    
    //log outputs
    // $this->logOutput("Request url: ".$requestUrl);
    // $this->logOutput("Response: ".$response);
    $json = json_decode($response, true);
    return $json;
  }

  /**
   * Update an existing catalogue item
   * @param string $itemUri
   * @param string $item (JSON)
   * @return string JSON(optional)
   */
  public function updateItem ($itemUri, $item) {
    $param= array(
      "href"=>$itemUri
    );
    $query= http_build_query($param);
    $requestUrl=$this->getFullCatalogueUrl()."?".$query;
    $data=$item;
    $key = $this->getKey();
    $response=$this->processHTTPRequest("PUT",$requestUrl, $data, $key);
    // $this->checkHTTPcode(200);
    $json = json_decode($response, true);
    return $json;
  }

  /**
   * Insert new catalogue item
   * @param string $itemUri
   * @param string $item (JSON)
   */
  public function insertItem ($item) {
    //POST request
    //success: return HTTP location header with url of catalogue where its added
    $requestUrl=$this->getFullCatalogueUrl();
    $data=$item;
    $key = $this->getKey();
    $response=$this->processHTTPRequest("POST",$requestUrl, $item, $key);
    // $this->checkHTTPcode(201);
    //TODO: return HTTP location header with url of catalogue
  }

  /**
   * Delete an existing catalogue item
   * @param string $itemUri
   */
  public function deleteItem ($itemUri) {
    $param= array(
      "href"=>$itemUri
    );
    $query= http_build_query($param);
    $data=null;
    $key = $this->getKey();
    $requestUrl=$this->getFullCatalogueUrl()."?".$query;
    $response=$this->processHTTPRequest("DELETE",$requestUrl, $data, $key);
    // $this->checkHTTPcode(200);
  }

  /**
   * cURL Request
   * @param  string $requestType (GET, POST, PUT, or DELETE)
   * @param string $url 
   * @param string JSON $data
   * @return string JSON
   */
  private function processHTTPRequest($requestType, $url, $data=null, $key=null){
    // Clear response_info
    $this->response_info = array();
    // Initialise cURL
    $ch = curl_init();
    //set url
    curl_setopt($ch, CURLOPT_URL, $url);
    //Allows results to be saved in variable and not printed out
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);

    if ($requestType == "DELETE")
      curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
    if ($requestType != "GET" and $data!=null){
      //'Postfields' for POST or PUT requests
      curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $requestType);
      curl_setopt($ch, CURLOPT_HTTPHEADER, array("Content-Type: application/json")); 
      curl_setopt($ch, CURLOPT_POST, TRUE);
      curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    }
    //set Key in request header if not null
    if ($key!=null){
      if (base64_decode($key,true))
        $headerRel="Aurthorization";
      else
        $headerRel="x-api-key";
      curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        $headerRel.': '.$key,
      ));
    }
    $response = curl_exec($ch);
    $response_info = curl_getinfo($ch);
    // $this->logOutput("Response Info: ".$response_info);
    curl_close($ch);
    return $response;
  }

  /**
   * Helper function to check HTTP response code
   */
  private function checkHTTPcode($expected_http_code){
    if ( $this->response_info['http_code'] != $expected_http_code )
      echo "http code: ".$this->response_info['http_code'];
      throw new Exception('Error: Unexpected HTTP Code '.$this->response_info['http_code'].' is returned!');
  }
  /**
   * Log outputs to an external file
   */
  private function logOutput($content){
    error_log($content."\n", 3, "../log/output.log");
  }
}
?>
