<?php
include('../_class.php');

if (isset($_GET['videoID']) && isset($_GET['videoName'])) {
	if (!empty($_GET['videoID']) && !empty($_GET['videoName'])) {
		$videoID = $_GET['videoID'];
		$videoName = $_GET['videoName'];

		global $pdo;
		$query = $pdo->prepare("UPDATE videos SET name = ? WHERE id = ?");
		$query->bindValue(1, $videoName);
		$query->bindValue(2, $videoID);
		$query->execute();
	}
}