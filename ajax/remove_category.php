<?php
include('../_class.php');

if (isset($_GET['id'])) {
	if (!empty($_GET['id'])) {
		$id = $_GET['id'];

		global $pdo;
		$query = $pdo->prepare("DELETE FROM categories WHERE id = ?");
		$query->bindValue(1, $id);
		$query->execute();

		$query = $pdo->prepare("DELETE FROM videocategories WHERE categoryID = ?");
		$query->bindValue(1, $id);
		$query->execute();
	}
}