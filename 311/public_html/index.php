<html>
	<head>
		<title>Vanocouver 311 Visualisation</title>
	  	<!-- CSS files here -->
	  	<link rel="stylesheet" type="text/css" href="/css/external/nv.d3.css" />
	  	<!-- <link rel="stylesheet" type="text/css" href="/css/external/jquery.tree.min.css" /> -->
	  	<link rel="stylesheet" type="text/css" href="http://cdn.leafletjs.com/leaflet-0.6.4/leaflet.css" />
	  	<link rel="stylesheet" type="text/css" href="http://ajax.aspnetcdn.com/ajax/jquery.ui/1.10.1/themes/black-tie/jquery-ui.min.css"/>
	  	<link rel="stylesheet" type="text/css" href="/css/styles.css" />
	  	<!-- Javascript files here -->
	  	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
	  	<script src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js"></script>
	  	<script type="text/javascript" src="http://d3js.org/d3.v3.min.js"></script>
	  	<script type="text/javascript" src="http://d3js.org/topojson.v1.min.js"></script>
	  	<script type="text/javascript" src="http://cdn.leafletjs.com/leaflet-0.6.4/leaflet.js"></script>
	  	<script type="text/javascript" src="/js/external/nv.d3.min.js"></script>
	  	<script type="text/javascript" src="/js/external/crossfilter.min.js"></script>
	  	<script type="text/javascript" src="/js/external/QuadTree.js"></script>	
	  	<script type="text/javascript" src="/js/external/heatmap-leaflet.js"></script>
	  	<script type="text/javascript" src="/js/external/heatmap.js"></script>
	  	<script type="text/javascript" src="/js/external/jstree.min.js"></script>
	  	<link rel="polygons" type="application/json" href="/media/maps/regions.json">
	  	<script type="text/javascript" src="/js/index.js"></script>
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
				<div id ="date_navbar">
					<label for="datasetSelect">Dataset: </label>
					<select id ="datasetSelect">
					</select>
					<label for="from">From: </label>
					<input type="text" id="from" name="from" />
					<label for="to">To: </label>
					<input type="text" id="to" name="to" />

					<a href="#" id="setFiltersButton" class="button">Optional Filters</a>
					<a href="#" id="searchButton" class="button">Search</a>
				</div>
				<div id="top-left-box">
					<div id="case_overview_desc" class="description">
						<h3 class="title">Vancouver 311</h3>
						<div class ="text">
							<span>Month: October 2013</span><br>
							<span>Total Cases: 10718</span><br>
							<span>Highest Case Division: Sanitation</span><br>
							<span>Lowest Case Type: Street Horticulture</span><br>
							<!-- Selected Region<br>
							<span>Region: </span><br>
							<span>Total Cases: </span><br>
							<span>Population: </span><br>
							<span>Highest Case Type: </span><br>
							<span>Lowest Case Type: </span><br> -->
						</div>
					</div>
					<a href="#" id="resetButton" class="button">Show All</a>
				</div>
				<div id="top-right-box">
					<!-- <div>
						<label for="departmentSelect">Departments: </label>
						<select id ="departmentSelect">
							<option value="all">All</option>
						</select>
					</div>
					<div>
						<label for="divisionSelect">Divisions: </label>
						<select id ="divisionSelect">
							<option value="all">All</option>
						</select>
					</div> -->
					<!-- <a href="#" id="filterButton" class="button">Filter</a> -->
					
				</div>
				<div id="bottom-box"></div>
			</div>
		</div>

		<div id="filter-modal" title="311 Search Filters">
		<a href="#" id="clearFilterButton" class="button">Clear All</a>
			<a href="#" id="addFilterButton" class="button">Add filters</a>
			<div id="tree"></div>
	  		<div id="accordion">

			</div>
		</div>
	</body>
</html>