<?php
include('_class.php');

if (isset($_GET['aliasID']) && isset($_GET['starID'])) {
	if (!empty($_GET['aliasID']) && !empty($_GET['starID'])) {
		$starID = $_GET['starID'];
		$aliasID = $_GET['aliasID'];

		global $pdo;
		$query = $pdo->prepare("SELECT name FROM staralias WHERE id = :aliasID LIMIT 1");
		$query->bindParam(':aliasID', $aliasID);
		$query->execute();
		if ($query->rowCount()) {
			$aliasName = $query->fetch()['name'];

			$query = $pdo->prepare("SELECT name FROM stars WHERE id = :starID LIMIT 1");
			$query->bindParam(':starID', $starID);
			$query->execute();
			if ($query->rowCount()) {
				$starName = $query->fetch()['name'];

				$query = $pdo->prepare("UPDATE stars SET name = :starAlias WHERE id = :starID");
				$query->bindParam(':starAlias', $aliasName);
				$query->bindParam(':starID', $starID);
				$query->execute();

				$query = $pdo->prepare("UPDATE staralias SET name = :starName WHERE id = :aliasID");
				$query->bindParam(':starName', $starName);
				$query->bindParam(':aliasID', $aliasID);
				$query->execute();
			}
		}
	}
}
