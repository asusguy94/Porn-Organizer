# Porn NextJS

## Requirements

1. Modern Web Browser
2. Browser resolution set to 1920x1080 (not a hard requirement, but some stuff might be visually bugged otherwise)
3. Yarn package manger
4. Database (preferable mariaDB)
   - host
   - username
   - password
   - database
5. Docker application (eg. Docker Desktop)

## Installation

Any setting ending with `*` is required

### List of settings

| Keyword                         | Description                                                                                        |
| ------------------------------- | -------------------------------------------------------------------------------------------------- |
| DATABASE_URL\*                  | The database URL for your chosen database                                                          |
| NEXT_PUBLIC_DB_ADMIN            | The url for the DB-link in the navbar _(default=`/db`)_                                            |
| NEXT_PUBLIC_TIMELINE_OFFSET     | The left offset of the timeline (default=`1`)                                                      |
| NEXT_PUBLIC_TIMELINE_SPACING    | The max allowed horizontal spacing between bookmarks (default=`0`)                                 |
| NEXT_PUBLIC_PLAYER_DURATIONDIFF | The max allowed difference of a video's duration and the reported duration (default=`1`)           |
| NEXT_PUBLIC_THUMBNAILS          | Weather generated thumbnails should be used (default=`false`)                                      |
| NEXT_PUBLIC_USER_THUMB          | Weather window should be closed after a thumbnail has been created (default=`false`)               |
| THUMBNAIL_RES                   | The height used for thumbnails (default=`290`)                                                     |
| THEPORNDB_API                   | The API-KEY used, for getting data                                                                 |
| PORT\*                          | _Only required for docker._ The port used for the application (default=`3000`)                     |
| PATH\*                          | _Only docker._ The path to map to `app/media` (this directory should contain a `videos`-directory) |

### With Docker

Map the required path, port, and variables, [see the table above](#list-of-settings)

### Without Docker

Add a `videos`-directory inside a `media`-directory in the `root`-directory, and place all your videos within the `videos`-directory

`sample.env` can be found in the root-directory, just rename it to `.env`, and change the data of the file.

Change any required/optional variables [see the table above](#list-of-settings)

Run the following command to generate your database structure

```bash
   yarn prisma db push
```

## Starting the app

### Starting the app with docker

Start the docker container

### Starting the app without docker

Run the following command

```bash
yarn build && yarn start
```

## Features

Status of functionality can be found at [features.md](FEATURES.md)

## Recommendations

### Screen resolution

| Resolution | Attributes / Locations / Categories |
| ---------- | ----------------------------------- |
| 1080p      | 0-18                                |
| 1440p      | 19-37                               |
| 2160p      | 38+                                 |
