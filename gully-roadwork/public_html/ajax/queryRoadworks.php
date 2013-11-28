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
    $cursor = $db->$collection->find()->limit(10000); //set limit on results to return
}else{
	$query_decoded = json_decode($query);
    $cursor = $db->$collection->find($query_decoded);
}
$queryArray= array("query"=>$query);
$resultsArray=array("results"=>iterator_to_array($cursor));
$results= json_encode(array_merge($queryArray, $resultsArray));
echo $results;
?>