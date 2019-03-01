<?php
include('../_class.php');

if (isset($_GET['videoID']) && isset($_GET['starID'])) {
	if (!empty($_GET['videoID']) && !empty($_GET['starID'])) {
		$videoID = $_GET['videoID'];
		$starID = $_GET['starID'];

		global $pdo;
		$query = $pdo->prepare("DELETE FROM videostars WHERE videoID = ? AND starID = ?");
		$query->bindValue(1, $videoID);
		$query->bindValue(2, $starID);
		$query->execute();

		$query = $pdo->prepare("SELECT * from videostars WHERE videoID = ? AND starID = ? LIMIT 1");
		$query->bindParam(':videoID', $videoID);
		$query->bindParam(':starID', $starID);
		$query->execute();
		if(!$query->rowCount()){
			print '1';
		}
	}
}