<?php
include('_class.php');
$basic = new Basic();
$stars = new Star();

if (isset($_GET['id']) && !empty($_GET['id']))
	$id = $_GET['id'];
else
	header('Location: index.php');
?>

<!doctype html>
<html>
    <head>
		<?php $basic->head($stars->getStar($id), array('bootstrap', 'jqueryui', 'contextmenu', 'autocomplete'), array('jquery', 'jqueryui', 'contextmenu', 'autocomplete', 'star')) ?>
    </head>

    <body>
        <nav><?php $basic->navigation() ?></nav>
        <main class="container-fluid">
            <section class="row">
                <div class="col">
					<?php $stars->fetchStar($id) ?>
                </div>
            </section>
        </main>
    </body>
</html>