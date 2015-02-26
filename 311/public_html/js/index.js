$(document).ready(function() {
	var selectedRegion = null;
	var selectedDepartment = null;
	var selectedDivision =null;

	var viewportWidth = $(window).width();
	var viewportHeight = $(window).height();

	$(window).resize(function() {
		viewportWidth = $(window).width();
		viewportHeight = $(window).height();
	});

	// Map creation
	var bounds = [[-123.287888, 49.117928],[ -122.717972,49.330492]]; // bottom left, top right bounds of the vancouver city map
	var cloudmadeUrl= "http://{s}.tiles.mapbox.com/v4/tedh.l6cl5pco/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidGVkaCIsImEiOiJWYVdlRWdzIn0.XUX26iMTofEnu7jNGIDWeQ";
	var baseLayer=new L.TileLayer(cloudmadeUrl, {
				attribution: "Map data &copy;",
				maxZoom: 180
			});
	var regionLayer;
	var heatmapLayer = new L.TileLayer.heatMap({
                    radius: { value: 90, absolute: true },
                    opacity: 0.6,
                    gradient: {
                        0.45: "rgb(0,0,255)",
                        0.55: "rgb(0,255,255)",
                        0.65: "rgb(0,255,0)",
                        0.95: "yellow",
                        1.0: "rgb(255,0,0)"
                    }
                });
	var map = new L.Map("map", {
	    center: [49.261226 ,-123.1139268],
      	zoom: 12,
      	minZoom: 5,
      	maxZoom:19,
      	layers: [baseLayer, heatmapLayer]
	});


    // Draw Vancouver Regions
	var style = {
        "clickable": true,
        "color": "white",
        "weight": 2.0,
        "opacity": 0.9,
        "fillOpacity": 0.9
    };
    var hoverStyle = {
        "fillOpacity": 0.1
    };
    var clickStyle = {
        "fillOpacity": 0
    };
    var veryHigh ={
    	"fillColor":"#6e0000"
    };
    var high ={
    	"fillColor":"#A60000"
    };
    var medium ={
    	"fillColor":"#ff4040"
    };
    var low ={
    	"fillColor":"#ff7373"
    };
    var veryLow ={
    	"fillColor":"#ffbbbb"
    };
    
	$.getJSON($('link[rel="polygons"]').attr("href"), function(data) {
	    regionLayer = new L.geoJson(data, {
	      style: style,
	      onEachFeature: function (feature, layer) {
	      	var region = feature["properties"]["Name"].replace("-"," ");
	      	var query = JSON.stringify({"region": region});
	      	query311MapPins("count",query, function(count){
		        if (parseInt(count)>=1000)
		        	layer.setStyle(veryHigh);
		        else if (parseInt(count)>=750)
		        	layer.setStyle(high);
		        else if (parseInt(count)>=500)
		        	layer.setStyle(medium);
		        else if (parseInt(count)>=250)
		        	layer.setStyle(low);
		        else
		        	layer.setStyle(veryLow);
		        	// TODO: reset zoom level and map centre
		        	//TODO: put feature color css in separate css file
		        //TODO: show region labels
	        	layer.bindPopup("Region: "+region+"<br>"+"Case Count: "+count);
	        });
	        var isClicked=false;
	        layer.on("mousedown", function (e) {
	        	var query = JSON.stringify({"region": region});
	        	selectedRegion = region;

	        	query311MapPins("find", query, function(response){
		        	clear_map();
		        	var json = JSON.parse(response);
					var itemArray=new Array();
		           	var heatmapArray=new Array();
		           	$.each(json["results"], function (i, ob) {
		            	heatmapArray.push({lat:json["results"][i]["geo"]["coordinates"][1] , lon:json["results"][i]["geo"]["coordinates"][0] , value: 1});
		            	itemArray.push(json["results"][i]);
					});
					create_heatmap(heatmapArray);
		        	plot_pins(itemArray);
		        	create_plots(itemArray); //re draw distribution graphs
		        	layer.setStyle(clickStyle);
		        	isClicked=true;
		        });
		    });
	        layer.on('mouseover', function () {
	            layer.setStyle(hoverStyle);
	        });
	        layer.on('mousemove', function () {
	            layer.setStyle(style);
		    });
	      }
	    });
	    regionLayer.addTo(map);
	    create_map_controls();
	});

	//D3 SVG 
	var pane = map.getPanes().overlayPane;
	var svg = d3.select(pane).append("svg").style("width", 50000).style("height", 50000),
	    g = svg.append("g").attr("class", "leaflet-zoom-hide");
	
	map.on("viewreset", reset);
	initialise_data();
	//TODO: check if leaflet-control-layers-selector is clicked, 
	map.on("layerremove", function(){
		if (!map.hasLayer(regionLayer)){
			$(".leaflet-zoom-animated").css("pointer-events","none");
		}
	});
	map.on("layeradd", function(){
		if (map.hasLayer(regionLayer)){
			$(".leaflet-zoom-animated").css("pointer-events","auto");
		}
	});
		
	/************************** Control UI Related Functions **************************/
	function create_heatmap(heatmapArray){
		map.addLayer(heatmapLayer);
		var heatmapData = {max: 5000, data: heatmapArray};
		heatmapLayer.setData(heatmapData.data);
		
	}

	function build_mongo_query(region, department, division){
		var queryParameters = new Array();

		var dataset={"dataset": $("#datasetSelect").val()};
		var fromDate={"$gte": $("#from").val()}; // TODO push dates later! 
		var toDate={"$lt": $("#to").val()};// + one day TODO!
		var regionObj = {"region": region};
		var departmentObj = {"department": department};
		var divisionObj = {"division": division};
		
		queryParameters.push(dataset);
		if (region!=null)
			queryParameters.push(regionObj);
		if (department!=null)
			queryParameters.push(departmentObj);
		if (division!=null)
			queryParameters.push(divisionObj);
		return JSON.stringify({"$and":queryParameters});
	}
	function initialise_data(){
		clear_map();
		$('#departmentSelect').html('<option value = "all">All</option>');
		$('#divisionSelect').html('<option value = "all">All</option>');
		//$("#datasetSelect").html("");
		$('#from').datepicker('destroy');
		$('#to').datepicker('destroy');
		$("#accordion").html("");
		queryDistinctFields ("dataset", null, function(response){
			var items = JSON.parse(response);
			//populate databar
			$.each(items, function (i, item) {
			 	$('#datasetSelect').append($('<option>', { 
			        value: item,
			        text : item 
			    }));
			});
			// Plot current selected dataset
			var query = JSON.stringify({"dataset":$("#datasetSelect").val()});
			query311MapPins("find",query, function(response){
				var json = JSON.parse(response);
				var itemArray=new Array();
	           	var heatmapArray=new Array();
	           	$.each(json["results"], function (i, ob) {
	            	heatmapArray.push({lat:json["results"][i]["geo"]["coordinates"][1] , lon:json["results"][i]["geo"]["coordinates"][0] , value: 1});
	            	itemArray.push(json["results"][i]);
				});
	        	plot_pins(itemArray);
	        	create_plots(itemArray);
	        	create_heatmap(heatmapArray);
	        });

	        //populate departments and divisions
			//TODO: add dataset in query
			//build tree object JSON here
			var departments=new Array();
			queryDistinctFields ("department", query, function(response){
				var departments = JSON.parse(response);
				var departmentArray = new Array();
				$.each(departments, function (i, department) {
					$("#accordion").append("<h6 id='department"+i+"'>"+department+"</h6><div></div>")
					//search for divisions
					
					var divisionQuery = JSON.stringify({"department":department});
					queryDistinctFields ("division", divisionQuery, function(response){
						var divisions = JSON.parse(response);
						var divisionArray = new Array();
						$.each(divisions, function (k, division) {
							$("#department"+i+" + div").append("<input type='checkbox' checked='checked' class ='filterCheckboxes' id='division_"+division+"'>"+division+" </input></br>")
							//search for divisions
							divisionArray.push(division);
						});
						var departmentObj ={department:divisionArray};
						departmentArray.push(departmentObj);
					});
				});
				// $('#tree').jstree();
				$("#tree").jstree({
			        "plugins" : [ "themes", "html_data", "checkbox", "sort", "ui" ]
			    });

				$("#accordion").accordion("refresh");
			});
			
			//populate date picker
			var from_date = new Date("1 "+$("#datasetSelect").val());
			var to_date = new Date(from_date.getFullYear(), from_date.getMonth()+1, 0);
			$( "#from" ).datepicker({
		      defaultDate: from_date,
		      changeMonth: false,
		      showOtherMonths: false,
		      numberOfMonths: 1,
		      minDate: from_date,
		      maxDate: to_date,
		      onClose: function( selectedDate ) {
		        $( "#to" ).datepicker( "option", "minDate", selectedDate );
		      }
		    });
		    $('#from').datepicker("setDate",from_date);
		    $( "#to" ).datepicker({
		      defaultDate: to_date,
		      changeMonth: false,
		      numberOfMonths: 1,
		      minDate: from_date,
		      maxDate: to_date,
		      onClose: function( selectedDate ) {
		        $( "#from" ).datepicker( "option", "maxDate", selectedDate );
		      }
		    });
		    $('#to').datepicker("setDate",to_date);
		});
	}

	function create_map_controls(){
		var overlayMaps = {
            'Heatmap': heatmapLayer,
            'Neighbourhoods':regionLayer
	    }; 
	    var controls = L.control.layers(null, overlayMaps, {collapsed: false});
		controls.addTo(map);
		$(".leaflet-control-layers").append("<label><input id='case-dot-control' type='checkbox' checked></input><span>311 Case Locations</span></label>");
		$( "#case-dot-control" ).click( function(){
	      if ($(this).is(':checked'))
	      	$(".case-dot").show();
	      else
	      	$(".case-dot").hide();
	    });
	}

	function update_division_dropdown(){
		$('#divisionSelect').html('<option value = "all">All</option>');
		var department = $("#departmentSelect").val();
		var query = JSON.stringify({"department":department});
			queryDistinctFields ("division", query, function(response){
			var divisions = JSON.parse(response);
			$.each(divisions, function (i, division) {
				$('#divisionSelect').append($('<option>', { 
						value: division,
						text : division
				}));
			});
		});
	}

	function create_plots(itemArray){
		graph_pie_chart(itemArray, "division", "top-right-box", "Case Distribution By Divisions", function(e){
		        	// re-plot map
		        	// build query: dataset, date range, region, department =null, division
		        	selectedDivision=e.data.label;
		        	var query = build_mongo_query(selectedRegion, selectedDepartment,selectedDivision);
		        	query311MapPins("find",query, function(response){
	        			var json = JSON.parse(response);
						var itemArray=new Array();
						var heatmapArray= new Array();
			           	$.each(json["results"], function (i, ob) {
			            	heatmapArray.push({lat:json["results"][i]["geo"]["coordinates"][1] , lon:json["results"][i]["geo"]["coordinates"][0] , value: 1});
			            	itemArray.push(json["results"][i]);
						});
						create_heatmap(heatmapArray);
						plot_pins(itemArray);
	        		});
		        });
	        	graph_pie_chart(itemArray, "department", "bottom-box", "Case Distribution By Departments", function(e){
	        		selectedDepartment=e.data.label;
	        		selectedDivision=null;
		        	var query = build_mongo_query(selectedRegion, selectedDepartment,selectedDivision);
	        		query311MapPins("find",query, function(response){
	        			var json = JSON.parse(response);
						var itemArray=new Array();
						var heatmapArray= new Array();
			           	$.each(json["results"], function (i, ob) {
			            	heatmapArray.push({lat:json["results"][i]["geo"]["coordinates"][1] , lon:json["results"][i]["geo"]["coordinates"][0] , value: 1});
			            	itemArray.push(json["results"][i]);
						});
						create_heatmap(heatmapArray);
						plot_pins(itemArray);
						graph_pie_chart(itemArray, "division", "top-right-box", "Case Distribution By Divisions", function(e){
		        			// re-plot map
				        	selectedDivision=e.data.label;
				        	var query = build_mongo_query(selectedRegion, selectedDepartment,selectedDivision);
				        	query311MapPins("find",query, function(response){
			        			var json = JSON.parse(response);
								var itemArray=new Array();
								var heatmapArray= new Array();
					           	$.each(json["results"], function (i, ob) {
					            	heatmapArray.push({lat:json["results"][i]["geo"]["coordinates"][1] , lon:json["results"][i]["geo"]["coordinates"][0] , value: 1});
					            	itemArray.push(json["results"][i]);
								});
								create_heatmap(heatmapArray);
								plot_pins(itemArray);
			        		});
		        		});
	        		});
	        	});
	}
	/************************** Map Related Functions **************************/
	function plot_pins(itemArray){
			//clear map pins
			g.selectAll(".case-map-points").data([]).exit().remove();
			//plot map pins
			g.selectAll(".case-map-points")
					.data(itemArray)
					.enter()
					.append("circle")
					.attr("class", "case-dot case-stroke case-map-points case-unselected")
					.attr("cx", function(d) {
						var point_x = project([d["geo"]["coordinates"][0], d["geo"]["coordinates"][1]])[0];
		                return point_x;
		            })
		            .attr("cy", function(d) {
		            	var point_y = project([d["geo"]["coordinates"][0], d["geo"]["coordinates"][1]])[1];
		                return point_y;
		            })
		            .attr("r", function(d) {
		               	return 7;
		        	})
		        	.on('click',function(d){	
                   //      d3.select(".case-selected")
                   //      	.classed("case-selected", false)
			                // .classed("case-unselected", true);
                        var tooltip= d3.select(".tooltip");
                        tooltip.transition()       
                          .duration(200)
                          .style("display","block")     
                          .style("opacity", .9)
                          .style("left", (d3.event.pageX-100-8) + "px")    
                          .style("top", (d3.event.pageY+20) + "px");
                        //add tooltip content
                        $("#tooltip_content").html("");
                        $("#tooltip_content").append("<div style='text-align: left;'>Case Type: <span class='bold'>"+d.casetype+"</span></div>");
                        $("#tooltip_content").append("<div style='text-align: left;'>Department: <span class='bold'>"+d.department+"</span></div>");
                        $("#tooltip_content").append("<div style='text-align: left;'>Division: <span class='bold'>"+d.division+"</span></div>");
                        $("#tooltip_content").append("<div style='text-align: left;'>Date : <span class='bold'>"+new Date(1000*d.date.sec)+"</span></div>");
                        $("#tooltip_content").append("<div style='text-align: left;'>Location: <span class='bold'>"+d["address"]+"</span></div>");
                        d3.select(this)
                           .classed("case-unselected", false)
                           .classed("case-selected", true);
		        	})
		        	.on('mouseover',function(d){
		        		d3.select(this)
		        		   // .classed("case-unselected", true)
                           .classed("mouseovered", true)
                           .classed("case-stroke", false);		
		        	}).on('mouseout', function(d, i){
                     	d3.select(this)
                     	   // .classed("case-unselected", true)
                           .classed("mouseovered", false)
                           .classed("case-stroke", true);
                	});
	}
	function graph_pie_chart(itemArray, filterDimension, graphLocation, graphTitle, sliceClickCallback){
		//cross filter the data by silt levels
		chartId =filterDimension+"_chart";
		var chartFilter= crossfilter(itemArray);
		var dataByDepartment = chartFilter.dimension(function(d) {return d[filterDimension]}); 
		var values=new Array();
		var departments = new Array();
		var query = JSON.stringify({"dataset":$("#datasetSelect").val()});
		queryDistinctFields (filterDimension, query, function(response){
			var departments = JSON.parse(response);
			$.each(departments, function (i, department) {
			 	departments.push(department);
			 	dataByDepartment.filter(department);
			 	var count = chartFilter.groupAll().reduceCount().value();
			   	var value={};
			    value["label"]= department;
			    value["value"]= count;
			    values.push(value);
			});
			if ($("#"+chartId).length==0){
				$("#"+graphLocation).append("<svg id='"+filterDimension+"_title'"+" class='chart_title'></svg>");
				$("#"+graphLocation).append("<svg id='"+filterDimension+"_chart'"+"></svg>");
			}
			nv.addGraph(function() {
				var chart = nv.models.pieChart()
					.showLegend(false)
					.x(function(d) { return d.label })
			        .y(function(d) { return d.value })
				.width(300).height(300);
			        // .color(myColors);

				chart.pie.pieLabelsOutside(false).labelType("percent");
				d3.select('#'+filterDimension+'_title')
							.append("text")
						    .attr("x", "50%")             
						  	.attr("y", "50%")
							.attr("class", "graph-title")
							.attr("text-anchor", "middle")  
							.text(graphTitle);

				d3.select("#"+filterDimension+"_chart")
					.datum(values)
					.transition().duration(500)
					.call(chart);
				nv.utils.windowResize(chart.update);
				return chart;
			},function(){
				d3.selectAll("#"+filterDimension+"_chart .nv-slice").on('click',function(e){
					sliceClickCallback(e)
				});
			});
		});
	}
	
	// function graph_pie_chart(itemArray){
	// 	//cross filter the data by silt levels
	// 	var chartFilter= crossfilter(itemArray);
	// 	var dataByDepartment = chartFilter.dimension(function(d) {return d["department"]}); 
	// 	var values=new Array();
	// 	var departments = new Array();
	// 	var query = JSON.stringify({"dataset":$("#datasetSelect").val()});
	// 	queryDistinctFields ("department", query, function(response){
	// 		var departments = JSON.parse(response);
	// 		$.each(departments, function (i, department) {
	// 		 	departments.push(department);
	// 		 	dataByDepartment.filter(department);
	// 		 	var count = chartFilter.groupAll().reduceCount().value();
	// 		   	var value={};
	// 		    value["label"]= department;
	// 		    value["value"]= count;
	// 		    values.push(value);
	// 		    console.log("label: "+department);
	// 		    console.log("value: "+count);
	// 		});
	// 		chartData = [{
	// 			key: "Departments",
	// 			values: values
	// 		}];
	// 		$("#bottom-box").append("<svg id="+"'department_title'"+" class='chart_title'></svg>");
	// 		$("#bottom-box").append("<svg id="+"'department_chart'"+"></svg>");
	// 		nv.addGraph(function() {
	// 			var chart = nv.models.pieChart()
	// 				.showLegend(false)
	// 				.x(function(d) { return d.label })
	// 		        .y(function(d) { return d.value });
	// 		        // .color(myColors);

	// 			chart.pie.pieLabelsOutside(false).labelType("percent");
	// 			d3.select('#department_title')
	// 						.append("text")
	// 					    .attr("x", "50%")             
	// 					  	.attr("y", "50%")
	// 						.attr("class", "graph-title")
	// 						.attr("text-anchor", "middle")  
	// 						.text("Case Distribution by Departments");

	// 			d3.select("#department_chart")
	// 				.datum(values)
	// 				.transition().duration(500)
	// 				.call(chart);
	// 			nv.utils.windowResize(chart.update);
	// 			return chart;
	// 		},function(){
	// 			d3.selectAll("#department_chart .nv-slice").on('click',
	// 			    function(e){
	// 			        //clear all 
	// 			       	g.selectAll(".case-map-points").data([]).exit().remove();
	// 		});
	// 	});
	// }
	
	// Use Leaflet to implement a D3 geographic projection.
	function project(x) {
	    var point = map.latLngToLayerPoint(new L.LatLng(x[1], x[0]));
	    return [point.x, point.y];
	}

	// Reposition the SVG to cover the features.
	function reset() {
	  	var bottomLeft = project(bounds[0]),
	        topRight = project(bounds[1]);
		svg .attr("width", topRight[0] - bottomLeft[0])
		    .attr("height", bottomLeft[1] - topRight[1])
		    .style("margin-left", bottomLeft[0] + "px")
		    .style("margin-top", topRight[1] + "px");
		g   .attr("transform", "translate(" + -bottomLeft[0] + "," + -topRight[1] + ")");
		g   .selectAll(".case-map-points")
		    .attr("cx", function(d) {
				return project([d["geo"]["coordinates"][0], d["geo"]["coordinates"][1]])[0];
			})
			.attr("cy", function(d) {
				return project([d["geo"]["coordinates"][0], d["geo"]["coordinates"][1]])[1];
			});
	}
	function clear_map(){
		g.selectAll(".case-map-points").data([]).exit().remove();
		map.removeLayer(heatmapLayer);
		$(".tooltip").hide();
	}
	$( "#datasetSelect" ).change(function() {
	  initialise_data();
	});

	$( "#departmentSelect" ).change(function() {
	  update_division_dropdown();
	});

	$("#map").on('click', function(event) {
	    if ($(".tooltip").css('opacity')>0 && ($(event.target).attr('class') !== 'tooltip')){
	    	$(".tooltip").css("opacity",0)
                     	.css("display", "none");
            d3.select(".case-selected")
                .classed("case-unselected", true)
                .classed("case-selected", false);
	    } 
	});
	$(".tooltip").on('dblclick click', function(event) {
		event.stopPropagation();
	});
	$("#resetButton").click(function(){
		//TODO: wrong! should only refresh current dataset 
		selectedRegion=null;
		selectedDivision=null;
		selectedDepartment=null;
		$(".tooltip").hide();
		//TODO: clear all graphs
		initialise_data();

	});
	$("#searchButton").click(function(){
		//get dataset
		var dataset={"dataset": $("#datasetSelect").val()};
		//get date range
		var fromDate={"$gte": $("#from").val()}; // TODO push dates later! 
		var toDate={"$lt": $("#to").val()};// + one day TODO!
		//get filters
		var checkedDivisions = $(".filterCheckboxes:checkbox:checked").map(function() {
        	return this.id.replace("division_","");
    	}).get();
    	var queryParameters = new Array();
    	var division = {"division":{"$in":checkedDivisions}};

    	queryParameters.push(dataset);
		queryParameters.push(division);
		var queryString=JSON.stringify({"$and":queryParameters});

		query311MapPins("find",queryString, function(response){
				var json = JSON.parse(response);
				var itemArray=new Array();
	           	var heatmapArray=new Array();
	           	$.each(json["results"], function (i, ob) {
	            	heatmapArray.push({lat:json["results"][i]["geo"]["coordinates"][1] , lon:json["results"][i]["geo"]["coordinates"][0] , value: 1});
	            	itemArray.push(json["results"][i]);
				});
	        	plot_pins(itemArray);
	        	create_plots(itemArray);
	        	create_heatmap(heatmapArray);
	    });

		// $collection->find([
		//     '$and' => [
		//         ['username' => 'kristories'],
		//         ['email'    => 'w.kristories@gmail.com']
		//     ]
		// ]);
		// {"user_id":"userId","token_id":"tokenId"}
		// db.case.find({"division" :{$in :[19,22]}}).pretty(); 

	});
	$("#addFilterButton").click(function(){
		$("#filter-modal").dialog('close');

	});
	$("#clearFilterButton").click(function(){
		if($("#clearFilterButton").text()=="Select All"){
			$(".filterCheckboxes").prop( "checked", true );
			$("#clearFilterButton").text("Clear All");

		}else{
			$(".filterCheckboxes").removeAttr('checked');
			$("#clearFilterButton").text("Select All");
		}
		

	});

	$("#setFiltersButton").click(function(){
		$( "#filter-modal" ).dialog({
	      height: viewportHeight*0.8,
	      width: viewportWidth*0.8,
	      modal: true
	    });		
	});

	$( "#accordion" ).accordion({
      collapsible: false,
      heightStyle: "content",
      header: "h6"
    });

    

	// $("#filterButton").click(function(){
	// 	console.log("filter data!");		
	// 	//build query
	// 	var dataset = $("#datasetSelect").val();
	// 	var department = $("#departmentSelect").val();
	// 	var division = $("#divisionSelect").val();
	// 	var from_date = $("#from").val();
	// 	var to_date = $("#to").val(); // + one day TODO!
	// 	if (department =="all"){
	// 		//query = dataset + date , todo
	// 		var query = JSON.stringify({"$and":[{"dataset": dataset},{"date": {"$gte": from_date, "$lte": to_date}}]});
	// 	}else{
	// 		if (division == "all"){
	// 			var query = JSON.stringify({"$and":[{"dataset": dataset},{"department": department}]});
	// 			//query = dataset + department +date
	// 		}else{
	// 			//query = dataset + department +division +date
	// 			var query = JSON.stringify({"$and":[{"dataset": dataset},{"department": department},{"division": division}]});
	// 		}
	// 	}
	// 	query311MapPinsWithDateRange("find", query, function(response){
	// 		console.log("my response: "+response);
	// 	});
	// });
	/************************** Mongo Query AJAX Calls **************************/
	function queryDistinctFields (field, query, callback){
		$.post( "./ajax/queryDistinctFields.php", {collection: "case", field: field, query: query})
			.done(function( response ){
				callback(response);
		});
	}
	function query311MapPins(type, query, callback){
		$.post( "./ajax/query311Cases.php", {collection: "case", type: type, query: query})
			.done(function( response ){
				callback(response);
		});
	}
	function query311MapPinsWithDateRange(type, query, callback){
		$.post( "./ajax/query311CasesWithDateRange.php", {collection: "case", type: type, query: query})
			.done(function( response ){
				callback(response);
		});
	}
});
