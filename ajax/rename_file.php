<?php
include('../_class.php');
$basic = new Basic();

if (isset($_GET['videoID']) && isset($_GET['videoPath'])) {
	if (!empty($_GET['videoID']) && !empty($_GET['videoPath'])) {
		$videoID = $_GET['videoID'];
		$newPath = $_GET['videoPath'];

		global $pdo;
		$query = $pdo->prepare("SELECT id FROM videos WHERE BINARY path = ? LIMIT 1"); // Case Sensitive
		$query->bindValue(1, $newPath);
		$query->execute();
		if (!$query->rowCount()) {
			$query = $pdo->prepare("SELECT path FROM videos WHERE id = ? LIMIT 1");
			$query->bindValue(1, $videoID);
			$query->execute();
			if ($query->rowCount()) {
				$path = $query->fetch()['path'];
				$wsite = explode('/', $path)[0];

				$query = $pdo->prepare("UPDATE videos SET path = ? WHERE id = ?");
				$query->bindValue(1, $newPath);
				$query->bindValue(2, $videoID);
				if ($query->execute()) {
					if (file_exists("../videos/$path") && !file_exists("../videos/$newPath")) {
						rename("../videos/$path", "../videos/$newPath");
					}

					$path_webm = "$wsite/" . $basic->removeExtension($path) . ".webm";
					$newPath_webm = "$wsite/" . $basic->removeExtension($newPath) . ".webm";

					if (file_exists("../videos/$path_webm") && !file_exists("../videos/$newPath_webm")) {
						rename("../videos/$path_webm", "../videos/$newPath_webm");
					}

					$path_hls = "$wsite/" . $basic->removeExtension($path);
					$newPath_hls = "$wsite/" . $basic->removeExtension($newPath);
					if(file_exists("../videos/$path_hls") && !file_exists("../videos/$newPath_hls")){
						rename("../videos/$path_hls", "../videos/$newPath_hls");
					}
				}
			}
		}
	}
}