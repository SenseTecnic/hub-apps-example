Gully Overview
==============
This application visualises UK gully data that is available on the Smartstreets hub: http://smartstreets.sensetecnic.com/

Dependencies
------------
- PHP
- MongoDB
- Mongo PHP Driver

Libraries
---------
Javascript libraries used include:
1. JQuery: http://jquery.com/
2. Leaflet (Map): http://leafletjs.com/
3. D3 (SVG map pins): http://d3js.org/
4. NvD3 (Charts): http://nvd3.org/
5. Crossfilter (client side data processing): http://square.github.io/crossfilter/
6. Heatmap.js ( Generating heatmap) : http://www.patrick-wied.at/static/heatmapjs/


How to Use
----------
1. Install MongoDB and the Mongo PHP Driver
2. Download the source code
3. Run script to populate gully sensor data in MongoDB, script location: "/resources/scripts/populate-mongo.php" (Note: set up cron job to run script periodically to retrieve new data)
4. Deploy site

