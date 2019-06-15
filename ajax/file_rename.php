<?php
include('../_class.php');

if (isset($_GET['videoID']) && isset($_GET['videoPath'])) {
	if (!empty($_GET['videoID']) && !empty($_GET['videoPath'])) {
		$videoID = $_GET['videoID'];
		$newPath = $_GET['videoPath'];

		global $pdo;
		$query = $pdo->prepare("SELECT id FROM videos WHERE path = ? LIMIT 1");
		$query->bindValue(1, $newPath);
		$query->execute();
		if (!$query->rowCount()) { // if new path does not exist
			$query = $pdo->prepare("SELECT path FROM videos WHERE id = ? LIMIT 1");
			$query->bindValue(1, $videoID);
			$query->execute();
			if ($query->rowCount()) {
				$path = $query->fetch()['path'];

				$query = $pdo->prepare("UPDATE videos SET path = ? WHERE id = ?");
				$query->bindValue(1, $newPath);
				$query->bindValue(2, $videoID);
				if ($query->execute()) {
					rename("../videos/$path", "../videos/$newPath");
					rename("../videos/" . str_replace('.mp4', '-720.mp4', $path), "../videos/" . str_replace('.mp4', '-720.mp4', $newPath));
					rename("../videos/" . str_replace('.mp4', '-480.mp4', $path), "../videos/" . str_replace('.mp4', '-480.mp4', $newPath));
					rename("../videos/" . str_replace('.mp4', '-360.mp4', $path), "../videos/" . str_replace('.mp4', '-360.mp4', $newPath));
				}
			}
		}
	}
}