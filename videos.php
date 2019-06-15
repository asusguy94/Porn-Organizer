<?php
include('_class.php');
$basic = new Basic();
$videos = new Video();
?>

<!doctype html>
<html>
<head>
	<?php $basic->head() ?>
</head>

<body>
<nav><?php $basic->navigation() ?></nav>
<main>
	<section>
		<?php $videos->fetchVideos() ?>
	</section>
</main>
</body>
</html>