<?php
include('../_class.php');

$ffmpeg = new FFMPEG();

if (isset($_GET['videoID']) && isset($_GET['seconds'])) {
	if (!empty($_GET['videoID'])) {
		$videoID = $_GET['videoID'];
		$seconds = $_GET['seconds'];

		if(empty($seconds)) $seconds = THUMBNAIL_START; // OVERRIDE WITH DEFAULT IF ZERO

		global $pdo;
		$query = $pdo->prepare("SELECT path FROM videos WHERE id = ? LIMIT 1");
		$query->bindValue(1, $videoID);
		$query->execute();
		if($query->rowCount()){
			$path = $query->fetch()['path'];
			$ffmpeg->generateThumbnail($path, $videoID, $seconds);
			$ffmpeg->generateThumbnail($path, $videoID, $seconds, THUMBNAIL_RES);
		}
	}
}