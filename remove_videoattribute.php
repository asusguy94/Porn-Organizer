<?php
include('_class.php');

if (isset($_GET['attributeID']) && isset($_GET['videoID'])) {
	if (!empty($_GET['attributeID']) && !empty($_GET['videoID'])) {
		$videoID = $_GET['videoID'];
		$attributeID = $_GET['attributeID'];

		global $pdo;
		$query = $pdo->prepare("DELETE FROM videoattributes WHERE videoID = :videoID AND attributeID = :attributeID");
		$query->bindParam(':videoID', $videoID);
		$query->bindParam(':attributeID', $attributeID);
		$query->execute();
	}
}
