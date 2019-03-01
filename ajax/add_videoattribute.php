<?php
include('../_class.php');

if (isset($_GET['attributeID']) && isset($_GET['videoID'])){
	if (!empty($_GET['attributeID']) && !empty($_GET['videoID'])) {
		$videoID = $_GET['videoID'];
		$attributeID = $_GET['attributeID'];

		global $pdo;
		$query = $pdo->prepare("SELECT id FROM videoattributes WHERE attributeID = :attributeID AND videoID = :videoID");
		$query->bindParam(':videoID', $videoID);
		$query->bindParam(':attributeID', $attributeID);
		$query->execute();
		if(!$query->rowCount()){
			$query = $pdo->prepare("INSERT INTO videoattributes(attributeID, videoID) VALUES(:attributeID, :videoID)");
			$query->bindParam(':videoID', $videoID);
			$query->bindParam(':attributeID', $attributeID);
			$query->execute();

			$query = $pdo->prepare("SELECT id FROM videoattributes WHERE videoID = :videoID AND attributeID = :attributeID LIMIT 2");
			$query->bindParam(':videoID', $videoID);
			$query->bindParam(':attributeID', $attributeID);
			$query->execute();
			$id = $query->fetch()['id'];
			if($query->rowCount() == 1){
				print $id;
			}
		}
	}
}
