hub-apps-example
================
This application visualises UK gully and roadwork data that is available on the Smartstreets hub: http://smartstreets.sensetecnic.com/

Dependencies
------------
- PHP
- MongoDB

How to Use
----------
1. Install MongoDB
2. Download the code
3. Run script to populate gully sensor data in MongoDB, script location: "/resources/scripts/populate-mongo-gully.php" (Note: set up cron job to run script periodically to retrieve new data)
4. Run script to populate roadwork sensor data in MongoDB, script location: "/resources/scripts/populate-mongo-roadwork.php" (Note: set up cron job to run script periodically to retrieve new data)
5. Deploy site

