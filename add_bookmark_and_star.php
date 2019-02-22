<?php
include('_class.php');
$basic = new Basic();
$stars = new Star();

if (isset($_GET['videoID']) && isset($_GET['starID']) && isset($_GET['categoryID']) && isset($_GET['seconds'])) {
	if (!empty($_GET['videoID']) && !empty($_GET['starID']) && !empty($_GET['categoryID']) && !empty($_GET['seconds'])) {
		$videoID = $_GET['videoID'];
		$starID = $_GET['starID'];
		$categoryID = $_GET['categoryID'];
		$seconds = $_GET['seconds'];

		global $pdo;
		$query = $pdo->prepare("SELECT id FROM videocategories WHERE videoID = ? AND categoryID = ? LIMIT 1");
		$query->bindValue(1, $videoID);
		$query->bindValue(2, $categoryID);
		$query->execute();
		if(!$query->rowCount()){
			$query = $pdo->prepare("INSERT INTO videocategories(videoID, categoryID) VALUES(?, ?)");
			$query->bindValue(1, $videoID);
			$query->bindValue(2, $categoryID);
			$query->execute();
		}

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

			$query = $pdo->prepare("SELECT id FROM bookmarks WHERE videoID = ? AND categoryID = ? AND start = ? LIMIT 1");
			$query->bindValue(1, $videoID);
			$query->bindValue(2, $categoryID);
			$query->bindValue(3, $seconds);
			$query->execute();
		}
		$bookmarkID = $query->fetch()['id'];

		$query = $pdo->prepare("SELECT * FROM bookmarkstars WHERE bookmarkID = ? LIMIT 1"); // check if bookmark relation exists
		$query->bindValue(1, $bookmarkID);
		$query->execute();
		if (!$query->rowCount()) {
			$query = $pdo->prepare("INSERT INTO bookmarkstars(bookmarkID, starID) VALUES(?, ?)"); // insert relation if non-existing relation
			$query->bindValue(1, $bookmarkID);
			$query->bindValue(2, $starID);
			$query->execute();
		} else {
			$query = $pdo->prepare("SELECT id FROM bookmarkstars WHERE bookmarkID = ? AND starID = ? LIMIT 1"); // check if bookmark star relation exists
			$query->bindValue(1, $bookmarkID);
			$query->bindValue(2, $starID);
			$query->execute();
			if (!$query->rowCount()) {
				$query = $pdo->prepare("UPDATE bookmarkstars SET starID = ? WHERE bookmarkID = ?"); // update existing relation if existing relation
				$query->bindValue(1, $starID);
				$query->bindValue(2, $bookmarkID);
				$query->execute();
			}
		}
	}
}
