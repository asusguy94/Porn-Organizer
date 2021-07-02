# PornJS Frontend Scripts

## Requirements

1. Yarn package manager
2. Modern Web Browser
3. Browser resolution set to 1920x1080 (not a hard requirement, but you might have to change some variables otherwise)

## Installation

1. Edit config.json
   | Variable | Details |
   | :---: | --- |
   | `api` | The URL to the backend scripts |
   | `source` | The path to the old server...useful for grabbing images, and also to be able to play videos |
   | `db` | The root path for phpMyAdmin, it can usually be set to the same as `source` |
   |`hls`|`enabled`: Enable HLS playback (requires special files)<br/>`maxLevel`: Highest quality allowed by HLS<br/>`maxStartLevel`: Highest initial quality allowed by HLS |

    > You change other variables in `config.json` to change the functionality, but none of these changes are required

1. Install NPM and then Yarn
1. Make sure the backend scripts are running, _scroll down for more info_

## Start Scripts

1. Open terminal in this folder
2. Run `yarn` to install the packages
3. Run `yarn build` to build the scripts
4. Run `yarn server` to start the app

## Backend Scripts

Backend scripts can be found in on of my other repositories: [Backend Scripts](https://github.com/asusguy94/Porn-Organizer-api)

## Features

Status of functionality can be found at [features.md](FEATURES.md)

## Known issues

-   Search-pages starts to slow down after 100-200 elements
