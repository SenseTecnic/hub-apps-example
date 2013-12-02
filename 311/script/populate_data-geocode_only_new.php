<?php

include "case311.php";

// Connect to mongodb
$dbhost = 'localhost';  
$dbname = '311';
$geocodeCollection = 'geocode';
$caseCollection = 'case';

// Parse CSV file 
$file="";
if (isset($argv[1]))
   $file = (string)$argv[1]; // use the command line argument for file name
else
	die("Error: Please provide file name as command argument.\n");
$fp = fopen($file,'r') or die("Can not open file! \n");

// MongoDB Initialization
$db = initialise_db($dbhost, $dbname);

$count=0;
while($csvline = fgetcsv($fp,1024)) {
    $count++;
   	$case = new case311($csvline);
    if ($count!=1){
    	echo $count,": ";
        geocode($db->$geocodeCollection, $case);
    }
}
fclose($fp) or die("can not close file");

function geocode ($dbCollection, $case){
    $address = $case->getAddress();
    $region = $case->getRegion();
    // check if address is in mongo
    $query = array("address"=> $address);
    $cursor = $dbCollection->find($query);
    if ($cursor->count()==0){
    	echo $address,"\n";
    	echo "No address record in db, create new item... \n";
    	$geocode = $case->createGeocodeDBObj("1", "2");
            var_dump($geocode);
        $result= makeGoogleGeocodeAPICall($address);
        if (array_key_exists('error_message', $result)){
            die("Status: ".$result["status"].": ".$result["error_message"]);
        }else{
            $lat = $result['results'][0]['geometry']["location"]["lat"]."\n";
            $lng = $result['results'][0]['geometry']["location"]["lng"]."\n";
            // Insert to Mongodb
            $geocode = $case->createGeocodeDBObj($lat, $lng);
            var_dump($geocode);
            $dbCollection->insert($geocode);
        }
        sleep(1); // Sleep for a sec to avoid passing rate limit
    }else{
    	echo "This address already exists. \n";
    }
   
}

function initialise_db ($dbhost, $dbname){
	try {
	    $m = new Mongo("mongodb://$dbhost"); // connect to mongo
	    echo "Connected to MongoDB.\n";
	} catch (MongoConnectionException $e) {
	    die('Error connecting to MongoDB server');
	}
	return $m->$dbname;;
}

function makeGoogleGeocodeAPICall($address){
	$param= array(
          "address"=>$address,
          "sensor"=>'false'
    );
    $query= http_build_query($param);
    $url="http://maps.googleapis.com/maps/api/geocode/json"."?".$query;
    $url = str_replace('%00','',$url);
    echo "url: ".$url."\n";
    $response = curl($url);
    return json_decode($response, true);
}

function curl ($url){
    // Initialise cURL
    $ch = curl_init();
    //set url
    curl_setopt($ch, CURLOPT_URL, $url);
    $ip = "127.0.0.1";
    curl_setopt( $ch, CURLOPT_HTTPHEADER, array("REMOTE_ADDR: $ip", "HTTP_X_FORWARDED_FOR: $ip"));

    //Allows results to be saved in variable and not printed out
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
    $response = curl_exec($ch);
    curl_close($ch);
    return $response;
}
//TODO: end script if catch exception
//should i store the postal code as well? full address?
?>