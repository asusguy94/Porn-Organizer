<?php
include('../_class.php');

if (isset($_GET['bookmarkID']) && isset($_GET['categoryID'])) {
	if (!empty($_GET['bookmarkID']) && !empty($_GET['categoryID'])) {
		$bookmarkID = $_GET['bookmarkID'];
		$categoryID = $_GET['categoryID'];

		global $pdo;
		$query = $pdo->prepare("SELECT videoID, categoryID FROM bookmarks WHERE id = :bookmarkID LIMIT 1");
		$query->bindParam(':bookmarkID', $bookmarkID);
		$query->execute();
		if($query->rowCount()){
			$result = $query->fetch();

			$videoID = $result['videoID'];
			$categoryID_old = $result['categoryID'];

			$query = $pdo->prepare("UPDATE bookmarks SET categoryID = :categoryID WHERE id = :bookmarkID AND videoID = :videoID");
			$query->bindParam(':categoryID', $categoryID);
			$query->bindParam(':bookmarkID', $bookmarkID);
			$query->bindParam(':videoID', $videoID);
			$query->execute();

			$query = $pdo->prepare("SELECT id FROM bookmarks WHERE videoID = :videoID AND categoryID = :oldCategoryID LIMIT 1");
			$query->bindParam(':videoID', $videoID);
			$query->bindParam(':oldCategoryID', $categoryID_old);
			$query->execute();
			if(!$query->rowCount()){
				$query = $pdo->prepare("DELETE FROM videocategories WHERE videoID = :videoID AND categoryID = :oldCategoryID");
				$query->bindParam(':videoID', $videoID);
				$query->bindParam(':oldCategoryID', $categoryID_old);
				$query->execute();
			}

			$query = $pdo->prepare("SELECT id FROM bookmarks WHERE videoID = :videoID AND categoryID = :categoryID LIMIT 1");
			$query->bindParam(':videoID', $videoID);
			$query->bindParam(':categoryID', $categoryID);
			$query->execute();
			if($query->rowCount()){
				$query = $pdo->prepare("SELECT id FROM videocategories WHERE videoID = :videoID AND categoryID = :categoryID");
				$query->bindParam(':videoID', $videoID);
				$query->bindParam(':categoryID', $categoryID);
				$query->execute();
				if(!$query->rowCount()){
					$query = $pdo->prepare("INSERT INTO videocategories(videoID, categoryID) VALUES(:videoID, :categoryID)");
					$query->bindParam(':videoID', $videoID);
					$query->bindParam(':categoryID', $categoryID);
					$query->execute();
				}
			}
		}
	}
}
