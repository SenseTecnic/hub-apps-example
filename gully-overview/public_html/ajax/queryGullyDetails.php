<?php
ini_set("memory_limit","-1");

$dbhost = 'localhost';  
$dbname = 'demo';

// Get AJAX parameters
$collection = $_POST['collection'];
$query = $_POST['query'];

// MongoDB Initialization
try {
	$m = new Mongo("mongodb://$dbhost"); // connect to mongo
} catch (MongoConnectionException $e) {
	die('Error connecting to MongoDB server');
}
$db = $m->$dbname;
$dbCollection = $db->$collection;

// Query MongoDB
$query_decoded = json_decode($query);
$cursor = $db->$collection->find($query_decoded)->limit(1);
$results= json_encode(iterator_to_array($cursor));
echo $results;
?>
