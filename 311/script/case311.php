<?php
/**
 * Class file for 311 case data
 *
 * This class creates a new 311 case that can be
 * populated into MongoDB. 
 *
 **/
class case311 {

  // Year,Month,Day,Hour,Minute,Department,Division,Case_Type,Hundred_Block,Street_Name,Local_Area

	//class variables
	private $year=null; //0
	private $month=null; //1
	private $day=null; //2
	private $hour=null; //3
	private $minute=null; //4
	private $department=null; //5
	private $division= null; //6
	private $casetype= null; //7
	private $block= null; //8
	private $street = null; //9
	private $region=null; //10
  private $address=null;
  private $geo=null;
  private $city= "Vancouver";
  private $date= null;
  private $dataset = null;

  	public function __construct($csv_line){
  		$this->year= str_replace("\000",'',$csv_line[0]);
  		$this->month= str_replace("\000",'',$csv_line[1]);
  		$this->day= str_replace("\000",'',$csv_line[2]);
  		$this->hour= str_replace("\000",'',$csv_line[3]);
  		$this->minute= str_replace("\000",'',$csv_line[4]);
  		$this->department= str_replace("\000",'',$csv_line[5]);
      $this->division= str_replace("\000",'',$csv_line[6]);
      $this->casetype= str_replace("\000",'',$csv_line[7]);
      $this->block= str_replace("\000",'',$csv_line[8]);
      $this->street= str_replace("\000",'',$csv_line[9]);
      $this->region= str_replace("\000",'',$csv_line[10]);
      $this->region= str_replace("-",' ',$this->region);
      $this->region= str_replace("\r",'',$this->region);

      $this->block = str_replace('#','0',$this->block);
      $this->address = $this->block.' '.$this->street.', '.$this->city;
      date_default_timezone_set('America/Vancouver');
      $this->date = new MongoDate(strtotime($this->year.'-'.$this->month.'-'.$this->day.' '.$this->hour.':'.$this->minute));
      $monthName = date("F", mktime(0, 0, 0, (int)$this->month, 10));
      $this->dataset = $monthName." ".$this->year;

  	}

    public function getBlock(){
      return $this->block;
    }

    public function getStreet(){
      return $this->street;
    }

    public function getRegion(){
      return $this->region;
    }

    public function getAddress(){
      return $this->address;
    }

    public function getGeo(){
      return $this->geo;
    }

    public function setGeo($geo){
      $this->geo=$geo;
    }

    public function createGeocodeDBObj($lat, $lng){
      $geocode= array();
      $geocode["address"] = $this->address;
      $geocode["region"] = $this->region;
      $geojson["type"]="Point";
      $geojson["coordinates"]=array((float)$lng, (float)$lat);
      $geocode["geo"]= $geojson;
      $this->geo= $geojson;
      return $geocode;
    }

  	public function createCaseDBObj(){
  		$case= array();
  		foreach (get_object_vars($this) as $key=>$value){
  				$case[$key]=$value;
  		}      
  		return $case;
  	}
}
?>