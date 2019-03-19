<?php
include('../_class.php');

if (isset($_GET['locationID']) && isset($_GET['videoID'])) {
	if (!empty($_GET['locationID']) && !empty($_GET['videoID'])) {
		$videoID = $_GET['videoID'];
		$locationID = $_GET['locationID'];

		global $pdo;
		$query = $pdo->prepare("DELETE FROM videolocations WHERE videoID = :videoID AND locationID = :locationID");
		$query->bindParam(':videoID', $videoID);
		$query->bindParam(':locationID', $locationID);
		$query->execute();
	}
}
