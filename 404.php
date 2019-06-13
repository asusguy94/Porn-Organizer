<?php
include('_class.php');
$basic = new Basic();
?>

<!doctype html>
<html>
    <head>
		<?php $basic->head('404', array('bootstrap')) ?>
    </head>

    <body>
        <nav>
			<?php $basic->navigation() ?>
        </nav>

        <main class="container-fluid">
            <section class="jumbotron justify-content-center">
                <h1 class="display-1">404</h1>
                <p class="lead">Oops, seems like this page does not exist</p>
                <p class="lead">
                    <a href="index.php" class="btn btn-primary btn-lg">Go Back</a>
                </p>
            </section>
        </main>
    </body>
</html>