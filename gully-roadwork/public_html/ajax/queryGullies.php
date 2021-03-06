<?php
ini_set("memory_limit","-1");

$dbhost = 'localhost';  
$dbname = 'demo';

// Get AJAX parameters
$collection = $_POST['collection'];
$query = $_POST['query'];

// MongoDB Initialization
try {
	$m = new MongoClient("mongodb://$dbhost"); // connect to mongo
} catch (MongoConnectionException $e) {
	die('Error connecting to MongoDB server');
}
$db = $m->$dbname;
$dbCollection = $db->$collection;

// Query MongoDB
if ($query==""){
    $cursor = $db->$collection->find(array(), array("_id"=>0,"la" => 1, "ln" => 1,"si" => 1));
}else{
	$query_decoded = json_decode($query);
    $cursor = $db->$collection->find($query_decoded, array("_id"=>0,"la" => 1, "ln" => 1,"si" => 1));
}
$queryArray= array("query"=>$query);
$resultsArray=array("results"=>iterator_to_array($cursor));
$results= json_encode(array_merge($queryArray, $resultsArray));
echo $results;
?>