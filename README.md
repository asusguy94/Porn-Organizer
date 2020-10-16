# Warning

This is early alpha version of the next version, only use this if you're interested to see how far the project is coming!

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
4. Run `yarn start` within the project
5. Open [http://localhost:3000](http://localhost:3000) on the browser, to open the app

## Backend scripts

> Backend scripts can be found in the **_releases_** section. The backend script version needs to match the version of the app

1. Run the backend scripts on a separate web-path. Using WAMP / LAMP / XAMP should work fine.
2. Make sure the previous branch (@v2) of this app is running in the background

3. The backend scripts uses uses the same database structure as the current version, and should work without issues.

## Features

Status of functionality can be found at [features.md](FEATURES.md)

## Special Requirements

-   video-thumbnails(WebVTT) to be generated, which can be done with the previous version.

## Known Bugs

This app has a requirement of cors-requests, but sometimes they just don't work as intended. You can install a browser extension to fix it. I usually use **`Allow CORS`** extension on Google Chrome
