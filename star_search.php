<?php
	include('_class.php');
	$basic = new Basic();
	$video = new Video();
	global $pdo;
?>

<!doctype html>
<html>
    <head>
		<?php $basic->head('Star Search', array('bootstrap', 'prettydropdown', 'flags', 'search'), array('bootstrap', 'lazyload', 'prettydropdown', 'star.search')) ?>
    </head>

    <body>
        <nav>
			<?php $basic->navigation() ?>
        </nav>

        <main class="container-fluid">
            <div class="row">
                <aside class="col-2">
                    <div id="update" class="col btn btn-outline-primary d-none">Update Data</div>

                    <div class="input-wrapper" data-toggle="tooltip" data-placement="right" title="Exclude from Name">
                        <input type="checkbox" name="exclude" data-toggle="switchbutton"
                               data-onlabel="Exclude" data-offlabel="Include">
                    </div>

                    <div class="input-wrapper">
                        <input type="text" name="star-name" placeholder="Aaliyah Hadid" autofocus>
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
                        <input id="videocount" type="radio" name="sort">
                        <label for="videocount">Least Videos</label>
                    </div>

                    <div class="input-wrapper">
                        <input id="videocount_desc" type="radio" name="sort">
                        <label for="videocount_desc">Most Videos</label>
                    </div>

                    <h2>Website/Sites</h2>
					<?php
						$query = $pdo->prepare("SELECT websites.name, websites.id FROM websites JOIN videowebsites ON websites.id = videowebsites.websiteID GROUP BY name ORDER BY name");
						$query->execute();

						if ($query->rowCount()) {
							print '<div id="websites">';
							print '<select class="pretty">';
							print '<option>All</option>';
							foreach ($query->fetchAll() as $wsite) {
								print sprintf("<option data-wsite='%s'>$wsite[name]</option>", Basic::encode($wsite['name']));
								foreach (Website::getSites($wsite['id']) as $site) {
									print sprintf("<option data-wsite='%s' data-site='%s'>$wsite[name]_$site[name]</option>", Basic::encode($wsite['name']), Basic::encode($site['name']));
								}
							}
							print '</select>';
							print '</div>';
						}
					?>

                    <h2>Exclude Website</h2>
	                <?php
		                $query = $pdo->prepare("SELECT websites.name, websites.id FROM websites JOIN videowebsites ON websites.id = videowebsites.websiteID GROUP BY name ORDER BY name");
		                $query->execute();

		                if ($query->rowCount()) {
			                print '<div id="websites_exclude">';
			                print '<select class="pretty">';
			                print '<option>None</option>';
			                foreach ($query->fetchAll() as $wsite) {
				                print sprintf("<option data-wsite='%s'>$wsite[name]</option>", Basic::encode($wsite['name']));
			                }
			                print '</select>';
			                print '</div>';
		                }
	                ?>

                    <h2>Country</h2>
					<?php
						$query = $pdo->prepare("SELECT country.name, country.code FROM country JOIN stars ON country.name = stars.country GROUP BY country.name ORDER BY country.name");
						$query->execute();
						if ($query->rowCount()) {
							print '<div id="countries">';
							print '<select class="pretty">';
							print '<option name="country_All">All</option>';
							foreach ($query->fetchAll() as $data) {
								print "<option name='country_$data[name]' value='$data[name]' data-prefix='<span class=\"flag flag-$data[code]\"></span>'>$data[name]</option>";
							}
							print '</select>';
							print '</div>';
						}
					?>

                    <h2>Breast</h2>
					<?php
						$query = $pdo->prepare("SELECT breast FROM stars WHERE breast IS NOT NULL GROUP BY breast ORDER BY breast='AA' DESC, breast");
						$query->execute();
						if ($query->rowCount()) {
							print '<div id="breasts">';

							print '<div class="input-wrapper">';
							print '<input type="radio" name="breast">';
							print '<label>NULL</label>';
							print '</div>';

							foreach ($query->fetchAll() as $data) {
								print '<div class="input-wrapper">';
								print '<input type="radio" name="breast">';
								print "<label>$data[breast]</label>";
								print '</div>';
							}
							print '</div>';
						}
					?>

                    <h2>Hair Color</h2>
					<?php
						$query = $pdo->prepare("SELECT haircolor FROM stars WHERE haircolor IS NOT NULL GROUP BY haircolor");
						$query->execute();
						if ($query->rowCount()) {
							print '<div id="hair">';

							print '<div class="input-wrapper">';
							print '<input type="radio" name="hair">';
							print '<label>NULL</label>';
							print '</div>';

							foreach ($query->fetchAll() as $data) {
								print '<div class="input-wrapper">';
								print '<input type="radio" name="hair">';
								print "<label>$data[haircolor]</label>";
								print '</div>';
							}
							print '</div>';
						}
					?>

                    <h2>Ethnicity</h2>
					<?php
						$query = $pdo->prepare("SELECT ethnicity FROM stars WHERE ethnicity IS NOT NULL GROUP BY ethnicity");
						$query->execute();
						if ($query->rowCount()) {
							print '<div id="ethnicity">';

							print '<div class="input-wrapper">';
							print '<input type="radio" name="ethnicity">';
							print '<label>NULL</label>';
							print '</div>';

							foreach ($query->fetchAll() as $data) {
								print '<div class="input-wrapper">';
								print '<input type="radio" name="ethnicity">';
								print "<label>$data[ethnicity]</label>";
								print '</div>';
							}
							print '</div>';
						}
					?>
                </aside>

                <section id="stars" class="col-10">
                    <h2 class="text-center"><span id="video-count">0</span> Stars</h2>
                    <div id="loader" class="spinner-border text-primary"></div>
                </section>
            </div>
        </main>
    </body>
</html>