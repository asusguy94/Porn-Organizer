<?php
include('../_class.php');

if (isset($_GET['starID']) && isset($_GET['starName'])) {
	if (!empty($_GET['starID']) && !empty($_GET['starName'])) {
		$starID = $_GET['starID'];
		$starName = $_GET['starName'];

		global $pdo;
		$query = $pdo->prepare("SELECT id FROM stars WHERE name = ?");
		$query->bindValue(1, $starName);
		$query->execute();
		if(!$query->rowCount()){
			$query = $pdo->prepare("UPDATE stars SET name = ? WHERE id = ?");
			$query->bindValue(1, $starName);
			$query->bindValue(2, $starID);
			$query->execute();
		}
	}
}