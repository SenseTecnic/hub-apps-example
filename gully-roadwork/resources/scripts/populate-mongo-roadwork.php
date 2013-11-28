<?php
include "../library/Hypercat.php"; // Hypercat PHP Client API
include "../library/RoadworkSensor.php"; // Roadwork Sensor Class
include "../config.php"; // Config file

//MongoDB Config Variables 
$dbhost= $config["mongo"]["dbhost"];
$dbname = $config["mongo"]["dbname"];
$collection = "roadwork";


// Hypercat API Config Variables 
$api_key= $config["hypercat-api"]["api_key"];
$base_url = $config["hypercat-api"]["base_url"];
$catalogue_uri = $config["hypercat-api"]["catalogue_url"];

// Initialise MongoDB connection
try {
	$m = new MongoClient("mongodb://$dbhost");
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
    "val"=> "roadworks"
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
			$roadwork = new RoadworkSensor($response, $lastupdate);
			$lat = abs((float)$roadwork->getLat());
			$lng = abs((float)$roadwork->getLng());
			if (($lat>=0 &&$lat <=90)&&($lng>=0 &&$lng <=180))
				$collection->insert($roadwork->create_db_object());
			else
				print_r("Out of this world coor!!!! \n ");
		}else{
			foreach ($cursor as $doc) {
				if ($doc["lastupdate"]==$lastupdate)
					print_r ("Sensor has not been updated since last check. \n");
				else{
					print_r ("Updated Roadwork Sensor!\n");
					// Update existing item in MongoDB
					$response=curl_with_authentication($data_href, $api_key);
					$roadwork = new RoadworkSensor($response, $lastupdate);
					$lat = abs((float)$roadwork->getLat());
					$lng = abs((float)$roadwork->getLng());
					if (($lat>=0 &&$lat <=90)&&($lng>=0 &&$lng <=180))
						$collection->update($query, array('$set'=>$roadwork->create_db_object()));
					else
						print_r("Out of this world coor!!!! \n ");
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