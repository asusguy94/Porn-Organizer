<?php
include('_class.php');

global $pdo;
$sql = "
            SELECT franchise, stars.id as starID, stars.name as starName, stars.image, stars.breast, stars.eyecolor, stars.haircolor, stars.hairstyle, attributes.name as attributeName
            FROM stars
              LEFT JOIN starattributes ON starattributes.starID = stars.id
              LEFT JOIN attributes ON attributes.id = starattributes.attributeID
              LEFT JOIN videostars ON videostars.starID = stars.id
              LEFT JOIN videos ON videostars.videoID = videos.id
            ORDER BY starName";

$query = $pdo->prepare($sql);
$query->execute();
$result = $query->fetchAll(PDO::FETCH_OBJ);

$attribute_arr = [];
$len = count($result);

$first = true;
print '{';
print '"stars": [';
for ($i = 0; $i < $len; $i++) {
	$franchise = $result[$i]->franchise;
	$starID = $result[$i]->starID;
	$starName = $result[$i]->starName;
	$starImg = $result[$i]->image;
	$breastSize = $result[$i]->breast;
	$eyeColor = $result[$i]->eyecolor;
	$hairColor = $result[$i]->haircolor;
	$hairStyle = $result[$i]->hairstyle;
	$attributeName = $result[$i]->attributeName;

	$nextIsDuplicate = ($i < $len - 1 && ($result[$i + 1]->starID == $starID));
	$prevIsDuplicate = ($i > 0 && ($result[$i - 1]->starID == $starID));


	if (!$prevIsDuplicate) { // first video of the bunch
		if ($first) print '{';

		print "\"starID\": $starID,";
		print "\"starName\": \"$starName\",";
		print "\"starImg\": \"$starImg\",";
		print "\"breast\": \"$breastSize\",";
		print "\"eye\": \"$eyeColor\",";
		print "\"hair\": \"$hairColor\",";
		print "\"hairstyle\": \"$hairStyle\",";
		print "\"franchise\": \"$franchise\",";
	}

	// Attribute INIT
	if (!is_null($attributeName)) {
		if (!in_array($attributeName, $attribute_arr)) array_push($attribute_arr, $attributeName);
	}
	if (((!$nextIsDuplicate && $prevIsDuplicate) || (!$nextIsDuplicate && !$prevIsDuplicate)) && $starName) { // last video of the bunch
		// Attribute
		print '"attribute": [';
		if (count($attribute_arr)) {
			for ($j = 0; $j < count($attribute_arr); $j++) {
				print "\"$attribute_arr[$j]\"";
				if ($j < count($attribute_arr) - 1) print ',';
			}
		}
		print ']';

		/* RESETS */
		$attribute_arr = [];
	}

	if (!$nextIsDuplicate) {
		print '';

		if ($i < $len - 1) print '},';
		else print '}';
	}
}

print ']';
print '}';