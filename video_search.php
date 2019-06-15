<?php
include('_class.php');
$basic = new Basic();
$video = new Video();
global $pdo;
?>

<!doctype html>
<html>
<head>
	<?php $basic->head('Video Search', array('', 'bootstrap', 'search'), array('jquery', 'lazyload', 'video.search')) ?>
</head>

<body>
<nav><?php $basic->navigation() ?></nav>
<main class="container-fluid">
    <div class="row">
        <aside class="left col-2">
            <!--<h2>Sort</h2>
			<div class="input-wrapper">
				<label for="sort_rand">Random</label>
				<input type="radio" name="sort" id="sort_rand">
			</div>

			<div class="input-wrapper">
				<label for="sort_asc">Ascending</label>
				<input type="radio" name="sort" id="sort_asc">
			</div>-->

			<!--<h2>Filter</h2>-->
            <div class="input-wrapper">
                <input type="checkbox" name="no-star_1" id="no-star_1">
                <label for="no-star_1">StarCount > 0</label>
            </div>

            <div class="input-wrapper">
                <input type="checkbox" name="no-star_0" id="no-star_0">
                <label for="no-star_0">StarCount < 1</label>
            </div>

            <br>

            <div class="input-wrapper">
                <input type="checkbox" name="cen" id="cen">
                <label for="cen">Censored</label>
            </div>

            <div class="input-wrapper">
                <input type="checkbox" name="ucen" id="ucen">
                <label for="ucen">Uncensored</label>
            </div>


            <!--<div class="input-wrapper">
				<label for="franchise">Franchise </label>
				<input type="text" name="franchise" placeholder="15 Bishoujo Hyouryuuki">
			</div>-->

            <div class="input-wrapper">
                <label for="title">Title </label>
                <input type="text" name="title" placeholder="15 Bishoujo Hyouryuuki Episode 1" autofocus>
            </div>

            <h2>Attributes</h2>
			<?php
			$query = $pdo->prepare("SELECT * FROM attributes ORDER BY name");
			$query->execute();
			if ($query->rowCount()) {
				print '<div id="attributes">';
				foreach ($query->fetchAll() as $data) {
					print '<div class="input-wrapper">';
					print '<input type="checkbox" name="attribute_' . $data['name'] . '">';
					print '<label for="attribute_' . $data['name'] . '">' . $data['name'] . '</label>';
					print '</div>';
				}
				print '</div>';
			}
			?>

            <h2>Categories</h2>
			<?php
			$query = $pdo->prepare("SELECT * FROM categories ORDER BY name");
			$query->execute();
			if ($query->rowCount()) {
				print '<div id="categories">';
				foreach ($query->fetchAll() as $data) {
					print '<div class="input-wrapper">';
					print '<input type="checkbox" name="category_' . $data['name'] . '">';
					print '<label for="category_' . $data['name'] . '">' . $data['name'] . '</label>';
					print '</div>';
				}
				print '</div>';
			}
			?>
        </aside>
        <section id="videos" class="col-10">
            <div id="loader"></div>
        </section>
    </div>
</main>
</body>
</html>