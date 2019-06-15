<?php
include('../_class.php');
$basic = new Basic();
$stars = new Star();

if (isset($_GET['bookmarkID']) && isset($_GET['starID'])) {
	if (!empty($_GET['bookmarkID']) && !empty($_GET['starID'])) {
		$bookmarkID = $_GET['bookmarkID'];
		$starID = $_GET['starID'];

		global $pdo;
		$query = $pdo->prepare("SELECT * FROM bookmarkstars WHERE bookmarkID = ? LIMIT 1");
		$query->bindValue(1, $bookmarkID);
		$query->execute();
		if (!$query->rowCount()) {
			$query = $pdo->prepare("INSERT INTO bookmarkstars(bookmarkID, starID) VALUES(?, ?)");
			$query->bindValue(1, $bookmarkID);
			$query->bindValue(2, $starID);
			$query->execute();
		} else {

			$query = $pdo->prepare("SELECT * FROM bookmarkstars WHERE bookmarkID = ? AND starID = ? LIMIT 1");
			$query->bindValue(1, $bookmarkID);
			$query->bindValue(2, $starID);
			$query->execute();
			if (!$query->rowCount()) {
				$query = $pdo->prepare("UPDATE bookmarkstars SET starID = ? WHERE bookmarkID = ?");
				$query->bindValue(1, $starID);
				$query->bindValue(2, $bookmarkID);
				$query->execute();
			}
		}
	}
}
