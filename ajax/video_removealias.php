<?php
include('../_class.php');

if (isset($_GET['videoID']) && isset($_GET['aliasID'])) {
	if (!empty($_GET['videoID']) && !empty($_GET['aliasID'])) {
		$videoID = $_GET['videoID'];
		$aliasID = $_GET['aliasID'];

		global $pdo;
		$query = $pdo->prepare("DELETE FROM videoalias WHERE videoID = :videoID AND id = :aliasID");
		$query->bindParam(':videoID', $videoID);
		$query->bindParam(':aliasID', $aliasID);
		$query->execute();
	}
}