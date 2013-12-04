<html>
	<head>
		<title>Simple PHP Demo Framework</title>
	  	<!-- CSS files here -->
	  	<link rel="stylesheet" type="text/css" href="./css/external/nv.d3.css" />
	  	<link rel="stylesheet" type="text/css" href="http://cdn.leafletjs.com/leaflet-0.6.4/leaflet.css" />
	  	<link rel="stylesheet" type="text/css" href="./css/styles.css" />
	  	<!-- Javascript files here -->
	  	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
	  	<script type="text/javascript" src="http://d3js.org/d3.v3.min.js"></script>
	  	<script type="text/javascript" src="http://d3js.org/topojson.v1.min.js"></script>
	  	<script type="text/javascript" src="http://cdn.leafletjs.com/leaflet-0.6.4/leaflet.js"></script>
	  	<script type="text/javascript" src="./js/external/nv.d3.min.js"></script>
	  	<script type="text/javascript" src="./js/external/crossfilter.min.js"></script>
	  	<script type="text/javascript" src="./js/external/heatmap-leaflet.js"></script>
	  	<script type="text/javascript" src="./js/external/heatmap.js"></script>
	  	<script type="text/javascript" src="./js/external/QuadTree.js"></script>	
	  	<script type="text/javascript" src="./js/index.js"></script>
	</head>
	<body>
		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>
		<div id="mapContainer">	
			<div id="map">
			</div> 
			<div id="chart">
				<div id="top-left-box">
					<div id="gully_overview_desc" class="description">
						<h3 class="title">Gully Status Overview</h3>
						<div class ="text">
							<span>This is an interactive overview of gullies in Redcar and Cleveland, UK.
							Explore the data by clicking on the graphs to filter gullies on the map view. 
							The purple dots 
							<svg class="gully-dot"><circle cx="6" cy="9" r="5"/></svg>
							represent gullies, the larger the dot means the higher the gully silt level. </span>
							<br>
							<span>Use the checkbox controls to toggle the gully map pins and heatmap visualisations.</span>
							<br>
							<span>To reset the map to show all gully data, click the "RESET" button below.</span>
						</div>
					</div>
					<a href="#" class="reset">RESET</a>
				</div>
				<div id="top-right-box"></div>
				<div id="bottom-box"></div>
			</div>
		</div>
	</body>
</html>
