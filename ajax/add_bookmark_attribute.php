<?php
include('../_class.php');
$basic = new Basic();
$stars = new Star();

if (isset($_GET['bookmarkID']) && isset($_GET['attributeID'])) {
	if (!empty($_GET['bookmarkID']) && !empty($_GET['attributeID'])) {
		$bookmarkID = $_GET['bookmarkID'];
		$attributeID = $_GET['attributeID'];

		global $pdo;
		$query = $pdo->prepare("SELECT id FROM bookmarkattributes WHERE bookmarkID = ? AND attributeID = ? LIMIT 1");
		$query->bindValue(1, $bookmarkID);
		$query->bindValue(2, $attributeID);
		$query->execute();
		if (!$query->rowCount()) {
			$query = $pdo->prepare("INSERT INTO bookmarkattributes(bookmarkID, attributeID) VALUES(?, ?)");
			$query->bindValue(1, $bookmarkID);
			$query->bindValue(2, $attributeID);
			$query->execute();
		}
	}
}