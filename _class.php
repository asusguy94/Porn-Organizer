<?php
define('DB', 'hentai');
define('DB_STR', 'mysql:host=127.0.0.1:3307;dbname=' . DB);
define('DB_USER', 'hentai.web_user');
define('DB_PASS', 'TUFDXy8qlqBUTz73');

define('CDN_MAX', 0); // number of virtual subdomains
define('THUMBNAIL_RES', 290);
define('THUMBNAIL_START', 100);

define('enableHLS', false);

define('BOOKMARK_FIX_OFFSET', 6);
define('BOOTSTRAP', true);

try {
	$pdo = new PDO(DB_STR, DB_USER, DB_PASS);
} catch (PDOException $e) {
	print "Error: {$e->getMessage()}<br>";
	print 'Please contact the system administrator if the problem persists';
	die();
}

// TODO bootstrap navbar

/* Initialize Header */
ob_start();

class Basic
{
	function head($title = '', $stylesheet = '', $script = '')
	{
		$this->title($title);
		$this->stylesheet($stylesheet);
		$this->script($script);
		$this->meta();
	}

	function meta()
	{
		if (BOOTSTRAP) print '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">';
	}

	function title($data)
	{
		if ($data !== '') print "<title>$data</title>";
	}

	function stylesheet($data)
	{
		print '<link rel="stylesheet" href="css/main.min.css?v=' . md5_file("css/main.min.css") . '">';

		if (is_array($data)) {
			for ($i = 0; $i < count($data); $i++) {
				if ($data[$i] === 'jqueryui') {
					print '<link rel="stylesheet" href="css/jquery.ui.min.css">';
				} else if ($data[$i] === 'normalize') {
					print '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/normalize.css/normalize.css">';
				} else if ($data[$i] === 'contextmenu') {
					print "<link rel='stylesheet' href='css/jquery.contextMenu.min.css'>";
				} else if ($data[$i] === 'autocomplete') {
					print '<link rel="stylesheet" href="css/jquery.autocomplete.min.css">';
				} else if ($data[$i] === 'plyr') {
					print "<link rel='stylesheet' href='css/plyr.css?v=" . md5_file("css/plyr.css") . "'>";
				} else if ($data[$i] === 'bootstrap' && BOOTSTRAP) {
					print "<link rel='stylesheet' href='https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css'>";
				} else if ($data[$i] === '') {

				} else {
					print "<link rel='stylesheet' href='css/$data[$i].min.css?v=" . md5_file("css/$data[$i].min.css") . "'>";
				}
			}
		} else if ($data !== '') {
			if (file_exists("css/$data.min.css"))
				print "<link rel='stylesheet' href='css/$data.min.css" . md5_file("css/$data.min.css") . "'>";
			else
				print "<link rel='stylesheet' href='css/$data.css" . md5_file("css/$data.css") . "'>";
		}
	}

	function script($data)
	{
		if (is_array($data)) {
			for ($i = 0; $i < count($data); $i++) {
				if ($data[$i] !== '') {
					if ($data[$i] == 'jquery') {
						print '<script src="js/jquery.min.js"></script>';
					} else if ($data[$i] == 'contextmenu') {
						print "<script src='js/jquery.contextMenu.min.js'></script>";
					} else if ($data[$i] == 'autocomplete') {
						print '<script src="js/jquery.autocomplete.min.js"></script>';
					} else if ($data[$i] == 'jqueryui') {
						print '<script src="js/jquery.ui.min.js"></script>';
					} else if ($data[$i] == 'plyr') {
						print "<script src='js/plyr.min.js?v=" . md5_file("js/plyr.min.js") . "'></script>";
					} else if ($data[$i] == 'lazyload') {
						print '<script src="js/lazyload.min.js?v=' . md5_file("js/lazyload.min.js") . '"></script>';
					} else if ($data[$i] == 'hls') {
						print '<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>';
					} else {
						if (file_exists("js/$data[$i].min.js"))
							print "<script src='js/$data[$i].min.js?v=" . md5_file("js/$data[$i].min.js") . "'></script>";
						else
							print "<script src='js/$data[$i].js?v=" . md5_file("js/$data[$i].js") . "'></script>";
					}
				}
			}
		} else if ($data !== '') {
			if (file_exists("js/$data.min.js"))
				print "<script src='js/$data.min.js?v=" . md5_file("js/$data.min.js") . "'></script>";
			else
				print "<script src='js/$data.js?v=" . md5_file("js/$data.js") . "'></script>";
		}
	}

	function navigation()
	{
		$currentPage = basename($_SERVER['PHP_SELF']);

		$arr = array(
			array(
				"name" => "Home",
				"link" => "index.php"
			), array(
				"name" => "Add Videos",
				"link" => "add_videos.php"
			), array(
				"name" => "Video Search",
				"link" => "video_search.php",
				array(
					"name" => "Videos",
					"link" => "videos.php"
				)
			), array(
				"name" => "Star Search",
				"link" => "star_search.php",
				array(
					"name" => "Stars",
					"link" => "stars.php"
				)
			), array(
				"name" => "Franchises",
				"link" => "franchises.php"
			), array(
				"name" => "Random",
				"link" => "random.php"
			), array(
				"name" => "DB",
				"link" => "http://ds1517/phpMyAdmin?pma_username=" . DB_USER . "&pma_password=" . DB_PASS
			), array(
				"name" => "Generate Thumbnails",
				"link" => 'video_generatethumbnails.php',
				array(
					"name" => "Generate WebVTT",
					'link' => 'vtt.php'
				)
			)
		);

		for ($i = 0; $i < count($arr); $i++) {
			if ($i === 0) print '<ul class="main-menu">';

			$name = $arr[$i]['name'];
			$link = $arr[$i]['link'];

			if ($link === $currentPage)
				print '<li class="active">';
			else
				print '<li>';

			print "<a href='$link'>$name</a>";

			for ($j = 0; $j < count($arr[$i]); $j++) {
				if (array_key_exists($j, $arr[$i]) && is_array($arr[$i][$j])) {
					print '<ul class="sub-menu">';

					$name = $arr[$i][$j]['name'];
					$link = $arr[$i][$j]['link'];

					if ($link === $currentPage)
						print "<li class='active'><a href='$link'>$name</a></li>";
					else
						print "<li><a href='$link'>$name</a></li>";

					print '</ul>';
				}
			}

			print '</li>';
			if ($i === count($arr)) print '</ul>';
		}
	}

	function pathToFname($path)
	{
		return pathinfo($path, PATHINFO_BASENAME);
	}

	function getExtension($path)
	{
		return pathinfo($path, PATHINFO_EXTENSION);
	}

	function generateName($fname)
	{
		return explode('.' . $this->getExtension($fname), $fname)[0];
	}

	function generateFranchise($fname)
	{
		return explode(' Episode', $fname)[0];
	}

	function generateEpisode($fname)
	{
		return explode('Episode ', explode($this->generateFranchise($fname), explode($this->getExtension($fname), $this->generateName($fname))[0])[1])[1];
	}

	function endsWidth($haystack, $needle)
	{
		$length = strlen($needle);
		if ($length == 0) {
			return true;
		}
		return (substr($haystack, -$length) === $needle);
	}

	static function getClosest($search, $arr)
	{
		$closest = null;
		foreach ($arr as $item) {
			if ($closest === null || abs($search - $closest) > abs($item - $search)) {
				$closest = $item;
			}
		}
		return $closest;
	}

	static function getClosestQ($quality)
	{
		if ($quality == 396) return 480;
		return self::getClosest($quality, [1080, 720, 480, 360]);
	}

	static function reload()
	{
		header("Location: $_SERVER[REQUEST_URI]");
		die();
	}

	static function removeExtensionPath($path)
	{
		return substr($path, 0, strrpos($path, "."));
	}
}

class HomePage
{
	public $count;

	function recent()
	{
		global $pdo;
		$query = $pdo->prepare("
											SELECT *
											FROM videos
											WHERE noStar = FALSE
											ORDER BY id DESC
										");
		$query->execute();
		$this->printData($query->fetchAll());
	}

	function newest()
	{
		global $pdo;
		$query = $pdo->prepare("
											SELECT * 
											FROM videos
											WHERE noStar = FALSE
											ORDER BY date DESC
										");
		$query->execute();

		$this->printData($query->fetchAll());
	}

	function popular()
	{
		global $pdo;
		$query = $pdo->prepare("
											SELECT videos.id, videos.name, COUNT(*) AS total
											FROM plays
											JOIN videos ON plays.videoID = videos.id
											WHERE noStar = FALSE
											GROUP BY videoID
											ORDER BY total DESC, videoID
										");
		$query->execute();
		$this->printData($query->fetchAll(), 'total');
	}

	function random()
	{
		global $pdo;
		$query = $pdo->prepare("
											SELECT id, name
											FROM videos
											ORDER BY RAND()
										");

		$query->execute();
		$this->printData($query->fetchAll());
	}

	function printData($input, $ribbonCol = null)
	{
		$count = $this->count;
		print "<div class='row'>";
		foreach ($input AS $data) {
			if ($count > 0) {
				$count--;

				$col = ($this->count >= 10 ? 'col-1' : 'col');
				print "
						<a class='video $col px-0 mx-3 ribbon-container' href='video.php?id=$data[id]'>
							<img class='lazy mx-auto img-thumbnail' data-src='images/videos/$data[id]-" . THUMBNAIL_RES . ".jpg' alt='thumbnail'>
							<span class='title mx-auto d-block'>$data[name]</span>";
				if ($ribbonCol) print "<span class='ribbon'>$data[$ribbonCol]</span >";
				print "</a>";
			} else {
				break;
			}
		}
		print '</div>';
	}
}

class DB
{
	function videoExists($path)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT id FROM videos WHERE path = ? LIMIT 1");
		$query->bindValue(1, $path);
		$query->execute();
		if ($query->rowCount()) {
			return true;
		} else {
			return false;
		}
	}

	function video_isPartialMatch($path)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT id FROM videos WHERE path = ? AND franchise = ''");
		$query->bindValue(1, $path);
		$query->execute();
		if ($query->rowCount()) return true;
		else return false;
	}

	function video_updateData($path, $franchise)
	{
		global $pdo;
		$query = $pdo->prepare("UPDATE videos SET franchise = ? WHERE path = ?");
		$query->bindValue(1, $franchise);
		$query->bindValue(2, $path);
		if ($query->execute()) return true;
		else return false;
	}

	function addVideo($path)
	{
		global $pdo;
		$query = $pdo->prepare("INSERT INTO videos(path) VALUES(?)");
		$query->bindValue(1, $path);
		if ($query->execute()) return true;
		else return false;
	}

	function fnameToFranchise($fname)
	{
		$result = substr($fname, 0, strpos($fname, ' Episode '));

		if ($result === '') $result = substr($fname, 0, strpos($fname, 'st Scene') - 2);
		if ($result === '') $result = substr($fname, 0, strpos($fname, 'nd Scene') - 2);
		if ($result === '') $result = substr($fname, 0, strpos($fname, 'rd Scene') - 2);
		if ($result === '') $result = substr($fname, 0, strpos($fname, 'th Scene') - 2);

		if ($result === '') $result = substr($fname, 0, strpos($fname, ' Bonus'));
		if ($result === '') $result = substr($fname, 0, strpos($fname, ' Special'));
		if ($result === '') $result = substr($fname, 0, strpos($fname, ' Extra'));

		return $result;
	}

	function fnameToEpisode($fname)
	{

		$result = substr($fname, strpos($fname, ' Episode ') + 1);

		$i = 1;
		while (!is_numeric($result) && $result !== '') {
			$result = substr($fname, strpos($fname, ' Episode ') + ++$i);
		}
		if ($result == '') $result = 99;
		return $result;
	}
}

class Star
{
	public $sqlMethod = '';
	public $orderStr = ' ORDER BY franchise, episode, stars.name';
	public $groupStr = ' GROUP BY id';
	public $havingStr = '';

	function sql($order = 1)
	{
		if ($this->sqlMethod == '') {
			$sql = "SELECT stars.id, stars.name, stars.image FROM stars JOIN videostars ON stars.id = videostars.starID JOIN videos ON videostars.videoID = videos.id";
		} else if ($this->sqlMethod === 'no-hair no-eye no-breast no-attribute') {
			$sql = "SELECT stars.id, stars.name, stars.image FROM stars JOIN videostars ON stars.id = videostars.starID JOIN videos ON videostars.videoID = videos.id LEFT JOIN starattributes ON stars.id = starattributes.starID WHERE (haircolor IS NULL AND hairstyle IS NULL)";
			$this->havingStr = " HAVING COUNT(starattributes.starID) < 1";
		} else if ($this->sqlMethod === 'no-hair / no-eye') {
			$sql = "SELECT stars.id, stars.name, stars.image FROM stars JOIN videostars ON stars.id = videostars.starID JOIN videos ON videostars.videoID = videos.id WHERE (haircolor IS NULL OR eyecolor IS NULL)";
		} else if ($this->sqlMethod === 'no-hair') {
			$sql = "SELECT stars.id, stars.name, stars.image FROM stars JOIN videostars ON stars.id = videostars.starID JOIN videos ON videostars.videoID = videos.id WHERE (haircolor IS NULL AND hairstyle IS NULL)";
		} else if ($this->sqlMethod === 'no-haircolor') {
			$sql = "SELECT stars.id, stars.name, stars.image FROM stars JOIN videostars ON stars.id = videostars.starID JOIN videos ON videostars.videoID = videos.id WHERE haircolor IS NULL";
		} else if ($this->sqlMethod === 'no-hairstyle') {
			$sql = "SELECT stars.id, stars.name, stars.image FROM stars JOIN videostars ON stars.id = videostars.starID JOIN videos ON videostars.videoID = videos.id WHERE hairstyle IS NULL";
		} else if ($this->sqlMethod === 'no-eye') {
			$sql = "SELECT stars.id, stars.name, stars.image FROM stars JOIN videostars ON stars.id = videostars.starID JOIN videos ON videostars.videoID = videos.id WHERE eyecolor IS NULL";
		} else if ($this->sqlMethod === 'no-breast') {
			$sql = "SELECT stars.id, stars.name, stars.image FROM stars JOIN videostars ON stars.id = videostars.starID JOIN videos ON videostars.videoID = videos.id WHERE breast IS NULL";
		} else if ($this->sqlMethod === 'small-breast / large-breast') {
			$sql = "SELECT stars.id, stars.name, stars.image FROM stars JOIN videostars ON stars.id = videostars.starID JOIN videos ON videostars.videoID = videos.id WHERE (breast = 'Small' OR  breast = 'Large')";
		} else if ($this->sqlMethod === 'no-image') {
			$sql = "SELECT stars.id, stars.name, stars.image FROM stars JOIN videostars ON stars.id = videostars.starID JOIN videos ON videostars.videoID = videos.id WHERE image IS NULL";
		} else if ($this->sqlMethod === 'no-attribute') {
			$sql = "SELECT stars.id, stars.name, stars.image FROM stars JOIN videostars ON stars.id = videostars.starID JOIN videos ON videostars.videoID = videos.id LEFT JOIN starattributes ON stars.id = starattributes.starID";
			$this->havingStr = " HAVING COUNT(starattributes.starID) < 1";
		} else {
			$sql = '';
		}

		if ($order == 0)
			return $sql;
		else
			return $sql . $this->groupStr . $this->havingStr . $this->orderStr;
	}

	function starExists($name)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT * FROM stars WHERE name = ? LIMIT 1");
		$query->bindValue(1, $name);
		$query->execute();
		if ($query->rowCount()) return true;
		else return false;
	}

	function addStar($name)
	{
		global $pdo;
		$query = $pdo->prepare("INSERT INTO stars(name) VALUES(?)");
		$query->bindValue(1, $name);
		if ($query->execute()) return true;
		else return false;
	}

	function fetchStars()
	{
		global $pdo;
		$query = $pdo->prepare($this->sql());
		$query->execute();
		if ($query->rowCount()) {
			print '<div id="stars">';
			foreach ($query->fetchAll() as $data) {
				if (is_null($data['image']))
					print '<div class="star no-image" data-star-id="' . $data['id'] . '">';
				else
					print '<div class="star" data-star-id="' . $data['id'] . '">';

				print '<a href="star.php?id=' . $data['id'] . '">';

				if (is_null($data['image']))
					print '<div class="image" style="width: 200px; height: 275px"></div>';
				else
					print '<img src="images/stars/' . $data['image'] . '?v=' . time() . '" style="width: 200px; height: 275px">';

				print '<span class="name">' . $data['name'] . '</span>';
				print '</a>';

				print '</div>';
			}
			print '</div>';
		}
	}

	function getStar($id)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT name FROM stars WHERE id = :starID LIMIT 1");
		$query->bindParam(':starID', $id);
		$query->execute();
		return $query->fetch()['name'];
	}

	function fetchStar($id)
	{
		$nextID = function ($id) {
			global $pdo;
			if ($this->sqlMethod != '') {
				if ($this->havingStr == '') {
					$query = $pdo->prepare($this->sql(0) . " OR stars.id = :starID" . $this->groupStr . $this->orderStr);
				} else {
					$query = $pdo->prepare($this->sql(0) . " OR stars.id = :starID" . $this->groupStr . $this->havingStr . " OR stars.id = :starID" . $this->orderStr);
				}
			} else {
				$query = $pdo->prepare($this->sql());
			}
			$query->bindParam(':starID', $id);
			$query->execute();

			$i = 0;
			$return = [];
			$idFound = false;
			foreach ($query->fetchAll() as $data) {
				if (!$idFound) {
					if ($data['id'] == $id) {
						$idFound = true;
					}
					continue;
				} else if ($idFound && !count($return)) {
					$return[0] = $data['id'];
					$return[1] = ++$i;
				} else {
					$return[1] = ++$i;
				}
			}
			return $return;
		};

		global $pdo;
		$query = $pdo->prepare("SELECT * FROM stars WHERE id = ? LIMIT 1");
		$query->bindValue(1, $id);
		$query->execute();
		if (!$query->rowCount()) {
			header('Location: stars.php');
		} else {
			$result = $query->fetch();

			$name = $result['name'];
			$image = $result['image'];

			/* NextID */
			$nextID_arr = $nextID($id);
			$nextID = $nextID_arr[0];
			$nextID_count = $nextID_arr[1];

			print '<div id="star">';
			print '<a id="next" class="btn btn-outline-primary btn-sm" href="?id=' . $nextID . '">Next (' . $nextID_count . ')</a>';

			if (!is_null($image) && !empty($image)) {
				print '<img src="images/stars/' . $image . '?v=' . md5_file('images/stars/' . $image) . '">';
			} else {
				if ($this->videoCount($result['id']))
					print '<div id="dropbox" class="context-menu-disabled"><span>Drop Image Here</span></div>';
				else
					print '<div id="dropbox"><span>Drop Image Here</span></div>';
			}
			print "<h2>$name</h2>";


			$hair = $result['haircolor'];
			$hairstyle = $result['hairstyle'];
			$eye = $result['eyecolor'];
			$breast = $result['breast'];

			print '<form method="post">';
			print '<label for="breast">Breast</label>';
			print "<input type='text' name='breast' value='$breast'>";
			print '<div id="breasts" class="hidden">';
			$query = $pdo->prepare("SELECT breast FROM stars WHERE breast IS NOT NULL GROUP BY breast");
			$query->execute();
			foreach ($query->fetchAll() as $data) {
				print "<span class='breast'>$data[breast]</span>";
			}
			print '</div>';
			print '</form>';

			print '<form method="post">';
			print '<label for="eyecolor">EyeColor</label>';
			print "<input type='text' name='eyecolor' value='$eye'>";
			print '<div id="eyecolorss" class="hidden">';
			$query = $pdo->prepare("SELECT eyecolor FROM stars WHERE eyecolor IS NOT NULL GROUP BY eyecolor");
			$query->execute();
			foreach ($query->fetchAll() as $data) {
				print "<span class='eyecolor'>$data[eyecolor]</span>";
			}
			print '</div>';
			print '</form>';

			print '<form method="post">';
			print '<label for="haircolor">HairColor</label>';
			print "<input type='text' name='haircolor' value='$hair'>";
			print '<div id="haircolors" class="hidden">';
			$query = $pdo->prepare("SELECT haircolor FROM stars WHERE haircolor IS NOT NULL GROUP BY haircolor");
			$query->execute();
			foreach ($query->fetchAll() as $data) {
				print "<span class='haircolor'>$data[haircolor]</span>";
			}
			print '</div>';
			print '</form>';

			print '<form method="post">';
			print '<label for="hairstyle">HairStyle</label>';
			print "<input type='text' name='hairstyle' value='$hairstyle'>";
			print '<div id="hairstyles" class="hidden">';
			$query = $pdo->prepare("SELECT hairstyle FROM stars WHERE hairstyle IS NOT NULL GROUP BY hairstyle");
			$query->execute();
			foreach ($query->fetchAll() as $data) {
				print "<span class='hairstyle'>$data[hairstyle]</span>";
			}
			print '</div>'; // #hairstyles
			print '</form>';

			print '<form method="post">';
			print '<label for="attribute">Attribute</label>';
			print '<input type="text" name="attribute">';
			print '<div id="attributes" class="hidden">';
			$query = $pdo->prepare("SELECT * FROM attributes");
			$query->execute();
			foreach ($query->fetchAll() as $data) {
				print "<span class='attribute'>$data[name]</span>";
			}
			print '</div>'; // #attributes
			print '</form>';


			$this->fetchAttributes($id); // fetch star-attributes

			print '</div>'; // #star

			$this->saveProperty($id); // save star-info
			$this->addAttribute($id); // save star-attribute

			print '<h3>Videos</h3>';
			$this->fetchVideos($id);
		}
	}

	function getBookmarks($id, $videoID)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT categories.name FROM bookmarkstars JOIN bookmarks ON bookmarkstars.bookmarkID = bookmarks.id JOIN categories ON categories.id = bookmarks.categoryID WHERE starID = ? AND videoID = ?");
		$query->bindValue(1, $id);
		$query->bindValue(2, $videoID);
		$query->execute();
		return $query->fetchAll();
	}

	function saveProperty($starID)
	{
		global $pdo;
		if ($_SERVER['REQUEST_METHOD'] == "POST") {
			if ((isset($_POST['haircolor']) && !empty($_POST['haircolor']) && $_POST['haircolor'] != '') ||
				(isset($_POST['hairstyle']) && !empty($_POST['hairstyle']) && $_POST['hairstyle'] != '') ||
				(isset($_POST['eyecolor']) && !empty($_POST['eyecolor']) && $_POST['eyecolor'] != '') ||
				(isset($_POST['breast']) && !empty($_POST['breast']) && $_POST['breast'] != '')) {
				$hair = $_POST['haircolor'];
				$hair_style = $_POST['hairstyle'];
				$eye = $_POST['eyecolor'];
				$breast = $_POST['breast'];

				if ($hair != '' && $hair != '_NULL') { // HAIR-COLOR
					$query = $pdo->prepare("UPDATE stars SET haircolor = ? WHERE id = ?");
					$query->bindValue(1, $hair);
					$query->bindValue(2, $starID);
					$query->execute();
				} else if ($hair == '_NULL') {
					$query = $pdo->prepare("UPDATE stars SET haircolor = NULL WHERE id = ?");
					$query->bindValue(1, $starID);
					$query->execute();
				}

				if ($hair_style != '' && $hair_style != '_NULL') { // HAIR-STYLE
					$query = $pdo->prepare("UPDATE stars SET hairstyle = ? WHERE id = ?");
					$query->bindValue(1, $hair_style);
					$query->bindValue(2, $starID);
					$query->execute();
				} else if ($hair_style == '_NULL') {
					$query = $pdo->prepare("UPDATE stars SET hairstyle = NULL WHERE id = ?");
					$query->bindValue(1, $starID);
					$query->execute();
				}

				if ($eye != '' && $eye != '_NULL') { // EYE-COLOR
					$query = $pdo->prepare("UPDATE stars SET eyecolor = ? WHERE id = ?");
					$query->bindValue(1, $eye);
					$query->bindValue(2, $starID);
					$query->execute();
				} else if ($eye == '_NULL') {
					$query = $pdo->prepare("UPDATE stars SET eyecolor = NULL WHERE id = ?");
					$query->bindValue(1, $starID);
					$query->execute();
				}

				if ($breast != '' && $breast != '_NULL') { // BREAST
					$query = $pdo->prepare("UPDATE stars SET breast = ? WHERE id = ?");
					$query->bindValue(1, $breast);
					$query->bindValue(2, $starID);
					$query->execute();
				} else if ($breast == '_NULL') {
					$query = $pdo->prepare("UPDATE stars SET breast = NULL WHERE id = ?");
					$query->bindValue(1, $starID);
					$query->execute();
				}

				Basic::reload();
			}
		}
	}

	function fetchAttributes($starID)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT starID, attributeID, name FROM starattributes JOIN attributes ON starattributes.attributeID = attributes.id WHERE starID = ? ORDER BY name");
		$query->bindValue(1, $starID);
		$query->execute();
		if ($query->rowCount()) {
			print '<h3>Attributes</h3>';
			foreach ($query->fetchAll() as $data) {
				print "<p class='attribute' data-attribute-id='$data[attributeID]'><span class='btn btn-outline-primary btn-sm'>$data[name]</span></p>";
			}
		}
	}

	function addAttribute($starID)
	{
		global $pdo;
		if ($_SERVER['REQUEST_METHOD'] == "POST") {
			if (isset($_POST['attribute']) && !empty($_POST['attribute'])) {
				$attribute = $_POST['attribute'];

				if ($attribute != '') {
					$query = $pdo->prepare("SELECT id FROM attributes WHERE name = ? LIMIT 1");
					$query->bindValue(1, $attribute);
					$query->execute();
					if (!$query->rowCount()) {
						$query = $pdo->prepare("INSERT INTO attributes(name) VALUES(?)");
						$query->bindValue(1, $attribute);
						$query->execute();

						$query = $pdo->prepare("SELECT id FROM attributes WHERE name = ? LIMIT 1");
						$query->bindValue(1, $attribute);
						$query->execute();
					}
					$attributeID = $query->fetch()['id'];

					$query = $pdo->prepare("SELECT * FROM starattributes WHERE starID = ? AND attributeID = ?");
					$query->bindValue(1, $starID);
					$query->bindValue(2, $attributeID);
					$query->execute();
					if (!$query->rowCount()) {
						$query = $pdo->prepare("INSERT INTO starattributes(starID, attributeID) VALUES(?, ?)");
						$query->bindValue(1, $starID);
						$query->bindValue(2, $attributeID);
						$query->execute();
					}
				}

				Basic::reload();
			}
		}
	}

	function fetchVideos($starID)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT * FROM videos JOIN videostars ON videos.id = videostars.videoID WHERE videostars.starID = ? ORDER BY franchise, episode");
		$query->bindValue(1, $starID);
		$query->execute();
		if ($query->rowCount()) {
			print '<div id="videos">';

			$cdnNumber = 2;
			foreach ($query->fetchAll() as $data) {
				$localPath = "videos/$data[path]";
				$localPath_img = "images/videos/$data[videoID]-" . THUMBNAIL_RES . ".jpg";

				//$fullPath = "http://cdn$cdnNumber-$_SERVER[HTTP_HOST]/$localPath";
				//$fullPath_img = "http://cdn$cdnNumber-$_SERVER[HTTP_HOST]/$localPath_img";
				$fullPath = $localPath;
				$fullPath_img = $localPath_img;

				print "<a class='video card' href='video.php?id=$data[videoID]'>";
				print "<video class='mx-auto' src='$fullPath' poster='$fullPath_img?v=" . md5_file($localPath_img) . "' muted></video>";
				print "<span class='title card-title'>$data[name]</span>";
				print '</a>';

				if ($cdnNumber < CDN_MAX) $cdnNumber++;
				else $cdnNumber = 1;
			}
			print '</div>';
		}
	}

	function addImage_form()
	{
		print '<h3>Add Image</h3>';
		print '<form method="post">';
		print '<label for="image">ImageURL: </label>';
		print '<input type="text" name="image">';
		print '<input type="submit" name="addImage" value="Add">';
		print '<form>';

		$this->addImage();
	}

	function addImage()
	{
		global $pdo;
		$basic = new Basic();
		if (isset($_POST['addImage'])) {
			if (isset($_POST['image']) && !empty($_POST['image'])) {
				$image = $_POST['image'];
				$id = $_GET['id'];
				$ext = $basic->getExtension($image);

				if ($this->downloadImage($image, $id)) {
					$query = $pdo->prepare("UPDATE stars SET image = ? WHERE id = ?");
					$query->bindValue(1, "$id.$ext");
					$query->bindValue(2, $id);
					if ($query->execute()) {
						Basic::reload();
					}
				}
			}
		}
	}

	function downloadImage($url, $name)
	{
		$basic = new Basic();
		$ext = $basic->getExtension($url);
		$localPath = "../images/stars/$name.$ext";

		return copy($url, $localPath);
	}

	function videoCount($id)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT COUNT(*) as total FROM videostars WHERE starID = ?");
		$query->bindValue(1, $id);
		$query->execute();
		return $query->fetch()['total'];
	}

	function bookmarkStarCount($id, $videoID)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT COUNT(*) as total FROM bookmarkstars JOIN bookmarks ON bookmarks.id = bookmarkstars.bookmarkID WHERE starID = ? AND videoID = ?");
		$query->bindValue(1, $id);
		$query->bindValue(2, $videoID);
		$query->execute();
		return $query->fetch()['total'];
	}
}

class Video
{
	public $noStar;
	public $sqlMethod = '';
	public $videoDuration;

	function sql($override = 0)
	{
		if ($override == 1 || $this->sqlMethod == '')
			return "SELECT * FROM videos WHERE noStar = FALSE";
		else if ($this->sqlMethod === 'all')
			return "SELECT * FROM videos";
		else if ($this->sqlMethod === 'category')
			return "SELECT videos.id, videos.name FROM videos LEFT JOIN videocategories ON videos.id = videocategories.videoID WHERE noStar = FALSE OR videos.id = :videoID GROUP BY name HAVING COUNT(videocategories.id)";
		else if ($this->sqlMethod === '!category')
			return "SELECT videos.id, videos.name FROM videos LEFT JOIN videocategories ON videos.id = videocategories.videoID WHERE noStar = FALSE OR videos.id = :videoID GROUP BY name HAVING COUNT(videocategories.id) < 1";
		else if ($this->sqlMethod === '!star')
			return "SELECT videos.id, videos.name FROM videos LEFT JOIN videostars ON videos.id = videostars.videoID WHERE noStar = TRUE OR videos.id = :videoID GROUP BY name";
		else if ($this->sqlMethod === '!stars')
			return "SELECT videos.id, videos.name FROM videos LEFT JOIN videostars ON videos.id = videostars.videoID WHERE noStar = FALSE OR videos.id = :videoID GROUP BY name HAVING COUNT(videostars.id) < 1";
		else if ($this->sqlMethod === 'bookmark')
			return "SELECT videos.id, videos.name FROM videos LEFT JOIN bookmarks ON bookmarks.videoID = videos.id WHERE noStar = FALSE OR videos.id = :videoID GROUP BY name HAVING COUNT(bookmarks.id)";
		else if ($this->sqlMethod == '!bookmark')
			return "SELECT videos.id, videos.name FROM videos LEFT JOIN bookmarks ON bookmarks.videoID = videos.id WHERE noStar = FALSE OR videos.id = :videoID GROUP BY name HAVING COUNT(bookmarks.id) < 1";
		else if ($this->sqlMethod === 'bookmark !stars')
			return "SELECT videos.id, videos.name FROM videos JOIN bookmarks ON bookmarks.videoID = videos.id LEFT JOIN bookmarkstars ON bookmarks.id = bookmarkstars.bookmarkID WHERE noStar = FALSE OR videos.id = :videoID GROUP BY name HAVING COUNT(bookmarkstars.id) < COUNT(bookmarks.id)";
		else if ($this->sqlMethod === 'cen')
			return "SELECT videos.id, videos.name FROM videos WHERE cen = TRUE";
		else if ($this->sqlMethod === '!q-1080')
			return "SELECT videos.id, videos.name FROM videos WHERE height <= 720";
		else
			return "";
	}

	function fetchVideos()
	{
		global $pdo;
		$query = $pdo->prepare("{$this->sql()} ORDER BY franchise, episode");
		$query->bindParam(':videoID', $id);
		$query->execute();
		if ($query->rowCount()) {
			foreach ($query->fetchAll() as $data) {
				print "<p><a href='video.php?id=$data[id]'>$data[name]</a></p>";
			}
		}
	}

	function nextVideo($id)
	{
		global $pdo;

		if ($this->sqlMethod === 'all') $query = $pdo->prepare("{$this->sql()} ORDER BY franchise, episode");
		else $query = $pdo->prepare("{$this->sql()} OR videos.id = :videoID ORDER BY franchise, episode");
		$query->bindParam(':videoID', $id);
		$query->execute();

		$idFound = false;
		foreach ($query->fetchAll() as $data) {
			if (!$idFound) {
				if ($data['id'] == $id) {
					$idFound = true;
				}
				continue;
			} else {
				return $data;
			}
		}
		return false;
	}

	function upNext($id)
	{
		$nextVideo = $this->nextVideo($id);
		$nextPlays = 0;

		if ($nextVideo) {
			print "
				<div id='up-next'>
				<span>Up Next</span>
				<a href='?id=$nextVideo[id]'>
					<div class='info'>
					<div class='title'>$nextVideo[name]</div>";

			if (intval($nextPlays) === 1) print "<div class='plays'>$nextPlays Play</div>";
			else print "<div class='plays'>$nextPlays Plays</div>";

			print "
						</div> // end .plays
					</a>
				</div>
			";
		}
	}

	function getVideo($id)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT name FROM videos WHERE id = :videoID");
		$query->bindParam(':videoID', $id);
		$query->execute();
		return $query->fetch()['name'];
	}

	function fetchVideo($id)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT * FROM videos WHERE id = ? LIMIT 1");
		$query->bindValue(1, $id);
		$query->execute();
		if (!$query->rowCount()) {
			header('Location: videos.php');
		} else {
			$result = $query->fetch();

			$query = $pdo->prepare("SELECT id AS aliasID, name AS aliasName FROM videoalias WHERE videoID = ? ORDER BY aliasName");
			$query->bindValue(1, $id);
			$query->execute();
			$aliasArr = $query->fetchAll();

			if ($result['cen']) $cen = 'Censored';

			$name = $result['name'];
			$franchise = htmlspecialchars($result['franchise'], ENT_QUOTES);
			$videoHeight = $result['height'];
			$this->videoDuration = $result['duration'];

			$fname = $result['path'];
			$fname_720 = str_replace('.mp4', '-720.mp4', $fname);
			$fname_480 = str_replace('.mp4', '-480.mp4', $fname);
			$fname_360 = str_replace('.mp4', '-360.mp4', $fname);

			$next = $this->nextVideo($id);

			print '<div id="video">';
			print "<h2><span id='video-name' data-franchise='$franchise'>$name</span>";

			if (count($aliasArr)) {
				$i = 0;

				print '<small>(';
				foreach ($aliasArr as $alias) {
					print "<span class='alias' data-alias-id='$alias[aliasID]'>$alias[aliasName]</span>";
					if (++$i < count($aliasArr)) print ', ';
				}
				print ')</small>';
			}

			if (isset($cen)) print " - <span style='color: red'>$cen</span>";
			print '</h2>';

			print '<a id="next" class="btn btn-outline-primary btn-sm" href="?id=' . $next['id'] . '" title="' . $next['name'] . '">Next</a>';

			$localPath = htmlspecialchars("videos/$fname", ENT_QUOTES);
			$localPath_720 = htmlspecialchars("videos/$fname_720", ENT_QUOTES);
			$localPath_480 = htmlspecialchars("videos/$fname_480", ENT_QUOTES);
			$localPath_360 = htmlspecialchars("videos/$fname_360", ENT_QUOTES);

			print "<video poster='images/videos/$id.jpg?v=" . md5_file("images/videos/$id.jpg") . "$' controls preload='auto' data-cen='$result[cen]'>";

			$hlsDir = Basic::removeExtensionPath($fname);
			$hlsFile = "videos/$hlsDir/index.m3u8";
			if (enableHLS && file_exists($hlsFile)) {
				$hlsFile = htmlspecialchars($hlsFile, ENT_QUOTES);
				print "<source src='$hlsFile' type='application/x-mpegURL'>";
			}

			print "<source src='$localPath' type='video/mp4' data-size='$videoHeight'>";
			if (!enableHLS) {
				if ($videoHeight > 720 && file_exists("videos/$fname_720")) print "<source src='$localPath_720' type='video/mp4' data-size='720'>";
				if ($videoHeight > 480 && file_exists("videos/$fname_480")) print "<source src='$localPath_480' type='video/mp4' data-size='480'>";
				if ($videoHeight > 360 && file_exists("videos/$fname_360")) print "<source src='$localPath_360' type='video/mp4' data-size='360'>";
			}
			print '</video>';
			print '</div>';
		}
	}

	function idToFranchise($id)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT franchise FROM videos WHERE id = ? LIMIT 1");
		$query->bindValue(1, $id);
		$query->execute();
		return $query->fetch()['franchise'];
	}

	function idToEpisode($id)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT episode FROM videos WHERE id = ? LIMIT 1");
		$query->bindValue(1, $id);
		$query->execute();
		return $query->fetch()['episode'];
	}

	function fetchFranchise($videoID)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT * FROM videos WHERE franchise = ? ORDER BY episode");
		$query->bindValue(1, $this->idToFranchise($videoID));
		$query->execute();
		if ($query->rowCount() > 1) {
			print '<div id="franchise">';
			foreach ($query->fetchAll() as $data) {
				print '<a class="episode" href="?id=' . $data['id'] . '">';
				print '<div class="info">';

				print "<img src='images/videos/$data[id]-" . THUMBNAIL_RES . ".jpg' class='thumbnail'>";
				print '<div class="title">' . $data['name'] . '</div>';

				//if (intval(0) === 1) print '<div class="plays">' . 0 . ' Play</div>';
				//else print '<div class="plays">' . 0 . ' Plays</div>';

				print '</div>'; // end #info
				print '</a>'; // end .episode
			}
			print '</div>'; // end #franchise
		}
	}

	function fetchInfo($id)
	{
		print '<div id="videoDetails">';

		$this->fetchBookmarks($id);

		print '<div style="min-height: 240px">';
		$this->fetchCategories($id);

		$this->addCategory_form($id);
		print '<br>';
		$this->addStar_form($id);

		print '</div>';
		$this->hiddenData();
		print '</div>';
	}

	function fetchInfo_sidebar($id)
	{
		//$this->upNext($id);
		$this->fetchFranchise($id);
		$this->fetchStars($id);
		$this->fetchAttributes($id);
	}

	function getStars($id)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT stars.image, stars.name, starID FROM stars JOIN videostars ON stars.id = videostars.starID WHERE videostars.videoID = ? ORDER BY stars.id");
		$query->bindValue(1, $id);
		$query->execute();
		return $query->fetchAll();
	}

	function fetchStars($id)
	{
		$star = new Star();

		global $pdo;
		$query = $pdo->prepare("SELECT stars.image, stars.name, starID FROM stars JOIN videostars ON stars.id = videostars.starID WHERE videostars.videoID = ? ORDER BY stars.id");
		$query->bindValue(1, $id);
		$query->execute();
		if ($query->rowCount()) {
			print '<div id="video-stars">';
			foreach ($query->fetchAll() as $data) {
				if ($data['image'] != '') {
					print '<div class="star" data-star-id="' . $data['starID'] . '">';
					print "<img class='image' src='images/stars/$data[image]?v=" . md5_file("images/stars/$data[image]") . "'>";
				} else {
					print '<div class="star no-image" data-star-id="' . $data['starID'] . '">';
					print '<div class="image" style="height: 275px; width: 200px"></div>';
				}

				print '<a class="name" href="star.php?id=' . $data['starID'] . '">' . $data['name'] . '</a>';

				if (!$total = $star->bookmarkStarCount($data['starID'], $id)) {
					print '<span class="ribbon">NEW<span>';
				}

				print '<div class="star-info" data-star-id="' . $data['starID'] . '">';
				foreach ($star->getBookmarks($data['starID'], $id) as $result) {
					print '<p class="btn btn-outline-primary btn-sm">' . $result['name'] . '</p>';
				}
				print '</div>';

				print '</div>'; // .star
			}
			print '</div>'; // #stars
		}
	}

	function fetchCategories($id)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT * FROM categories JOIN videocategories ON categories.id = videocategories.categoryID WHERE videoID = ?");
		$query->bindValue(1, $id);
		$query->execute();
		if ($query->rowCount()) {
			print '<div id="video-categories">';
			foreach ($query->fetchAll() as $data) {
				print "<a class='category btn btn-outline-primary btn-sm px-3' href='category.php?id=$data[categoryID]' data-category-id='$data[categoryID]'>$data[name]</a>";
			}
			print '</div>';
		}
	}

	function getOffset($start)
	{
		$offset_min = 0.965;
		$offset_max = 0.954;

		$offset_delta = abs($offset_max - $offset_min);
		$offset_decimal = $start / $this->videoDuration;

		$offset = $offset_decimal * 100;
		$offset *= $offset_max - ($offset_decimal * $offset_delta);

		return $offset;
	}

	function fetchBookmarks($id)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT bookmarks.id, categories.name, bookmarks.start FROM bookmarks JOIN categories ON bookmarks.categoryID = categories.id WHERE videoID = ? ORDER BY start");
		$query->bindValue(1, $id);
		$query->execute();
		if ($query->rowCount()) {
			print '<div id="timeline">';
			foreach ($query->fetchAll() as $data) {
				$offset = $this->getOffset($data['start']);
				print "<a class='bookmark btn btn-outline-primary btn-sm' data-bookmark-id='$data[id]' data-bookmark-time='$data[start]' data-level='1' style='margin-left: $offset%'>$data[name]</a>";

				print "<div class='bookmark-info' data-bookmark-id='$data[id]'>";
				$query = $pdo->prepare("SELECT stars.image, stars.id AS starID FROM bookmarkstars JOIN stars ON bookmarkstars.starID = stars.id WHERE bookmarkID = ? LIMIT 1");
				$query->bindValue(1, $data['id']);
				$query->execute();
				if ($query->rowCount()) {
					$result = $query->fetch();
					$image = $result['image'];
					$starID = $result['starID'];
					print '<img class="star-image" data-star-id="' . $starID . '" src="images/stars/' . $image . '?v=' . md5_file('images/stars/' . $image) . '">';

					$query = $pdo->prepare("SELECT attributes.name, attributes.id FROM starattributes JOIN attributes ON starattributes.attributeID = attributes.id WHERE starID = :starID");
					$query->bindParam(':starID', $starID);
					$query->execute();
					foreach ($query->fetchAll() as $attribute) {
						print '<div class="btn btn-outline-primary btn-sm no-hover" data-attribute-id="' . $attribute['id'] . '">' . $attribute['name'] . '</div>';
					}
				}

				$query = $pdo->prepare("SELECT attributes.name, attributes.id FROM bookmarkattributes JOIN attributes ON bookmarkattributes.attributeID = attributes.id WHERE bookmarkID = :bookmarkID");
				$query->bindParam(':bookmarkID', $data['id']);
				$query->execute();
				foreach ($query->fetchAll() as $attribute) {
					print '<div class="btn btn-outline-primary btn-sm no-hover" data-attribute-id="' . $attribute['id'] . '">' . $attribute['name'] . '</div>';
				}
				print '</div>';

			}
			print '</div>';
		}
	}

	function addCategory_form($id)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT id, name FROM categories ORDER BY name");
		$query->execute();
		if ($query->rowCount()) {
			print '<form method="post" autocomplete="off">';
			print '<label for="category">Category </label>';
			print '<input name="category" list="category_list">';
			print '<datalist id="category_list">';
			foreach ($query->fetchAll() as $data) {
				print "<option value='$data[name]' data-category-id='$data[id]'>";
			}
			print '</datalist>';
			print '</form>';
		}

		$this->addCategory($id);
	}

	function addStar_form($id)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT stars.name FROM stars ORDER BY stars.name");
		$query->execute();
		if ($query->rowCount()) {
			print '<form method="post" autocomplete="off">';
			print '<label for="star">Star </label>';
			print '<input name="star">';

			$query = $pdo->prepare("SELECT noStar FROM videos WHERE id = ? LIMIT 1");
			$query->bindValue(1, $id);
			$query->execute();
			$this->noStar = $query->fetch()['noStar'];

			if (!$this->starCount($id)) {
				if ($this->noStar)
					print '<input type="checkbox" name="no-star" value="1" onchange="this.form.submit()" checked>';
				else
					print '<input type="checkbox" name="no-star" value="1" onchange="this.form.submit()">';
				print '<label for="no-star">No Star</label>';
			}

			print '</form>';
		}

		$this->addStar($id);
	}

	function addCategory($id)
	{
		global $pdo;
		if (isset($_POST['category']) && !empty($_POST['category'])) {
			$category = $_POST['category'];

			$query = $pdo->prepare("SELECT id FROM categories WHERE name = ? LIMIT 1");
			$query->bindValue(1, $category);
			$query->execute();
			if (!$query->rowCount()) {
				$query = $pdo->prepare("INSERT INTO categories(name) VALUES(?)");
				$query->bindValue(1, $category);
				$query->execute();

				$query = $pdo->prepare("SELECT id FROM categories WHERE name = ? LIMIT 1");
				$query->bindValue(1, $category);
				$query->execute();
			}
			$categoryID = $query->fetch()['id'];

			$query = $pdo->prepare("SELECT id FROM videocategories WHERE videoID = ? AND categoryID = ? LIMIT 1");
			$query->bindValue(1, $id);
			$query->bindValue(2, $categoryID);
			$query->execute();
			if (!$query->rowCount()) {
				$query = $pdo->prepare("INSERT INTO videocategories(videoID, categoryID) VALUES(?, ?)");
				$query->bindValue(1, $id);
				$query->bindValue(2, $categoryID);
				$query->execute();

				Basic::reload();
			}
		}
	}

	function addStar($id)
	{
		$executeSql = function ($star, $id) {
			global $pdo;
			$query = $pdo->prepare("SELECT id FROM stars WHERE name = ? LIMIT 1");
			$query->bindValue(1, $star);
			$query->execute();
			if (!$query->rowCount()) {
				$query = $pdo->prepare("INSERT INTO stars(name) VALUES(?)");
				$query->bindValue(1, $star);
				$query->execute();
			}

			$query = $pdo->prepare("SELECT id FROM stars WHERE stars.name = ? LIMIT 1");
			$query->bindValue(1, $star);
			$query->execute();
			$starID = $query->fetch()['id'];

			$query = $pdo->prepare("SELECT id FROM videostars WHERE videoID = ? AND starID = ? LIMIT 1");
			$query->bindValue(1, $id);
			$query->bindValue(2, $starID);
			$query->execute();
			if (!$query->rowCount()) {
				$query = $pdo->prepare("INSERT INTO videostars(videoID, starID) VALUES(?, ?)");
				$query->bindValue(1, $id);
				$query->bindValue(2, $starID);
				$query->execute();

				Basic::reload();
			}
		};

		global $pdo;
		if ($_SERVER['REQUEST_METHOD'] == 'POST') {
			if (($this->noStar && isset($_POST['no-star'])) || (!$this->noStar && !isset($_POST['no-star']))) {
				if (isset($_POST['star']) && !empty($_POST['star'])) { // Add Star
					$star = $_POST['star'];
					$executeSql($star, $id);
				}
			} else { // Edit no-star status
				if (isset($_POST['no-star']) && !empty($_POST['no-star'])) {
					$query = $pdo->prepare("UPDATE videos SET noStar = TRUE WHERE id = ?");
				} else {
					$query = $pdo->prepare("UPDATE videos SET noStar = FALSE WHERE id = ?");
				}

				$query->bindValue(1, $id);
				$query->execute();

				Basic::reload();
			}
		}
	}

	function starCount($id)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT COUNT(*) as total FROM videostars WHERE videoID = ?");
		$query->bindValue(1, $id);
		$query->execute();
		return $query->fetch()['total'];
	}

	function titleFromID($id)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT videos.name FROM videos WHERE videos.id = ? LIMIT 1");
		$query->bindValue(1, $id);
		$query->execute();
		return $query->fetch()['name'];
	}

	function fetchAttributes($id)
	{
		$stars = $this->getStars($id);
		$starStr = '';
		for ($i = 0; $i < count($stars); $i++) {
			$starStr .= ' starattributes.starID = ' . $stars[$i]['starID'];
			if ($i < count($stars) - 1) $starStr .= ' OR ';
		}

		global $pdo;
		$query = $pdo->prepare("
											SELECT attributes.id, attributes.name FROM attributes JOIN bookmarkattributes ON attributes.id = bookmarkattributes.attributeID JOIN bookmarks ON bookmarkattributes.bookmarkID = bookmarks.id WHERE bookmarks.videoID = :videoID 
											
											UNION
											
											SELECT attributes.id, attributes.name FROM attributes JOIN starattributes ON attributes.id = starattributes.attributeID WHERE $starStr
										");

		$query->bindParam(':videoID', $id);
		$query->execute();
		if ($query->rowCount()) {
			print '<div id="video-attributes">';
			foreach ($query->fetchAll() AS $data) {
				print "<a class='video-attribute btn btn-outline-primary btn-sm btn-sm' href='#' data-attribute-id='$data[id]'>$data[name]</a>";
			}
			print '</div>';
		}
	}

	function hiddenData()
	{
		global $pdo;
		$query = $pdo->prepare("SELECT * FROM attributes");
		$query->execute();
		if ($query->rowCount()) {
			print '<div id="attributes" class="hidden">';
			foreach ($query->fetchAll() AS $attribute) {
				print "<span class='attribute' data-attribute-id='$attribute[id]'>$attribute[name]</span>";
			}
			print '</div>';
		}
	}
}

class Franchise
{
	public $sqlMethod = '';

	function sql()
	{
		if ($this->sqlMethod == 'somthing') $sql = "SELECT SOMTHING";
		else if ($this->sqlMethod == 'somthing eles') $sql = "SELECT SOMTHING ELSE";
		else $sql = "SELECT franchise FROM videos GROUP BY franchise ORDER BY franchise";

		return $sql;
	}

	function fetchFranchises()
	{
		global $pdo;
		$query = $pdo->prepare($this->sql());
		$query->execute();

		if ($query->rowCount()) {
			foreach ($query->fetchAll() as $data) {
				print "<p class='franchise'>$data[franchise]</p>";
			}
		}
	}
}

class Date
{
	function secondsToMinutesAndSeconds($seconds)
	{
		$minutes = floor($seconds / 60);
		$seconds = $seconds % 60;
		if ($seconds < 10) $seconds = '0' . $seconds;

		return $minutes . ':' . $seconds;
	}
}

class FFMPEG
{
	/* SYNOLOGY */
	protected $ffprobe = '/volume1/@appstore/ffmpeg/bin/ffprobe';
	protected $ffmpeg = '/volume1/@appstore/ffmpeg/bin/ffmpeg';
	public $rootFix = false;

	function getDuration($fname) // TODO check if this function works with windows
	{
		$input = "videos/$fname"; // this makes ajax work...but "video_generatehumbnails" does not work!
		if ($this->rootFix) $input = "../$input";

		$duration = shell_exec("$this->ffmpeg -i \"$input\" 2>&1 | grep Duration | awk '{print $2}' | tr -d ,");

		if (!is_null($duration)) {
			$hours = intval(explode(':', $duration)[0]);
			$minutes = intval(explode(':', $duration)[1]);
			$seconds = intval(explode('.', explode(':', $duration)[2])[0]);

			$return = ($hours * 60 * 60) + ($minutes * 60) + $seconds;
			return $return;
		} else {
			return false;
		}
	}

	function generateThumbnail($fname, $videoID, $startTime = 0, $width = 0)
	{
		$input = "videos/$fname";
		$output = "images/videos/$videoID.jpg";

		if ($this->rootFix) {
			$input = "../$input";
			$output = "../$output";
		}

		$duration = $this->getDuration($fname);
		if ($duration < $startTime) $startTime = floor($duration / 2);

		if ($width) {
			$output = str_replace('.jpg', "-$width.jpg", $output);
			$cmd = "$this->ffmpeg -ss $startTime -i \"$input\" -frames:v 1 -f mjpeg -vf scale=$width:-1 $output -y";
		} else {
			$cmd = "$this->ffmpeg -ss $startTime -i \"$input\" -frames:v 1 -f mjpeg $output -y";
		}

		shell_exec($cmd);
	}

	function getVideoHeight($fname)
	{
		$input = "videos/$fname";
		if ($this->rootFix) $input = "../$input";

		$height = shell_exec("$this->ffprobe -v quiet -show_streams \"$input\" | grep coded_height | cut -d '=' -f 2");

		if (!is_null($height)) {
			return trim($height);
		} else {
			return false;
		}
	}
}

class VTT extends FFMPEG
{
	private $im_identify = '/volume1/@appstore/imagemagick/bin/identify';
	private $im_montage = '/volume1/@appstore/imagemagick/bin/montage';

	function generateVtt($fname, $videoID, $width = 360)
	{
		/* Variables */
		$input = "videos/$fname";
		$output = "images/thumbnails/tmp/$videoID-%03d.jpg";

		/* Get Duration */
		$duration = $this->getDuration($fname);

		/* Calculate Size */
		if ($duration > (60 * 60)) {
			$delay = 30;
		} else if ($duration >= (30 * 60)) {
			$delay = 20;
		} else if ($duration >= (10 * 60)) {
			$delay = 10;
		} else if ($duration >= (2 * 60)) {
			$delay = 5;
		} else {
			$delay = 2;
		}

		$size_val = ceil(sqrt($duration / $delay));
		$size = "{$size_val}x{$size_val}";

		/* Create thumbnails */
		$cmd = "$this->ffmpeg -i \"$input\" -f image2 -bt 20M -vf \"fps=1/$delay,scale=$width:-1\" \"$output\"";
		shell_exec($cmd);

		/* ImageCount */
		$imageCount = 0;
		foreach (glob("images/thumbnails/tmp/$videoID-*.jpg") AS $file) {
			if ($file !== false) $imageCount++;
		}

		/* Get Width & Height */
		$cmd = "$this->im_identify -format \"%g - %f\" \"images/thumbnails/tmp/$videoID-001.jpg\"";
		$info = explode(' ', shell_exec($cmd))[0];
		$height = explode('+', explode('x', $info)[1])[0];

		/* Merge Thumbnails */
		$cmd = "$this->im_montage images/thumbnails/tmp/$videoID-*.jpg -tile $size -geometry $info \"images/thumbnails/$videoID.jpg\"";
		shell_exec($cmd);

		/* Remove Source Files */
		foreach (glob("images/thumbnails/tmp/$videoID-*.jpg") AS $file) {
			if ($file !== false) unlink($file);
		}

		/* Make File */
		$vtt = fopen("vtt/$videoID.vtt", 'w');
		$data = 'WEBVTT';
		for ($col = 0, $counter = 0; $col < $size_val; $col++) {
			for ($row = 0; $row < $size_val; $row++) {
				if ($counter >= $imageCount) break;

				$data .= "\n";
				$data .= "\n" . ($counter + 1);
				$data .= "\n" . gmdate("H:i:s", $counter * $delay) . ".000 --> " . gmdate("H:i:s", ($counter + 1) * $delay) . '.000';
				$data .= "\n" . "../images/thumbnails/$videoID.jpg#xywh=" . ($row * $width) . "," . ($col * $height) . ",$width,$height";
				$counter++;
			}
		}
		fwrite($vtt, $data);
	}
}

class System
{
	function CPU()
	{
		$load = sys_getloadavg();
		return $load[0];
	}
}

class Performance
{
	public $start;

	function __construct()
	{
		$this->start = microtime(true);
	}

	function result()
	{
		$end = microtime(true);

		return round(($end - $this->start), 2) . " seconds";
	}
}