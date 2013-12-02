<?php
/**
 * Example server side script to connect to MongoDB and populate it 
 * with gully sensor data from Smart Streets Hub using the Hypercat API 
 * and MongoDB PHP Driver. 
 *
 * The Hypercat API can be found on Github, please visit: 
 * https://github.com/SenseTecnic/hypercat-php
 *
 * For MongoDB PHP Driver Documentations, please visit:
 * http://php.net/mongo/
 * 
 * Schedule a CRON job to execute this script to update data frequently.
 * For more information about setting up CRON jobs, please see the README file.
 **/
include "../library/Hypercat.php"; // Hypercat PHP Client API
include "../library/GullySensor.php"; // Gully Sensor Class
include "../config.php"; // Config file

//MongoDB Config Variables 
$dbhost= $config["mongo"]["dbhost"];
$dbname = $config["mongo"]["dbname"];
$collection = $config["mongo"]["collection"];


// Hypercat API Config Variables 
$api_key= $config["hypercat-api"]["api_key"];
$base_url = $config["hypercat-api"]["base_url"];
$catalogue_uri = $config["hypercat-api"]["catalogue_url"];

// Initialise MongoDB connection
try {
	$m = new Mongo("mongodb://$dbhost");
} catch (MongoConnectionException $e) {
	die('Error connecting to MongoDB server.');
}
$db = $m->$dbname;
$collection = $db->$collection;

/*** Retrieve gully data via Hypercat API PHP client ***/
$config = array("key"=> $api_key,
         "baseUrl"=> $base_url,
         "catalogueUri"=> $catalogue_uri
        );
$client = new Hypercat($config);
// Set Simple Search parameters
$param=array(
	"rel"=> "urn:X-smartstreets:rels:tags",
    "val"=> "Gully"
);
$offset = 0; // Set paging offset
$limit = 10; // Set paging limit

$finish=false;
do{
	$results = $client->searchCatalogue($param, $offset, $limit); 
	foreach($results['items'] as $item) {
		$sensor_id=null;
		$lastupdate=null;
		$data_href=null;
		foreach ($item["i-object-metadata"] as $metadata){
			if ($metadata["rel"]=="urn:X-smartstreets:rels:hasId"){
				$sensor_id= $metadata["val"];
			}
			if ($metadata["rel"]=="urn:X-smartstreets:rels:lastUpdate"){
				$lastupdate= $metadata["val"];
			}
			if ($metadata["rel"]=="urn:X-smartstreets:rels:data"){
				$data_href= $metadata["val"];
			}
		}
		// Query Mongo to see if item with sensor ID already exists
		$query = array("sensorid"=> (int)$sensor_id);
		$cursor = $collection->find($query);
		
		if ($cursor->count()==0){
			print_r ("Created new Sensor item! New sensor Id: ".$sensor_id."\n");
			$response=curl_with_authentication($data_href, $api_key);
			// Insert new item to MongoDB
			$gully = new GullySensor($response, $lastupdate);
			$collection->insert($gully->create_db_object());
		}else{
			foreach ($cursor as $doc) {
				if ($doc["lastupdate"]==$lastupdate)
					print_r ("Sensor has not been updated since last check. \n");
				else{
					print_r ("Updated Sensor!\n");
					// Update existing item in MongoDB
					$response=curl_with_authentication($data_href, $api_key);
					$gully = new GullySensor($response, $lastupdate);
					$collection->update($query, array('$set'=>$gully->create_db_object()));
				}
			}
		}
	}
	$offset+=$limit; // Increment paging offset
	// Finish loop when reaching end of all sensor results
	if (count($results['items'])==0)
		$finish=true;
}while(!$finish);

function curl_with_authentication ($url, $key){
	// Initialise cURL
    $ch = curl_init();
    //set url
    curl_setopt($ch, CURLOPT_URL, $url);
    //Allows results to be saved in variable and not printed out
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
    if (base64_decode($key,true))
    	$headerRel="Aurthorization";
    else
        $headerRel="x-api-key";
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        	$headerRel.': '.$key,
      	));
    $response = curl_exec($ch);
    curl_close($ch);
    return $response;
}
?>