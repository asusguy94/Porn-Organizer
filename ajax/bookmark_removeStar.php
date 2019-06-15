<?php
include('../_class.php');

if (isset($_GET['bookmarkID']) && isset($_GET['starID'])) {
	if (!empty($_GET['bookmarkID']) && !empty($_GET['starID'])) {
		$bookmarkID = $_GET['bookmarkID'];
		$starID = $_GET['starID'];

		global $pdo;
		$query = $pdo->prepare("DELETE FROM bookmarkstars WHERE starID = :starID AND bookmarkID = :bookmarkID");
		$query->bindParam(':starID', $starID);
		$query->bindParam(':bookmarkID', $bookmarkID);
		$query->execute();
	}
}
