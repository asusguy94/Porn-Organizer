<?php
include('../_class.php');

if (isset($_GET['id'])) {
	if (!empty($_GET['id'])) {
		$id = $_GET['id'];

		global $pdo;
		$query = $pdo->prepare("SELECT categoryID, videoID FROM bookmarks WHERE id = ? LIMIT 1");
		$query->bindValue(1, $id);
		$query->execute();
		$result = $query->fetch();
		$categoryID = $result['categoryID'];
		$videoID = $result['videoID'];

		$query = $pdo->prepare("DELETE FROM bookmarks WHERE id = ?");
		$query->bindValue(1, $id);
		$query->execute();

		$query = $pdo->prepare("SELECT id FROM bookmarks WHERE videoID = ? AND categoryID = ? LIMIT 1");
		$query->bindValue(1, $videoID);
		$query->bindValue(2, $categoryID);
		$query->execute();
		if(!$query->rowCount()){
			$query = $pdo->prepare("DELETE FROM videocategories WHERE videoID = ? AND categoryID = ?");
			$query->bindValue(1, $videoID);
			$query->bindValue(2, $categoryID);
			$query->execute();
		}
	}
}