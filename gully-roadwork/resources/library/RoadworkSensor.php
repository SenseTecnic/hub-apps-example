<?php
/**
 * Class file for Roadwork Sensor
 *
 * This class creates a new Roadwork Sensor object that can be
 * populated into MongoDB. 
 *
 **/
class RoadworkSensor {

	//class variables
	private $sensorid=null; //sensor_id
	private $roadworkid=null; //id
	private $timestamp=null; //timestamp
	private $sensorname=null; //sensor_name

	private $scheduleddate=null;//scheduledDate
	private $jobstatus=null;//jobStatus
	private $locationdescription= null;//locationDescription
	private $value= null;//value


  private $lat= null;
  private $lng= null;
	private $lastupdate=null;

  	public function __construct($data, $lastupdate){
  		$this->lastupdate=$lastupdate;
  		$decoded_object=json_decode($data, true);
  		
      var_dump($decoded_object);
  		$this->roadworkid= $decoded_object["data"][0]["id"];
  		$this->sensorid= $decoded_object["data"][0]["sensor_id"];
  		$this->timestamp= $decoded_object["data"][0]["timestamp"];
  		$this->sensorname= $decoded_object["data"][0]["sensor_name"];
  		$this->lat= $decoded_object["data"][0]["lat"];
  		$this->lng= $decoded_object["data"][0]["lng"];
      $this->scheduleddate= $decoded_object["data"][0]["scheduledDate"];
      $this->jobstatus= $decoded_object["data"][0]["jobStatus"];
      $this->locationdescription= $decoded_object["data"][0]["locationDescription"];
      $this->value= $decoded_object["data"][0]["value"];
  	}

    public function getLat(){
      return $this->lat;
    }
    public function getLng(){
      return $this->lng;
    }
  	public function create_DB_object(){
  		$roadwork= array();
  		foreach (get_object_vars($this) as $key=>$value){
  			if ($key != "lat" && $key != "lng"){
  				$roadwork[$key]=$value;
  			}
  		}
  		$geojson["type"]="Point";
        $geojson["coordinates"]=array((float)$this->lng, (float)$this->lat);
        $roadwork["geo"]= $geojson;
  		return $roadwork;
  	}
}
?>