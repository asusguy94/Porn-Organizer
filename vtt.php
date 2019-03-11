<?php
require '_class.php';
$vtt = new VTT();

global $pdo;
$query = $pdo->prepare("SELECT * FROM videos");
$query->execute();

$count = 0;
foreach ($query->fetchAll() AS $video) {
	if($count > 10){
		header('Refresh: 0');
		die();
	}else if (!file_exists("vtt/$video[id].vtt")) {
		$vtt->generateVtt($video['path'], $video['id']);
		$count++;
	}
}