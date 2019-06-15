<?php
include('../_class.php');

if (isset($_GET['starID']) && isset($_GET['attributeID'])) {
	if (!empty($_GET['starID']) && !empty($_GET['attributeID'])) {
		$starID = $_GET['starID'];
		$attributeID = $_GET['attributeID'];

		global $pdo;
		$query = $pdo->prepare("DELETE FROM starattributes WHERE starID = ? AND attributeID = ?");
		$query->bindValue(1, $starID);
		$query->bindValue(2, $attributeID);
		$query->execute();
	}
}