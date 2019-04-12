<?php
require '_class.php';
$vtt = new VTT();

global $pdo;
$query = $pdo->prepare("SELECT * FROM videos");
$query->execute();

foreach ($query->fetchAll() AS $video) {
	if (file_exists("videos/$video[path]") && !file_exists("vtt/$video[id].vtt")) {
		$vtt->generateVtt($video['path'], $video['id']);
	}
}