<?php
/**
 * Class file for Gully Sensor
 *
 * This class creates a new Gully Sensor object that can be
 * populated into MongoDB. 
 *
 **/
class GullySensor {

	//class variables
	private $sensorid=null;
	private $gullyid=null;
	private $timestamp=null;
	private $sensorname=null;
	private $gullytype=null;
	private $gullystate=null;
	private $lat= null;
	private $lng= null;
	private $siltlevel= null;
	private $accessibility = null;
	private $lastupdate=null;

  	public function __construct($data, $lastupdate){
  		$this->lastupdate=$lastupdate;
  		$decoded_object=json_decode($data, true);
  		
  		foreach($decoded_object["data"][0] as $key=>$value){
        $key = strtolower($key);
		  if(strpos($key, "silt")!==false){
		    $this->siltlevel= $value;
		  }
		  if(strpos($key, "state")!==false){//state
		  	if (strtolower($value) =="clean and running")
                $this->gullystate= "Clean & Running";
            else if (strtolower($value)=="blocked and cleaned")
                $this->gullystate= "Blocked & Cleaned";
            else if (strtolower($value)=="cleaned and not running")
                $this->gullystate= "Cleaned & Not Running";
            else if (strtolower($value)=="obstructed")
                $this->gullystate= "Obstructed";
            else
                $this->gullystate= "No Info";
		    $this->gullystate= $value;
		  }
		  if(strpos($key, "type")!==false){//type
		    $this->gullytype= $value;
		  }
		  if(strpos($key, "accessibility")!==false){
		    $this->accessibility= $value;
		  }
		}
  		$this->gullyid= $decoded_object["data"][0]["id"];
  		$this->sensorid= $decoded_object["data"][0]["sensor_id"];
  		$this->timestamp= $decoded_object["data"][0]["timestamp"];
  		$this->sensorname= $decoded_object["data"][0]["sensor_name"];
  		$this->lat= $decoded_object["data"][0]["lat"];
  		$this->lng= $decoded_object["data"][0]["lng"];
  	}

  	public function create_DB_object(){
  		$gully= array();
  		foreach (get_object_vars($this) as $key=>$value){
  			if ($key != "lat" && $key != "lng"){
  				$gully[$key]=$value;
  			}
  		}
  		$geojson["type"]="Point";
        $geojson["coordinates"]=array((float)$this->lng, (float)$this->lat);
        $gully["geo"]= $geojson;
  		return $gully;
  	}
}
?>