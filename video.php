<?php
    include('_class.php');
    $basic = new Basic();
    $videos = new Video();

    if (isset($_GET['id']) && !empty($_GET['id'])) {
        $id = $_GET['id'];
    } else {
        header('Location: video_list.php');
    }

    // TODO Enable bootstrap
?>

<!doctype html>
<html>
    <head>
        <?php $basic->head($videos->getVideo($id), array('jqueryui', 'contextmenu', 'autocomplete', 'plyr', 'video'), array('bootstrap', 'jqueryui', 'contextmenu', 'autocomplete', 'hls', 'plyr', 'video')) ?>
    </head>

    <body>
        <nav>
            <?php $basic->navigation() ?>
        </nav>

        <main class="container-fluid">
            <div class="row">
                <section class="col-10">
                    <?php
                        $videos->fetchVideo($id);
                        $videos->fetchInfo($id);
                    ?>
                </section>

                <aside class="col-2">
                    <?php
                        if (isset($_GET['id']) && !empty($_GET['id'])) {
                            $id = $_GET['id'];
                            $videos->fetchInfo_sidebar($id);
                        } else {
                            header('Location: video_list.php');
                        }
                    ?>
                </aside>
            </div>
        </main>
    </body>
</html>