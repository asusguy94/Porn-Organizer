<?php
include('_class.php');

if (isset($_GET['starID'])) {
	if (!empty($_GET['starID'])) {
		$id = $_GET['starID'];

		global $pdo;

		$query = $pdo->prepare("SELECT image FROM stars WHERE id = ? AND image IS NOT NULL LIMIT 1");
		$query->bindValue(1, $id);
		$query->execute();
		if ($query->rowCount()) {
			$image = $query->fetch()['image'];
			unlink('images/stars/' . $image);

			$query = $pdo->prepare("UPDATE stars SET image = NULL WHERE id = ?");
			$query->bindValue(1, $id);
			$query->execute();
		}

		$query = $pdo->prepare("SELECT id FROM videostars WHERE starID = ? LIMIT 1");
		$query->bindValue(1, $id);
		$query->execute();
		if (!$query->rowCount()) {
			$query = $pdo->prepare("DELETE FROM stars WHERE id = ?");
			$query->bindValue(1, $id);
			$query->execute();
		}

		$query = $pdo->prepare("DELETE FROM starattributes WHERE starID = ?");
		$query->bindValue(1, $id);
		$query->execute();

		$query = $pdo->prepare("DELETE FROM staralias WHERE starID = ?");
		$query->bindValue(1, $id);
		$query->execute();
	}
}