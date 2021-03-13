# PornJS

## Frontend Requirements

1. NodeJS
2. Modern Web Browser
3. Browser resolution set to 1920x1080 (not a hard requirement, but some stuff might be visually bugged otherwise)

## Backend Requirements (API & SERVER)

1. NodeJS
2. Database (preferable mariaDB) with known _port_, _username_, _password_, _Database Name_
3. FFMPEG and FFPROBE (one of the following) ([more info](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg#prerequisites))
    1. Installed to the server-computer and added to path
    2. Installed to the server-computer and added to ENV
    3. Installed to the server-computer in the root folder of the SERVER-project

## Installation

1. Edit config.json
   | Variable | Details |
   | :---: | --- |
   | `api` | The URL to the backend scripts |
   | `source` | The path to the old server...usefull for grabbing images, and also to be able to play videos |
   | `db` | The root path for phpMyAdmin, it can usually be set to the same as `source` |
   |`hls`|`enable`: Enable HLS playback (requires special files)<br/>`maxLevel`: Highest quality allowed by HLS<br/>`maxStartLevel`: Highest initial quality allowed by HLS |

2. Install NPM and then Yarn
3. Make sure the backend scripts are running, _scroll down for more info_

## Backend START

1. Navigate to the backend-scripts folder (where _app.js_ is located)
2. Run `npm i` to install the packages
3. Run `node app.js` to start the backend-scripts

## Frontend START

1. Navigate to the scripts folder (where _app.js_ is located)
2. Run `yarn` to install the packages
3. Run `yarn build` to build the scripts
4. Run `yarn server` to start the app

## Features

Status of functionality can be found at [features.md](FEATURES.md)
