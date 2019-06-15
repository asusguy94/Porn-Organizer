<?php
include('_class.php');
$basic = new Basic();
$video = new Video();
global $pdo;
$sql = "
            SELECT videos.path, videos.id AS videoID, videos.name AS video, videoalias.name AS alias, videos.franchise, videos.noStar, attributes.name AS attribute, categories.name AS category, videos.episode, videos.cen
            FROM videos
              LEFT JOIN videoalias ON videos.id = videoalias.videoID
              LEFT JOIN videostars ON videostars.videoID = videos.id
              LEFT JOIN starattributes ON videostars.starID = starattributes.starID
              LEFT JOIN attributes ON starattributes.attributeID = attributes.id
              LEFT JOIN videocategories ON videos.id = videocategories.videoID
              LEFT JOIN categories ON videocategories.categoryID = categories.id
            
          UNION ALL
            SELECT videos.path, videos.id AS videoID, videos.name AS video, videoalias.name AS alias, videos.franchise, videos.noStar, attributes.name AS attribute, categories.name AS category, videos.episode, videos.cen
            FROM videos
              LEFT JOIN videoalias ON videos.id = videoalias.videoID
              LEFT JOIN bookmarks ON videos.id = bookmarks.videoID
              LEFT JOIN bookmarkattributes ON bookmarkattributes.bookmarkID = bookmarks.id
              LEFT JOIN attributes ON bookmarkattributes.attributeID = attributes.id
              LEFT JOIN categories ON bookmarks.categoryID = categories.id
              
          ORDER BY franchise, episode
          ";

$query = $pdo->prepare($sql);
$query->execute();
$result = $query->fetchAll(PDO::FETCH_OBJ);

$attribute_arr = [];
$category_arr = [];
$alias_arr = [];

print '{';
print '"videos": [';
for ($i = 0, $len = count($result); $i < $len; $i++) {
	$videoID = $result[$i]->videoID;
	$videoName = $result[$i]->video;
	$noStar = $result[$i]->noStar;
	$franchise = $result[$i]->franchise;
	$attributeName = $result[$i]->attribute;
	$categoryName = $result[$i]->category;
	$fileName = $result[$i]->path;
	$aliasName = $result[$i]->alias;
	$cen = $result[$i]->cen;

	if (is_null($videoID)) {
		$query = $pdo->prepare("SELECT id FROM videos WHERE name = ? LIMIT 1");
		$query->bindValue(1, $videoName);
		$query->execute();

		$videoID = $query->fetch()['id'];
	}

	$nextIsDuplicate = ($i < $len - 1 && ($result[$i + 1]->video == $videoName));
	$prevIsDuplicate = ($i > 0 && ($result[$i - 1]->video == $videoName));


	if (!$prevIsDuplicate) { // first video of the bunch
		print '{';

		$thumbnail = "images/videos/$videoID-" . THUMBNAIL_RES . ".jpg";

		print "\"videoID\": $videoID,";
		print "\"noStar\": " . intval($noStar) . ",";
		print "\"cen\": \"$cen\",";
		print "\"franchise\": \"$franchise\",";
		print "\"videoName\": \"$videoName\",";
		print "\"thumbnail\": \"$thumbnail\",";
		print "\"md5\": \"" . md5_file("images/videos/$videoID-" . THUMBNAIL_RES . ".jpg") . "\",";
	}

	// Attribute INIT
	if (!is_null($attributeName)) {
		if (!in_array($attributeName, $attribute_arr)) array_push($attribute_arr, $attributeName);
	}

	// Category INIT
	if (!is_null($categoryName)) {
		if (!in_array($categoryName, $category_arr)) array_push($category_arr, $categoryName);
	}

	// Alias INIT
	if (!is_null($aliasName)) {
		if (!in_array($aliasName, $alias_arr)) array_push($alias_arr, $aliasName);
	}

	if (((!$nextIsDuplicate && $prevIsDuplicate) || (!$nextIsDuplicate && !$prevIsDuplicate)) && $videoName) { // last video of the bunch
		// Attribute
		print '"attribute": [';
		if (count($attribute_arr)) {
			for ($j = 0; $j < count($attribute_arr); $j++) {
				print "\"$attribute_arr[$j]\"";
				if ($j < count($attribute_arr) - 1) print ',';
			}
		}
		print '],';

		// Category
		print '"category": [';
		if (count($category_arr)) {
			for ($j = 0; $j < count($category_arr); $j++) {
				print "\"$category_arr[$j]\"";
				if ($j < count($category_arr) - 1) print ',';
			}
		}
		print '],';

		// Alias
		print '"alias": [';
		if (count($alias_arr)) {
			for ($j = 0; $j < count($alias_arr); $j++) {
				print "\"$alias_arr[$j]\"";
				if ($j < count($alias_arr) - 1) print ',';
			}
		}
		print ']';

		/* RESETS */
		$attribute_arr = [];
		$category_arr = [];
		$alias_arr = [];
	}

	if (!$nextIsDuplicate) {
		print '';

		if ($i < $len - 1) print '},';
		else print '}';
	}
}

print ']';
print '}';