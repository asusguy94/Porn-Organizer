<?php
include('../_class.php');

global $pdo;
$sql = "
            SELECT videos.id AS videoID, videos.path, videos.name AS videoName, videos.date AS videoDate, stars.name AS star, datediff(videos.date, stars.birthdate) AS ageinvideo, categories.name AS categoryName, attributes.name AS attributeName, websites.name AS websiteName
            	FROM videos
                	LEFT JOIN videostars ON videos.id = videostars.videoID
                	LEFT JOIN stars ON stars.id = videostars.starID
                	LEFT JOIN videowebsites ON videos.id = videowebsites.videoID
                	LEFT JOIN websites ON videowebsites.websiteID = websites.id
                	LEFT JOIN videocategories ON videos.id = videocategories.videoID
                	LEFT JOIN categories ON videocategories.categoryID = categories.id
                	LEFT JOIN videoattributes ON videos.id = videoattributes.videoID
                	LEFT JOIN attributes ON videoattributes.attributeID = attributes.id
            	ORDER BY videoName
          ";

$query = $pdo->prepare($sql);
$query->execute();
$result = $query->fetchAll(PDO::FETCH_OBJ);

print '{';
print '"videos": [';
for ($i = 0, $len = count($result), $category_arr = [], $attribute_arr = []; $i < $len; $i++) {
	$videoID = $result[$i]->videoID;
	$videoName = $result[$i]->videoName;
	$videoDate = $result[$i]->videoDate;
	$star = $result[$i]->star;
	$websiteName = $result[$i]->websiteName;
	$ageInVideo = $result[$i]->ageinvideo;

	if (!$ageInVideo) {
		$query_age = $pdo->prepare("SELECT starAge FROM videos WHERE id = :videoID AND starAge IS NOT NULL");
		$query_age->bindParam(':videoID', $videoID);
		$query_age->execute();
		if ($query_age->rowCount()) $ageInVideo = $query_age->fetch()['starAge'] * 365;
	}
	if (!$ageInVideo) $ageInVideo = 0;

	/* Array */
	$categoryName = $result[$i]->categoryName;
	$attributeName = $result[$i]->attributeName;


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
		print "\"star\": \"$star\",";
		print "\"websiteName\": \"$websiteName\",";
		print "\"ageInVideo\": \"$ageInVideo\",";
		print "\"thumbnail\": \"$thumbnail\",";

		if (basic::file_exists($thumbnail)) print '"md5": "' . md5_file("..$thumbnail") . '",';
		else print '"md5": "0",';

		/*if (basic::file_exists($video)) print '"existing": "1",';
		else print '"existing": "0",';*/
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
		print ']';

		if ($i < $len - 1) print '},';
		else print '}';

		/* RESETS */
		$category_arr = [];
		$attribute_arr = [];
	}
}

print ']';
print '}';