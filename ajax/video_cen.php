<?php
include('../_class.php');
global $pdo;

if (isset($_GET['videoID'])) {
	if (!empty($_GET['videoID'])) {
		$videoID = $_GET['videoID'];

		$query = $pdo->prepare("SELECT cen FROM videos WHERE id = :videoID LIMIT 1");
		$query->bindParam(':videoID', $videoID);
		$query->execute();
		if ($query->rowCount()) {
			$cen = intval(!$query->fetch()['cen']);

			$query = $pdo->prepare("UPDATE videos SET cen = :cen WHERE id = :videoID");
			$query->bindParam(':cen', $cen);
			$query->bindParam(':videoID', $videoID);
			$query->execute();
		}
	}
}