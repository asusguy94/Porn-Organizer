<?php
include('../_class.php');
global $pdo;

$ffmpeg = new FFMPEG();
$ffmpeg->rootFix = true;

if (isset($_GET['videoID'])) {
	if (!empty($_GET['videoID'])) {
		$videoID = $_GET['videoID'];

		$query = $pdo->prepare("SELECT path FROM videos WHERE id = :videoID LIMIT 1");
		$query->bindParam(':videoID', $videoID);
		$query->execute();
		if ($query->rowCount()) {
			$fname = $query->fetch()['path'];

			$query = $pdo->prepare("UPDATE videos SET height = :height, duration = :duration, date = NOW() WHERE id = :videoID");
			$query->bindParam(':height', Basic::getClosestQ($ffmpeg->getVideoHeight($fname)));
			$query->bindParam(':duration', $ffmpeg->getDuration($fname));
			$query->bindParam(':videoID', $videoID);
			$query->execute();
		}
	}
}