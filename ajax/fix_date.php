<?php
    include('../_class.php');
    $db = new DB();
    $date_class = new Date();

    if (isset($_POST['videoID'])) {
        if (!empty($_POST['videoID'])) {
            $videoID = $_POST['videoID'];

            global $pdo;
            $query = $pdo->prepare("SELECT path from videos WHERE id = :videoID LIMIT 1");
            $query->bindParam(':videoID', $videoID);
            $query->execute();
            if ($query->rowCount()) {
                $db->checkVideoDate("videos/{$query->fetch()['path']}");
                $query = $pdo->prepare("SELECT date FROM videos WHERE id = :videoID LIMIT 1");
                $query->bindParam(':videoID', $videoID);
                $query->execute();
                if ($query->rowCount()) echo $date_class->parse($query->fetch()['date']);
            }
        }
    }