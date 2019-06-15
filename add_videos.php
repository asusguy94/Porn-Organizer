<?php
include('_class.php');

$basic = new Basic();
$db = new DB();
$ffmpeg = new FFMPEG();
?>

    <!doctype html>
    <html>
        <head>
			<?php $basic->head('', array('bootstrap')) ?>
        </head>

        <body>
            <nav>
				<?php $basic->navigation() ?>
            </nav>
        </body>
    </html>

<?php
global $pdo;
$files = glob('videos/*.mp4');
$newFiles = [];

foreach ($files as $path) {
	$file = $basic->pathToFname($path);

	if ($basic->endsWidth($file, '-720.mp4') || $basic->endsWidth($file, '-480.mp4') || $basic->endsWidth($file, '-360.mp4')) { // QUALITY FILE
		continue;
	}

	if (!$db->videoExists($file)) {
		array_push($newFiles, $file);
	}
}

$query = $pdo->prepare("SELECT id, path FROM videos WHERE duration = 0 OR height = 0");
$query->execute();
foreach ($query->fetchAll() AS $item) {
	$query = $pdo->prepare("UPDATE videos SET duration = :duration, height = :height WHERE id = :id");
	$query->bindParam(':id', $item['id']);
	$query->bindParam(':duration', $ffmpeg->getDuration($item['path']));
	$query->bindParam(':height', $ffmpeg->getVideoHeight($item['path']));
}

if (isset($_POST['submit'])) {
	if (count(array_filter($_POST)) === count($_POST)) { // check if all fields are filled out!
		$titleArr = [];
		$episodeArr = [];
		$franchiseArr = [];
		$fnameArr = [];
		foreach ($_POST['title'] as $data) {
			array_push($titleArr, $data);
		}
		foreach ($_POST['episode'] as $data) {
			array_push($episodeArr, $data);
		}
		foreach ($_POST['franchise'] as $data) {
			array_push($franchiseArr, $data);
		}
		foreach ($_POST['fname'] as $data) {
			array_push($fnameArr, $data);
		}

		for ($i = 0; $i < count($fnameArr); $i++) {
			$query = $pdo->prepare("INSERT INTO videos(name, episode, path, franchise, duration, height, date) VALUES(:name, :episode, :path, :franchise, :duration, :height, NOW())");
			$query->bindParam(':name', $titleArr[$i]);
			$query->bindParam(':episode', $episodeArr[$i]);
			$query->bindParam(':path', $fnameArr[$i]);
			$query->bindParam(':franchise', $franchiseArr[$i]);
			$query->bindParam(':duration', $ffmpeg->getDuration($fnameArr[$i]));
			$query->bindParam(':height', Basic::getClosestQ($ffmpeg->getVideoHeight($fnameArr[$i])));
			$query->execute();
		}

		header('Location: video_generatethumbnails.php');
	}
} else if (count($newFiles)) {
	print '<form method="post" id="addVideos">';
	for ($i = 0; $i < count($newFiles); $i++) {
		print '<div class="form-group">';
		print '<label for="fname[]">FileName</label><br>';
		print "<input type='text' name='fname[]' value='{$newFiles[$i]}'><br>";
		print '</div>';

		print '<div class="form-group">';
		print '<label for="title[]">Title</label><br>';
		print "<input type='text' name='title[]' value='{$basic->generateName($newFiles[$i])}'><br>";
		print '</div>';

		print '<div class="form-group">';
		print '<label for="franchise[]">Franchise</label><br>';
		print "<input type='text' name='franchise[]' value='{$basic->generateFranchise($newFiles[$i])}'><br>";
		print '</div>';

		print '<div class="form-group">';
		print '<label for="episode[]">Episode</label><br>';
		print "<input type='number' name='episode[]' value='{$basic->generateEpisode($newFiles[$i])}'><br>";
		print '</div>';

		print '<br>';
	}
	print '<input type="submit" class="btn btn-primary" name="submit" value="Save Changes">';
	print '</form>';
}