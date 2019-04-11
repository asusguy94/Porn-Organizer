<?php
include('../_class.php');

if (isset($_GET['locationID']) && isset($_GET['videoID'])) {
	if (!empty($_GET['locationID']) && !empty($_GET['videoID'])) {
		$videoID = $_GET['videoID'];
		$locationID = $_GET['locationID'];

		global $pdo;
		$query = $pdo->prepare("SELECT id FROM videolocations WHERE locationID = :locationID AND videoID = :videoID");
		$query->bindParam(':videoID', $videoID);
		$query->bindParam(':locationID', $locationID);
		$query->execute();
		if (!$query->rowCount()) {
			$query = $pdo->prepare("INSERT INTO videolocations(locationID, videoID) VALUES(:locationID, :videoID)");
			$query->bindParam(':videoID', $videoID);
			$query->bindParam(':locationID', $locationID);
			$query->execute();

			$query = $pdo->prepare("SELECT id FROM videolocations WHERE videoID = :videoID AND locationID = :locationID LIMIT 2");
			$query->bindParam(':videoID', $videoID);
			$query->bindParam(':locationID', $locationID);
			$query->execute();
			$id = $query->fetch()['id'];
			if ($query->rowCount() == 1) {
				print $id;
			}
		}
	}
}
