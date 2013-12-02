<?php

/*
	Config file to be included in the application.
*/

$config = array(
	"mongo" => array(
		"dbname" => "demo",
		"dbhost" => "localhost",
		"collection" => "gully"
	),
	"hypercat-api" => array(
		"api_key" => "f9c0e0b7-8c4a-4f32-bf9c-7a7fac849659",
		"base_url" => "http://smartstreets.sensetecnic.com",
		"catalogue_url" => "/cat/sensors",
	)
);


/*
	Error reporting.
*/
ini_set("error_reporting", "true");
error_reporting(E_ALL|E_STRCT);

?>