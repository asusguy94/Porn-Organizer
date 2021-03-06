<?php
    include('../_class.php');
    
    global $pdo;
    $sql = "
            SELECT videos.id AS videoID, videos.starAge, videos.path, videos.name AS videoName,
                   videos.date AS videoDate, videos.added AS videoAdded, stars.name AS star,
                   datediff(videos.date, stars.birthdate) AS ageinvideo,
                   websites.name AS websiteName, sites.name AS siteName,
                   categories.name AS categoryName,
                   attributes.name AS attributeName,
                   locations.name AS locationName
                   
            	FROM videos
                	LEFT JOIN videostars ON videos.id = videostars.videoID
                	LEFT JOIN stars ON stars.id = videostars.starID
                	LEFT JOIN videowebsites ON videos.id = videowebsites.videoID
                	LEFT JOIN websites ON videowebsites.websiteID = websites.id
            	    LEFT OUTER JOIN videosites ON videosites.videoID = videos.id
            	    LEFT JOIN sites ON sites.id = videosites.siteID
                	LEFT JOIN videocategories ON videos.id = videocategories.videoID
                	LEFT JOIN categories ON videocategories.categoryID = categories.id
                	LEFT JOIN videoattributes ON videos.id = videoattributes.videoID
                	LEFT JOIN attributes ON videoattributes.attributeID = attributes.id
                	LEFT OUTER JOIN videolocations ON videos.id = videolocations.videoID
                	LEFT JOIN locations ON videolocations.locationID = locations.id
            	ORDER BY videos.name, videos.path
          ";
    
    $query = $pdo->prepare($sql);
    $query->execute();
    $result = $query->fetchAll(PDO::FETCH_OBJ);
    
    print '{';
    print '"videos": [';
    for ($i = 0, $len = count($result), $category_arr = [], $attribute_arr = [], $location_arr = []; $i < $len; $i++) {
        $videoID = $result[$i]->videoID;
        $videoName = $result[$i]->videoName;
        $videoDate = $result[$i]->videoDate;
        $videoAdded = $result[$i]->videoAdded;
        $star = $result[$i]->star;
        $websiteName = $result[$i]->websiteName;
        $siteName = $result[$i]->siteName;
        $ageInVideo = $result[$i]->ageinvideo;
        $ageInVideo_alt = $result[$i]->starAge;
        
        if (!$ageInVideo) {
            if (!is_null($ageInVideo_alt)) $ageInVideo = $ageInVideo_alt * 365;
            else $ageInVideo = 0;
        }
        
        /* Array */
        $categoryName = $result[$i]->categoryName;
        $attributeName = $result[$i]->attributeName;
        $locationName = $result[$i]->locationName;
        
        
        /* Duplicate Check */
        $videoPath = $result[$i]->path;
        $nextIsDuplicate = ($i < $len - 1 && ($result[$i + 1]->path == $videoPath));
        $prevIsDuplicate = ($i > 0 && ($result[$i - 1]->path == $videoPath));
        
        
        if (!$prevIsDuplicate) { // first video of the bunch
            print '{';
            
            $thumbnail = "../images/videos/$videoID-" . THUMBNAIL_RES . ".jpg";
            $video = "../videos/$videoPath";
            
            print "\"videoID\": $videoID,";
            print "\"videoName\": \"" . str_replace('"', '\\"', $videoName) . "\",";
            print "\"videoDate\": \"$videoDate\",";
            print "\"videoAdded\": \"$videoAdded\",";
            print "\"star\": \"$star\",";
            print "\"websiteName\": \"$websiteName\",";
            print "\"siteName\": \"$siteName\",";
            print "\"ageInVideo\": \"$ageInVideo\",";
            print "\"thumbnail\": \"$thumbnail\",";
            print "\"plays\": \"" . getPlays($videoID) . "\",";
            print '"existing": "1",';
        }

        // Category INIT
        if (!is_null($categoryName)) {
            if (!in_array($categoryName, $category_arr)) array_push($category_arr, $categoryName);
        }

        // Attribute INIT
        if (!is_null($attributeName)) {
            if (!in_array($attributeName, $attribute_arr)) array_push($attribute_arr, $attributeName);
        }

        // Locations INIT
        if (!is_null($locationName)) {
            if (!in_array($locationName, $location_arr)) array_push($location_arr, $locationName);
        }

        // Duplicate Check
        if (!$nextIsDuplicate) { // last video of the bunch
            // Category
            print '"category": [';
            if (count($category_arr)) {
                for ($j = 0; $j < count($category_arr); $j++) {
                    print "\"$category_arr[$j]\"";
                    if ($j < count($category_arr) - 1) print ',';
                }
            }
            print '],';

            // Attribute
            print '"attribute": [';
            if (count($attribute_arr)) {
                for ($j = 0; $j < count($attribute_arr); $j++) {
                    print "\"$attribute_arr[$j]\"";
                    if ($j < count($attribute_arr) - 1) print ',';
                }
            }
            print '],';

            // Location
            print '"location": [';
            if (count($location_arr)) {
                for ($j = 0; $j < count($location_arr); $j++) {
                    print "\"$location_arr[$j]\"";
                    if ($j < count($location_arr) - 1) print ',';
                }
            }
            print ']';

            if ($i < $len - 1) print '},';
            else print '}';
            
            // RESETS
            $category_arr = [];
            $attribute_arr = [];
            $location_arr = [];
        }
    }
    
    print ']';
    print '}';
    
    function initArray(&$arr, $item)
    {
        if (!is_null($item)) {
            if (!in_array($item, $arr)) array_push($arr, $item);
        }
    }
    
    function handleArray($label, $arr, $last = false)
    {
        print '"' . $label . '": [';
        if (count($arr)) {
            for ($j = 0; $j < count($arr); $j++) {
                print "\"$arr[$j]\"";
                if ($j < count($arr) - 1) print ',';
            }
        }
        print ']';
        if (!$last) print ',';
    }
    
    function getPlays($id)
    {
        global $pdo;
        $query = $pdo->prepare("SELECT COUNT(*) AS total FROM plays WHERE videoID = :videoID");
        $query->bindParam(':videoID', $id);
        $query->execute();
        return $query->fetch()['total'];
    }