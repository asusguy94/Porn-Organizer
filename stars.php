<?php
include('_class.php');
$basic = new Basic();
$stars = new Star();
?>

<!doctype html>
<html>
<head>
	<?php $basic->head('', array('', 'jqueryui', 'contextmenu'), array('jquery', 'jqueryui', 'contextmenu', 'stars')) ?>
</head>

<body>
<nav><?php $basic->navigation() ?></nav>
<main>
    <section>
        <h2>Add Star</h2>
        <form method="post">
            <label>Name: </label>
            <input type="text" name="star">
            <input type="submit" name="addStar" value="Add">
        </form>

		<?php
		if (isset($_POST['addStar'])) {
			if (isset($_POST['star']) && !empty($_POST['star'])) {
				$star = $_POST['star'];
				if (!$stars->starExists($star)) {
					if (!$stars->addStar($star)) {
						echo 'Could not add star!';
					}else{
					    print '<script>window.location.href = window.location.href</script>';
                    }
				}
			}
		}
		?>

        <h2>Stars</h2>
        <?php $stars->fetchStars() ?>
    </section>
</main>
</body>
</html>