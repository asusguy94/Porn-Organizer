<?php
include('../_class.php');
global $pdo;

if (isset($_GET['videoID'])) {
	if (!empty($_GET['videoID'])) {
		$videoID = $_GET['videoID'];

		$query = $pdo->prepare("SELECT * FROM videos WHERE id = :videoID LIMIT 1");
		$query->bindParam(':videoID', $videoID);
		$query->execute();
		if ($query->rowCount()) { // video exists
			$query = $pdo->prepare("SELECT * FROM bookmarks WHERE videoID = :videoID");
			$query->bindParam(':videoID', $videoID);
			$query->execute();
			foreach ($query->fetchAll() AS $bookmark) {
				$time = $bookmark['start'] + BOOKMARK_FIX_OFFSET;
				$query = $pdo->prepare("UPDATE bookmarks SET start = :newTime WHERE id = :bookmarkID");
				$query->bindParam(':newTime', $time);
				$query->bindParam(':bookmarkID', $bookmark['id']);
				$query->execute();
			}
		}
	}
}