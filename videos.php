<?php
include('_class.php');
$basic = new Basic();
$videos = new Video();
?>

<!doctype html>
<html>
    <head>
		<?php $basic->head('Videos', array('bootstrap')) ?>
    </head>

    <body>
        <nav>
			<?php $basic->navigation() ?>
        </nav>

        <main class="container-fluid">
            <section class="row">
                <div class="col-12">
					<?php $videos->fetchVideos() ?>
                </div>
            </section>
        </main>
    </body>
</html>