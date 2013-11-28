<html>
	<head>
		<title>Simple PHP Demo Framework</title>
	  	<!-- CSS files here -->
	  	<link rel="stylesheet" type="text/css" href="/css/external/nv.d3.css" />
	  	<link rel="stylesheet" type="text/css" href="http://cdn.leafletjs.com/leaflet-0.6.4/leaflet.css" />
	  	<link rel="stylesheet" type="text/css" href="http://code.jquery.com/ui/1.10.3/themes/smoothness/jquery-ui.css" />
	  	<link rel="stylesheet" type="text/css" href="/css/external/iThing.css" />
	  	<link rel="stylesheet" type="text/css" href="/css/styles.css" />
	  	<!-- Javascript files here -->
	  	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
	  	<script type="text/javascript" src="http://code.jquery.com/ui/1.10.3/jquery-ui.js"></script>
	  	<script type="text/javascript" src="http://d3js.org/d3.v3.min.js"></script>
	  	<script type="text/javascript" src="http://d3js.org/topojson.v1.min.js"></script>
	  	<script type="text/javascript" src="http://cdn.leafletjs.com/leaflet-0.6.4/leaflet.js"></script>
	  	<script type="text/javascript" src="./js/external/nv.d3.min.js"></script>
	  	<script type="text/javascript" src="./js/external/crossfilter.min.js"></script>
	  	<script type="text/javascript" src="./js/external/heatmap-leaflet.js"></script>
	  	<script type="text/javascript" src="./js/external/heatmap.js"></script>
	  	<script type="text/javascript" src="./js/external/QuadTree.js"></script>
	  	<script type="text/javascript" src="./js/external/jQDateRangeSlider-withRuler-min.js"></script>	
	  	<script type="text/javascript" src="./js/index.js"></script>
	</head>
	<body>
		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>
		<div id="mapContainer">	
			<div id="map">
				<div class="tooltip">
					<div id="tooltip_content"></div>
				</div>
			</div> 
			<div id="chart">
				<div id="top-left-box">
					<div id="gully_roadwork_desc" class="description">
						<h3 class="title">Roadworks vs. Gullies</h3>
						<div class ="text smallfont">
							<span>This interactive demo shows all roadworks and gullies in Redcar and Cleveland, UK. The purple dots represent gullies(size increases for higher silt levels). The triangles represent roadworks, which are color-coded based on roadwork statuses(see chart at bottom for color reference). <br><br>
							Explore the impact of roadworks on gully silt levels by:<br>
							1. Clicking on the bars of the "Roadwork Status" chart (below) to filter roadworks by status on the map.<br>
							2. Click on a Roadwork symbol on map to view the silt levels of gullis that are within a certain radius of the roadwork location. Radius can be adjusted by the slider widget. 
							</span>
							<br><br>
							<span>To reset the map to show all data, click the "RESET" button below.</span>
							
						</div>
					</div>
					<a href="#" class="reset">RESET</a>
					<div id="slider-box" class="smallfont">
						Radius: <span id="radius" >500m</span>
						<div id="radiusSlider"></div>
					</div>
				</div>
				<div id="top-right-box"></div>
				<div id="bottom-box"></div>
			</div>
		</div>
	</body>
</html>