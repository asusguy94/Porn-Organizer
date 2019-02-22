<?php
include('_class.php');
$basic = new Basic();
$db = new DB();
$file_class = new File();

global $pdo;
$root = glob('videos/*', GLOB_ONLYDIR);

$path_arr = [];
foreach ($root as $file) { // store directory names

	if (!$basic->contains($file, '_') || $basic->contains($file, '_ffmpeg')) {
		echo $file, '<br>';
		array_push($path_arr, $file);
	}
	array_push($path_arr, $file);
}

/*foreach ($path_arr as $path) { // for each path
	$files = glob($path . '/*');
	foreach ($files as $file) {
		$video_date = $file_class->getDate($file);

		$date_first_number = explode('-', $video_date)[0];
		$date_second_number = explode('-', $video_date)[1];
		$date_third_number = explode('-', $video_date)[2];

		if (strlen($date_first_number) === 2 && strlen($date_third_number) === 4) {
			$video_date_new = "$date_third_number-$date_second_number-$date_first_number";
			$file_new = str_replace($video_date, $video_date_new, $file);
			if (!rename($file, $file_new)) echo "Error Renaming File!";
		}

		echo '<br>';
	}
}*/