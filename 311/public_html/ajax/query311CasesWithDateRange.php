<?php
ini_set("memory_limit","-1");

$dbhost = 'localhost';  
$dbname = '311';

// Get AJAX parameters
$collection = $_POST['collection'];
$query = $_POST['query'];
$type = $_POST['type'];

// MongoDB Initialization
try {
	$m = new Mongo("mongodb://$dbhost"); // connect to mongo
} catch (MongoConnectionException $e) {
	die('Error connecting to MongoDB server');
}
$db = $m->$dbname;
$dbCollection = $db->$collection;

if ($type=="find"){
	// Query MongoDB
	$query_decoded = json_decode($query, true);

	$timeRangeArray=Array();
    foreach($query as $key=>$val){
        if($key=="tf_recordedtime"){
            foreach($val as $val_key=>$val_val){
                $timeRangeArray[$val_key]=new MongoDate(strtotime($val_val));
            }
        }
        if ($key=="region"){
            $region=$val;
        }
   	}
        $queryArray = array(
            'tf_recordedtime' => $timeRangeArray,
            'region'=> $region
        );


	$cursor = $db->$collection->find($query_decoded);
	$queryArray= array("query"=>$query);
	$resultsArray=array("results"=>iterator_to_array($cursor));
	$results= json_encode(array_merge($queryArray, $resultsArray));
	echo $results;

}else{
	// Query MongoDB
	if ($query==""){
	    $count = $db->$collection->count(); //set limit on results to return
	}else{
		$query_decoded = json_decode($query, true);
	    $count = $db->$collection->count($query_decoded);
	}
	echo $count;
}


?>