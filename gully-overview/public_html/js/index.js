$(document).ready(function() {

	/************ Define variables **********/
	var limit =4000; // paging limit 
	var itemArray=[]; // 
    var heatmapArray=[]; // heatmap data
    var oldQuery;
    var mongoCollection="testgully";

    /************ Map related variables **********/
    var cloudmadeUrl= "http://{s}.tile.cloudmade.com/d33d78dd8edd4f61a812a0d56b062f56/2400/256/{z}/{x}/{y}.png";
	var baseLayer=new L.TileLayer(cloudmadeUrl);
	// Heatmap layer
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
	// Map creation
	var map = new L.Map("map", {
	    center: [54.56011889582139, -1.023101806640625],
      	zoom: 11,
      	minZoom: 10,
      	maxZoom:17,
      	layers: [baseLayer, heatmapLayer]
	});
	map.setView(new L.LatLng(54.56011889582139, -1.023101806640625), 11);

    var overlayMaps = {
        'Heatmap': heatmapLayer
    }; 
    var controls = L.control.layers(null, overlayMaps, {collapsed: false});
	controls.addTo(map);
	$(".leaflet-control-layers").append("<label><input id='gully-dot-control' type='checkbox' checked></input><span>Gully Pins</span></label>");
	$( "#gully-dot-control" ).click( function(){
      if ($(this).is(':checked'))
      	$(".gully-dot").show();
      else
      	$(".gully-dot").hide();
    });

	//SVG
	var pane = map.getPanes().overlayPane,
		svg = d3.select(pane).append("svg"),
	    g = svg.append("g").attr("class", "leaflet-zoom-hide");
	//Draw UK boundary
	d3.json("media/maps/subunits.json", function(error, collection) {
	 	var bounds = d3.geo.bounds(collection),
	    path = d3.geo.path().projection(project);
	  	var feature = g.selectAll("path")
	      	.data(collection.features)
	    	.enter().append("path")
	    	.attr("class", "uk_boundary");	

	    get_gully_overview();
	  	var div= d3.select(".tooltip").style("opacity", 0);  
	  	map.on("viewreset", reset);
	  	reset();
		
		function clear_graph(){
			$("#bottom-box").html("");
			$("#top-right-box").html([]);
		}

		function clear_map(){
			g.selectAll(".gully-map-points").data([]).exit().remove();
			g.selectAll(".boundary").data([]).exit().remove();
			map.removeLayer(heatmapLayer);
			$(".tooltip").hide();
		}

		function get_gully_overview(){
			offset=0;
			map_gullies(null);
		}

		function map_gullies(query){
			var offset=0;
	  		preloader_on();
	  		itemArray= [];
	  		heatmapArray = [];
	  		queryAllGullies(query, offset);
	  	}

	  	function queryAllGullies(query, offset){
	  		$.post( "./ajax/queryGullies.php", {collection: mongoCollection, query: query, limit: limit, offset: offset})
			  .done(function( response ) {
			    processGullyData(response, query);
			});
	  	}

	  	function preloader_on(){
	  		$("#preloader").show();
			$("#preloader").delay(50).fadeIn("slow"); 
	  	}
	  	function preloader_off(){
			$("#preloader").delay(50).fadeOut("slow");
			$("#preloader").hide();
	  	}

	  	function processGullyData(response, query){
	  			var json= JSON.parse(response);
			   	var counter=0; //num of results
            	$.each(json["results"], function (i, ob) {
	            		var silt = parseFloat(ob["si"]);
	            		if (silt >=50){
	            			heatmapArray.push({lat:ob["la"] , lon:ob["ln"] , value: silt});
	            		}else{
	            			heatmapArray.push({lat:ob["la"] , lon:ob["ln"] , value: 0});
	            		}
	            		itemArray.push(json["results"][i]);
	            		counter++;
				});

				if (counter ==0){
			    	preloader_off();
			    	var heatmapData = {max: 100000, data: heatmapArray};
					heatmapLayer.setData(heatmapData.data);
			    }else{
				    queryAllGullies(query, json["newOffset"]);
					oldQuery=json["query"];
					//plot map pins
					g.selectAll(".gully-map-points")
						.data(itemArray)
						.enter()
						.append("circle")
						.attr("class", "gully-dot gully-map-points gully-stroke")
						.attr("cx", function(d) {
			                    return project([d["ln"], d["la"]])[0];
			            })
			            .attr("cy", function(d) {
			                    return project([d["ln"], d["la"]])[1];	                
			            })
			            .attr("r", function(d) {
			            		var level= parseInt(d["si"], 10);	
			            		return 2*(1+level/25);	            	
			        	})
			        	.on('mouseover',function(d){
			        		d3.select(this)
	                           .classed("mouseovered", true)
	                           .classed("gully-stroke", false);
			        	}).on('mouseout', function(d, i){
	                     	d3.select(this)
	                           .classed("mouseovered", false)
	                           .classed("gully-stroke", true);
	                	}).on('click', function(d, i){
	                		var pageX=d3.event.pageX;
	                		var pageY= d3.event.pageY;
	                		var query = {"sid": d.sensorid};
	                		var stringQuery= JSON.stringify(query);
	                		$.post( "./ajax/queryGullyDetails.php", {collection: mongoCollection, query: stringQuery})
							  .done(function( response ) {
							  	response=JSON.parse(response);
							  	var height=parseInt($(".tooltip").css("height"),10);
		                        var tooltip= d3.select(".tooltip");
		                        tooltip.transition()       
		                          .duration(200)
		                          .style("display","block")     
		                          .style("opacity", .9)
		                          .style("left", (pageX-100-8) + "px")    
		                          .style("top", (pageY+20) + "px");
		                          var content;
		                        for(key in response){
		                        	content = response[key];
		                        }
		                        //add tooltip content
		                        $("#tooltip_content").html("");
		                        $("#tooltip_content").append("<div style='text-align: left;'>Gully ID: <span class='bold'>"+content.gid+"</span></div>");
		                        $("#tooltip_content").append("<div style='text-align: left;'>Sensor ID: <span class='bold'>"+content.sid+"</span></div>");
		                        $("#tooltip_content").append("<div style='text-align: left;'>Silt Level: <span class='bold'>"+content.si+"</span></div>");
		                        $("#tooltip_content").append("<div style='text-align: left;'>Gully Type: <span class='bold'>"+content.ty+"</span></div>");
		                        $("#tooltip_content").append("<div style='text-align: left;'>Gully State: <span class='bold'>"+content.st+"</span></div>");
		                        $("#tooltip_content").append("<div style='text-align: left;'>Gully Accessible?: <span class='bold'>"+content.access+"</span></div>");
		                        $("#tooltip_content").append("<div style='text-align: left;'>Gully Timestamp: <span class='bold'>"+content.timestamp+"</span></div>");
							});
	                	});
			        plotData();
				}
	  	}

	  	function plotData(){
	  		//cross filter the data by silt levels
		    var gullyFilter= crossfilter(itemArray);
		    var dataBySiltLevel = gullyFilter.dimension(function(d) {return d["si"]}); 
		    var values=new Array();
		    var levels= ["0", "25", "50", "75","100"];
		    for (var i in levels){
		        dataBySiltLevel.filter(levels[i]);
		        var count = gullyFilter.groupAll().reduceCount().value();
		   		var value={};
		        value["label"]= levels[i]+"%";
		    	value["value"]= count;
		    	values.push(value);
		    }
		 	siltLevelBarData = [ 
				{
				    key: "Silt Level",
				    values: values
				}
			];
			//Silt level bar chart
			if ($("#gully_silt_chart").length==0){
				$("#bottom-box-left").append("<svg id="+"'gully_silt_title'"+"' class='chart_title'></svg>");
		       	$("#bottom-box-left").append("<svg id="+"'gully_silt_chart'"+"></svg>");
	       	}
        	nv.addGraph(function() {  
			  	var chart = nv.models.discreteBarChart()
				    .x(function(d) { return d.label })
					.y(function(d) { return d.value })
					.staggerLabels(false)
					.tooltips(false)
					.showValues(true)
					.transitionDuration(250);
				chart.yAxis.axisLabel("Number of Gullies");
				chart.xAxis.axisLabel("Silt Levels (in %)");
				
				d3.select('#gully_silt_title')
				  .append("text")
				  .attr("x", "50%")             
				  .attr("y", "50%")
				  .attr("class", "graph-title")
				  .attr("text-anchor", "middle")  
				  .text("Gully Silt Levels");
				d3.select('#gully_silt_chart')
					.datum(siltLevelBarData)
					.call(chart);
				nv.utils.windowResize(chart.update);
				return chart;
			},function(){
		        d3.selectAll(".nv-bar").on('click',
		            function(e){
		                //clear all 
		               	g.selectAll(".gully-map-points").data([]).exit().remove();
		                //remap gullies
		                var query = {"si": e.label.replace("%","")};
		                if (oldQuery!=""&&oldQuery!=query){
		                	oldQuery=JSON.parse(oldQuery);
		                	query = {"$and" : [query, oldQuery]};
		                }
						var stringQuery = JSON.stringify( query );
						offset=0;
						map_gullies(stringQuery);
		        });
		    });

			// gully state pie chart
			var stateFilter= crossfilter(itemArray);
			var state_values=new Array();
			var dataByState = stateFilter.dimension(function(d) {return d["st"]}); 

		    var states= ["Clean and Running", "Obstructed", "Blocked And Cleaned", "Cleaned and Not Running", "No Info"];
		    for (var i in states){
		        dataByState.filter(null).filter(states[i]);
		        var count = stateFilter.groupAll().reduceCount().value();
		   		var value={};
		        value["key"]= states[i];
		    	value["y"]= count;
		    	state_values.push(value);
		    }
		 	stateData = [ 
				{
				    key: "Gully States",
				    values: state_values
				}
			];
			//graph a bar chart for states
			var myColors = ["#336699", "crimson", "salmon", "#99ffff", "#cccccc"];
			if ($("#gully_state_title").length==0){
		       	$("#bottom-box-right").append("<svg id="+"'gully_state_title'"+" class='chart_title'></svg>");
		       	$("#bottom-box-right").append("<svg id="+"'gully_state_chart'"+"></svg>");
	       	}
			nv.addGraph(function() {
			    var chart1 = nv.models.pieChart()
			        .x(function(d) { return d.key })
			        .y(function(d) { return d.y })
			        .color(myColors);

			    chart1.pie.pieLabelsOutside(false).labelType("percent");
			    
			    d3.select('#gully_state_title')
					.append("text")
				    .attr("x", "50%")             
				  	.attr("y", "50%")
					.attr("class", "graph-title")
					.attr("text-anchor", "middle")  
					.text("Gully States");

				d3.select("#gully_state_chart")
			        .datum(state_values)
			        .transition().duration(500)
			          .call(chart1);
				nv.utils.windowResize(chart1.update);
			    return chart1;
			},function(){
		        d3.selectAll("#gully_state_chart .nv-slice").on('click',
		            function(e){
		                //clear all 
		               	g.selectAll(".gully-map-points").data([]).exit().remove();
		                //remap gullies
		                var query = {"st": e.data.key};
		                if (oldQuery!=""&&oldQuery!=query){
		                	oldQuery=JSON.parse(oldQuery);
		                	query = {"$and" : [query, oldQuery]};
		                }
						var stringQuery = JSON.stringify( query );
						offset=0;
						map_gullies(stringQuery);
		        });
		    });

			// Gully type chart
			var typeFilter= crossfilter(itemArray);
			var type_values=new Array();
			var dataByType = typeFilter.dimension(function(d) {return d["ty"]}); 
		    var types= ["Top Entry", "Side Entry", "Box", "Rod and Eye"];
		    for (var i in types){
		        dataByType.filter(null).filter(types[i]);
		        var count = typeFilter.groupAll().reduceCount().value();
		   		var value={};
		        value["key"]= types[i];
		    	value["y"]= count;
		    	type_values.push(value);
		    }
		 	typeData = [ 
				{
				    key: "Gully Type",
				    values: type_values
				}
			];
			//graph a bar chart for states
			var myColors2 = ["#336699", "crimson", "salmon", "#99ffff"];
			if ($("#gully_type_chart").length==0){
				$("#top-right-box").append("<svg id="+"'gully_type_title'"+"' class='chart_title'></svg>");
	       		$("#top-right-box").append("<svg id="+"'gully_type_chart'"+"'></svg>");
	       		
			}
			nv.addGraph(function() {
			    var chart2 = nv.models.pieChart()
			        .x(function(d) { return d.key })
			        .y(function(d) { return d.y })
				    .color(myColors2);

		      	chart2.pie.pieLabelsOutside(false).labelType("percent");
		      	d3.select("#gully_type_chart")
		          	.datum(type_values)
		        	.transition().duration(500)
		          	.call(chart2);
		     	 d3.select('#gully_type_title')
				  	.append("text")
				    .attr("x", "50%")             
				  	.attr("y", "50%")
					.attr("class", "graph-title")
					.attr("text-anchor", "middle")  
					.text("Gully Types");
				nv.utils.windowResize(chart2.update);
			    return chart2;
			},function(){
		        d3.selectAll("#gully_type_chart .nv-slice").on('click',
		            function(e){
		                //clear all 
		                g.selectAll(".gully-map-points").data([]).exit().remove();
		                 var query = {"ty": e.data.key};
		                if (oldQuery!=""&&oldQuery!=query){
		                	oldQuery=JSON.parse(oldQuery);
		                	query = {"$and" : [query, oldQuery]};
		                }
		                //remap gullies
						var stringQuery = JSON.stringify( query );
						offset=0;
						map_gullies(stringQuery);
		        });
		    });
	  	}
	  	// Reposition the SVG to cover the features on map reset
	  	function reset() {
	  	 	var bottomLeft = project(bounds[0]),
	        	topRight = project(bounds[1]);
		    svg .attr("width", topRight[0] - bottomLeft[0])
		        .attr("height", bottomLeft[1] - topRight[1])
		        .style("margin-left", bottomLeft[0] + "px")
		        .style("margin-top", topRight[1] + "px");
		    g   .attr("transform", "translate(" + -bottomLeft[0] + "," + -topRight[1] + ")");
		    feature.attr("d", path);
		    //redraw the pins due to zoom level
				g.selectAll(".gully-map-points")
		    		.attr("cx", function(d) {
						return project([d["ln"], d["la"]])[0];
					})
					.attr("cy", function(d) {
					    return project([d["ln"], d["la"]])[1];
					});
				g.selectAll(".boundary")
		    		.attr("cx", function(d) {
						return project([d["region_lng"], d["region_lat"]])[0];
					})
					.attr("cy", function(d) {
					    return project([d["region_lng"], d["region_lat"]])[1];
					});	  
	  	}
	  	// Use Leaflet to implement a D3 geographic projection.
		function project(x) {
		    var point = map.latLngToLayerPoint(new L.LatLng(x[1], x[0]));
		    return [point.x, point.y];
		}
		$("#map").on('click', function(event) {
		    if ($(".tooltip").css('opacity')>0 && ($(event.target).attr('class') !== 'tooltip')){
		    	$(".tooltip").css("opacity",0)
	                     	 .css("display", "none");
		    } 
		});
		$(".tooltip").on('dblclick click', function(event) {
			event.stopPropagation();
		});
	  	$(".reset").click(function(){
	  		clear_map();
	  		oldQuery=null;
	  		$(".tooltip").hide();
	  		map.addLayer(heatmapLayer);
	  		get_gully_overview();
	  	});
	});
});
