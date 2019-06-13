<?php
include('_class.php');
$basic = new Basic();
$home = new HomePage();
?>

<!doctype html>
<html>
    <head>
		<?php $basic->head('Home', array('bootstrap'), array('lazyload', 'home')) ?>
    </head>

    <body>
        <nav>
			<?php $basic->navigation() ?>
        </nav>

        <main class="container-fluid">
            <section class="row">
				<?php $home->count = 8 ?>
				<?php if ($home->count) { ?>
                    <div class="col-12">
                        <h2>Recent Added Videos (<span class="count"><?= $home->count ?></span>)</h2>
						<?php $home->recent() ?>
                    </div>
				<?php } ?>

				<?php $home->count = 8 ?>
				<?php if ($home->count) { ?>
                    <div class="col-12">
                        <h2>Newest Videos (<span class="count"><?= $home->count ?></span>)</h2>
						<?php $home->newest() ?>
                    </div>
				<?php } ?>

				<?php $home->count = 0 ?>
				<?php if ($home->count) { ?>
                    <div class="col-12">
                        <h2>Random Videos (<span class="count"><?= $home->count ?></span>)</h2>
						<?php $home->random() ?>
                    </div>
				<?php } ?>

				<?php $home->count = 8 ?>
				<?php if ($home->count) { ?>
                    <div class="col-12">
                        <h2>Popular Videos (<span class="count"><?= $home->count ?></span>)</h2>
						<?php $home->popular() ?>
                    </div>
				<?php } ?>
            </section>
        </main>
    </body>
</html>