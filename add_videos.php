<?php
include('_class.php');
$basic = new Basic();
$db = new DB();
$file_class = new File();
?>

    <!doctype html>
    <html>
    <head>
		<?php $basic->head('', array('bootstrap')) ?>
    </head>

    <body>
    <nav>
		<?php $basic->navigation() ?>
    </nav>
    </body>
    </html>

<?php
global $pdo;
$root = glob('videos/*', GLOB_ONLYDIR);

$path_arr = [];
foreach ($root as $file) { // store directory names
	if (!$basic->contains($file, '_')) {
		array_push($path_arr, $file);
	}
}

$filesAdded = 0;

// get data from videos-table
$query = $pdo->prepare("SELECT path AS videoPath FROM videos");
$query->execute();
$result = $query->fetchAll(PDO::FETCH_OBJ);

$videoPath_arr = [];
for ($i = 0, $len = count($result); $i < $len; $i++) {
	array_push($videoPath_arr, $result[$i]->videoPath);
}

$error = [];
foreach ($path_arr as $directory) { // for each directory (website)
	$files = glob($directory . '/*');
	foreach ($files as $file) {
		$video_path = $file_class->getPath($file);
		if ($basic->getExtension($file) === 'webm' || !$basic->hasExtension($video_path)) continue;

		// Extract Data from File
		$video_website = $file_class->getWebsite($file);
		$video_site = $file_class->getSite($file);
		$video_star = $file_class->getStar($file);
		$video_title = $file_class->getTitle($file);
		$video_date = $file_class->getDate($file);

		// Add Data to DB
		if (!in_array($video_path, $videoPath_arr)) { // file does not exists in videos-table
			if (!$db->addVideo($video_path, $video_title, $video_date)) { // Add Video
				array_push($error, "Could not add Video: $video_path");
			}
			array_push($videoPath_arr, $video_path); // Update Array

			if ($db->websiteExists($video_website) && $db->siteExists($video_site)) { // Add WebsiteSite
				if (strlen($video_site)) {
					$websiteID = $db->getWebsite($video_website);
					$siteID = $db->getSite($video_site);

					$db->addWebsiteSite($websiteID, $siteID);
				}
			} else {
				if (!$db->websiteExists($video_website)) { // Add WebSite
					$db->addWebsite($video_website);
				}
				if (!$db->siteExists($video_site)) { // Add Site
					if (strlen($video_site)) {
						if ($video_website != '') $db->addSite($video_site, $db->getWebsite($video_website));
						else $db->addSite($video_site);
					}
				}
			}
			$filesAdded++;
		} else { // file exists in videos-table
			/* FIX duration - START */
			$ffmpeg = new FFMPEG();
			$query = $pdo->prepare("SELECT id FROM videos WHERE duration = 0 AND path = :path LIMIT 1");
			$query->bindParam(':path', $video_path);
			$query->execute();
			foreach ($query->fetchAll() AS $data) {
				if (file_exists("videos/$video_path")) {
					$query = $pdo->prepare("UPDATE videos SET duration = :duration WHERE id = :id AND path = :path");
					$query->bindParam(':duration', $ffmpeg->getDuration($video_path));
					$query->bindParam(':id', $data['id']);
					$query->bindParam(':path', $video_path);
					$query->execute();
				}
			}
			/* FIX duration - END */

			$db->checkStarRelation($file); // add star-video relation

			$db->checkVideoRelation($file); // add video-site relation

			// Uncomment Bellow if you are editing the date-part of the video-files
			//$db->checkVideoDate($file);
		}
	}
}

if (count($error)) {
	for ($i = 0; $i < count($error); $i++) {
		echo "$error[$i]<br>";
	}
} else if ($filesAdded) {
	header('Location: video_generatethumbnails.php');
}
?>