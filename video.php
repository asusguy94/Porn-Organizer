<?php
include('_class.php');
$basic = new Basic();
$videos = new Video();

if (isset($_GET['id']) && !empty($_GET['id']))
	$id = $_GET['id'];
else
	header('Location: videos.php');

?>

<!doctype html>
<html>
<head>
	<?php $basic->head($videos->getVideo($id), array('', 'jqueryui', 'contextmenu', 'plyr', 'video'), array('jquery', 'jqueryui', 'contextmenu', 'hls', 'plyr', 'video')) ?>
</head>

<body>
<nav><?php $basic->navigation() ?></nav>
<main class="container-fluid">
    <div class="row">
        <!-- TODO bootstrap-buttons not working -->
        <section>
			<?php
			$videos->fetchVideo($id);
			$videos->fetchInfo($id);
			?>
        </section>
        <aside>
			<?php $videos->fetchInfo_sidebar($id) ?>
        </aside>
    </div>
</main>
</body>
</html>