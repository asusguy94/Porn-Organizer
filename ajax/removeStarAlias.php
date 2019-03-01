<?php
include('../_class.php');

if (isset($_GET['aliasID'])) {
	if (!empty($_GET['aliasID'])) {
		$aliasID = $_GET['aliasID'];

		global $pdo;
		$query = $pdo->prepare("DELETE FROM staralias WHERE id = ?");
		$query->bindValue(1, $aliasID);
		$query->execute();
	}
}