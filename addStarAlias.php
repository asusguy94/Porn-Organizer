<?php
include('_class.php');

if (isset($_GET['starID']) && isset($_GET['aliasName'])) {
	if (!empty($_GET['starID']) && !empty($_GET['aliasName'])) {
		$starID = $_GET['starID'];
		$aliasName = $_GET['aliasName'];

		global $pdo;
		$query = $pdo->prepare("SELECT id FROM staralias WHERE name = ? LIMIT 1");
		$query->bindValue(1, $aliasName);
		$query->execute();
		if (!$query->rowCount()) {
			$query = $pdo->prepare("SELECT id FROM stars WHERE name = ? LIMIT 1");
			$query->bindValue(1, $aliasName);
			$query->execute();
			if (!$query->rowCount()) {
				$query = $pdo->prepare("INSERT INTO staralias(starID, name) VALUES(:starID, :aliasName)");
				$query->bindParam(':starID', $starID);
				$query->bindParam(':aliasName', $aliasName);
				$query->execute();
			}
		}
	}
}