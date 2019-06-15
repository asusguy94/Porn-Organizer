<?php
include('../_class.php');

if (isset($_GET['videoID']) && isset($_GET['franchiseName'])) {
	if (!empty($_GET['videoID']) && !empty($_GET['franchiseName'])) {
		$videoID = $_GET['videoID'];
		$franchiseName = $_GET['franchiseName'];

		global $pdo;
		$query = $pdo->prepare("SELECT id FROM videos WHERE franchise = ? AND id = ? LIMIT 1");
		$query->bindValue(1, $franchiseName);
		$query->bindValue(2, $videoID);
		$query->execute();
		if(!$query->rowCount()){
			$query = $pdo->prepare("UPDATE videos SET franchise = ? WHERE id = ?");
			$query->bindValue(1, $franchiseName);
			$query->bindValue(2, $videoID);
			$query->execute();
		}
	}
}