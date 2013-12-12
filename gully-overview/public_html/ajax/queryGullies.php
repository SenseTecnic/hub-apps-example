<?php
ini_set("memory_limit","-1");

$dbhost = 'localhost';  
$dbname = 'demo';

// Get AJAX parameters
$collection = $_POST['collection'];
$query = $_POST['query'];
$limit = $_POST['limit'];
$offset = $_POST['offset'];

// MongoDB Initialization
try {
	$m = new Mongo("mongodb://$dbhost"); // connect to mongo
} catch (MongoConnectionException $e) {
	die('Error connecting to MongoDB server');
}
$db = $m->$dbname;
$dbCollection = $db->$collection;

// Query MongoDB
if ($query==""){
    $cursor = $db->$collection->find(array(), array("_id" => 0, "gullyid" => 0,"access"=>0, "lastupdate"=>0, "name"=>0, "timestamp"=>0, "geo"=>0))->skip((float)$offset)->limit((float)$limit); //set limit on results to return
}else{
	$query_decoded = json_decode($query);
    $cursor = $db->$collection->find($query_decoded, array("_id" => 0, "gullyid" => 0,"access"=>0, "lastupdate"=>0, "name"=>0, "timestamp"=>0, "geo"=>0))->skip((float)$offset)->limit((float)$limit);
}
$queryArray= array("query"=>$query);
$newOffset = (float)$offset+(float)$limit;
$offsetArray= array("newOffset"=>$newOffset);
$limitArray = array("limit"=>(float)$limit);
$resultsArray=array("results"=>iterator_to_array($cursor));
$results= json_encode(array_merge($queryArray, $limitArray, $offsetArray, $resultsArray));
echo $results;
?>
