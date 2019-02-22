<?php
include('_class.php');
$basic = new Basic();
$stars = new Star();
$db = new DB();
?>

<!doctype html>
<html>
    <head>
		<?php $basic->head('Stars', array('bootstrap', 'jqueryui', 'contextmenu'), array('jquery', 'jqueryui', 'contextmenu', 'stars')) ?>
    </head>

    <body>
        <nav>
			<?php $basic->navigation() ?>
        </nav>

        <main class="container-fluid">
            <section class="row">
                <div class="col">
                    <h2>Add Star</h2>
                    <form method="post">
                        <label for="star">Name: </label>
                        <input type="text" name="star" id="star">
                        <input type="submit" name="addStar" value="Add">
                    </form>

					<?php
					if (isset($_POST['addStar'])) {
						if (isset($_POST['star']) && !empty($_POST['star'])) {
							$star = $_POST['star'];
							if (!$stars->starExists($star) && !$db->starAliasExists($star) && !$db->ignoredStar($star)) {
								if (!$stars->addStar($star)) {
									echo 'Could not add star!';
								} else {
									$root = glob('videos/*', GLOB_ONLYDIR);

									$path_arr = [];
									foreach ($root as $file) {
										if (!$basic->contains($file, '_')) {
											array_push($path_arr, $file);
										}
									}

									$file_arr = [];
									foreach ($path_arr as $path) {
										$files = glob($path . '/*');
										foreach ($files as $file) {
											$db->checkStarRelation($file);
										}
									}
									Basic::reload();
								}
							}
						}
					}
					?>

                    <h2>Stars</h2>
					<?php $stars->fetchMissing() ?>
                </div>
            </section>
        </main>
    </body>
</html>