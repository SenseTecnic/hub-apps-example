<?php

$dbhost = 'localhost';  
$dbname = '311';

// Get AJAX parameters
$collection = $_POST['collection'];
$field = $_POST['field'];
$query = $_POST['query']; //must be array

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
    $cursor = $db->$collection->distinct($field);
}else{
	$query_decoded = json_decode($query, true);
    $cursor = $db->$collection->distinct($field, $query_decoded);
}

$resultsArray=$cursor;
$results= json_encode($resultsArray);
echo $results;
?>