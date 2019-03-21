<?php

define('DB', 'porn'); // SQL database name
define('DB_PORT', 3307); // 3307_mariaDB - 3306_mySQL
define('DB_STR', 'mysql:host=127.0.0.1:' . DB_PORT . ';dbname=' . DB);
define('DB_USER', 'porn.web_user'); // SQL username
define('DB_PASS', 'Qnn3ANukory20UAQ'); // SQL password

try {
	$pdo = new PDO(DB_STR, DB_USER, DB_PASS);
} catch (PDOException $e) {
	print "Error:{$e->getMessage()}<br>";
	print 'Please contact the system administrator if the problem persists';
	die();
}

/* Get settings from DB */
$opt = Settings::getSettings();

define('SIMILAR_DEF', $opt['similar_def']);
define('SIMILAR_MAX', $opt['similar_max']);
define('SIMILAR_TEXT', $opt['similar_text']);

define('CDN', false);
define('CDN_MAX', $opt['cdn_max']);
define('THUMBNAIL_RES', $opt['thumbnail_res']); // Thumbnail height
define('THUMBNAIL_START', $opt['thumbnail_start']); // Thumbnail start time

define('PARSER', $opt['parser']); // Enable FreeOnes
define('enableWEBM', $opt['enable_webm']); // Enable compression lvl-1
define('enableMKV', $opt['enable_mkv']); // Enable compression lvl-2
define('enableFA', $opt['enable_fa']); // Enable FontAwesome

define('bootstrapCols', 12);
define('bootstrapColsDef', 6);
define('HLS', true); // true=HLS; false=mp4 (or webm or mkv if enabled)

/* Initialize Header */
ob_start();

class HomePage
{
	public $count;

	function recent()
	{
		global $pdo;
		$query = $pdo->prepare("SELECT * FROM videos ORDER BY id DESC");
		$query->execute();
		$this->printData($query->fetchAll());
	}

	function newest()
	{
		global $pdo;
		$query = $pdo->prepare("SELECT * FROM videos ORDER BY date DESC");
		$query->execute();
		$this->printData($query->fetchAll());
	}

	function printData($input, $items_per_line = bootstrapColsDef)
	{
		if (!(12 % $items_per_line)) {
			$col = bootstrapCols / $items_per_line;
		} else {
			$col = bootstrapCols / bootstrapColsDef;
		}

		$count = $this->count;
		print "<div class='row'>";
		foreach ($input AS $data) {
			if ($count > 0) {
				if (file_exists("videos/$data[path]")) {
					$count--;

					print "<a class='video col-$col' href='video.php?id=$data[id]'>";
					print "<img class='lazy mx-auto img-thumbnail' data-src='images/videos/$data[id]-" . THUMBNAIL_RES . ".jpg'>";
					print "<span class='title mx-auto'>$data[name]</span>";
					print '</a>';
				}
			} else {
				break;
			}
		}
		print '</div>';
	}
}

class Basic
{
	public $nav_arr = array(
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
			"name" => "DB",
			"link" => "http://ds1517/phpMyAdmin?pma_username=" . DB_USER . "&pma_password=" . DB_PASS

		), array(
			"name" => "Generate Thumbnails",
			"link" => 'video_generatethumbnails.php',
			array(
				"name" => 'Generate WebVTT',
				'link' => 'vtt.php'
			)
		)

	);

	function head($title = '', $stylesheet = '', $script = '')
	{
		$this->title($title);
		$this->stylesheet($stylesheet);
		$this->script($script);
		$this->meta();
	}

	function meta()
	{
		print '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">';
	}

	function title($data)
	{
		if ($data !== '') print "<title>$data</title>";
	}

	function stylesheet($data)
	{
		if (is_array($data)) {
			for ($i = 0; $i < count($data); $i++) {
				if (!$i && !in_array('', $data))
					print '<link rel="stylesheet" href="css/main.min.css?v=' . md5_file("css/main.min.css") . '">';

				if ($data[$i] === 'jqueryui') {
					print '<link rel="stylesheet" href="css/jquery.ui.min.css">';
				} else if ($data[$i] === 'bootstrap') {
					print '<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css">';
				} else if ($data[$i] === 'contextmenu') {
					if (enableFA) print '<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.8.0/css/all.css">';
					print '<link rel="stylesheet" href="css/jquery.contextMenu.min.css">';
				} else if ($data[$i] === 'autocomplete') {
					print '<link rel="stylesheet" href="css/jquery.autocomplete.min.css">';
				} else if ($data[$i] === 'prettydropdown') {
					print '<link rel="stylesheet" href="css/jquery.prettydropdown.min.css">';
				} else if ($data[$i] === 'plyr') {
					print '<link rel="stylesheet" href="css/plyr.min.css">';
				} else if (file_exists("css/$data[$i].min.css")) {
					print '<link rel="stylesheet" href="css/' . $data[$i] . '.min.css?v=' . md5_file("css/$data[$i].min.css") . '">';
				} else {
					print '<link rel="stylesheet" href="css/' . $data[$i] . '.css?v=' . md5_file("css/$data[$i].css") . '">';
				}
			}
		} else if ($data !== '') {
			print "<link rel='stylesheet' href='css/$data'>";
		} else if ($data === '') {
			print '<link rel="stylesheet" href="css/main.min.css?v=' . md5_file("css/main.min.css") . '">';
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
						print '<script src="js/jquery.contextMenu.min.js"></script>';
					} else if ($data[$i] == 'autocomplete') {
						print '<script src="js/jquery.autocomplete.min.js"></script>';
					} else if ($data[$i] == 'jqueryui') {
						print '<script src="js/jquery.ui.min.js"></script>';
					} else if ($data[$i] == 'prettydropdown') {
						print '<script src="js/jquery.prettydropdown.min.js"></script>';
					} else if ($data[$i] == 'plyr') {
						print '<script src="js/plyr.min.js?v=' . md5_file("js/plyr.min.js") . '"></script>';
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
			print "<script src='js/$data.min.js?v=" . md5_file("js/$data.min.js") . "'></script>";
		}
	}

	function navigation()
	{
		$currentPage = basename($_SERVER['PHP_SELF']);
		$arr = $this->nav_arr;

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

	function hasExtension($path)
	{
		return strlen($this->getExtension($path));
	}

	function getExtension($path)
	{
		$ext = pathinfo($path, PATHINFO_EXTENSION);
		return $ext;
	}

	function removeExtension($filename)
	{
		return pathinfo($filename, PATHINFO_FILENAME);
	}

	static function removeExtensionPath($path)
	{
		return substr($path, 0, strrpos($path, "."));
	}

	function startsWith($haystack, $needle)
	{
		$length = strlen($needle);
		return (substr($haystack, 0, $length) === $needle);
	}

	function endsWith($haystack, $needle)
	{
		$length = strlen($needle);
		return ($length === 0) || (substr($haystack, -$length) === $needle);
	}

	function contains($haystack, $needle)
	{
		return (strpos($haystack, $needle));
	}

	function str_replace_last($search, $replace, $str)
	{
		if (($pos = strrpos($str, $search)) !== false) {
			$str = substr_replace($str, $replace, $pos, strlen($search));
		}
		return $str;
	}

	function cleanUrl($str)
	{
		$arr = explode('?', $str);
		return $arr[count($arr) - 2];
	}

	static function reload()
	{
		header("Location: $_SERVER[REQUEST_URI]");
		die();
	}

	static function file_exists($filename)
	{
		return file_exists($filename);
	}
}

class File
{
	function getWebsite($path)
	{
		$domain = explode('/', dirname($path))[1];
		return $domain;
	}

	function getSite($path)
	{
		$basic = new Basic();
		$site = explode('[', explode(']', $basic->pathToFname($path))[0])[1];
		return $site;
	}

	function getStar($path)
	{
		$basic = new Basic();
		$star = explode('] ', explode('_', $basic->pathToFname($path))[0])[1];
		return $star;
	}

	function getTitle($path)
	{
		$basic = new Basic();
		$title = explode('_', explode('] ', $basic->pathToFname($path))[1])[1];
		return $basic->removeExtension($title);
	}

	function getPath($directory)
	{
		$path = substr($directory, strpos($directory, '/') + 1);
		return $path;
	}

	function getDate($path)
	{
		$basic = new Basic();
		$date = explode('{', explode('}', $basic->pathToFname($path))[0])[1];
		return $date;
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

	function addVideo($path, $name, $date)
	{
		$ffmpeg = new FFMPEG();

		global $pdo;
		$query = $pdo->prepare("INSERT INTO videos(path, name, date, duration) VALUES(:path, :title, :videoDate, :duration)");
		$query->bindParam('path', $path);
		$query->bindParam(':title', $name);
		$query->bindParam(':videoDate', $date);
		$query->bindParam(':duration', $ffmpeg->getDuration($path));

		if ($query->execute()) return true;
		else return false;
	}

	function getVideo($path)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT id FROM videos WHERE path = ? LIMIT 1");
		$query->bindValue(1, $path);
		$query->execute();
		return $query->fetch()['id'];
	}

	function websiteExists($name)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT id FROM websites WHERE name = ? LIMIT 1");
		$query->bindValue(1, $name);
		$query->execute();
		if ($query->rowCount()) return true;
		else return false;
	}

	function addWebsite($name)
	{
		global $pdo;
		$query = $pdo->prepare("INSERT INTO websites(name) VALUES(?)");
		$query->bindValue(1, $name);
		if ($query->execute()) return true;
		else return false;
	}

	function getWebsite($name)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT id FROM websites WHERE name = ? LIMIT 1");
		$query->bindValue(1, $name);
		$query->execute();
		return $query->fetch()['id'];
	}

	function siteExists($name)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT id FROM sites WHERE name = ? LIMIT 1");
		$query->bindValue(1, $name);
		$query->execute();
		if ($query->rowCount()) return true;
		else return false;
	}

	function addSite($name, $websiteID = '')
	{
		global $pdo;
		if ($websiteID == '') {
			$query = $pdo->prepare("INSERT INTO sites(name) VALUES(?)");
			$query->bindValue(1, $name);
		} else {
			$query = $pdo->prepare("INSERT INTO sites(name, websiteID) VALUES(?, ?)");
			$query->bindValue(1, $name);
			$query->bindValue(2, $websiteID);
		}

		if ($query->execute()) return true;
		else return false;
	}

	function getSite($name)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT id FROM sites WHERE name = ? LIMIT 1");
		$query->bindValue(1, $name);
		$query->execute();
		return $query->fetch()['id'];
	}

	function siteRelationExists($site, $videoID)
	{
		global $pdo;

		$siteID = $this->getSite($site);

		$query = $pdo->prepare("SELECT id FROM videosites WHERE siteID = ? AND videoID = ?");
		$query->bindValue(1, $siteID);
		$query->bindValue(2, $videoID);
		$query->execute();
		if ($query->rowCount()) return true;
		else return false;
	}

	function addSiteRelation($site, $videoID)
	{
		global $pdo;

		$siteID = $this->getSite($site);

		$query = $pdo->prepare("INSERT INTO videosites(videoID, siteID) VALUES(?, ?)");
		$query->bindValue(1, $videoID);
		$query->bindValue(2, $siteID);
		$query->execute();
	}

	function resetSiteRelation($videoID)
	{
		global $pdo;

		$query = $pdo->prepare("DELETE FROM videosites WHERE videoID = ?");
		$query->bindValue(1, $videoID);
		$query->execute();
	}

	function websiteSiteExists($website, $site)
	{
		global $pdo;
		$websiteID = $this->getWebsite($website);
		$siteID = $this->getSite($site);

		$query = $pdo->prepare("SELECT id FROM websitesites WHERE websiteID = ? AND siteID = ? LIMIT 1");
		$query->bindValue(1, $websiteID);
		$query->bindValue(2, $siteID);
		$query->execute();
		if ($query->rowCount()) return true;
		else return false;
	}

	function websiteRelationExists($website, $videoID)
	{
		global $pdo;

		$websiteID = $this->getWebsite($website);

		$query = $pdo->prepare("SELECT id FROM videowebsites WHERE websiteID = ? AND videoID = ?");
		$query->bindValue(1, $websiteID);
		$query->bindValue(2, $videoID);
		$query->execute();
		if ($query->rowCount()) return true;
		else return false;
	}

	function addWebsiteRelation($website, $videoID)
	{
		global $pdo;

		$websiteID = $this->getWebsite($website);

		$query = $pdo->prepare("INSERT INTO videowebsites(videoID, websiteID) VALUES (?, ?)");
		$query->bindValue(1, $videoID);
		$query->bindValue(2, $websiteID);
		$query->execute();
	}

	function resetWebsiteRelation($videoID)
	{
		global $pdo;

		$query = $pdo->prepare("DELETE FROM videowebsites WHERE videoID = ?");
		$query->bindValue(1, $videoID);
		$query->execute();
	}

	function addWebsiteSite($websiteID, $siteID)
	{
		global $pdo;
		$query = $pdo->prepare("INSERT INTO websitesites(websiteID, siteID) VALUES(?, ?)");
		$query->bindValue(1, $websiteID);
		$query->bindValue(2, $siteID);
		if ($query->execute()) return true;
		else return false;
	}

	/**
	 * @param $starID integer
	 * @return bool
	 */
	function ignoredStarID($starID)
	{
		if (!is_int($starID)) return false;

		global $pdo;
		$query = $pdo->prepare("SELECT id FROM stars WHERE id = ? AND autoTaggerIgnore = TRUE LIMIT 1");
		$query->bindValue(1, $starID);
		$query->execute();

		if ($query->rowCount()) return true;
		else return false;
	}

	function ignoredStar($starName)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT id FROM stars WHERE name = ? AND autoTaggerIgnore = TRUE LIMIT 1");
		$query->bindValue(1, $starName);
		$query->execute();

		if ($query->rowCount()) return true;
		else return false;
	}

	function starExists($name)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT id FROM stars WHERE name = ? LIMIT 1");
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

	function getStarName($id)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT name FROM stars WHERE id = ? LIMIT 1");
		$query->bindValue(1, $id);
		$query->execute();
		return $query->fetch()['name'];
	}

	function getStar($name)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT id FROM stars WHERE name = ? LIMIT 1");
		$query->bindValue(1, $name);
		$query->execute();
		return $query->fetch()['id'];
	}

	function starAliasExists($name)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT id FROM staralias WHERE name = ? LIMIT 1");
		$query->bindValue(1, $name);
		$query->execute();
		if ($query->rowCount()) return true;
		else return false;
	}

	/**
	 * @param $name
	 * @return bool|int
	 */
	function getAliasAsStar($name)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT stars.id FROM stars JOIN staralias ON staralias.starID = stars.id WHERE staralias.name = ? GROUP BY staralias.id");
		$query->bindValue(1, $name);
		$query->execute();
		if ($query->rowCount() == 1) return (int)$query->fetch()['id'];
		else return false;
	}

	function videoStarAliasExists($video, $star)
	{
		global $pdo;
		$videoID = $this->getVideo($video);
		$starID = $this->getAliasAsStar($star);

		$query = $pdo->prepare("SELECT id FROM videostars WHERE videoID = ? AND starID = ? LIMIT 1");
		$query->bindValue(1, $videoID);
		$query->bindValue(2, $starID);
		$query->execute();
		if ($query->rowCount()) return true;
		else return false;
	}

	function videoStarExists($video, $star)
	{
		global $pdo;
		$videoID = $this->getVideo($video);
		$starID = $this->getStar($star);

		$query = $pdo->prepare("SELECT id FROM videostars WHERE videoID = ? AND starID = ? LIMIT 1");
		$query->bindValue(1, $videoID);
		$query->bindValue(2, $starID);
		$query->execute();
		if ($query->rowCount()) return true;
		else return false;
	}

	function starRelationExists($path)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT id from videos WHERE path = ? LIMIT 1");
		$query->bindValue(1, $path);
		$query->execute();
		if ($query->rowCount()) {
			$videoID = $query->fetch()['id'];
			$query = $pdo->prepare("SELECT id FROM videostars WHERE videoID = ? LIMIT 1");
			$query->bindValue(1, $videoID);
			$query->execute();
			if ($query->rowCount()) return true;
		}

		return false;
	}

	function addVideoStar($videoID, $starID)
	{
		global $pdo;
		$query = $pdo->prepare("INSERT INTO videostars(videoID, starID) VALUES(?, ?)");
		$query->bindValue(1, $videoID);
		$query->bindValue(2, $starID);
		if ($query->execute()) return true;
		else return false;
	}

	function incorrectDate($videoID, $date)
	{
		global $pdo;

		$query = $pdo->prepare("SELECT * FROM videos WHERE id = ? AND date = ? LIMIT 1");
		$query->bindValue(1, $videoID);
		$query->bindValue(2, $date);
		$query->execute();
		return !$query->rowCount();
	}

	function fixDate($videoID, $date)
	{
		global $pdo;

		$query = $pdo->prepare("UPDATE videos SET date = :videoDate WHERE id = :videoID");
		$query->bindParam(':videoID', $videoID);
		$query->bindParam(':videoDate', $date);
		$query->execute();
	}

	function checkStarRelation($file)
	{
		$file_class = new File();
		$path = $file_class->getPath($file);
		$star = $file_class->getStar($file);

		if (!$this->starRelationExists($path)) { // Video without stars
			if (!$this->videoStarExists($path, $star) && !$this->videoStarAliasExists($path, $star)) { // add VIDEO-STARS
				if (!$this->ignoredStar($star) && !$this->ignoredStarID($this->getAliasAsStar($star))) {
					if ($this->starExists($star)) { // USING NAME
						$videoID = $this->getVideo($path);
						$starID = $this->getStar($star);

						$this->addVideoStar($videoID, $starID);
					} else if ($this->starAliasExists($star)) { // USING ALIAS
						$videoID = $this->getVideo($path);
						$starID = $this->getAliasAsStar($star);

						$this->addVideoStar($videoID, $starID);
					}
				}

			}
		}
	}

	function checkVideoRelation($file)
	{
		$file_class = new File();
		$path = $file_class->getPath($file);

		$website = $file_class->getWebsite($file);
		$site = $file_class->getSite($file);
		$videoID = $this->getVideo($path);

		if (!$this->websiteRelationExists($website, $videoID)) {
			$this->resetWebsiteRelation($videoID);
			$this->addWebsiteRelation($website, $videoID);
		}
		if (!$this->siteRelationExists($site, $videoID)) {
			if (strlen($site)) {
				$this->resetSiteRelation($videoID);
				$this->addSiteRelation($site, $videoID);
			}
		}
	}

	function checkVideoDate($file)
	{
		$file_class = new File();
		$path = $file_class->getPath($file);

		$date = $file_class->getDate($file);
		$videoID = $this->getVideo($path);

		if ($this->incorrectDate($videoID, $date)) {
			$this->fixDate($videoID, $date);
		}
	}
}

class Star
{
	public $sqlMethod = '';
	public $orderStr = ' ORDER BY name';
	public $groupStr = '';
	public $havingStr = ' HAVING image IS NULL';

	function sql($order = 1)
	{
		if ($this->sqlMethod == '') {
			$sql = "SELECT * FROM stars";
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

	function fetchMissing()
	{
		global $pdo;
		$query = $pdo->prepare("SELECT videos.id, path FROM videos LEFT JOIN videostars ON videos.id = videostars.videoID GROUP BY videos.id HAVING COUNT(videostars.id) < 1");
		$query->execute();
		if ($query->rowCount()) {
			$file_class = new File();

			$missingStars_arr = [];
			$missingStarsID_arr = [];

			foreach ($query->fetchAll() as $data) {
				if (!in_array($file_class->getStar($data['path']), $missingStars_arr) && file_exists("videos/$data[path]")) {
					array_push($missingStars_arr, $file_class->getStar($data['path']));
					array_push($missingStarsID_arr, $data['id']);
				}
			}

			for ($i = 0; $i < count($missingStars_arr); $i++) {
				print "<p class='missing'><a href='video.php?id=$missingStarsID_arr[$i]'>$missingStarsID_arr[$i]</a>: <span class='name'>$missingStars_arr[$i]</span></p>";
			}
		}

		$query = $pdo->prepare($this->sql());
		$query->execute();
		if ($query->rowCount()) {
			print '<div id="stars">';
			foreach ($query->fetchAll() as $data) {
				if (is_null($data['image']))
					print "<div class='star no-image' data-star-id='$data[id]'>";
				else
					print "<div class='star' data-star-id='$data[id]'>";

				print "<a href='star.php?id=$data[id]'>";

				if (is_null($data['image']))
					print '<div class="image" style="width: 200px; height: 275px"></div>';
				else
					print "<img src='images/stars/$data[image]?v=" . md5_file("images/stars/$data[image]") . "' style='width: 200px; height: 275px'>";
				print "<span class='name'>$data[name]</span>";
				print '</a>';

				print '</div>';
			}
			print '</div>';
		}
	}

	function fetchSimilar($starID)
	{
		global $pdo;

		/* Fetch Base Star */
		$query = $pdo->prepare("SELECT * FROM stars WHERE id = :starID LIMIT 1");
		$query->bindParam(':starID', $starID);
		$query->execute();
		$currentStar = $query->fetch();

		/* Fetch other Stars */
		$query = $pdo->prepare("SELECT * FROM stars WHERE NOT id = :starID");
		$query->bindParam(':starID', $starID);
		$query->execute();

		$otherStars_id = [];
		$otherStars_match = [];
		$match_important = 5;
		$match_default = 2;

		foreach ($query->fetchAll() as $otherStar) {
			$date_class = new Date();

			$match = 100;
			if (!empty($currentStar['breast']) && $otherStar['breast'] !== $currentStar['breast']) $match -= $match_important;
			if (!empty($currentStar['haircolor']) && $otherStar['haircolor'] !== $currentStar['haircolor']) $match -= $match_important;
			if (!empty($currentStar['eyecolor']) && $otherStar['eyecolor'] !== $currentStar['eyecolor']) $match -= $match_default;
			if (!empty($currentStar['ethnicity']) && $otherStar['ethnicity'] !== $currentStar['ethnicity']) $match -= $match_important;
			if (!empty($currentStar['country']) && $otherStar['country'] !== $currentStar['country']) $match -= $match_important;
			if (!empty($currentStar['height']) && $otherStar['height'] !== $currentStar['height']) $match -= $match_default;
			if (!empty($currentStar['weight']) && $otherStar['weight'] !== $currentStar['weight']) $match -= $match_default;
			if (!empty($currentStar['start']) && $otherStar['start'] !== $currentStar['start']) $match -= $match_default;
			if (!empty($currentStar['end']) && $otherStar['end'] !== $currentStar['end']) $match -= $match_default;
			if (!empty($currentStar['birthdate']) && !empty($otherStar['birthdate'])) {
				if ($date_class->calculateAge($otherStar['birthdate']) !== $date_class->calculateAge($currentStar['birthdate'])) {
					$match -= $match_important;
				}
			}

			if ($match > 0) {
				array_push($otherStars_id, $otherStar['id']);
				array_push($otherStars_match, $match);
			}
		}
		array_multisort($otherStars_match, SORT_DESC, $otherStars_id);

		if (count($otherStars_id) === count($otherStars_match)) {
			$numResults = SIMILAR_DEF;
			if (count($otherStars_id) < $numResults) $numResults = count($otherStars_id);

			for ($i = 0; $i < $numResults; $i++) {
				if ($i === 0) {
					print '<div id="similar">';
					print '<h1>Similar Stars</h1>';
				}

				$query = $pdo->prepare("SELECT * FROM stars WHERE id = :starID LIMIT 1");
				$query->bindParam(':starID', $otherStars_id[$i]);
				$query->execute();
				$star = $query->fetch();

				$similarity = $otherStars_match[$i];
				if (SIMILAR_TEXT && $similarity === 100) {
					$similarity = round(similar_text($currentStar['name'], $star['name']));
				}

				print "<a href='?id=$star[id]' class='similar-star ribbon-container'>";

				print "<img src='images/stars/$star[image]?v=" . md5_file("images/stars/$star[image]") . "' class='lazy'>";
				print "<h2>$star[name]</h2>";


				if (SIMILAR_TEXT) {
					if ($otherStars_match[$i] < 100) print "<span class='ribbon'>$similarity%</span>";
					else print "<span class='ribbon ribbon-green'>$similarity%</span>";
				} else {
					if ($similarity < 100) print "<span class='ribbon'>$similarity%</span>";
					else print "<span class='ribbon ribbon-green'>$similarity%</span>";
				}
				print '</a>'; // .similar-star

				if ($i === $numResults - 1) {
					if ($otherStars_match[$i] === 100 && $numResults < SIMILAR_MAX) {
						if (
							!is_null($currentStar['breast']) || !is_null($currentStar['eyecolor']) || !is_null($currentStar['haircolor']) ||
							!is_null($currentStar['ethnicity']) || !is_null($currentStar['country']) || !is_null($currentStar['birthdate']) ||
							!is_null($currentStar['height']) || !is_null($currentStar['weight']) || !is_null($currentStar['start']) ||
							!is_null($currentStar['end'])
						) {
							$numResults++;
						}
					} else {
						print '</div>'; // #similar
					}
				}
			}
		}
	}

	function getStar($id)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT * FROM stars WHERE id = ? LIMIT 1");
		$query->bindValue(1, $id);
		$query->execute();
		return $query->fetch()['name'];
	}

	function fetchStar($id)
	{
		$nextID = function ($id = -1) {
			global $pdo;
			if ($id !== -1) {
				if ($this->havingStr === '') {
					$this->havingStr = ' HAVING id = :starID';
				} else {
					$this->havingStr .= ' OR id = :starID';
				}
				$query = $pdo->prepare($this->sql());
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
			} else {
				$query = $pdo->prepare($this->sql());
				$query->execute();
				$return = $query->fetch()['id'];
			}

			return $return;
		};

		global $pdo;
		$query = $pdo->prepare("SELECT * FROM stars WHERE id = ? LIMIT 1");
		$query->bindValue(1, $id);
		$query->execute();
		if (!$query->rowCount()) {
			if ($id) header("Location: ?id={$nextID()}");
			else header("Location: stars.php");
		} else {
			$result = $query->fetch();

			$name = $result['name'];
			$image = $result['image'];
			$ignored = $result['autoTaggerIgnore'];

			/* NextID */
			$nextID_arr = $nextID($id);
			$nextID = $nextID_arr[0];
			$nextID_count = $nextID_arr[1];

			print '<div id="star">';
			print "<a class='btn btn-outline-primary' id='next' href='?id=$nextID'>Next ($nextID_count)</a>";

			if (!is_null($image) && !empty($image)) {
				print "<img src='images/stars/$image?v=" . md5_file("images/stars/$image") . "'>";
			} else {
				print '<div id="dropbox"><span>Drop Image Here</span></div>';
			}
			print "<h2><span id='star-name' data-star-ignore='$ignored'>$name</span>";
			$this->fetchAlias($id);

			if (PARSER) {
				print '<br><form method="post" style="display: inline"><div class="form-row">';
				print '<input class="btn btn-primary" type="submit" name="freeones" value="Get Data">';
				print '<input class="btn btn-outline-secondary" type="submit" name="freeones_rs" value="Reset Data">';
				print '</div></form>';
			}
			print '</h2>';


			$haircolor = $result['haircolor'];
			$eyecolor = $result['eyecolor'];
			$breast = $result['breast'];
			$ethnicity = $result['ethnicity'];
			$country = $result['country'];
			$birthdate = $result['birthdate'];
			$height = $result['height'];
			$weight = $result['weight'];
			$start = $result['start'];
			$end = $result['end'];

			$query_country = $pdo->prepare("SELECT code FROM country WHERE name = ? LIMIT 1");
			$query_country->bindValue(1, $country);
			$query_country->execute();
			$country_char = $query_country->fetch()['code'];

			print '<form method="post">';
			print '<label for="breast">Breast </label>';
			print "<input type='text' name='breast' value='$breast'>";
			print '<div id="breasts" class="hidden">';
			$query = $pdo->prepare("SELECT * FROM stars GROUP BY breast");
			$query->execute();
			foreach ($query->fetchAll() as $data) {
				if (!is_null($data['breast'])) print "<span class='breast'>$data[breast]</span>";
			}
			print '</div>';

			print '</form>';
			print '<form method="post">';

			print '<label for="eye">EyeColor </label>';
			print "<input type='text' name='eye' value='$eyecolor'>";
			print '<div id="eyes" class="hidden">';
			$query = $pdo->prepare("SELECT * FROM stars GROUP BY eyecolor");
			$query->execute();
			foreach ($query->fetchAll() as $data) {
				if (!is_null($data['eyecolor'])) print "<span class='eye'>$data[eyecolor]</span>";
			}
			print '</div>';

			print '</form>';
			print '<form method="post">';

			print '<label for="hair">HairColor </label>';
			print "<input type='text' name='hair' value='$haircolor'>";
			print '<div id="hairs" class="hidden">';
			$query = $pdo->prepare("SELECT * FROM stars GROUP BY haircolor");
			$query->execute();
			foreach ($query->fetchAll() as $data) {
				if (!is_null($data['haircolor'])) print "<span class='hair'>$data[haircolor]</span>";
			}
			print '</div>';

			print '</form>';
			print '<form method="post">';

			print '<label for="ethnicity">Ethnicity </label>';
			print "<input type='text' name='ethnicity' value='$ethnicity'>";
			print '<div id="ethnicities" class="hidden">';
			$query = $pdo->prepare("SELECT * FROM stars GROUP BY ethnicity");
			$query->execute();
			foreach ($query->fetchAll() as $data) {
				if (!is_null($data['ethnicity'])) print "<span class='ethnicity'>$data[ethnicity]</span>";
			}
			print '</div>';

			print '</form>';
			print '<form method="post">';

			print '<label for="country">Country </label>';
			print "<input type='text' name='country' value='$country'>";
			print "<div class='flag flag-$country_char'></div>";
			print '<div id="countries" class="hidden">';
			$query = $pdo->prepare("SELECT * FROM stars GROUP BY country");
			$query->execute();
			foreach ($query->fetchAll() as $data) {
				if (!is_null($data['country'])) print "<span class='country'>$data[country]</span>";
			}
			print '</div>';

			print '</form>';
			print '<form method="post">';

			print '<label for="birthdate">BirthDate </label>';
			print "<input type='text' name='birthdate' value='$birthdate'>";

			if (strlen($birthdate)) {
				$date_class = new Date();
				print "<span style='margin-left: 10px'>Age: {$date_class->calculateAge($birthdate)}</span>";
			}
			print '</form>';


			print '<form method="post">';

			print '<label for="height">Height </label>';
			print "<input type='text' name='height' value='$height'>";

			print '</form>';
			print '<form method="post">';

			print '<label for="weight">Weight </label>';
			print "<input type='text' name='weight' value='$weight'>";

			print '</form>';
			print '<form method="post" class="inline">';

			print '<label>Year </label>';
			print "<input type='text' name='start' placeholder='Start' value='$start'>";
			print '<div id="starts" class="hidden">';
			$query = $pdo->prepare("SELECT * FROM stars GROUP BY start");
			$query->execute();
			foreach ($query->fetchAll() as $data) {
				if (!is_null($data['start'])) print "<span class='start'>$data[start]</span>";
			}
			print '</div>'; // #starts

			print '</form>';
			print '<form method="post" class="inline">';

			print "<input type='text' name='end' placeholder='End' value='$end'>";
			print '<div id="ends" class="hidden">';
			$query = $pdo->prepare("SELECT * FROM stars GROUP BY end");
			$query->execute();
			foreach ($query->fetchAll() as $data) {
				if (!is_null($data['end'])) print "<span class='end'>$data[end]</span>";
			}
			print '</div>'; // #ends

			print '</form>';

			print '</div>';

			$this->saveProperty($id);

			$videoCount = self::videoCount($id);
			print "<h3>Videos (<span class='count'>$videoCount</span>)</h3>";

			$this->fetchVideos($id);
		}
	}

	function fetchAlias($id)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT id, name FROM staralias WHERE starID = ?");
		$query->bindValue(1, $id);
		$query->execute();
		if ($query->rowCount()) {
			$aliasID_arr = [];
			$aliasName_arr = [];
			foreach ($query->fetchAll() as $alias) {
				array_push($aliasID_arr, $alias['id']);
				array_push($aliasName_arr, $alias['name']);
			}

			print '<small>(';
			for ($i = 0; $i < count($aliasID_arr); $i++) {
				print "<span class='alias' data-alias-id='$aliasID_arr[$i]'>";
				print $aliasName_arr[$i];
				print '</span>';
				if ($i !== count($aliasID_arr) - 1) print ', ';
			}
			print ')</small>';
		}
	}

	function saveProperty($starID)
	{
		global $pdo;
		if ($_SERVER['REQUEST_METHOD'] == "POST") {
			if ((isset($_POST['hair']) && !empty($_POST['hair']) && $_POST['hair'] != '') ||
				(isset($_POST['eye']) && !empty($_POST['eye']) && $_POST['eye'] != '') ||
				(isset($_POST['breast']) && !empty($_POST['breast']) && $_POST['breast'] != '') ||
				(isset($_POST['ethnicity']) && !empty($_POST['ethnicity']) && $_POST['ethnicity'] != '') ||
				(isset($_POST['country']) && !empty($_POST['country']) && $_POST['country'] != '') ||
				(isset($_POST['birthdate']) && !empty($_POST['birthdate']) && $_POST['birthdate'] != '') ||
				(isset($_POST['height']) && !empty($_POST['height']) && $_POST['height'] != '') ||
				(isset($_POST['weight']) && !empty($_POST['weight']) && $_POST['weight'] != '') ||
				(isset($_POST['start']) && !empty($_POST['start']) && $_POST['start'] != '') ||
				(isset($_POST['end']) && !empty($_POST['end']) && $_POST['end'] != '')
			) {
				$hair = $_POST['hair'];
				$eye = $_POST['eye'];
				$breast = $_POST['breast'];
				$ethnicity = $_POST['ethnicity'];
				$country = $_POST['country'];
				$birthdate = $_POST['birthdate'];
				$height = $_POST['height'];
				$weight = $_POST['weight'];
				$start = $_POST['start'];
				$end = $_POST['end'];

				if (count(explode("'", $height)) > 1) {
					$height_feet = explode("'", $height)[0];
					$height_inches = explode("'", $height)[1];
					$height = round(($height_feet * 30.48) + ($height_inches * 2.54));
				}

				if (count(explode("lbs", $weight)) > 1) {
					$weight_lbs = explode("lbs", $weight)[0];
					$weight = round($weight_lbs * 0.45359237);
				}

				if ($hair != '' && $hair != '_NULL') {
					$query = $pdo->prepare("UPDATE stars SET haircolor = ? WHERE id = ?");
					$query->bindValue(1, $hair);
					$query->bindValue(2, $starID);
					$query->execute();
				} else if ($hair == '_NULL') {
					$query = $pdo->prepare("UPDATE stars SET haircolor = NULL WHERE id = ?");
					$query->bindValue(1, $starID);
					$query->execute();
				}

				if ($eye != '' && $eye != '_NULL') {
					$query = $pdo->prepare("UPDATE stars SET eyecolor = ? WHERE id = ?");
					$query->bindValue(1, $eye);
					$query->bindValue(2, $starID);
					$query->execute();
				} else if ($eye == '_NULL') {
					$query = $pdo->prepare("UPDATE stars SET eyecolor = NULL WHERE id = ?");
					$query->bindValue(1, $starID);
					$query->execute();
				}

				if ($breast != '' && $breast != '_NULL') {
					$query = $pdo->prepare("UPDATE stars SET breast = ? WHERE id = ?");
					$query->bindValue(1, $breast);
					$query->bindValue(2, $starID);
					$query->execute();
				} else if ($breast == '_NULL') {
					$query = $pdo->prepare("UPDATE stars SET breast = NULL WHERE id = ?");
					$query->bindValue(1, $starID);
					$query->execute();
				}

				if ($ethnicity != '' && $ethnicity != '_NULL') {
					$query = $pdo->prepare("UPDATE stars SET ethnicity = ? WHERE id = ?");
					$query->bindValue(1, $ethnicity);
					$query->bindValue(2, $starID);
					$query->execute();
				} else if ($ethnicity == '_NULL') {
					$query = $pdo->prepare("UPDATE stars SET ethnicity = NULL WHERE id = ?");
					$query->bindValue(1, $starID);
					$query->execute();
				}

				if ($country != '' && $country != '_NULL') {
					$query = $pdo->prepare("UPDATE stars SET country = ? WHERE id = ?");
					$query->bindValue(1, $country);
					$query->bindValue(2, $starID);
					$query->execute();
				} else if ($country == '_NULL') {
					$query = $pdo->prepare("UPDATE stars SET country = NULL WHERE id = ?");
					$query->bindValue(1, $starID);
					$query->execute();
				}

				if ($birthdate != '' && $birthdate != '_NULL') {
					if (is_numeric($birthdate)) {
						if (self::videoCount() === 1) {
							$query = $pdo->prepare("SELECT * FROM videostars WHERE starID = ? LIMIT 1");
							$query->bindValue(1, $starID);
							$query->execute();
							$videoID = $query->fetch()['videoID'];

							$query = $pdo->prepare("UPDATE videos SET starAge = :age WHERE id = :videoID");
							$query->bindParam(':age', $birthdate);
							$query->bindParam(':videoID', $videoID);
							$query->execute();
						}
					} else {
						$date = new Date;
						$birthdate_newStr = $date->stringToDate($birthdate);

						if ($birthdate_newStr > (new DateTime())->format('Y-m-d')) { // date should be less than today
							$dateArr = explode('-', $birthdate_newStr);
							$dateArr[0] = $dateArr[0] - 100; // change 20xx to 19xx

							$birthdate_newStr = "$dateArr[0]-$dateArr[1]-$dateArr[2]";
						}

						$query = $pdo->prepare("UPDATE stars SET birthdate = ? WHERE id = ?");
						$query->bindValue(1, $birthdate_newStr);
						$query->bindValue(2, $starID);
						$query->execute();
					}
				} else if ($birthdate == '_NULL') {
					$query = $pdo->prepare("UPDATE stars SET birthdate = NULL WHERE id = ?");
					$query->bindValue(1, $starID);
					$query->execute();
				}

				if ($height != '' && $height != '_NULL') {
					if (strpos($height, "'")) {
						$height_feet = trim(explode($height, "'")[0]);
						$height_inches = trim(explode(explode($height, "'")[1], '"')[0]);

						$height = round(($height_feet * 30.48) + ($height_inches * 2.54));
					}

					$query = $pdo->prepare("UPDATE stars SET height = ? WHERE id = ?");
					$query->bindValue(1, $height);
					$query->bindValue(2, $starID);
					$query->execute();
				} else if ($height == '_NULL') {
					$query = $pdo->prepare("UPDATE stars SET height = NULL WHERE id = ?");
					$query->bindValue(1, $starID);
					$query->execute();
				}

				if ($weight != '' && $weight != '_NULL') {
					if (strpos($weight, 'lbs')) {
						$weight_lbs = trim(explode($weight, 'lbs')[0]);
						$weight = round($weight_lbs * 2.20462);
					}

					$query = $pdo->prepare("UPDATE stars SET weight = ? WHERE id = ?");
					$query->bindValue(1, $weight);
					$query->bindValue(2, $starID);
					$query->execute();
				} else if ($weight == '_NULL') {
					$query = $pdo->prepare("UPDATE stars SET weight = NULL WHERE id = ?");
					$query->bindValue(1, $starID);
					$query->execute();
				}

				if ($start != '' && $start != '_NULL') {
					$query = $pdo->prepare("UPDATE stars SET start = ? WHERE id = ?");
					$query->bindValue(1, $start);
					$query->bindValue(2, $starID);
					$query->execute();
				} else if ($start == '_NULL') {
					$query = $pdo->prepare("UPDATE stars SET start = NULL WHERE id = ?");
					$query->bindValue(1, $starID);
					$query->execute();
				}

				if ($end != '' && $end != '_NULL') {
					$query = $pdo->prepare("UPDATE stars SET end = ? WHERE id = ?");
					$query->bindValue(1, $end);
					$query->bindValue(2, $starID);
					$query->execute();
				} else if ($end == '_NULL') {
					$query = $pdo->prepare("UPDATE stars SET end = NULL WHERE id = ?");
					$query->bindValue(1, $starID);
					$query->execute();
				}
				Basic::reload();
			}
		}
	}

	function fetchVideos($starID)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT videos.name, path, videos.id, websites.name AS website, sites.name AS site, datediff(videos.date, stars.birthdate) AS ageinvideo FROM videos LEFT JOIN videosites ON videosites.videoID = videos.id LEFT JOIN sites ON sites.id = videosites.siteID JOIN videowebsites ON videowebsites.videoID = videos.id JOIN websites ON websites.id = videowebsites.websiteID JOIN videostars ON videos.id = videostars.videoID JOIN stars ON videostars.starID = stars.id WHERE videostars.starID = ? GROUP BY videos.id ORDER BY date");
		$query->bindValue(1, $starID);
		$query->execute();
		if ($query->rowCount()) {
			$date_class = new Date();

			print "<div id='videos' class='row'>";
			$cdnNumber = 1;
			foreach ($query->fetchAll() as $data) {
				$ageInVideo = $date_class->daysToYears($data['ageinvideo']);

				$localPath = htmlspecialchars("videos/$data[path]", ENT_QUOTES);
				$localPathWebm = str_replace('.mp4', '.webm', str_replace('.m4v', '.webm', $localPath));
				$localPathMkv = str_replace('.mp4', '.mkv', str_replace('.m4v', '.mkv', $localPath));

				if (CDN) $cdnPrefix = "http://cdn$cdnNumber-";
				else $cdnPrefix = "http://";
				$fullPath = "$cdnPrefix$_SERVER[HTTP_HOST]/$localPath";
				$fullPathWebm = "$cdnPrefix$_SERVER[HTTP_HOST]/$localPathWebm";
				$fullPathMkv = "$cdnPrefix$_SERVER[HTTP_HOST]/$localPathMkv";

				$localPath_img = "images/videos/$data[id]-" . THUMBNAIL_RES . ".jpg";
				$fullPath_img = "$cdnPrefix$_SERVER[HTTP_HOST]/$localPath_img";

				print "<a class='video col-4 ribbon-container' href='video.php?id=$data[id]'>";
				print "<video class='mx-auto' poster='$fullPath_img?v=" . md5_file($localPath_img) . "' preload='none' muted>";
				if (enableWEBM && file_exists($localPathWebm)) print "<source src='$fullPathWebm' type='video/webm'>";
				if (enableMKV && file_exists($localPathMkv)) print "<source src='$fullPathMkv' type='video/x-matroska'>";
				print "<source src='$fullPath' type='video/mp4'>";
				print "</video>";

				print "<span class='title'>$data[name]</span>";
				print '<span class="info">';
				print "<span class='wsite''>$data[website]</span>";
				if (!is_null($data['site'])) {
					print '<span class="divider">&ndash;</span>';
					print "<span class='site'>$data[site]</span>";
				}
				print '</span>';

				if (!$ageInVideo) {
					$query_age = $pdo->prepare("SELECT starAge FROM videos WHERE id = :videoID AND starAge IS NOT NULL");
					$query_age->bindParam(':videoID', $data['id']);
					$query_age->execute();
					if ($query_age->rowCount()) $ageInVideo = $query_age->fetch()['starAge'];
				}
				if ($ageInVideo) print "<span class='ribbon'>$ageInVideo<span>";

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
				$ext = strtolower($basic->getExtension($image));

				if ($this->downloadImage($image, $id)) {
					$query = $pdo->prepare("UPDATE stars SET image = ? WHERE id = ?");
					$query->bindValue(1, "$id.$ext");
					$query->bindValue(2, $id);
					if ($query->execute()) {
						print '<script>reload(true)</script>';
					}
				}
			}
		}
	}

	function downloadImage($url, $name)
	{
		$basic = new Basic();
		$ext = strtolower($basic->getExtension($url));
		if ($ext === 'jpe' || $ext === 'jpeg') $ext = 'jpg';
		$url = str_replace('https://', 'http://', $url);

		$localPath = "../images/stars/$name.$ext";

		$url = str_replace(' ', '%20', $url);

		return copy($url, $localPath);
	}

	function freeOnes($id)
	{
		$saveProp = function ($name, $value) {
			global $pdo, $id;
			$query = $pdo->prepare("UPDATE stars SET $name = ? WHERE id = ?");
			$query->bindValue(1, $value);
			$query->bindValue(2, $id);
			$query->execute();
		};

		$addAlias = function ($aliasName) {
			global $pdo, $id;
			$query = $pdo->prepare("SELECT id FROM staralias WHERE name = ? LIMIT 1");
			$query->bindValue(1, $aliasName);
			$query->execute();
			if (!$query->rowCount()) {
				$query = $pdo->prepare("SELECT id FROM stars WHERE name = ? LIMIT 1");
				$query->bindValue(1, $aliasName);
				$query->execute();
				if (!$query->rowCount()) {
					$query = $pdo->prepare("INSERT INTO staralias(starID, name) VALUES(:starID, :aliasName)");
					$query->bindParam(':starID', $id);
					$query->bindParam(':aliasName', $aliasName);
					$query->execute();
				}
			}
		};

		global $pdo;
		$query = $pdo->prepare("SELECT * FROM stars WHERE id = ? LIMIT 1");
		$query->bindValue(1, $id);
		$query->execute();
		$star = $query->fetch();

		$url = "https://www.freeones.no/search/?q=" . str_replace(' ', '+', $star['name']);

		$base = file_get_contents($url);
		$searchElement = explode('<tr>', explode('class="ContentBlockBody Block3"', $base)[1])[2];
		$starLink = '/html/' . explode('"', explode('/html/', $searchElement)[1])[0];
		$starBio = str_replace('_links/', '_links/bio_', $starLink);

		$names_arr = [];

		$names = explode('</small>', explode('/>', explode('<img src', $searchElement)[1])[1])[0];
		$names_main = trim(explode('</a>', explode('">', $names)[2])[0]);
		array_push($names_arr, strtolower($names_main));
		$names_alias = explode(', ', explode(' aka ', explode('">', $names)[2])[1]);
		foreach ($names_alias as $alias) {
			array_push($names_arr, strtolower($alias));
		}

		/* Calculate MatchRate */
		$matchRate = intval(trim(explode('>', end(explode(' ', explode('%', $searchElement)[0])))[1]));
		if ($matchRate < 100 || !in_array(strtolower($star['name']), $names_arr)) {
			return;
		} else if ($names_main !== $star['name']) {
			$addAlias($names_main);
		}

		$url = "https://www.freeones.no$starBio";
		$bio = file_get_contents($url);

		$bio_content = explode('<div class="ContentBlockBody"', $bio)[1];

		$ethnicity = '';
		for ($i = 0; $i < count(explode('<tr>', $bio_content)); $i++) {
			$wrapper = explode('<tr>', $bio_content)[$i];
			$wrapper_header = trim(explode('</b>', explode('<b>', $wrapper)[1])[0]);
			if ($wrapper_header == 'Etnisitet:') {
				$ethnicity = trim(explode('&nbsp;', explode('<td class="paramvalue">', $wrapper)[1])[0]);
				break;
			}
		}

		switch ($ethnicity) {
			case 'Hvit':
				$ethnicity = 'Caucasian';
				break;
			case 'Latinsk':
				$ethnicity = 'Latin';
				break;
			case 'Svart':
				$ethnicity = 'Black';
				break;
		}

		/* COUNTRY */
		$country = explode('" />', explode('title="', explode('<img class="middle"', $searchElement)[1])[1])[0];

		$date = '';
		for ($i = 0; $i < count(explode('<tr>', $bio_content)); $i++) {
			$wrapper = explode('<tr>', $bio_content)[$i];
			$wrapper_header = trim(explode('</b>', explode('<b>', $wrapper)[1])[0]);
			if ($wrapper_header == 'Fødselsdato:') {
				$date = trim(str_replace("&nbsp;", '', explode(' (', explode('<td class="paramvalue">', $wrapper)[1])[0]));
				if (strpos($date, 'Ukjent') !== false) {
					$date = '';
				} else {
					$date = str_replace('Januar', 'January', $date);
					$date = str_replace('Februar', 'February', $date);
					$date = str_replace('Mars', 'March', $date);
					$date = str_replace('Mai', 'May', $date);
					$date = str_replace('Juni', 'June', $date);
					$date = str_replace('Juli', 'July', $date);
					$date = str_replace('Oktober', 'October', $date);
					$date = str_replace('Desember', 'December', $date);
				}
				break;
			}
		}

		$eyecolor = '';
		for ($i = 0; $i < count(explode('<tr>', $bio_content)); $i++) {
			$wrapper = explode('<tr>', $bio_content)[$i];
			$wrapper_header = trim(explode('</b>', explode('<b>', $wrapper)[1])[0]);
			if ($wrapper_header == 'Øyenfarge:') {
				$eyecolor = trim(explode('&nbsp;', explode('<td class="paramvalue">', $wrapper)[1])[0]);
				break;
			}
		}

		switch ($eyecolor) {
			case 'Blå':
				$eyecolor = 'Blue';
				break;
			case 'Brun':
				$eyecolor = 'Brown';
				break;
			case 'Grå':
				$eyecolor = 'Grey';
				break;
			case 'Grønn':
				$eyecolor = 'Green';
				break;
			case 'Nøttebrun':
				$eyecolor = 'Hazel';
				break;
		}

		$haircolor = '';
		for ($i = 0; $i < count(explode('<tr>', $bio_content)); $i++) {
			$wrapper = explode('<tr>', $bio_content)[$i];
			$wrapper_header = trim(explode('</b>', explode('<b>', $wrapper)[1])[0]);
			if ($wrapper_header == 'Hårfarge:') {
				$haircolor = trim(explode('&nbsp;', explode('<td class="paramvalue">', $wrapper)[1])[0]);
				break;
			}
		}

		switch ($haircolor) {
			case 'Blond':
				$haircolor = 'Blonde';
				break;
			case 'Brun':
				$haircolor = 'Brown';
				break;
			case 'Gyllenbrun':
				$haircolor = 'Auburn';
				break;
			case 'Rød':
				$haircolor = 'Red';
				break;
			case 'Svart':
				$haircolor = 'Black';
				break;
		}

		$height = '';
		for ($i = 0; $i < count(explode('<tr>', $bio_content)); $i++) {
			$wrapper = explode('<tr>', $bio_content)[$i];
			$wrapper_header = trim(explode('</b>', explode('<b>', $wrapper)[1])[0]);
			if ($wrapper_header == 'Høyde:') {
				$height = trim(explode('"', explode('heightcm = "', explode('&nbsp;', explode('<td class="paramvalue">', $wrapper)[1])[0])[1])[0]);
				break;
			}
		}
		if ($height == 0) $height = '';


		$weight = '';
		for ($i = 0; $i < count(explode('<tr>', $bio_content)); $i++) {
			$wrapper = explode('<tr>', $bio_content)[$i];
			$wrapper_header = trim(explode('</b>', explode('<b>', $wrapper)[1])[0]);
			if ($wrapper_header == 'Vekt:') {
				$weight = trim(explode('"', explode('weightkg = "', explode('&nbsp;', explode('<td class="paramvalue">', $wrapper)[1])[0])[1])[0]);
				break;
			}
		}
		if ($weight == 0) $weight = '';

		$breast_str = '';
		for ($i = 0; $i < count(explode('<tr>', $bio_content)); $i++) {
			$wrapper = explode('<tr>', $bio_content)[$i];
			$wrapper_header = trim(explode('</b>', explode('<b>', $wrapper)[1])[0]);
			if ($wrapper_header == 'Mål:') {
				$breast_str = trim(explode('-', explode('&nbsp;', explode('<td class="paramvalue">', $wrapper)[1])[0])[0]);
				break;
			}
		}
		$breast = '';
		for ($i = 0; $i < strlen($breast_str); $i++) if (preg_match('/[a-zA-Z]/', $breast_str[$i])) $breast .= $breast_str[$i];

		switch ($breast) {
			case 'DDD':
				$breast = 'E';
				break;
			case 'G':
			case 'EE':
				$breast = 'F';
				break;
			case 'H':
				$breast = 'FF';
				break;
			case 'I':
				$breast = 'G';
				break;
			case 'J':
				$breast = 'GG';
				break;
			case 'K':
				$breast = 'H';
				break;
			case 'L':
				$breast = 'HH';
				break;
			case 'M':
				$breast = 'I';
				break;
			case 'N':
				$breast = 'II';
				break;
		}

		$year = '';
		for ($i = 0; $i < count(explode('<tr>', $bio_content)); $i++) {
			$wrapper = explode('<tr>', $bio_content)[$i];
			$wrapper_header = trim(explode('</b>', explode('<b>', $wrapper)[1])[0]);
			if ($wrapper_header == 'Career Start And End') {
				$year = explode(' - ', explode('&nbsp;', explode('<td class="paramvalue">', $wrapper)[1])[0]);
				break;
			}
		}

		$year_start = trim($year[0]);
		$year_end = trim(explode('(', $year[1])[0]);
		if (!is_numeric($year_start)) $year_start = '';
		if (!is_numeric($year_end) || $year_end == date('Y')) $year_end = '';

		$date_class = new Date();
		if (is_null($star['breast']) && strlen($breast)) {
			$saveProp('breast', $breast);
		}
		if (is_null($star['eyecolor']) && strlen($eyecolor)) {
			$saveProp('eyecolor', $eyecolor);
		}
		if (is_null($star['haircolor']) && strlen($haircolor)) {
			$saveProp('haircolor', $haircolor);
		}
		if (is_null($star['ethnicity']) && strlen($ethnicity)) {
			$saveProp('ethnicity', $ethnicity);
		}
		if (is_null($star['country']) && strlen($country)) {
			$saveProp('country', $country);

			// COUNTRY_code
			$country_src = explode('"', explode('src="', explode('<img class="middle"', $searchElement)[1])[1])[0];
			$country_code = explode('.', explode('/', $country_src)[count(explode('/', $country_src)) - 1])[0];
			$query = $pdo->prepare("SELECT id FROM country WHERE name = ? AND code = ? LIMIT 1");
			$query->bindValue(1, $country);
			$query->bindValue(2, $country_code);
			$query->execute();
			if (!$query->rowCount()) {
				$query = $pdo->prepare("INSERT into country(name, code) VALUES(:countryName, :countryCode)");
				$query->bindParam(':countryName', $country);
				$query->bindParam(':countryCode', $country_code);
				$query->execute();
			}
		}
		if (is_null($star['birthdate']) && strlen($date)) {
			$saveProp('birthdate', $date_class->stringToDate($date));
		}
		if (is_null($star['height']) && strlen($height)) {
			$saveProp('height', $height);
		}
		if (is_null($star['weight']) && strlen($weight)) {
			$saveProp('weight', $weight);
		}
		if (is_null($star['start']) && strlen($year_start)) {
			$saveProp('start', $year_start);
		}
		if (is_null($star['end']) && strlen($year_end)) {
			$saveProp('end', $year_end);
		}
		Basic::reload();
	}

	function freeOnes_reset($id)
	{
		global $pdo;
		$query = $pdo->prepare("UPDATE stars SET haircolor = NULL, eyecolor = NULL, breast = NULL, ethnicity = NULL, country = NULL, birthdate = NULL, height = NULL, height = NULL, weight = NULL, start = NULL, end = NULL WHERE id = :starID");
		$query->bindParam(':starID', $id);
		$query->execute();
		Basic::reload();
	}

	static function videoCount($id = -1)
	{
		if ($id === -1) $id = $_GET['id'];

		global $pdo;
		$query = $pdo->prepare("SELECT COUNT(*) as total FROM videostars WHERE starID = ?");
		$query->bindValue(1, $id);
		$query->execute();
		return (int)$query->fetch()['total'];
	}
}

class Attributes
{
	static function getAttributes($videoID)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT videoattributes.attributeID AS id, attributes.name FROM attributes JOIN videoattributes ON attributes.id = videoattributes.attributeID WHERE videoattributes.videoID = :videoID");
		$query->bindParam(':videoID', $videoID);
		$query->execute();
		if ($query->rowCount()) {
			return $query->fetchAll();
		} else {
			return '';
		}
	}

	static function attributeCount($videoID)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT attributes.name FROM attributes JOIN videoattributes ON attributes.id = videoattributes.attributeID WHERE videoattributes.videoID = :videoID");
		$query->bindParam(':videoID', $videoID);
		$query->execute();
		return $query->rowCount();
	}
}

class Location
{
	static function getLocations($videoID)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT videolocations.locationID AS id, locations.name FROM locations JOIN videolocations ON locations.id = videolocations.locationID WHERE videolocations.videoID = :videoID");
		$query->bindParam(':videoID', $videoID);
		$query->execute();
		if ($query->rowCount()) {
			return $query->fetchAll();
		} else {
			return '';
		}
	}

	static function locationCount($videoID)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT locations.name FROM locations JOIN videolocations ON locations.id = videolocations.locationID WHERE videolocations.videoID = :videoID");
		$query->bindParam(':videoID', $videoID);
		$query->execute();
		return $query->rowCount();
	}
}

class Video
{
	public $noStar;
	public $sqlOrder = ' ORDER BY ageinvideo, stars.id, videos.date';
	public $sqlMethod = 'age-in-video no-bookmark';
	public $videoDuration;

	function sql($override = 0)
	{
		if ($override == 1 || $this->sqlMethod == '')
			return "SELECT * FROM videos";
		else if ($this->sqlMethod === 'category')
			return "SELECT videos.id, videos.name, videos.path FROM videos LEFT JOIN videocategories ON videos.id = videocategories.videoID GROUP BY name HAVING COUNT(videocategories.id)";
		else if ($this->sqlMethod === 'no-category')
			return "SELECT videos.id, videos.name, videos.path FROM videos LEFT JOIN videocategories ON videos.id = videocategories.videoID GROUP BY name HAVING COUNT(videocategories.id) < 1";
		else if ($this->sqlMethod === 'no-stars')
			return "SELECT videos.id, videos.name, videos.path FROM videos LEFT JOIN videostars ON videos.id = videostars.videoID GROUP BY name HAVING COUNT(videostars.id) < 1";
		else if ($this->sqlMethod === 'bookmark')
			return "SELECT videos.id, videos.name, videos.path FROM videos LEFT JOIN bookmarks ON bookmarks.videoID = videos.id GROUP BY name HAVING COUNT(bookmarks.id)";
		else if ($this->sqlMethod === 'no-bookmark')
			return "SELECT videos.id, videos.name, videos.path FROM videos LEFT JOIN bookmarks ON bookmarks.videoID = videos.id GROUP BY name HAVING COUNT(bookmarks.id) < 1";
		else if ($this->sqlMethod === 'age-in-video no-bookmark')
			return "SELECT videos.id, videos.name, videos.path, videos.date, stars.birthdate, datediff(videos.date, stars.birthdate) AS ageinvideo FROM videos LEFT JOIN bookmarks ON videos.id = bookmarks.videoID LEFT JOIN videostars ON videos.id = videostars.videoID LEFT JOIN stars ON stars.id = videostars.starID GROUP BY videos.id HAVING COUNT(bookmarks.id) < 1";
		else if ($this->sqlMethod === 'age no-bookmark') {
			$this->sqlOrder = " ORDER BY birthdate DESC, stars.id, ageinvideo";
			return "SELECT videos.id, videos.name, videos.path, videos.date, stars.birthdate, datediff(videos.date, stars.birthdate) AS ageinvideo FROM videos LEFT JOIN bookmarks ON videos.id = bookmarks.videoID LEFT JOIN videostars ON videos.id = videostars.videoID LEFT JOIN stars ON stars.id = videostars.starID GROUP BY videos.id HAVING COUNT(bookmarks.id) < 1";
		} else if ($this->sqlMethod === 'age-in-video')
			return "SELECT videos.id, videos.name, videos.path, videos.date, stars.birthdate, datediff(videos.date, stars.birthdate) AS ageinvideo FROM videos JOIN videostars ON videos.id = videostars.videoID JOIN stars ON stars.id = videostars.starID";

		return true;
	}

	function fetchVideos()
	{
		$date_class = new Date();
		global $pdo;
		$query = $pdo->prepare($this->sql() . $this->sqlOrder);
		$query->execute();
		if ($query->rowCount()) {
			foreach ($query->fetchAll() as $data) {
				if (!file_exists("videos/$data[path]")) continue;

				$age = $date_class->daysToYears($data['ageinvideo']);
				if (!$age) $age = '00';
				print "<p>Age: $age <a href='video.php?id=$data[id]'>$data[name]</a></p>";
			}
		}
	}

	function nextVideo($id)
	{
		global $pdo;

		if ($this->sqlMethod == '')
			$query = $pdo->prepare("{$this->sql()}$this->sqlOrder");
		else
			$query = $pdo->prepare("{$this->sql()} OR videos.id = ?$this->sqlOrder");
		$query->bindValue(1, $id);
		$query->execute();

		$idFound = false;
		foreach ($query->fetchAll() as $data) {
			if (!$idFound) {
				if ($data['id'] == $id) {
					$idFound = true;
				}
				continue;
			} else if (!file_exists("videos/$data[path]")) { // skip file, if it does not exist on server
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
			print '<div id="up-next">';
			print '<span>Up Next</span>';
			print "<a href='?id=$nextVideo[id]'>";

			print '<div class="info">';

			print "<div class='title'>$nextVideo[name]</div>";

			if (intval($nextPlays) === 1) print "<div class='plays'>$nextPlays Play</div>";
			else print "<div class='plays'>$nextPlays Plays</div>";

			print '</div>';
			print '</a>';
			print '</div>';
		}
	}

	function getVideo($id)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT name FROM videos WHERE id = ? LIMIT 1");
		$query->bindValue(1, $id);
		$query->execute();
		return $query->fetch()['name'];
	}

	function getWebsite($videoID)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT websites.name FROM websites JOIN videowebsites ON websites.id = videowebsites.websiteID JOIN videos ON videos.id = videowebsites.videoID WHERE videos.id = ?");
		$query->bindValue(1, $videoID);
		$query->execute();
		return $query->fetch()['name'];
	}

	function getSite($videoID)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT sites.name FROM sites JOIN videosites ON sites.id = videosites.siteID JOIN videos ON videos.id = videosites.videoID WHERE videos.id = ?");
		$query->bindValue(1, $videoID);
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

			$name = htmlentities($result['name']);
			$wsite = $this->getSite($result['id']);
			$fname = $result['path'];
			$fnameWebm = str_replace('.mp4', '.webm', str_replace('.m4v', '.webm', $fname));

			$this->videoDuration = $result['duration'];

			$next = $this->nextVideo($id);
			$next['name'] = htmlspecialchars($next['name'], ENT_QUOTES);

			$localPath = htmlspecialchars($fname, ENT_QUOTES);
			$localPathWebm = htmlspecialchars($fnameWebm, ENT_QUOTES);

			$attr = '';
			if (Attributes::attributeCount($id)) {
				$attr .= '<small class="attributes">';
				foreach (Attributes::getAttributes($id) AS $attribute) {
					$attr .= "<span class='attribute btn' data-attribute-id='$attribute[id]'>$attribute[name]</span>";
				}
				$attr .= '</small>';
			}

			$lcn = '';
			if (Location::locationCount($id)) {
				$lcn .= '<small class="locations">';
				foreach (Location::getLocations($id) AS $location) {
					$lcn .= "<span class='location btn' data-location-id='$location[id]'>$location[name]</span>";
				}
				$lcn .= '</small>';
			}

			print '<div id="video">';

			print "<h2 id='video-title'><span id='video-name'>$name</span><small>$lcn</small><small>$attr</small></h2>";
			print "<h3 id='video-site'>$wsite</h3>";

			print "<a id='next' class='btn btn-outline-primary' href='?id=$next[id]' title='$next[name]'>Next</a>";


			/* Video */
			print "<video poster='images/videos/$id.jpg?v=" . md5_file("images/videos/$id.jpg") . "'>";

			$hlsDir = htmlspecialchars(Basic::removeExtensionPath($fname), ENT_QUOTES);
			$hlsFile = "videos/$hlsDir/index.m3u8";
			if (HLS && file_exists($hlsFile)) {
				print "<source src='' data-src='$hlsFile'>";
			} else {
				if (file_exists("videos/$fnameWebm")) print "<source src='videos/$localPathWebm' type='video/webm'>";
				print "<source src='videos/$localPath' type='video/mp4'>";
			}

			print "</video>";

			print '<span id="duration" class="hidden">' . $this->videoDuration . '</span>';

			print '</div>';
		}
	}

	function fetchInfo($id)
	{
		print '<div id="videoDetails" class="row">';

		$this->fetchBookmarks($id);

		print '<div style="min-height: 240px" class="col-3">'; // half of 3 is 1.5
		$this->fetchCategories($id);
		$this->addCategory_form($id);
		print '<br>';
		$this->addStar_form($id);
		print '</div>';

		print '</div>'; // #videoDetails

		$this->hiddenData();
	}

	function fetchInfo_sidebar($id)
	{
		$this->fetchStars($id);
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
		global $pdo;

		$query = $pdo->prepare("SELECT stars.image, stars.name, starID, datediff(videos.date, stars.birthdate) as ageinvideo FROM stars JOIN videostars ON stars.id = videostars.starID JOIN videos ON videos.id = videostars.videoID WHERE videostars.videoID = ? ORDER BY starID");
		$query->bindValue(1, $id);
		$query->execute();
		if ($query->rowCount()) {
			$date_class = new Date();
			print '<div id="stars">';
			foreach ($query->fetchAll() as $data) {
				$ageInVideo = $date_class->daysToYears($data['ageinvideo']);
				$videoCount = Star::videoCount($data['starID']);

				if ($data['image'] != '') {
					print "<div class='star' data-star-id='$data[starID]' data-badge='$videoCount'>";
					print "<img class='image' src='images/stars/$data[image]?v=" . md5_file("images/stars/$data[image]") . "'>";
				} else {
					print "<div class='star no-image' data-star-id='$data[starID]' data-badge='$videoCount'>";
					print '<div class="image" style="height: 275px; width: 200px"></div>';
				}

				print "<a class='name' href='star.php?id=$data[starID]'>$data[name]</a>";


				if (!$ageInVideo) {
					$query_age = $pdo->prepare("SELECT starAge FROM videos WHERE id = :videoID AND starAge IS NOT NULL");
					$query_age->bindParam(':videoID', $id);
					$query_age->execute();
					if ($query_age->rowCount()) $ageInVideo = $query_age->fetch()['starAge'];
				}
				if ($ageInVideo) print "<span class='ribbon'>$ageInVideo</span>";

				print "<div class='star-info' data-star-id='$data[starID]'>";
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
			print '<div class="row"><div id="categories" class="col-6">'; // actually col-1.5
			foreach ($query->fetchAll() as $data) {
				print "<a class='category btn btn-outline-primary' href='category.php?id=$data[categoryID]' data-category-id='$data[categoryID]'>$data[name]</a>";
			}
			print '</div></div>'; // #categories
		}
	}

	function getOffset($start)
	{
		$offset_decimal = $start / $this->videoDuration;
		$offset_custom = 0.5;

		$offset = ($offset_decimal * 100);
		$offset += $offset_custom;

		return $offset;
	}

	function fetchBookmarks($id)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT bookmarks.id, bookmarks.start, categories.name, categories.id AS categoryID  FROM bookmarks JOIN categories ON bookmarks.categoryID = categories.id WHERE videoID = ? ORDER BY start ASC");
		$query->bindValue(1, $id);
		$query->execute();
		if ($query->rowCount()) {
			print '<div id="timeline" class="col-10">';
			foreach ($query->fetchAll() as $data) {
				$offset = $this->getOffset($data['start']);
				print "<a class='bookmark btn btn-outline-primary' data-category-id='$data[categoryID]' data-bookmark-id='$data[id]' data-bookmark-time='$data[start]' data-level='1' href='javascript:;' style='margin-left: $offset%'>$data[name]</a>";
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
		$query = $pdo->prepare("SELECT name FROM stars ORDER BY name");
		$query->execute();
		if ($query->rowCount()) {
			print '<form method="post" autocomplete="off">';

			print '<label for="star">Star </label>';
			print "<input type='text' name='star'>";

			print '<div id="stars" class="hidden">';
			foreach ($query->fetchAll() AS $star) {
				print "<span class='star-autocomplete'>$star[name]</span>";
			}
			print '</div>';

			print '<input type="submit" class="invisible-submit">';

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
				$query = $pdo->prepare("SELECT id FROM staralias WHERE name = ? LIMIT 1");
				$query->bindValue(1, $star);
				$query->execute();
				if (!$query->rowCount()) { // add star
					$query = $pdo->prepare("INSERT INTO stars(name) VALUES(?)");
					$query->bindValue(1, $star);
					$query->execute();
				}
			}

			$query = $pdo->prepare("SELECT starID FROM staralias WHERE name = ? LIMIT 1");
			$query->bindValue(1, $star);
			$query->execute();
			if ($query->rowCount()) {
				$starID = $query->fetch()['starID'];
			} else {
				$query = $pdo->prepare("SELECT id FROM stars WHERE stars.name = ? LIMIT 1");
				$query->bindValue(1, $star);
				$query->execute();
				$starID = $query->fetch()['id'];
			}

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

		if ($_SERVER['REQUEST_METHOD'] == 'POST') {
			if (($this->noStar && isset($_POST['no-star'])) || (!$this->noStar && !isset($_POST['no-star']))) {
				if (isset($_POST['star']) && !empty($_POST['star'])) { // Add Star
					$star = $_POST['star'];
					$executeSql($star, $id);
				}
			}
		}
	}

	static function starCount($id)
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

	function hiddenData()
	{
		global $pdo;
		$query = $pdo->prepare("SELECT id, name FROM attributes");
		$query->execute();
		if ($query->rowCount()) {
			print '<div id="attributes" class="hidden">';
			foreach ($query->fetchAll() as $data) {
				print "<span class='attribute' data-attribute-id='$data[id]'>$data[name]</span>";
			}
			print '</div>';
		}

		$query = $pdo->prepare("SELECT id, name FROM locations");
		$query->execute();
		if ($query->rowCount()) {
			print '<div id="locations" class="hidden">';
			foreach ($query->fetchAll() as $data) {
				print "<span class='location' data-location-id='$data[id]'>$data[name]</span>";
			}
			print '</div>';
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

	function stringToDate($str)
	{
		if (is_numeric(explode(' ', $str)[1])) {
			$return = DateTime::createFromFormat('j n y', $str);
		} else if (!is_numeric(explode(' ', $str)[0]) && count(explode(', ', $str)) > 1) {
			$return = DateTime::createFromFormat('F j, Y+', $str); // allow trailing data ==> let SQL remove it!
		} else if (count(explode('-', $str)) > 1) {
			$return = DateTime::createFromFormat('Y-m-d', $str);
		} else {
			$return = DateTime::createFromFormat('j M y', $str);
		}

		return $return->format('Y-m-d');
	}

	function calculateAge($date)
	{
		return DateTime::createFromFormat('Y-m-d', $date)->diff(new DateTime('now'))->y;
	}

	function daysToYears($days)
	{
		if (!is_numeric($days) || is_null($days)) return false;
		$years = floor($days / 365);
		return $years;
	}
}

class FFMPEG
{
	/* SYNOLOGY */
	public $ffprobe = '/volume1/@appstore/ffmpeg/bin/ffprobe';
	public $ffmpeg = '/volume1/@appstore/ffmpeg/bin/ffmpeg';

	/* TRANSCODER */
	/*public $ffprobe = 'C:/ffmpeg/ffprobe';
	public $ffmpeg = 'C:/ffmpeg/ffmpeg';*/

	function getDuration($fname)
	{
		$duration = shell_exec("$this->ffprobe -i \"videos/$fname\" 2>&1 | grep Duration | awk '{print $2}' | tr -d ,");

		if (!is_null($duration)) {
			$hours = intval(explode(':', $duration)[0]);
			$minutes = intval(explode(':', $duration)[1]);
			$seconds = intval(explode('.', explode(':', $duration)[2])[0]);

			return (($hours * 60 * 60) + ($minutes * 60) + $seconds);
		} else {
			return false;
		}
	}

	function generateThumbnail($fname, $videoID, $startTime = 0, $width = 0)
	{
		$input = "videos/$fname";
		$output = "images/videos/$videoID.jpg";

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

		$height = shell_exec("$this->ffprobe -v quiet -show_streams \"$input\" | grep coded_height | cut -d '=' -f 2");

		if (!is_null($height)) {
			return $height;
		} else {
			return false;
		}
	}

	function getVideoWidth($fname)
	{
		$input = "videos/$fname";

		$width = shell_exec("$this->ffprobe -v quiet -show_streams \"$input\" | grep coded_width | cut -d '=' -f 2");

		if (!is_null($width)) {
			return $width;
		} else {
			return false;
		}
	}
}

class VTT extends FFMPEG
{
	public $im_identify = '/volume1/@appstore/imagemagick/bin/identify';
	public $im_montage = '/volume1/@appstore/imagemagick/bin/montage';

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

class Settings
{
	static function getSettings()
	{
		global $pdo;
		$query = $pdo->prepare("SELECT * FROM settings LIMIT 1");
		$query->execute();
		return $query->fetch();
	}

	static function getSetting($name)
	{
		global $pdo;
		$query = $pdo->prepare("SELECT $name FROM settings LIMIT 1");
		$query->execute();
		return $query->fetch()[$name];
	}
}