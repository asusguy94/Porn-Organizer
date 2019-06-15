<?php
include('../_class.php');

if (isset($_GET['seconds']) && isset($_GET['categoryID']) && isset($_GET['videoID'])) {
	if (!empty($_GET['seconds']) && !empty($_GET['categoryID']) && !empty($_GET['videoID'])) {
		$seconds = $_GET['seconds'];
		$categoryID = $_GET['categoryID'];
		$videoID = $_GET['videoID'];

		$query = $pdo->prepare("SELECT id FROM bookmarks WHERE videoID = ? AND categoryID = ? AND start = ? LIMIT 1");
		$query->bindValue(1, $videoID);
		$query->bindValue(2, $categoryID);
		$query->bindValue(3, $seconds);
		$query->execute();



		if (!$query->rowCount()) {
			$query = $pdo->prepare("INSERT INTO bookmarks(videoID, categoryID, start) VALUES(?, ?, ?)");
			$query->bindValue(1, $videoID);
			$query->bindValue(2, $categoryID);
			$query->bindValue(3, $seconds);
			$query->execute();
		}
	}
}
