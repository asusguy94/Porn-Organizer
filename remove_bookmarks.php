<?php
include('_class.php');

if (isset($_GET['videoID'])) {
	if (!empty($_GET['videoID'])) {
		$videoID = $_GET['videoID'];

		global $pdo;
		$query = $pdo->prepare("DELETE FROM bookmarks WHERE videoID = :videoID");
		$query->bindParam(':videoID', $videoID);
		$query->execute();

		$query = $pdo->prepare("DELETE FROM videocategories WHERE videoID = :videoID");
		$query->bindParam(':videoID', $videoID);
		$query->execute();
	}
}