<?php
include('_class.php');
$basic = new Basic();
$home = new HomePage();

$home->count = 6;
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
                <div class="col-12">
                    <h2>Recent Added (<span class="count"><?= $home->count ?></span>)</h2>
					<?php $home->recent() ?>
                </div>

                <div class="col-12">
                    <h2>Newest (<span class="count"><?= $home->count ?></span>)</h2>
					<?php $home->newest() ?>
                </div>
            </section>
        </main>
    </body>
</html>