# hentai
A simple web management solution
## Getting started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.
### Prerequisites
#### Database
- Create a database
- Add tables to the database
  - **attributes** (TABLE NAME)
    - **id** (INT) AUTO_INCREMENT PRIMARY_KEY
    - **name** (VARCHAR255)
  - **bookmarkattributes** (TABLE NAME)
    - **id** (INT) AUTO_INCREMENT PRIMARY_KEY
    - **bookmarkID** (INT)
    - **attributeID** (INT)
  - **bookmarks** (TABLE NAME)
    - **id** (INT) AUTO_INCREMENT PRIMARY_KEY
    - **videoID** (INT)
    - **categoryID** (INT)
    - **start** (INT)
  - **bookmarkstars** (TABLE NAME)
    - **id** (INT) AUTO_INCREMENT PRIMARY KEY
    - **bookmarkID** (INT)
    - **starID** (INT)
  - **breast** (TABLE NAME)
    - **id** (INT) AUTO_INCREMENT PRIMARY KEY
    - **name** (VARCHAR255)
  - **categories** (TABLE NAME)
    - **id** (INT) AUTO_INCREMENT PRIMARY KEY
    - **name** (VARCHAR255)
  - **eye** (TABLE NAME)
    - **id** (INT) AUTO_INCREMENT PRIMARY KEY
    - **name** (VARCHAR255)
  - **hair** (TABLE NAME)
    - **id** (INT) AUTO_INCREMENT PRIMARY KEY
    - **name** (VARCHAR255)
  - **hairlength** (TABLE NAME)
    - **id** (INT) AUTO_INCREMENT PRIMARY KEY
    - **name** (VARCHAR255)
  - **hairstyle** (TABLE NAME)
    - **id** (INT) AUTO_INCREMENT PRIMARY KEY
    - **name** (VARCHAR255)
  - **starattributes** (TABLE NAME)
    - **id** (INT) AUTO_INCREMENT PRIMARY KEY
    - **starID** (INT)
    - **attributeID** (INT)
  - **stars** (TABLE NAME)
    - **id** (INT) AUTO_INCREMENT PRIMARY KEY
    - **name** (VARCHAR255)
    - **image** (VARCHAR255)
    - **hair** (VARCHAR255)
    - **hairstyle** (VARCHAR255)
    - **eye** (VARCHAR255)
    - **breast** (VARCHAR255)
  - **videoalias** (TABLE NAME)
    - **id** (INT) AUTO_INCREMENT PRIMARY KEY
    - **videoID** (INT)
    - **name** (VARCHAR255)
  - **videocategories** (TABLE NAME)
    - **id** (INT) AUTO_INCREMENT PRIMARY KEY
    - **videoID** (INT)
    - **starID** (INT)
  - **videos** (TABLE NAME)
    - **id** (INT) AUTO_INCREMENT PRIMARY KEY
    - **name** (VARCHAR255)
    - **episode** (VARCHAR255)
    - **path** (VARCHAR255)
    - **franchise** (VARCHAR255)
    - **noStar** (BOOL or TINY)
  - **videostars**
    - **id** (INT) AUTO_INCREMENT PRIMARY_KEY
    - **starID** (INT)
    - **videoID** (INT)

[Script for automatic creation](https://raw.githubusercontent.com/mnervik/hentai/master/hentai.sql?token=AOnpQNNlEOTnJeK-BZyG_i2jv_216ZYJks5b3rBswA%3D%3D)

#### _class.php
Edit the define-data at the top of the **_class.php** file, before "Try {".
- define('DB', 'INSERT_NAME_OF_YOUR_DATABASE')
- define('DB_USER', 'INSERT_DATABASE_USERNAME')
```
Use root if unsure
```
- define('DB_PASS', 'INSERT_DATABASE_PASSWORD')
```
Use blank if unsure and you used root as username
```
- define('CDN_MAX', NUMBER_OF_CDNS)
```
Number of virual cdn's to use for the project.
Set to 0 if you're not shure about what to set, or if you want to disable the feature.
This just allows the browser to load more than 6 elements at the same time due to a browser-limit.
```
- define('THUMBNAIL_RES', DESIRED_THUMBNAIL_WIDTH);
- OPTIONAL: define('DB_STR', 'mysql:host=YOUR_IP:PORT_NUMBER;dbname=' . DB);
```
  mariaDB port: 3307
  mySQL port: 3306
```

Thats it, now you're ready, enjoy.

## Issues
Bugs and issues withe low priority, learn to live with them. Most of the will not bother you more than once.

**If no categories exists, you cannot add any category to a video**
```
1. Add a category manually to the database table. This bug only occurs when the table has 0 rows.
```

**Attribute spelling error, or you accedentally created a new category by writing "softt" instead of "soft"**
```
Currently the way the structure of the database and php-functions work, is that it will create a new row that cannot be deleted through the app.
1. Remove the incorrect data by writing "_NULL" in the field with the incorrect data and click enter to save the changes. This will remove all data from that field.
2. Go to the database (click on "DB" at the top right to get into the administration)
3. Go to the database responsible for your app.
4. Go to the table with the incorrect data, i.e if you want to fix haircolor go to the hair-table.
5. BEFORE DOING ANYTHING: Check that nothing is using the unwanted data, this can be checked with the app (easy), or with the administration (intermediate).
6. Remove the unwanted data from the administration website and go back to the app. it should now be working again
```
## Copyright and License
[Plyr](js/license.md)

[The MIT License](LICENSE.md)
