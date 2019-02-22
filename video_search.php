<?php
include('_class.php');
$basic = new Basic();
$video = new Video();
$date = new Date();
global $pdo;
?>

<!doctype html>
<html>
    <head>
		<?php $basic->head('Video Search', array('bootstrap', 'prettydropdown', 'search'), array('jquery', 'lazyload', 'prettydropdown', 'video.search')) ?>
    </head>

    <body>
        <nav>
			<?php $basic->navigation() ?>
        </nav>

        <main class="container-fluid">
            <div class="row">
                <aside class="col-2">
                    <div class="input-wrapper">
                        <input type="text" name="title" placeholder="Title" autofocus>
                    </div>

                    <div class="input-wrapper">
                        <input type="text" name="star" placeholder="Star">
                    </div>

                    <div class="input-wrapper">
                        <input id="existing" type="checkbox" name="existing">
                        <label for="existing">Existing</label>
                    </div>

                    <h2>Sort</h2>
                    <div class="input-wrapper selected">
                        <input id="alphabetically" type="radio" name="sort" checked>
                        <label for="alphabetically">A-Z</label>
                    </div>

                    <div class="input-wrapper">
                        <input id="alphabetically_desc" type="radio" name="sort">
                        <label for="alphabetically_desc">Z-A</label>
                    </div>

                    <div class="input-wrapper">
                        <input id="added" type="radio" name="sort">
                        <label for="added">Old Upload</label>
                    </div>

                    <div class="input-wrapper">
                        <input id="added_desc" type="radio" name="sort">
                        <label for="added_desc">Recent Upload</label>
                    </div>

                    <div class="input-wrapper">
                        <input id="actor-age" type="radio" name="sort">
                        <label for="actor-age">Teen</label>
                    </div>

                    <div class="input-wrapper">
                        <input id="actor-age_desc" type="radio" name="sort">
                        <label for="actor-age_desc">Milf</label>
                    </div>

                    <div class="input-wrapper">
                        <input id="date" type="radio" name="sort">
                        <label for="date">Oldest</label>
                    </div>

                    <div class="input-wrapper">
                        <input id="date_desc" type="radio" name="sort">
                        <label for="date_desc">Newest</label>
                    </div>

                    <h2>Website</h2>
					<?php
					$query = $pdo->prepare("SELECT websites.name FROM websites JOIN videowebsites ON websites.id = videowebsites.websiteID GROUP BY name ORDER BY name");
					$query->execute();
					if ($query->rowCount()) {
						print '<div id="websites">';
						print '<select class="pretty">';
						print '<option name="website_All">All</option>';
						foreach ($query->fetchAll() as $data) {
							print "<option name='website_$data[name]' value='$data[name]'>$data[name]</option>";
						}
						print '</select>';
						print '</div>';
					}
					?>

                    <h2>Categories</h2>
					<?php
					$query = $pdo->prepare("SELECT * FROM categories ORDER BY name");
					$query->execute();
					if ($query->rowCount()) {
						print '<div id="categories">';
                        print "<div class='input-wrapper'><input type='checkbox' name='category_NULL'><label for='category_NULL'>NULL</label></div>";
						foreach ($query->fetchAll() as $data) {
							print '<div class="input-wrapper">';
							print "<input type='checkbox' name='category_$data[name]'>";
							print "<label for='category_$data[name]'>$data[name]</label>";
							print '</div>';
						}
						print '</div>';
					}
					?>

                    <h2>Attributes</h2>
					<?php
					$query = $pdo->prepare("SELECT * FROM attributes ORDER BY name");
					$query->execute();
					if ($query->rowCount()) {
						print '<div id="attributes">';
						foreach ($query->fetchAll() as $data) {
							print '<div class="input-wrapper">';
							print "<input type='checkbox' name='attribute_$data[name]'>";
							print "<label for='attribute_$data[name]'>$data[name]</label>";
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