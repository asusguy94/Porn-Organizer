<?php
include('_class.php');

if (isset($_GET['videoID']) && isset($_GET['age'])) {
	if (!empty($_GET['videoID']) && !empty($_GET['age'])) {
		$videoID = $_GET['videoID'];
		$age = $_GET['age'];

		global $pdo;
		$query = $pdo->prepare("UPDATE videos SET starAge = ? WHERE id = ?");
		$query->bindValue(1, $age);
		$query->bindValue(2, $videoID);
		$query->execute();
	}
}