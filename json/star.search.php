<?php
include('../_class.php');

global $pdo;
$sql = "
            SELECT stars.id AS starID, stars.name, stars.image, stars.haircolor, stars.breast, stars.ethnicity, stars.country, DATEDIFF(NOW(), stars.birthdate) AS age, websites.name AS websiteName, videostars.videoID,
              (SELECT COUNT(videostars.id) FROM videostars WHERE videostars.starID = stars.id) AS videoCount
            	FROM stars
            	LEFT JOIN videostars ON videostars.starID = stars.id
            	LEFT JOIN videowebsites ON videowebsites.videoID = videostars.videoID
            	LEFT JOIN websites ON websites.id = videowebsites.websiteID
            	ORDER BY stars.name, videoID
          ";

$query = $pdo->prepare($sql);
$query->execute();
$result = $query->fetchAll(PDO::FETCH_OBJ);

print '{';
print '"stars": [';
for ($i = 0, $len = count($result), $website_arr = []; $i < $len; $i++) {
	$starID = $result[$i]->starID;
	$starName = $result[$i]->name;
	$starImage = $result[$i]->image;
	$breast = $result[$i]->breast;
	$hair = $result[$i]->haircolor;
	$ethnicity = $result[$i]->ethnicity;
	$country = $result[$i]->country;
	$starAge = $result[$i]->age;
	$videoCount = $result[$i]->videoCount;

	/* Array */
	$websiteName = $result[$i]->websiteName;

	/* Duplicate Check */
	$nextIsDuplicate = (($result[$i + 1]->starID == $starID) && $i < $len - 1);
	$prevIsDuplicate = (($result[$i - 1]->starID == $starID) && $i >= 0);


	if (!$prevIsDuplicate) { // first star of the bunch
		print '{';

		print "\"starID\": $starID,";
		print "\"starName\": \"$starName\",";
		print "\"image\": \"$starImage\",";
		print "\"breast\": \"$breast\",";
		print "\"hair\": \"$hair\",";
		print "\"ethnicity\": \"$ethnicity\",";
		print "\"age\": \"$starAge\",";
		print "\"country\": \"$country\",";
		print "\"videoCount\": \"$videoCount\",";
	}

	// Website INIT
	if (!is_null($websiteName)) {
		if (!in_array($websiteName, $website_arr)) array_push($website_arr, $websiteName);
	}

	// Duplicate Check
	if (!$nextIsDuplicate) { // last star of the bunch
		// Attribute
		print '"website": [';
		if (count($website_arr)) {
			for ($j = 0; $j < count($website_arr); $j++) {
				print "\"$website_arr[$j]\"";
				if ($j < count($website_arr) - 1) print ',';
			}
		}
		print ']';

		if ($i < $len - 1) print '},';
		else print '}';

		/* RESETS */
		$website_arr = [];
	}
}

print ']';
print '}';