<?php

include "case311.php";

// Connect to mongodb
$dbhost = 'localhost';  
$dbname = '311';
$geocodeCollection = 'geocode';
$caseCollection = 'case';

set_error_handler('errHandle');
// Parse CSV file 
$file="";
$row=2;
if (isset($argv[1]))
   $file = (string)$argv[1]; // use the command line argument for file name
else
	die("Error: Please provide file name as command argument.\n");
if (isset($argv[2])){
	if (is_numeric($argv[2]))
   		$row = (int)$argv[2]; // use the command line argument for file name
   	else
   		die("Error: Please provide an integer starting row number.\n");
}

$fp = fopen($file,'r') or die("Can not open file! \n");

// MongoDB Initialization
$db = initialise_db($dbhost, $dbname);

$count=0;
while($csvline = fgetcsv($fp,1024)) {
    $count++;
   	$case = new case311($csvline);
    if ($count>=$row){
    	echo $count,": ";
        geocode($db->$geocodeCollection, $case); // geocode 
        populate($db->$caseCollection, $case); // populate 311 case data into db
    }
    //TODO: gracefully detect end of file
}
fclose($fp) or die("can not close file");

function populate ($dbCollection, $case){ 

	// TODO: check for dup?
	// get db obj
	$caseobj= $case->createCaseDBObj();
	if (isset($caseobj["geo"])){
		echo "CASE: \n";
		var_dump($caseobj);
		// insert into Mongo 
		$dbCollection->insert($caseobj);
	}else{
		die ("This record does not contain geocode information.");
	}
	// sleep(10);
}


function geocode ($dbCollection, $case){
    $address = $case->getAddress();
    $region = $case->getRegion();
    echo $address,"\n";
    // check if address is in mongo
    $query = array("address"=> $address);
    $cursor = $dbCollection->findOne($query);
    if (count($cursor)==0){
    	echo "No address record in db, create new item... \n";
        $result= makeGoogleGeocodeAPICall($address);
        if (array_key_exists('error_message', $result)){
            die("Status: ".$result["status"].": ".$result["error_message"]);
        }else{
            $lat = $result['results'][0]['geometry']["location"]["lat"]."\n";
            $lng = $result['results'][0]['geometry']["location"]["lng"]."\n";
            // Insert to Mongodb
            $geocode = $case->createGeocodeDBObj($lat, $lng);
            // var_dump($geocode);
            $dbCollection->insert($geocode); // enable it later!!!!
        }
        sleep(1); // Sleep for a sec to avoid passing rate limit
    }else{
    	echo "This address already exists. \n";
    	// var_dump($cursor);
    	//query mongodb for geo object
    	$case->setGeo($cursor["geo"]);
    	var_dump($case->getGeo());
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
    //Allows results to be saved in variable and not printed out
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
    $response = curl_exec($ch);
    curl_close($ch);
    return $response;
}

// End script if catch exceptions/notices
function errHandle($errNo, $errStr, $errFile, $errLine) {
    $msg = "$errStr in $errFile on line $errLine";
    if ($errNo == E_NOTICE || $errNo == E_WARNING) {
        throw new ErrorException($msg, $errNo);
    } else {
        echo $msg;
    }
}
//should i store the postal code as well? full address?
?>