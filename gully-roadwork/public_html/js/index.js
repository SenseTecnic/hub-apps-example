$(document).ready(function() {
	var redcar_query=null;

	$( "#radiusSlider" ).slider({
      range: "min",
      value: 500,
      min: 1,
      max: 10000,
      slide: function( event, ui ) {
        $( "#radius" ).text(  ui.value +"m");
      }
    });

	var cloudmadeUrl= "http://{s}.tile.cloudmade.com/d33d78dd8edd4f61a812a0d56b062f56/2400/256/{z}/{x}/{y}.png";
	var baseLayer=new L.TileLayer(cloudmadeUrl);

	//map creation on default (Gully Overview)
	var map = new L.Map("map", {
	    center: [54.56011889582139, -1.023101806640625],
      	zoom: 11,
      	minZoom: 5,
      	maxZoom:19,
      	layers: [baseLayer]
	});

	$(".leaflet-control-layers").append("<label><input id='gully-dot-control' type='checkbox' checked></input><span>Gully Pins</span></label>");
	$( "#gully-dot-control" ).click( function(){
      if ($(this).is(':checked'))
      	$(".gully-dot").show();
      else
      	$(".gully-dot").hide();
    });

	//SVG
	var pane = map.getPanes().overlayPane;

	var svg = d3.select(pane).append("svg"),
	    g = svg.append("g").attr("class", "leaflet-zoom-hide");
	//Draw with D3
	d3.json("media/maps/subunits.json", function(error, collection) {
	 	var bounds = d3.geo.bounds(collection),
	    path = d3.geo.path().projection(project);

	  	var feature = g.selectAll("path")
	      	.data(collection.features)
	    	.enter().append("path")
	    	.attr("class", "uk_boundary");	
	  	var div= d3.select(".tooltip").style("opacity", 0);  

	  	initialize();
	  	// create_timeline();
	  	// $("#date-slider").hide();
	  	map.on("viewreset", reset);
	  	reset();
	  	
	  	$(".reset").click(function(){
	  		clear_map();
	  		$(".tooltip").hide();
	  		// map.addLayer(heatmapLayer);
	  		// get_gully_overview();
	  		get_gully_roadwork();
	  		create_timeline();
	  	});

		function initialize(){
	  		// $(".description").hide();
	  		// $("#gully_roadwork_desc").show();
	  		// get_gully_overview();
	  		get_gully_roadwork();
	  		create_timeline();
	  	}
		
		function clear_graph(){
			$("#bottom-box").html("");
			$("#top-right-box").html([]);
		}

		function clear_map(){
			g.selectAll(".gully-map-points").data([]).exit().remove();
			g.selectAll(".boundary").data([]).exit().remove();
			$(".tooltip").hide();
			$("#date-slider").remove();
		}

		function create_timeline(){
			//create timeline scroll
			$("<div id= 'date-slider'></div>").insertAfter("#map");
			console.log("create timeline");
			var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
			var today = new Date();
		  	var before= new Date(today.getTime() - 60*(24 * 60 * 60 * 1000));

		  	var lower_bound= new Date(today.getTime() - 360*(24 * 60 * 60 * 1000));
		  	var upper_bound= new Date(today.getTime() + 180*(24 * 60 * 60 * 1000));
		  	$("#date-slider").dateRangeSlider({
		  		
			    bounds: {min: lower_bound, max: upper_bound},
			    defaultValues: {min: lower_bound, max: upper_bound},
			    step:{days: 1},
			    scales: [{
			      first: function(value){ return value; },
			      end: function(value) {return value; },
			      next: function(value){
			        var next = new Date(value);
			        return new Date(next.setMonth(value.getMonth() + 1));
			      },
			      label: function(value){
			        return months[value.getMonth()];
			      },
			      format: function(tickContainer, tickStart, tickEnd){
			        tickContainer.addClass("myCustomClass");
			      }
			    }]
		  	});

		  	//bind event for date range slider
		  	$("#date-slider").bind("valuesChanged", function(e, data){
		  		slider_onChange(data.values);
			});

		} //end of create_timeline

		function slider_onChange(data){
		  	$(".tooltip").css("display", "none");
	  		console.log("Values just changed. min: " + data.min + " max: " + data.max);
	  		console.log("redcar_query: " + redcar_query);
			plot_redcar_roadworks(redcar_query, data.min, data.max);	  			
		}

		function get_gully_roadwork(){
			map.setView(new L.LatLng(54.56011889582139, -1.023101806640625), 11);
			plot_gullies();
				
		}

	  	function plot_redcar_roadworks(query, minDate, maxDate){
	  		$("#top-right-box").html("");
	  		$("#top-right-box").append( "<div style='margin: 0 auto; display:table; margin-top:40%;'><strong>Select a roadwork on map to view chart.</strong><div>" );
	  		//make api calls to plot gullies
	  		g.selectAll(".redcar_roadwork_points")
					.data([])
					.exit()
					.remove();
			$.post( "./ajax/queryRoadworks.php", {collection: "roadwork", query: null})
			.done(function( response ) {
	  			var json= JSON.parse(response);
            	var itemArray=new Array();
            	minDate=new Date(minDate);
            	maxDate=new Date(maxDate);
            	console.log("min date="+minDate);
            	console.log("max date="+maxDate);
            	$.each(json["results"], function (i, ob) {
            		var timestamp = ob["timestamp"];
            		if (ob["jobstatus"]==query ||query ==null){
            			recordDate=new Date(timestamp);
            			console.log("record date="+recordDate);
            			if (recordDate<= maxDate && recordDate>= minDate){
            				itemArray.push(ob);
            				console.log("within date range!");
            			}
            		}
				});
				//plot with d3
				g.selectAll(".redcar_roadwork_points")
					.data(itemArray)
					.enter()
					.append("path")
					.attr("class", "redcar_roadwork_points regular-stroke")
			      	.attr('d', function(d) { 
			        	var x = project([d["geo"]["coordinates"][0], d["geo"]["coordinates"][1]])[0]; 
			        	y = project([d["geo"]["coordinates"][0], d["geo"]["coordinates"][1]])[1];
			        	return 'M ' + x +' '+ y + ' l 10 10 l -20 0 z';
			      	})
		        	.attr("stroke", "white")
		        	.attr("fill", function(d){
		        		if (d["jobstatus"]=="In Progress"){
		        			return "#FFCC00";
		        		}
		        		else if (d["jobstatus"]=="Completed"){
		        			return "#E68A00";
		        		}else if (d["jobstatus"]=="Paused"){
		        			return "#CC3300";
		        		}else if (d["jobstatus"]=="Scheduled -Active"){
		        			return "#6699FF";
		        		}
		        		else if (d["jobstatus"]=="Scheduled -Pending"){
		        			return "#a3a3a3";
		        		}
		        		else{
		        			if (d["jobstatus"]=="New")
		        			return "#b4a444";
		        		}
		        	})
		        	.attr("opacity", function(d){
		        		if (query != null){
		        			if (d["jobstatus"]==query){
			        			return 1;
			        		}else{
			        			return 0;
			        		}
		        		}
		        	})
		        	.on('mouseover',function(d){
		        		d3.select(this)
                           .classed("mouseovered", true)
                           .classed("regular-stroke", false);
		        		
		        	}).on('mouseout', function(d, i){
		        		if (d3.select(this).classed("clicked")==false)
	                     	d3.select(this)
	                           .classed("mouseovered", false)
	                           .classed("regular-stroke", true);
                	})
		        	.on("click", function(d, i){
		        		$("#top-right-box").html("");
		        		d3.selectAll(".redcar_roadwork_points")
                           .classed("mouseovered", false)
                           .classed("regular-stroke", true)
                           .classed("clicked", false);
                        d3.select(this)
                        	.classed("clicked", true)
                           .classed("mouseovered", true)
                           .classed("regular-stroke", false);

		        		var geo = d["geo"];
		        		var radius=$( "#radiusSlider" ).slider("option", "value");
		        		var lat = d["geo"]["coordinates"][1];
		        		var lng= d["geo"]["coordinates"][0];
		        		var query = {"$near": {$geometry: geo, $maxDistance: radius}};
					  	var stringQuery = JSON.stringify( query );

					  	//show pop up of roadwork details
					  	//show tooltip
                        var height=parseInt($(".tooltip").css("height"),10);
                        var tooltip= d3.select(".tooltip");
                        tooltip.transition()       
                          .duration(200)
                          .style("display","block")     
                          .style("opacity", .9)
                          .style("left", (d3.event.pageX-100-8) + "px")    
                          .style("top", (d3.event.pageY+20) + "px");
                        //add tooltip content
                        $("#tooltip_content").html("");
                        $("#tooltip_content").append("<div style='text-align: left;'>Sensor ID: <span class='bold'>"+d.sensorid+"</span></div>");
                        $("#tooltip_content").append("<div style='text-align: left;'>Roadwork ID: <span class='bold'>"+d.roadworkid+"</span></div>");
                        $("#tooltip_content").append("<div style='text-align: left;'>Sensor Name: <span class='bold'>"+d.sensorname+"</span></div>");
                        $("#tooltip_content").append("<div style='text-align: left;'>Location: <span class='bold'>"+d.locationdescription+"</span></div>");
                        $("#tooltip_content").append("<div style='text-align: left;'>Latest Status: <span class='bold'>"+d["jobstatus"]+"</span></div>");
                        $("#tooltip_content").append("<div style='text-align: left;'>Record Date: <span class='bold'>"+d["timestamp"]+"</span></div>");
                        $("#tooltip_content").append("<div style='text-align: left;'>Scheduled Date: <span class='bold'>"+d["scheduleddate"]+"</span></div>");

		        		
		        		//graph silt levels of gullies within specified radius, search mongo for gullies within 500 radius
		        		$.post( "./ajax/queryRoadworksByRadius.php", {collection: "testgully", query: null, lat: lat, lng: lng, radius: radius})
						.done(function( response ) {
		        		// makeAPICall('POST', "TrafficExplorer" , "mongoGeoRadiusSearch", {collection: "gully", lat: lat, lng: lng, radius: radius}, function(response){
		        			console.log(response);
		        			//cross filter the data
		        			//filter 
		        			var flatArray= new Array();
		        			response= JSON.parse(response);
		        			jQuery.each(response, function (key, value) {
			            		flatArray.push(response[key]);
							});

				        	var siltFilter= crossfilter(flatArray);
				        	var dataBySiltLevel = siltFilter.dimension(function(d) {console.log ("silt: "+d["si"]); return d["si"]}); 
				        	var values=new Array();
				        	var levels= ["0%", "25%", "50%", "100%"];
				        	for (var i in levels){
				        		dataBySiltLevel.filter(levels[i]);
				        		var count = siltFilter.groupAll().reduceCount().value();
				        		var value={};
				        		value["label"]= levels[i];
				        		value["value"]= count;
				        		values.push(value);
				        	}
							  //data:
							  historicalBarChart = [ 
								  {
								    key: "Silt Level",
								    values: values
								  }
								];
							//graph a bar chart
							// var chart;
							// var width = $(window).width()*0.45*0.5;
							// var height = $(window).height()*0.35;
							$("#top-right-box").append("<svg id="+"'gully_roadwork_title'"+"' class='chart_title'></svg>");
					       	$("#top-right-box").append("<svg id="+"'gully_roadwork_chart'"+" ></svg>");
					       	
		        			nv.addGraph(function() {  

							  	var chart = nv.models.discreteBarChart()
							      .x(function(d) { return d.label })
							      .y(function(d) { return d.value })
							      .staggerLabels(false)
							      .tooltips(false)
							      .showValues(true)
							      .transitionDuration(250);
							      chart.yAxis.axisLabel("# of Gullies");
								  chart.xAxis.axisLabel("Gully Silt Level (%)");
								d3.select('#gully_roadwork_title')
								  .append("text")
								  .attr("x", "50%")             
								  .attr("y", "50%")
								  .attr("class", "graph-title")
								  .attr("text-anchor", "middle")  
								  .text("Gully Silt Levels");
							  	d3.select('#gully_roadwork_chart')
							      .datum(historicalBarChart)
							      .call(chart);
							  	nv.utils.windowResize(chart.update);
							  	return chart;
							});
		        		});
		        	});
					//graph overall roadwork distribution!!!
					//cross filter the data by silt levels
				    var roadworkFilter= crossfilter(itemArray);
				    var dataByJobStatus = roadworkFilter.dimension(function(d) {
				    	return d["jobstatus"];
				    }); 
				    
				    var values=new Array();
				    var statuses= ["In Progress", "Completed", "Paused", "Scheduled -Active","Scheduled -Pending", "New"];
				    for (var i in statuses){
				        dataByJobStatus.filter(statuses[i]);
				        var count = roadworkFilter.groupAll().reduceCount().value();
				   		var value={};
				   		var label=statuses[i]
				   		if (statuses[i]=="Scheduled -Active")
				   			label="Active";
				   		if (statuses[i]=="Scheduled -Pending")
				   			label="Pending";
				        value["label"]= label;
				    	value["value"]= count;
				    	values.push(value);
				    }

				 	barChartData = [ 
						{
						    key: "Roadwork Statuses",
						    values: values
						}
					];

					//graph a bar chart
					var myColors = ["#FFCC00", "#E68A00", "#CC3300", "#6699FF", "#cccccc", "#b4a444"];
					$("#bottom-box").append("<svg id="+"'gully_roadwork_status_title'"+"' class='chart_title'></svg>");
			       	$("#bottom-box").append("<svg id="+"'gully_roadwork_status_chart'"+" ></svg>");
			 
			 		nv.addGraph(function() {  
					  	var chart = nv.models.discreteBarChart()
						    .x(function(d) { return d.label })
							.y(function(d) { return d.value })
							.staggerLabels(false)
							.tooltips(false)
							.color(myColors)
							.showValues(true)
							.transitionDuration(250);
						chart.yAxis.axisLabel("# of Roadworks");
						chart.xAxis.axisLabel("Roadwork Status");
						
						d3.select('#gully_roadwork_status_title')
						  .append("text")
						  .attr("x", "50%")             
						  .attr("y", "50%")
						  .attr("class", "graph-title")
						  .attr("text-anchor", "middle")  
						  .text("Roadwork Statuses");
						d3.select('#gully_roadwork_status_chart')
							.datum(barChartData)
							.call(chart);
						nv.utils.windowResize(chart.update);
						return chart;

					},function(){
				        d3.selectAll(".nv-bar").on('click',
				            function(e){
				                //clear all 
				                $(".tooltip").css("display", "none");
				               	g.selectAll(".redcar_roadwork_points").data([]).exit().remove();
				                //remap roadworks
				                var label=e.label;
				                redcar_query=label;
				                if (e.label=="Active")
						   			label="Scheduled -Active";
						   		if (e.label=="Pending")
						   			label="Scheduled -Pending";
						   		var dateValues = $("#date-slider").dateRangeSlider("values");
				            	var min_date= dateValues.min;
				            	var max_date= dateValues.max;
	  							plot_redcar_roadworks(label, min_date, max_date);
				        });
				    });

	  		});
	  	}

	  	function plot_gullies(){
	  		//make api calls to plot gullies

	  		var collection= "gully";

	  		$.post( "./ajax/queryGullies.php", {collection: "testgully", query: null})
			  .done(function( response ) {
	  			var json= JSON.parse(response);
            	var itemArray=new Array();
            	$.each(json["results"], function (i, ob) {
            		itemArray.push(ob);
				});
				//plot with d3
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
		            	var level;
		            	if (d.si!=null){
		            		level= parseInt(d["si"].replace("%",""), 10);		            	
		            	}
		            	if (level==0)
		                	r=0;
		                else if (level < 30)
		                	r=1;
		                else if (level<=50)
		                	r=3;
		                else if (level <=75)
		                	r=5;
		                else 
		                	r=7;
		               	return r;
		        	})
		        	.on("click", function(d, i){
		        		console.log ("silt level: "+d["si"]);
		        	});

		        //map redcar roadworks
		        var dateValues = $("#date-slider").dateRangeSlider("values");
				var min_date= dateValues.min;
				var max_date= dateValues.max;
		        plot_redcar_roadworks(null,min_date, max_date);
	  		});
	  	}

	  	//D3 functions

	  	// Reposition the SVG to cover the features.
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
				g.selectAll(".redcar_roadwork_points")
		    		.attr('d', function(d) { 
			        	var x = project([d["geo"]["coordinates"][0], d["geo"]["coordinates"][1]])[0]; 
			        	y = project([d["geo"]["coordinates"][0], d["geo"]["coordinates"][1]])[1];
			        	return 'M ' + x +' '+ y + ' l 10 10 l -20 0 z';
			      	})
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

	});//end of D3 loop

	$("#map").on('click', function(event) {
	    if ($(".tooltip").css('opacity')>0 && ($(event.target).attr('class') !== 'tooltip')){
	    	$(".tooltip").css("opacity",0)
                     	.css("display", "none");
	    } 
	});
	$(".tooltip").on('dblclick click', function(event) {
		event.stopPropagation();
	});
});
