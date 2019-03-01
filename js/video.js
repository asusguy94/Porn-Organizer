document.addEventListener('DOMContentLoaded', function () {
    window.videoWrapper = document.getElementById('video');
    window.videoPlayer = document.getElementsByTagName('video')[0];
    window.videoID = window.location.href.split('id=')[1];
    window.videoHeight = 500;
    window.seekTime = 1;

    window.bookmark = document.getElementsByClassName('bookmark');
    window.duration = document.getElementById('duration').textContent;
    window.videoTitle = document.getElementById('video-name');

    document.addEventListener('keydown', function (e) {
        switch (e.keyCode) {
            case 9:
                e.preventDefault();
                $('#next')[0].click();
                break;
        }
    });

    if (typeof localStorage.bookmark !== "undefined") {
        window.seconds = parseInt(localStorage.bookmark);
        if (localStorage.video === videoID) {
            videoPlayer.currentTime = seconds;

            if (typeof localStorage.playing !== 'undefined') {
                if (!!parseInt(localStorage.playing)) {
                    setTimeout(function () {
                        videoPlayer.play();
                    }, 100);
                }
            }
        } else {
            localStorage.video = videoID;
            localStorage.bookmark = 0;
        }
    }

    /* PLYR */
    new Plyr(videoPlayer, {
        "controls": ['play-large', 'play', 'progress', 'current-time', 'fullscreen'],
        "invertTime": false,
        "toggleInvert": false,
        "seekTime": window.seekTime,
        "volume": 1, // reset volume
        "muted": false,
        "hideControls": false // never hide controls
    });
    /* PLYR */

    videoWrapper.addEventListener('wheel', function (e) {
        let speed = 10;
        if (e.deltaY < 0) skip(speed);
        else rewind(speed);
    });

    videoWrapper.addEventListener('timeupdate', function () {
        localStorage.bookmark = Math.round(videoPlayer.currentTime);
        if (localStorage.video !== videoID) localStorage.video = videoID;
    });

    videoWrapper.addEventListener('playing', function () {
        localStorage.playing = 1;
    });

    videoWrapper.addEventListener('pause', function () {
        localStorage.playing = 0;
    });

    videoWrapper.addEventListener('enterfullscreen', function () {
        videoPlayer.style.maxHeight = 'none'
    });

    videoWrapper.addEventListener('exitfullscreen', function () {
        videoPlayer.style.maxHeight = videoHeight + 'px'
    });

    $(bookmark).on('click', function () {
        playFrom($(this).attr('data-bookmark-time'));
    });

    autoComplete();

    videoVolume(0.25);

    onFocus(bookmarkCollision);

    windowResize(function () {
        bookmarkCollision();
    });
});


document.onkeydown = checkKey;

function checkKey(e) {
    e = e || window.event;

    if (!$('input').is(':focus')) {
        switch (e.keyCode) {
            case 37:
                rewind();
                break;
            case 39:
                skip();
                break;
            case 32:
                playPause();
                break;
        }
    }
}

function rewind(seconds = seekTime) {
    let prevSeekTime = seekTime;
    if (seconds !== seekTime) {
        prevSeekTime = seekTime;
        window.seekTime = seconds;
    }
    videoPlayer.currentTime -= seconds;
    if (prevSeekTime !== seekTime)
        window.seekTime = prevSeekTime;
}

function skip(seconds = seekTime) {
    let prevSeekTime = seekTime;
    if (seconds !== seekTime) {
        prevSeekTime = seekTime;
        window.seekTime = seconds;
    }
    videoPlayer.currentTime += seconds;
    if (prevSeekTime !== seekTime)
        window.seekTime = prevSeekTime;
}

function playPause() {
    if (!isPlaying()) videoPlayer.play();
    else videoPlayer.pause();
}

function isPlaying() {
    return !videoPlayer.paused;
}

function playFrom(seconds) {
    videoPlayer.currentTime = seconds;
    videoPlayer.play();
}

function addAttribute(attributeID) {
    let arguments = 'videoID=' + videoID + '&attributeID=' + attributeID;
    ajax('ajax/add_videoattribute.php', arguments);
}

function removeAttribute(attributeID) {
    let arguments = 'videoID=' + videoID + '&attributeID=' + attributeID;
    ajax('ajax/remove_videoattribute.php', arguments);
}

function renameVideo(videoName) {
    let arguments = 'videoID=' + videoID + '&videoName=' + videoName;
    ajax('ajax/rename_video.php', arguments);
}

function renameFile(videoPath) {
    let arguments = 'videoID=' + videoID + '&videoPath=' + videoPath;
    ajax('ajax/rename_file.php', arguments);
}

function addBookmark(categoryID, categoryName) {
    let seconds = Math.round(videoPlayer.currentTime);
    localStorage.bookmark = seconds;

    let arguments = 'seconds=' + seconds + '&categoryID=' + categoryID + '&videoID=' + videoID;
    ajax('ajax/add_bookmark.php', arguments, function (data) {
        if (!$('#timeline').length) {
            let div = document.createElement('div');
            div.setAttribute('id', 'timeline');

            insertBefore(document.getElementById('videoDetails'), div);
        }
        let wrapper = document.getElementById('timeline');


        if (!$('.bookmark[data-bookmark-time="' + seconds + '"][data-category-id="' + categoryID + '"]').length) {
            let a = document.createElement('a');
            a.classList.add('bookmark', 'btn');
            a.setAttribute('data-category-id', categoryID);
            a.setAttribute('data-bookmark-id', data.responseText);
            a.setAttribute('data-bookmark-time', seconds.toString());
            a.setAttribute('data-level', '1');
            a.setAttribute('href', 'javascript:;');
            a.setAttribute('style', 'margin-left: ' + getOffset(seconds) + '%');
            a.textContent = categoryName;

            wrapper.appendChild(a);
        }

        animation('checkbox.png');

        $(bookmark).on('click', function () {
            playFrom($(this).attr('data-bookmark-time'));
        });

        bookmarkCollision();
    });
}

function bookmark_editCategory(bookmarkID, categoryID) {
    let arguments = 'bookmarkID=' + bookmarkID + '&categoryID=' + categoryID;
    ajax('ajax/bookmark_editCategory.php', arguments);
}

function bookmark_editTime(bookmarkID) {
    let seconds = Math.round(videoPlayer.currentTime);
    localStorage.bookmark = seconds;

    let arguments = 'bookmarkID=' + bookmarkID + '&seconds=' + seconds;
    ajax('ajax/bookmark_editTime.php', arguments, function () {
        let btn = document.querySelector('.bookmark[data-bookmark-id="' + bookmarkID + '"]');
        btn.setAttribute('style', 'margin-left: ' + getOffset(seconds) + '%');
        btn.setAttribute('data-bookmark-time', seconds.toString());


        animation('checkbox.png');
        bookmarkCollision();
    });
}

function removeBookmark(id) {
    let arguments = 'id=' + id;
    ajax('ajax/remove_bookmark.php', arguments);
}

function removeBookmarks() {
    let arguments = 'videoID=' + videoID;
    ajax('ajax/remove_bookmarks.php', arguments);
}

function removeVideoCategory(videoID, categoryID) {
    let arguments = 'videoID=' + videoID + '&categoryID=' + categoryID;
    ajax('ajax/remove_videocategory.php', arguments);
}

function removeVideoStar(videoID, starID) {
    let arguments = 'videoID=' + videoID + '&starID=' + starID;
    ajax('ajax/remove_videostar.php', arguments);
}

function addCategory_and_bookmark(categoryID, categoryName) {
    $('#dialog').dialog('close');

    let seconds = Math.round(videoPlayer.currentTime);
    localStorage.bookmark = seconds;

    let arguments = 'videoID=' + videoID + '&categoryID=' + categoryID + '&seconds=' + seconds;
    ajax('ajax/add_category_and_bookmark.php', arguments, function (data) {
        if (!$('#timeline').length) {
            let div = document.createElement('div');
            div.setAttribute('id', 'timeline');

            insertBefore(document.getElementById('videoDetails'), div);
        }
        let wrapper = document.getElementById('timeline');

        if (!$('#categories').length) {
            let div = document.createElement('div');
            div.setAttribute('id', 'categories');

            insertBefore(document.querySelector('#videoDetails > div[style]'), div);
        }
        let categoriesWrapper = document.getElementById('categories');

        if (!$('.category[data-category-id="' + categoryID + '"]').length) {
            let cat = document.createElement('a');
            cat.classList.add('category', 'btn');
            cat.setAttribute('data-category-id', categoryID);
            cat.setAttribute('href', 'category.php?id=' + categoryID);
            cat.textContent = categoryName;

            categoriesWrapper.appendChild(cat);
        }


        if (!$('.bookmark[data-bookmark-time="' + seconds + '"][data-category-id="' + categoryID + '"]').length) {
            let a = document.createElement('a');
            a.classList.add('bookmark', 'btn');
            a.setAttribute('data-category-id', categoryID);
            a.setAttribute('data-bookmark-id', data.responseText);
            a.setAttribute('data-bookmark-time', seconds.toString());
            a.setAttribute('data-level', '1');
            a.setAttribute('href', 'javascript:;');
            a.setAttribute('style', 'margin-left: ' + getOffset(seconds) + '%');
            a.textContent = categoryName;

            wrapper.appendChild(a);
        }

        animation('checkbox.png');

        $(bookmark).on('click', function () {
            playFrom($(this).attr('data-bookmark-time'));
        });

        bookmarkCollision();
    });
}

function generateThumbnail() {
    let arguments = 'videoID=' + videoID;
    ajax('ajax/video_generatethumbnail.php', arguments);
}

function removeVideo() {
    let arguments = 'videoID=' + videoID;
    ajax('ajax/remove_video.php', arguments);
}

function setAge(age) {
    let arguments = 'videoID=' + videoID + '&age=' + age;
    ajax('ajax/video_age.php', arguments);
}

function ajax(page, params, callback = function () {
    location.href = location.href
}) {
    let url = page + '?' + params;

    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.send();
    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) callback(this);
    }
}

/* Context Menu */
/* Title */
$(function () {
    $.contextMenu({
        selector: '#video > h2 #video-name',
        items: {
            "rename": {
                name: "Rename",
                icon: "edit",
                callback: function () {
                    $('body').append('<div id="dialog" title="Edit Video"></div>');

                    $(function () {
                        const dialogQuery = $('#dialog');
                        dialogQuery.dialog({
                            close: function () {
                                $(this).dialog('close');
                                this.closest('.ui-dialog').remove();
                            },
                            width: 250
                        });

                        dialogQuery.append('<input type="text" name="videoName_edit" value="' + videoTitle.textContent + '" autofocus>');
                        let input = $('input[name="videoName_edit"]');
                        let len = input.val().length;
                        input[0].focus();
                        input[0].setSelectionRange(len, len);

                        document.querySelector('input[name="videoName_edit"]').addEventListener('keydown', function (e) {
                            if (e.keyCode === 13) {
                                renameVideo(this.value);
                            }
                        });
                    });
                }
            }, "add_attribute": {
                name: "Add Attribute",
                icon: "add",
                callback: function () {
                    $('body').append('<div id="dialog" title="Add Attribute"></div>');

                    $(function () {
                        const dialogQuery = $('#dialog');
                        dialogQuery.dialog({
                            close: function () {
                                $(this).dialog('close');
                                this.closest('.ui-dialog').remove();
                            },
                            width: 250,
                            position: {my: "top", at: "top+150"}
                        });

                        const query = $('#attributes.hidden > .attribute');
                        for (let i = 0; i < query.length; i++) {
                            let attributeID = query.eq(i).attr('data-attribute-id');
                            let attributeName = query.eq(i).text();

                            dialogQuery.append('<div class="btn unselectable" onclick="addAttribute(' + attributeID + ')">' + attributeName + '</div>');
                        }
                    });
                }
            }
        }
    });
});
/* Bookmarks */
$(function () {
    $.contextMenu({
        selector: '.bookmark',
        items: {
            "edit": {
                name: "Change Category",
                icon: "edit",
                callback: function (itemKey, options) {
                    let bookmarkID = options.$trigger.attr('data-bookmark-id');
                    let bookmarkName = options.$trigger.text().trim();

                    $('body').append('<div id="dialog" title="Change Category"></div>');
                    $(function () {
                        const dialogQuery = $('#dialog');
                        dialogQuery.dialog({
                            close: function () {
                                $(this).dialog('close');
                                this.closest('.ui-dialog').remove();
                            },
                            width: 250,
                            position: {my: "top", at: "top+150"}
                        });

                        dialogQuery.append('<span class="search"><span class="inner"></span></span>');
                        const query = $('#category_list > option');
                        for (let i = 0; i < query.length; i++) {
                            let category = query.eq(i);
                            let categoryID = category.attr('data-category-id');
                            let categoryName = category.attr('value');

                            if (categoryName !== bookmarkName)
                                dialogQuery.append('<div class="btn unselectable" onclick="bookmark_editCategory(' + bookmarkID + ',' + categoryID + ')">' + categoryName + '</div>');
                        }

                        categorySearch();
                    });
                }
            }, "edit_time": {
                name: "Change Time",
                icon: "far fa-clock",
                callback: function (itemKey, options) {
                    bookmark_editTime(options.$trigger.attr('data-bookmark-id'));
                }
            },
            "divider": "---",
            "delete": {
                name: "Delete",
                icon: "delete",
                callback: function (itemKey, options) {
                    let id = options.$trigger.attr('data-bookmark-id');
                    removeBookmark(id);
                }
            }
        }
    });
});
/* Categories */
$(function () {
    $.contextMenu({
        selector: '.category',
        items: {
            "add_bookmark": {
                name: "Add Bookmark",
                icon: "add",
                callback: function (itemKey, options) {
                    let id = options.$trigger.attr('data-category-id');
                    let categoryName = options.$trigger.text();
                    addBookmark(id, categoryName);
                }
            },
            "divider": "---",
            "remove": {
                name: "Remove",
                icon: "delete",
                callback: function (itemKey, options) {
                    let id = options.$trigger.attr('data-category-id');
                    removeVideoCategory(videoID, id);
                }
            }
        }
    });
});
/* Star */
$(function () {
    $.contextMenu({
        selector: '.star[data-star-id]',
        items: {
            "add_bookmark": {
                name: "Add Bookmark",
                icon: "add",
                callback: function (/*itemKey, options*/) {
                    //let starID = options.$trigger.attr('data-star-id');
                    $('body').append('<div id="dialog" title="Add Bookmark"></div>');

                    $(function () {
                        const dialogQuery = $('#dialog');
                        dialogQuery.dialog({
                            close: function () {
                                $(this).dialog('close');
                                this.closest('.ui-dialog').remove();
                            },
                            width: 250,
                            position: {my: "right top", at: "right-160 top+250"}
                        });

                        dialogQuery.append('<span class="search"><span class="inner"></span></span>');
                        const query = $('#category_list > option');
                        for (let i = 0; i < query.length; i++) {
                            let categoryID = query.eq(i).attr('data-category-id');
                            let categoryName = query.eq(i).attr('value');

                            dialogQuery.append('<div class="btn unselectable" onclick="addCategory_and_bookmark(' + categoryID + ',\'' + categoryName + '\')">' + categoryName + '</div>');
                        }

                        categorySearch();
                    });
                }
            },
            "divider": "---",
            "remove": {
                name: "Remove",
                icon: "delete",
                callback: function (itemKey, options) {
                    let id = options.$trigger.attr('data-star-id');
                    removeVideoStar(videoID, id);
                }
            }
        }
    });
});
/* Video */
$(function () {
    $.contextMenu({
        selector: '#video .plyr',
        zIndex: 3,
        items: {
            "set_age": {
                name: "Set Age",
                icon: 'add',
                callback: function () {
                    $('body').append('<div id="dialog" title="Set Age"></div>');

                    $(function () {
                        const dialogQuery = $('#dialog');
                        dialogQuery.dialog({
                            close: function () {
                                $(this).dialog('close');
                                this.closest('.ui-dialog').remove();
                            },
                            width: 350
                        });

                        dialogQuery.append('<input type="number" name="videoAge_set" autofocus>');

                        document.querySelector('input[name="videoAge_set"]').addEventListener('keydown', function (e) {
                            if (e.keyCode === 13) {
                                setAge(this.value);
                            }
                        });
                    });
                }
            },
            "rename_video": {
                name: "Rename File",
                icon: "edit",
                callback: function () {
                    let source = $(videoPlayer).find('source').not('[type="video/webm"]').first().attr('src');
                    let videoPath_current = source.split('/')[1] + '/' + source.split('/')[2];

                    $('body').append('<div id="dialog" title="Edit File"></div>');

                    $(function () {
                        const dialogQuery = $('#dialog');
                        dialogQuery.dialog({
                            close: function () {
                                $(this).dialog('close');
                                this.closest('.ui-dialog').remove();
                            },
                            width: 350
                        });

                        dialogQuery.append('<input type="text" name="videoFile_edit" value="' + videoPath_current + '" autofocus>');
                        let input = $('input[name="videoFile_edit"]');
                        let len = input.val().length;
                        input[0].focus();
                        input[0].setSelectionRange(len, len);

                        document.querySelector('input[name="videoFile_edit"]').addEventListener('keydown', function (e) {
                            if (e.keyCode === 13) {
                                renameFile(this.value);
                            }
                        });
                    });
                }
            },
            "fix_thumbnail": {
                name: "Fix Thumbnail",
                icon: "edit",
                callback: function () {
                    generateThumbnail();
                }
            },
            "divider": "---",
            "remove_bookmarks": {
                name: "Remove Bookmarks",
                icon: "delete",
                callback: function () {
                    removeBookmarks();
                }
            },
            "remove_video": {
                name: "Remove Video",
                icon: "delete",
                callback: function () {
                    removeVideo();
                },
                disabled: !(hasNoStar() && hasNoBookmarks())
            }
        }
    });
});
/* Attribute */
$(function () {
    $.contextMenu({
        selector: '#video > h2 small > span.attribute',
        items: {
            "remove_attribute": {
                name: "Remove Attribute",
                icon: "delete",
                callback: function (itemKey, options) {
                    let attributeID = options.$trigger.attr('data-attribute-id');

                    removeAttribute(attributeID);
                }
            }
        }
    });
});

function categorySearch() {
    let input = '';
    document.addEventListener('keydown', function (e) {
        const CHAR_BACKSPACE = 8;
        const CHAR_SPACE = 32;
        const CHAR_A = 65;
        const CHAR_Z = 90;

        if (((e.which === CHAR_BACKSPACE && input.length) || e.which === CHAR_SPACE) || (e.which >= CHAR_A && e.which <= CHAR_Z)) {
            e.preventDefault(); // spacebar scroll

            if (e.which === 8) {
                updateLabel(input = input.slice(0, -1));
            } else {
                updateLabel(input += String.fromCharCode(e.which).toLowerCase());
            }

            $('#dialog .btn').removeClass('no-match').not(function () {
                return this.textContent.toLowerCase().indexOf(input) > -1;
            }).addClass('no-match');
        }

        function updateLabel(input) {
            if (document.querySelector('.search > .inner')) {
                document.querySelector('.search > .inner').textContent = input;
            }
        }
    });
}

function hasNoStar() {
    return !$('.star').length;
}

function hasNoBookmarks() {
    return !$('.bookmark').length;
}

/* Bookmark Collision Check */
function collisionCheck(firstElement, secondElement) {
    let distanceX_min = 10;
    let distanceY_min = 35;

    let first = firstElement.getBoundingClientRect();
    let second = secondElement.getBoundingClientRect();

    let firstPosX = $(firstElement).offset().left;
    let secondPosX = $(secondElement).offset().left;

    let firstPosY = $(firstElement).offset().top;
    let secondPosY = $(secondElement).offset().top;

    let distanceX = Math.abs((firstPosX + first.width) - secondPosX);
    let distanceY = Math.abs(firstPosY - secondPosY);

    return !(
        first.right < second.left ||
        first.left > second.right ||
        first.bottom < second.top ||
        first.top > second.bottom
    ) || (distanceX < distanceX_min && distanceY < distanceY_min);
}

function bookmarkCollision() {
    $(bookmark).attr('data-level', 1);
    for (let i = 0; i < bookmark.length; i++) {
        let level = $(bookmark).eq(i).attr('data-level');

        if (i) {
            let first = bookmark[i - 1];
            let second = bookmark[i];

            addSpace();

            function addSpace() {
                setTimeout(function () {
                    if (collisionCheck(first, second)) {
                        $(bookmark).eq(i).attr('data-level', level++);
                        addSpace();
                    }
                }, 250);
            }
        }
    }
}

function onFocus(callback) {
    if (!document.hasFocus()) {
        setTimeout(function () {
            onFocus(callback);
        });
        return;
    }
    callback();
    onBlur(callback); // make blur-and-focus connected
}

function onBlur(callback) {
    if (document.hasFocus()) {
        setTimeout(function () {
            onBlur(callback);
        });
        return;
    }
    onFocus(callback); // make blur-and-focus connected
}

function autoComplete() {
    let stars = [];

    const starQuery = $('.star-autocomplete');

    for (let i = 0; i < starQuery.length; i++) stars.push(starQuery.eq(i).text());

    $('input[name="star"]').autocomplete({source: [stars]});
}

function videoVolume(level = 1) {
    if (level > 1) {
        let audioCtx = new AudioContext();
        let source = audioCtx.createMediaElementSource(videoPlayer);

        let gainNode = audioCtx.createGain();
        gainNode.gain.value = level;

        source.connect(gainNode);
        gainNode.connect(audioCtx.destination);
    } else if (level >= 0) {
        videoPlayer.volume = level;
    }
}

function getOffset(start) {
    let offset_decimal = start / duration;
    let offset_custom = 0.5;

    let offset = offset_decimal * 100;
    offset += offset_custom;

    return offset;
}

function animation(src, duration_start = 300, duration_end = duration_start) {
    let img = document.createElement('img');
    img.src = 'css/images/' + src;
    img.classList.add('symbol');

    insertBefore(document.getElementsByClassName('plyr')[0], img);
    $(img).fadeIn(duration_start, function () {
        $(this).fadeOut(duration_end, function () {
            img.remove();
        });
    });
}

function insertBefore(parentNode, newNode) {
    parentNode.insertBefore(newNode, parentNode.firstChild);
}

function windowResize(callback) {
    let resizeEvt;
    window.addEventListener('resize', function () {
        clearInterval(resizeEvt);
        resizeEvt = setTimeout(function () {
            callback();
        }, 100);
    });
}