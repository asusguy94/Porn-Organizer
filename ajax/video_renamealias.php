<?php
include('../_class.php');

if (isset($_GET['videoID']) && isset($_GET['aliasID']) && isset($_GET['aliasName'])) {
	if (!empty($_GET['videoID']) && !empty($_GET['aliasID']) && !empty($_GET['aliasName'])) {
		$videoID = $_GET['videoID'];
		$aliasID = $_GET['aliasID'];
		$aliasName = $_GET['aliasName'];

		global $pdo;
		$query = $pdo->prepare("SELECT id FROM videoalias WHERE videoID = :videoID AND name = :aliasName LIMIT 1");
		$query->bindParam(':videoID', $videoID);
		$query->bindParam(':aliasName', $aliasName);
		$query->execute();
		if(!$query->rowCount()){
			$query = $pdo->prepare("UPDATE videoalias SET name = :aliasName WHERE id = :aliasID");
			$query->bindParam(':aliasName', $aliasName);
			$query->bindParam(':aliasID', $aliasID);
			$query->execute();
		}
	}
}