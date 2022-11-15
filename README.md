# Porn NextJS

## Requirements

1. Modern Web Browser
2. Browser resolution set to 1920x1010 (not a hard requirement, but some stuff might be visually bugged otherwise)
3. Yarn package manger
4. Database (preferable mariaDB)
   - host
   - username
   - password
   - database
5. Docker application (eg. Docker Desktop)

## Installation

Edit `config/server.ts`
Edit `config/settings.ts`

## Docker

1. Path: `/app/media` >> your-media-path
2. Port: `3000` >> desired-port
3. Variable: `DATABASE_URL` >> eg. `mysql://user:pass@address:dbport/dbname`
4. Optional Variable: `290` >> thumbnail-width

## Features

Status of functionality can be found at [features.md](FEATURES.md)

## Customization

You can easily change some functionality by altering some of the variables in `config/`

### `server.ts`

Change this if your server has changed network address

### `settings.ts`

Change this if you want to alter the functionality of the app

### `theme.ts`

Change this if you want a different look/feel of the app
