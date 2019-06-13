<?php
include('../_class.php');

if (isset($_GET['videoID'])) {
	if (!empty($_GET['videoID'])) {
		$videoID = $_GET['videoID'];

		global $pdo;
		$query = $pdo->prepare("SELECT * FROM plays WHERE videoID = :videoID AND time = NOW() LIMIT 1");
		$query->bindParam(':videoID', $videoID);
		$query->execute();
		if(!$query->rowCount()){
			$query = $pdo->prepare("INSERT INTO plays(videoID) VALUES(:videoID)");
			$query->bindParam(':videoID', $videoID);
			$query->execute();
		}
	}
}