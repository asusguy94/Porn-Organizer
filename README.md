# Welcome
This is a project I'm using for an automated system of organizing my porn. Import **database.sql** with phpmyadmin to create the database and tables.

## Some information about the system
- The program is built on **HTML, PHP, MySQL & JavaScript**, so to use it you either have to run a local server or if you have another computer you could run the server from there
  - I'm running the server on a NAS...so any computer should be able to outperform my setup.
- The program is dependent on some libraries/files, but all of them should be within this repository
- The program is heavily dependent on the structure of the files/folders, for more info check the [Wiki](../../wiki)
- This project is **early in development**
- If anyone needs help with anything regarding the project, don't hesitate to ask!
- This project is loosely based on a Windows app, if you want to try that one here [Pornganizer](https://pornganizer.org)
  - This project uses some of the functionality similar to that program, but with a lot of folder/file automation.
- I also have another version of this project for a hentai-version of this organizer, if that is something that anyone wants to use as well, I can upload that too.
- Any help is appreciated...also with GitHub, as I'm quite new to the platform

## Requirements
- Server
  - **Linux**: LAMP
  - **WindowsXP**: XAMP
  - **Windows**: WAMP
- **Modern Web browser**: Chrome, Chromium, Firefox, etc..
- **Database name**: insert it into ```_class.php``` (or use default)
- **Database username**: insert into ```_class.php``` (or use default)
- **Database password**: insert into ```_class.php``` (or use default)
- If you want the DB-link in the navbar to work, you need to install phpmyadmin and move its install folder to phpMyAdmin inside the project folder


## Release vs Clone
There are 2 ways to use this project
- Download a release (stable but not often updated)
- Clone the project (latest features and updated often)
  - If you choose to clone the project you will need to do one more thing in order to use the project
   1. Install [Node.JS](https://nodejs.org/)
   2. Open the terminal of choice and CD into where you downloaded/cloned the directory to
      - If you downloaded the file to `C:/downloads`, you can run `CD C:/downloads/porn-organizer`
   4. Type `npm install` to download the required files.
   3. Type `gulp` to compile the nesseary files.

## TODO
- [ ] Implement Bootstap 4
- [ ] Video-page bookmark-visuals are broken on smaller devices
- [x] Upload .SQL file for project
