<?php
include('../_class.php');

if (isset($_GET['videoID']) && isset($_GET['categoryID'])) {
	if (!empty($_GET['videoID']) && !empty($_GET['categoryID'])) {
		$categoryID = $_GET['categoryID'];
		$videoID = $_GET['videoID'];

		global $pdo;
		$query = $pdo->prepare("DELETE FROM videocategories WHERE videoID = ? AND categoryID = ?");
		$query->bindValue(1, $videoID);
		$query->bindValue(2, $categoryID);
		$query->execute();
	}
}