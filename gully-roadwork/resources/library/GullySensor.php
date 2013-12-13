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
  private $sid=null;
  private $gid=null;
  private $timestamp=null;
  private $name=null;
  private $ty=null;
  private $st=null;
  private $la= null;
  private $ln= null;
  private $si= null;
  private $access = null;
  private $lastupdate=null;

    public function __construct($data, $lastupdate){
      $this->lastupdate=$lastupdate;
      $decoded_object=json_decode($data, true);
      
      foreach($decoded_object["data"][0] as $key=>$value){
        $key = strtolower($key);
      if(strpos($key, "silt")!==false){
        $this->si= str_replace("%", "", $value)
      }
      if(strpos($key, "state")!==false){//state
        if (strtolower($value) =="clean and running")
                $this->st= "Clean & Running";
            else if (strtolower($value)=="blocked and cleaned")
                $this->st= "Blocked & Cleaned";
            else if (strtolower($value)=="cleaned and not running")
                $this->st= "Cleaned & Not Running";
            else if (strtolower($value)=="obstructed")
                $this->st= "Obstructed";
            else
                $this->st= "No Info";
        $this->st= $value;
      }
      if(strpos($key, "type")!==false){//type
        $this->ty= $value;
      }
      if(strpos($key, "accessibility")!==false){
        $this->access= $value;
      }
    }
      $this->gid= $decoded_object["data"][0]["id"];
      $this->sid= $decoded_object["data"][0]["sensor_id"];
      $this->timestamp= $decoded_object["data"][0]["timestamp"];
      $this->name= $decoded_object["data"][0]["sensor_name"];
      $this->la= $decoded_object["data"][0]["lat"];
      $this->ln= $decoded_object["data"][0]["lng"];
    }

    public function create_DB_object(){
      $gully= array();
      foreach (get_object_vars($this) as $key=>$value){
          $gully[$key]=$value;
      }
      $geojson["type"]="Point";
        $geojson["coordinates"]=array((float)$this->ln, (float)$this->la);
        $gully["geo"]= $geojson;
      return $gully;
    }
}
?>