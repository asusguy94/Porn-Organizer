<?php
include('../_class.php');

if (isset($_GET['franchiseOld']) && isset($_GET['franchiseNew'])) {
	if (!empty($_GET['franchiseOld']) && !empty($_GET['franchiseNew'])) {
		$franchiseOld = $_GET['franchiseOld'];
		$franchiseNew = $_GET['franchiseNew'];

		global $pdo;
		$query = $pdo->prepare("UPDATE videos SET name = REPLACE(name, :old, :new) WHERE name LIKE '%$franchiseOld%' AND (franchise = :old OR franchise = :new)");
		$query->bindParam(':old', $franchiseOld);
		$query->bindParam(':new', $franchiseNew);
		$query->execute();
	}
}