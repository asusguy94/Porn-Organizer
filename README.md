# PornJS Frontend Scripts

## Requirements

1. Yarn package manager
2. Modern Web Browser
3. Browser resolution set to 1920x1080 (not a hard requirement, but you might have to change some variables otherwise)

## Installation

1. Edit `config/server.ts`
   | Variable | Details |
   | :---: | --- |
   | `api` | The URL to the backend scripts |
   | `source` | The path to the old server...useful for grabbing images, and also to be able to play videos |
   | `db` | The root path for phpMyAdmin, it can usually be set to the same as `source` |

2. Edit `config/settings.ts`
   | Variable | Details |
   | :---: | --- |
   |`hls`|`enabled`: Enable HLS playback (requires special files)<br/>`maxLevel`: Highest quality allowed by HLS<br/>`maxStartLevel`: Highest initial quality allowed by HLS |

3. Install NPM and then Yarn
4. Make sure the backend scripts are running, _scroll down for more info_

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

### Customization

You can easily change some functionality by altering some of the variables in `config/`

#### `server.ts`

Change this if your server has changed network address

#### `settings.ts`

Change this if you want to alter the functionality of the app app

#### `theme.ts`

Change this if you want a different look/feel of the app
