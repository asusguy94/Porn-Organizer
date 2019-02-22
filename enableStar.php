<?php
include('_class.php');

if (isset($_GET['starID'])) {
	if (!empty($_GET['starID'])) {
		$starID = $_GET['starID'];

		global $pdo;
		$query = $pdo->prepare("UPDATE stars SET autoTaggerIgnore = 0 WHERE id = ?");
		$query->bindValue(1, $starID);
		$query->execute();
	}
}