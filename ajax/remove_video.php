<?php
include('../_class.php');

if (isset($_GET['videoID'])) {
	if (!empty($_GET['videoID'])) {
		$videoID = $_GET['videoID'];

		global $pdo;
		$query = $pdo->prepare("SELECT * FROM videos WHERE id = :videoID LIMIT 1");
		$query->bindParam(':videoID', $videoID);
		$query->execute();
		foreach ($query->fetchAll() as $data) {
			$hlsDir = '../videos/' . Basic::removeExtensionPath($data['path']);

			$query = $pdo->prepare("SELECT id FROM videostars WHERE videoID = :videoID LIMIT 1");
			$query->bindParam(':videoID', $videoID);
			$query->execute();
			if (!$query->rowCount()) { // check if the video has some stars
				if (file_exists('../videos/' . $data['path'])) {
					if (unlink('../videos/' . $data['path'])) {
						$webmPath = str_replace('.mp4', '.webm', str_replace('.m4v', '.webm', $data['path']));
						if (file_exists('../videos/' . $webmPath)) {
							unlink('../videos/' . $webmPath);
						}
						removeFromDB($videoID);
						removeThumbnails($videoID);
						removeHls($hlsDir);
					}
				} else {
					removeFromDB($videoID);
					removeThumbnails($videoID);
					removeHls($hlsDir);
				}
			}
		}
	}
}

function removeFromDB($videoID)
{
	global $pdo;

	/* Remove Video */
	$query = $pdo->prepare("DELETE FROM videos WHERE id = :videoID");
	$query->bindParam(':videoID', $videoID);
	$query->execute();

	/* Remove Site */
	$query = $pdo->prepare("DELETE FROM videosites WHERE videoID = :videoID");
	$query->bindParam(':videoID', $videoID);
	$query->execute();

	/* Remove Website */
	$query = $pdo->prepare("DELETE FROM videowebsites WHERE videoID = :videoID");
	$query->bindParam(':videoID', $videoID);
	$query->execute();

	/* Remove Attributes */
	$query = $pdo->prepare("DELETE FROM videoattributes WHERE videoID = :videoID");
	$query->bindParam(':videoID', $videoID);
	$query->execute();

	/* Remove Locations */
	$query = $pdo->prepare("DELETE FROM videolocations WHERE videoID = :videoID");
	$query->bindParam(':videoID', $videoID);
	$query->execute();
}

function removeThumbnails($videoID)
{
	unlink("../images/videos/$videoID.jpg");
	unlink("../images/videos/$videoID-" . THUMBNAIL_RES . ".jpg");

	unlink("../images/thumbnails/$videoID.jpg");
	unlink("../images/vtt/$videoID.vtt");
}

function removeHls($dir)
{
	$path = opendir($dir);
	while (false !== ($file = readdir($path))) {
		if (($file != '.') && ($file != '..')) {
			$full = $dir . '/' . $file;
			if (is_dir($full)) {
				removeHls($full);
			} else {
				unlink($full);
			}
		}
	}
	closedir($path);
	rmdir($dir);
}