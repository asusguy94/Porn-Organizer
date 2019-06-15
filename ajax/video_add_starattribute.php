<?php
include('../_class.php');

if (isset($_GET['videoID']) && isset($_GET['starID']) && isset($_GET['attributeID'])) {
	if (!empty($_GET['videoID']) && !empty($_GET['starID']) && !empty($_GET['attributeID'])) {
		$videoID = $_GET['videoID'];
		$starID = $_GET['starID'];
		$attributeID = $_GET['attributeID'];

		global $pdo;
		$query = $pdo->prepare("SELECT bookmarks.id FROM bookmarks JOIN bookmarkstars ON bookmarks.id = bookmarkstars.bookmarkID WHERE videoID = :video AND bookmarkstars.starID = :star");
		$query->bindParam(':video', $videoID);
		$query->bindParam(':star', $starID);
		$query->execute();
		foreach ($query->fetchAll() AS $data){
			$query = $pdo->prepare("SELECT id FROM bookmarkattributes WHERE bookmarkID = :bookmark AND attributeID = :attribute LIMIT 1");
			$query->bindParam(':bookmark', $data['id']);
			$query->bindParam(':attribute', $attributeID);
			$query->execute();
			if(!$query->rowCount()){
				$query = $pdo->prepare("INSERT INTO bookmarkattributes(bookmarkID, attributeID) VALUES(:bookmark, :attribute)");
				$query->bindParam(':bookmark', $data['id']);
				$query->bindParam(':attribute', $attributeID);
				$query->execute();
			}
		}
	}
}