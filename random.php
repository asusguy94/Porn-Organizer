<?php
include('_class.php');
$video = new Video();

$query = $pdo->prepare("{$video->sql()} ORDER BY RAND() LIMIT 1");
$query->execute();
$id = $query->fetch()['id'];

header("Location: video.php?id=$id");