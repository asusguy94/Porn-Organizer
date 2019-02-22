<?php
include('_class.php');

$ffmpeg = new FFMPEG();

if (isset($_GET['videoID']) && !empty($_GET['videoID'])) {
	if (isset($_GET['seconds']) && !empty($_POST['seconds'])) {
		$seconds = $_GET['seconds'];
	}else{
		$seconds = THUMBNAIL_START;
	}
	$videoID = $_GET['videoID'];


	global $pdo;
	$query = $pdo->prepare("SELECT path FROM videos WHERE id = ? LIMIT 1");
	$query->bindValue(1, $videoID);
	$query->execute();
	if ($query->rowCount()) {
		$path = $query->fetch()['path'];
		$ffmpeg->generateThumbnail($path, $videoID, $seconds);
		$ffmpeg->generateThumbnail($path, $videoID, $seconds, THUMBNAIL_RES);
	}
}