# Feature implementation status (OUTDATED)

## Priority Explanation

|  Priority  | Explanation                                                   |
| :--------: | ------------------------------------------------------------- |
|    HIGH    | Feature will be implemented as soon as possible               |
|    LOW     | Feature will take some time to implement, or might be removed |
| FUNCTIONAL | Feature is working, but not optimal                           |

## Issue Explanation

| Name            | Description                                                              |
| --------------- | ------------------------------------------------------------------------ |
| VideoFileRename | Solution breaks the VideoPlayer, so reloading is still the best solution |
| StarVideosHover | Throws an error when hovering, still works though                        |
| StarIgnoreIcon  | Icon is not changed, unless page is refreshed                            |

## :heavy_check_mark: Home Page

| Name           | Status             |
| -------------- | ------------------ |
| Recent Videos  | :heavy_check_mark: |
| Newest Videos  | :heavy_check_mark: |
| Popular Videos | :heavy_check_mark: |

## :x: Import Videos

| Name                | Status             | Priority |
| ------------------- | ------------------ | :------: |
| Import Videos       | :heavy_check_mark: |          |
| Generate Thumbnails | :heavy_check_mark: |          |
| Generate WebVTT     | :x:                |   LOW    |

## :warning: Video Search

### :heavy_check_mark: Main Section

| Name          | Status             |
| ------------- | ------------------ |
| Video         | :heavy_check_mark: |
| Video Ribbon  | :heavy_check_mark: |
| Video Counter | :heavy_check_mark: |

### :warning: Sidebar

| Name                 | Status                               | Priority |
| -------------------- | ------------------------------------ | :------: |
| Title Search _INPUT_ | :heavy_check_mark:                   |          |
| Sort                 | :heavy_check_mark:                   |          |
| Website _DROPDOWN_   | :x: Should filter websites and sites |   LOW    |
| Category _CHECKBOX_  | :heavy_check_mark:                   |          |
| Attribute _CHECKBOX_ | :heavy_check_mark:                   |          |
| Location _CHECKBOX_  | :heavy_check_mark:                   |          |

## :heavy_check_mark: Star Search

### :heavy_check_mark: Main Section

| Name         | Status             |
| ------------ | ------------------ |
| Star         | :heavy_check_mark: |
| Star Counter | :heavy_check_mark: |

### :heavy_check_mark: Sidebar

| Name                | Status             |
| ------------------- | ------------------ |
| Name Search _INPUT_ | :heavy_check_mark: |
| Sort                | :heavy_check_mark: |
| Breast _RADIO_      | :heavy_check_mark: |
| Haircolor _RADIO_   | :heavy_check_mark: |
| Ethnicity _RADIO_   | :heavy_check_mark: |
| Country _DROPDOWN_  | :heavy_check_mark: |

## :warning: Video Page

### :heavy_check_mark: Heading

| Name             | Status             |
| ---------------- | ------------------ |
| Rename Title     | :heavy_check_mark: |
| Add Attribute    | :heavy_check_mark: |
| Add Location     | :heavy_check_mark: |
| Copy Title       | :heavy_check_mark: |
| Copy Star        | :heavy_check_mark: |
| Remove Attribute | :heavy_check_mark: |
| Remove Location  | :heavy_check_mark: |
| Refresh Date     | :heavy_check_mark: |
| Next ID          | :heavy_check_mark: |

### :heavy_check_mark: Video

| Name             | Status                                        |  Priority  |
| ---------------- | --------------------------------------------- | :--------: |
| Add Bookmark     | :heavy_check_mark:                            |            |
| Set Age          | :heavy_check_mark:                            |            |
| Rename File      | :heavy_check_mark: [Info](#issue-explanation) | FUNCTIONAL |
| Remove Bookmarks | :heavy_check_mark:                            |            |
| Remove Plays     | :heavy_check_mark:                            |            |
| Delete Video     | :heavy_check_mark:                            |            |

### :heavy_check_mark: Bookmark

| Name            | Status             |
| --------------- | ------------------ |
| Change Category | :heavy_check_mark: |
| Change Time     | :heavy_check_mark: |
| Delete Bookmark | :heavy_check_mark: |

### :heavy_check_mark: Star

| Name        | Status             |
| ----------- | ------------------ |
| Remove Star | :heavy_check_mark: |
| [Hover]     | :heavy_check_mark: |

### :x: Star-Form

| Name             | Status | Priority |
| ---------------- | ------ | :------: |
| Add Star _INPUT_ | :x:    |   LOW    |

## :heavy_check_mark: Star Page

### :heavy_check_mark: Dropbox

| Name         | Status             |
| ------------ | ------------------ |
| Drop Area    | :heavy_check_mark: |
| Delete Star  | :heavy_check_mark: |
| [ImageHover] | :heavy_check_mark: |

### :heavy_check_mark: Image

| Name         | Status             |
| ------------ | ------------------ |
| Delete Image | :heavy_check_mark: |

### :heavy_check_mark: Star Name

| Name   | Status                         |
| ------ | ------------------------------ |
| Rename | :heavy_check_mark:             |
| Ignore | :x: [Info](#issue-explanation) |

### :heavy_check_mark: Input Fields

| Name               | Status             |
| ------------------ | ------------------ |
| Breast _INPUT_     | :heavy_check_mark: |
| Eye Color _INPUT_  | :heavy_check_mark: |
| Hair Color _INPUT_ | :heavy_check_mark: |
| Ethnicity _INPUT_  | :heavy_check_mark: |
| Country _INPUT_    | :heavy_check_mark: |
| Birthdate _INPUT_  | :heavy_check_mark: |
| Height _INPUT_     | :heavy_check_mark: |
| Weight _INPUT_     | :heavy_check_mark: |
| Start _INPUT_      | :heavy_check_mark: |
| End _INPUT_        | :heavy_check_mark: |

### :heavy_check_mark: Video list

| Name            | Status                                        |  Priority  |
| --------------- | --------------------------------------------- | :--------: |
| Video Thumbnail | :heavy_check_mark:                            |            |
| Video Title     | :heavy_check_mark:                            |            |
| [Hover]         | :heavy_check_mark: [Info](#issue-explanation) | FUNCTIONAL |
