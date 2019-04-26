document.addEventListener('DOMContentLoaded', function () {
    window.videoWrapper = document.getElementById('video');
    window.videoPlayer = document.getElementsByTagName('video')[0];
    window.videoSource = document.querySelector('source[type="application/x-mpegURL"]');
    window.videoID = window.location.href.split('id=')[1];
    window.videoHeight = 500;
    window.seekTime = 1;

    window.bookmark = document.getElementsByClassName('bookmark');
    window.duration = document.getElementById('duration').textContent;
    window.videoTitle = document.getElementById('video-name');

    document.addEventListener('keydown', function (e) {
        if (e.keyCode === 9) {
            e.preventDefault();
            $('#next')[0].click();
        }
    });

    if (typeof localStorage.bookmark !== 'undefined') {
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

    /* HLS */
    if (videoSource && Hls.isSupported()) {
        const hls = new Hls({
            maxBufferLength: 180 /* 3x duration of hls_time */
        });
        hls.loadSource(videoSource.getAttribute('src'));
        hls.attachMedia(videoPlayer);
    }

    /* PLYR */
    new Plyr(videoPlayer, {
        'controls': ['play-large', 'play', 'current-time', 'progress', 'duration', 'fullscreen'],
        'ratio': '21:9',
        'invertTime': false,
        'toggleInvert': false,
        'seekTime': window.seekTime,
        'volume': 1, // reset volume
        'muted': false,
        'previewThumbnails': {enabled: false, src: `vtt/${videoID}.vtt`},
        'hideControls': false // never hide controls
    });

    videoWrapper.addEventListener('wheel', function (e) {
        let speed = 10;
        if (e.deltaY < 0) skip(speed);
        else rewind(speed);
    });

    /*videoPlayer.addEventListener('loadedmetadata', function () {
        let track = this.addTextTrack('chapters', 'Bookmarks', 'en');
        track.mode = 'showing';

        track.addCue(new VTTCue(0, 12, "First"));
        track.addCue(new VTTCue(18.7, 21.5, "Second"));
        track.addCue(new VTTCue(22.8, 26.8, "Third"));

        let progressBar = document.createElement('span');
        progressBar.classList.add('progress-bookmarks');
        progressBar.textContent = 'progress';
        $('progress').first().before(progressBar);

        const c = videoPlayer.textTracks[0].cues;
        for (let i = 0; i < c.length; i++) {
            let s = document.createElement("span");
            //s.innerHTML = c[i].text;
            s.setAttribute('data-start', c[i].startTime);
            console.log(s);
            progressBar.appendChild(s);
        }
    });*/

    videoPlayer.addEventListener('timeupdate', function () {
        localStorage.bookmark = Math.round(videoPlayer.currentTime);
        if (localStorage.video !== videoID) localStorage.video = videoID;
    });

    videoPlayer.addEventListener('playing', function () {
        localStorage.playing = 1;
    });

    videoPlayer.addEventListener('pause', function () {
        localStorage.playing = 0;
    });

    videoWrapper.addEventListener('enterfullscreen', function () {
        videoPlayer.style.maxHeight = 'none'
    });

    videoWrapper.addEventListener('exitfullscreen', function () {
        videoPlayer.style.maxHeight = `${videoHeight}px`;
    });

    $(bookmark).on('click', function () {
        playFrom($(this).attr('data-bookmark-time'));
    });

    autoComplete();
    videoVolume(0.125);

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

function addLocation(locationID) {
    ajax('ajax/add_videolocation.php', `videoID=${videoID}&locationID=${locationID}`);
}

function removeLocation(locationID) {
    ajax('ajax/remove_videolocation.php', `videoID=${videoID}&locationID=${locationID}`);
}

function addAttribute(attributeID) {
    ajax('ajax/add_videoattribute.php', `videoID=${videoID}&attributeID=${attributeID}`);
}

function removeAttribute(attributeID) {
    ajax('ajax/remove_videoattribute.php', `videoID=${videoID}&attributeID=${attributeID}`);
}

function renameVideo(videoName) {
    ajax('ajax/rename_video.php', `videoID=${videoID}&videoName=${encodeURIComponent(videoName)}`);
}

function renameFile(videoPath) {
    ajax('ajax/rename_file.php', `videoID=${videoID}&videoPath=${encodeURIComponent(videoPath)}`);
}

function addBookmark(categoryID, categoryName) {
    let seconds = Math.round(videoPlayer.currentTime);
    localStorage.bookmark = seconds;

    ajax('ajax/add_bookmark.php', `seconds=${seconds}&categoryID=${categoryID}&videoID=${videoID}`, function (data) {
        if (!$('#timeline').length) {
            let div = document.createElement('div');
            div.id = 'timeline';

            insertBefore(document.getElementById('videoDetails'), div);
        }
        let wrapper = document.getElementById('timeline');

        if (!$(`.bookmark[data-bookmark-time="${seconds}"][data-category-id="${categoryID}"]`).length) {
            let a = document.createElement('a');
            a.classList.add('bookmark', 'btn');
            a.setAttribute('data-category-id', categoryID);
            a.setAttribute('data-bookmark-id', data.responseText);
            a.setAttribute('data-bookmark-time', seconds.toString());
            a.setAttribute('data-level', '1');
            a.href = 'javascript:;';
            a.style.marginLeft = `${getOffset(seconds)}%`;
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
    ajax('ajax/bookmark_editCategory.php', `bookmarkID=${bookmarkID}&categoryID=${categoryID}`);
}

function bookmark_editTime(bookmarkID) {
    let seconds = Math.round(videoPlayer.currentTime);
    localStorage.bookmark = seconds;

    ajax('ajax/bookmark_editTime.php', `bookmarkID=${bookmarkID}&seconds=${seconds}`, function () {
        let btn = document.querySelector(`.bookmark[data-bookmark-id="${bookmarkID}"]`);
        btn.style.marginLeft = `${getOffset(seconds)}%`;
        btn.setAttribute('data-bookmark-time', seconds.toString());


        animation('checkbox.png');
        bookmarkCollision();
    });
}

function removeBookmark(id) {
    ajax('ajax/remove_bookmark.php', `id=${id}`);
}

function removeBookmarks() {
    ajax('ajax/remove_bookmarks.php', `videoID=${videoID}`);
}

function removeVideoCategory(videoID, categoryID) {
    ajax('ajax/remove_videocategory.php', `videoID=${videoID}&categoryID=${categoryID}`);
}

function removeVideoStar(videoID, starID) {
    ajax('ajax/remove_videostar.php', `videoID=${videoID}&starID=${starID}`);
}

function addCategory_and_bookmark(categoryID, categoryName) {
    $('#dialog').dialog('close');

    let seconds = Math.round(videoPlayer.currentTime);
    localStorage.bookmark = seconds;

    ajax('ajax/add_category_and_bookmark.php', `videoID=${videoID}&categoryID=${categoryID}&seconds=${seconds}`, function (data) {
        if (!$('#timeline').length) {
            let div = document.createElement('div');
            div.id = 'timeline';

            insertBefore(document.getElementById('videoDetails'), div);
        }
        let wrapper = document.getElementById('timeline');

        if (!$('#categories').length) {
            let div = document.createElement('div');
            div.id = 'categories';

            insertBefore(document.querySelector('#videoDetails > div[style]'), div);
        }
        let categoriesWrapper = document.getElementById('categories');

        if (!$(`.category[data-category-id="${categoryID}"]`).length) {
            let cat = document.createElement('a');
            cat.classList.add('category', 'btn');
            cat.setAttribute('data-category-id', categoryID);
            cat.href = `category.php?id=${categoryID}`;
            cat.textContent = categoryName;

            categoriesWrapper.appendChild(cat);
        }


        if (!$(`.bookmark[data-bookmark-time="${seconds}"][data-category-id="${categoryID}"]`).length) {
            let a = document.createElement('a');
            a.classList.add('bookmark', 'btn');
            a.setAttribute('data-category-id', categoryID);
            a.setAttribute('data-bookmark-id', data.responseText);
            a.setAttribute('data-bookmark-time', seconds.toString());
            a.setAttribute('data-level', '1');
            a.href = 'javascript:;';
            a.style.marginLeft = `${getOffset(seconds)}%`;
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
    ajax('ajax/video_generatethumbnail.php', `videoID=${videoID}`);
}

function removeVideo() {
    ajax('ajax/remove_video.php', `videoID=${videoID}`);
}

function setAge(age) {
    ajax('ajax/video_age.php', `videoID=${videoID}&age=${age}`);
}

function ajax(page, params, callback = function () {
    location.href = location.href
}) {
    let url = `${page}?${params}`;

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
            'rename_title': {
                name: 'Rename',
                icon: 'edit',
                callback: function () {
                    const dialogWrapper = document.createElement('div');
                    dialogWrapper.id = 'dialog';
                    dialogWrapper.title = 'Edit Video';

                    document.body.appendChild(dialogWrapper);
                    $(function () {
                        const dialogQuery = $('#dialog');
                        dialogQuery.dialog({
                            close: function () {
                                $(this).dialog('close');
                                this.closest('.ui-dialog').remove();
                            },
                            width: 250
                        });

                        const dialogInput = document.createElement('input');
                        dialogInput.type = 'text';
                        dialogInput.name = 'videoName_edit';
                        dialogInput.value = videoTitle.textContent;
                        dialogInput.autofocus = true;

                        dialogQuery.append(dialogInput);
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
            }, 'add_attribute': {
                name: 'Add Attribute',
                icon: 'fas fa-tag',
                callback: function () {
                    const dialogWrapper = document.createElement('div');
                    dialogWrapper.id = 'dialog';
                    dialogWrapper.title = 'Add Attrubute';

                    document.body.appendChild(dialogWrapper);
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

                        const searchWrapper = document.createElement('span');
                        searchWrapper.classList.add('search');
                        const searchInner = document.createElement('span');
                        searchInner.classList.add('inner');

                        searchWrapper.appendChild(searchInner);
                        dialogQuery.append(searchWrapper);
                        const query = $('#attributes.hidden > .attribute');
                        for (let i = 0; i < query.length; i++) {
                            let attributeID = query.eq(i).attr('data-attribute-id');
                            let attributeName = query.eq(i).text();

                            let btn = document.createElement('div');
                            btn.classList.add('btn', 'unselectable');
                            btn.onclick = function () {
                                addAttribute(attributeID);
                            };
                            btn.textContent = attributeName;

                            dialogQuery.append(btn);
                        }
                        categorySearch();
                    });
                }
            }, 'add_location': {
                name: 'Add Location',
                icon: 'fas fa-map-marker-alt',
                callback: function () {
                    const dialogWrapper = document.createElement('div');
                    dialogWrapper.id = 'dialog';
                    dialogWrapper.title = 'Add Location';

                    document.body.appendChild(dialogWrapper);
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

                        const searchWrapper = document.createElement('span');
                        searchWrapper.classList.add('search');
                        const searchInner = document.createElement('span');
                        searchInner.classList.add('inner');

                        searchWrapper.appendChild(searchInner);
                        dialogQuery.append(searchWrapper);
                        const query = $('#locations.hidden > .location');
                        for (let i = 0; i < query.length; i++) {
                            let locationID = query.eq(i).attr('data-location-id');
                            let locationName = query.eq(i).text();

                            let btn = document.createElement('div');
                            btn.classList.add('btn', 'unselectable');
                            btn.onclick = function () {
                                addLocation(locationID);
                            };
                            btn.textContent = locationName;

                            dialogQuery.append(btn);
                        }
                        categorySearch();
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
            'edit': {
                name: 'Change Category',
                icon: 'edit',
                callback: function (itemKey, options) {
                    let bookmarkID = options.$trigger.attr('data-bookmark-id');
                    let bookmarkName = options.$trigger.text().trim();

                    const dialogWrapper = document.createElement('div');
                    dialogWrapper.id = 'dialog';
                    dialogWrapper.title = 'Change Category';

                    document.body.appendChild(dialogWrapper);
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

                        const searchWrapper = document.createElement('span');
                        searchWrapper.classList.add('search');
                        const searchInner = document.createElement('span');
                        searchInner.classList.add('inner');

                        searchWrapper.appendChild(searchInner);
                        dialogQuery.append(searchWrapper);
                        const query = $('#category_list > option');
                        for (let i = 0; i < query.length; i++) {
                            let category = query.eq(i);
                            let categoryID = category.attr('data-category-id');
                            let categoryName = category.attr('value');

                            if (categoryName !== bookmarkName) {
                                let btn = document.createElement('div');
                                btn.classList.add('btn', 'unselectable');
                                btn.onclick = function () {
                                    bookmark_editCategory(bookmarkID, categoryID);
                                };
                                btn.textContent = categoryName;

                                dialogQuery.append(btn);
                            }
                        }

                        categorySearch();
                    });
                }
            }, 'edit_time': {
                name: 'Change Time',
                icon: 'far fa-clock',
                callback: function (itemKey, options) {
                    bookmark_editTime(options.$trigger.attr('data-bookmark-id'));
                }
            },
            'divider': '---',
            'delete': {
                name: 'Delete',
                icon: 'delete',
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
            'add_bookmark': {
                name: 'Add Bookmark',
                icon: 'add',
                callback: function (itemKey, options) {
                    let id = options.$trigger.attr('data-category-id');
                    let categoryName = options.$trigger.text();
                    addBookmark(id, categoryName);
                }
            },
            'divider': '---',
            'remove': {
                name: 'Remove',
                icon: 'delete',
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
            'add_bookmark': {
                name: 'Add Bookmark',
                icon: 'add',
                callback: function () {
                    const dialogWrapper = document.createElement('div');
                    dialogWrapper.id = 'dialog';
                    dialogWrapper.title = 'Add Bookmark';

                    document.body.appendChild(dialogWrapper);
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

                        const searchWrapper = document.createElement('span');
                        searchWrapper.classList.add('search');
                        const searchInner = document.createElement('span');
                        searchInner.classList.add('inner');

                        searchWrapper.appendChild(searchInner);
                        dialogQuery.append(searchWrapper);
                        const query = $('#category_list > option');
                        for (let i = 0; i < query.length; i++) {
                            let categoryID = query.eq(i).attr('data-category-id');
                            let categoryName = query.eq(i).attr('value');

                            let btn = document.createElement('div');
                            btn.classList.add('btn', 'unselectable');
                            btn.onclick = function () {
                                addCategory_and_bookmark(categoryID, categoryName)
                            };
                            btn.textContent = categoryName;

                            dialogQuery.append(btn);
                        }

                        categorySearch();
                    });
                }
            },
            'divider': '---',
            'remove': {
                name: 'Remove',
                icon: 'delete',
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
            'set_age': {
                name: 'Set Age',
                icon: 'add',
                callback: function () {
                    const dialogWrapper = document.createElement('div');
                    dialogWrapper.id = 'dialog';
                    dialogWrapper.title = 'Set Age';

                    document.body.appendChild(dialogWrapper);
                    $(function () {
                        const dialogQuery = $('#dialog');
                        dialogQuery.dialog({
                            close: function () {
                                $(this).dialog('close');
                                this.closest('.ui-dialog').remove();
                            },
                            width: 350
                        });

                        const dialogInput = document.createElement('input');
                        dialogInput.type = 'number';
                        dialogInput.name = 'videoAge_set';
                        dialogInput.autofocus = true;

                        dialogQuery.append(dialogInput);
                        document.querySelector('input[name="videoAge_set"]').addEventListener('keydown', function (e) {
                            if (e.keyCode === 13) {
                                setAge(this.value);
                            }
                        });
                    });
                }
            },
            'rename_video': {
                name: 'Rename File',
                icon: 'edit',
                callback: function () {
                    let source = $(videoPlayer).find('source').not('[type="video/webm"], [type="application/x-mpegURL"]').first().attr('src');
                    let videoPath_current = `${source.split('/')[1]}/${source.split('/')[2]}`;

                    const dialogWrapper = document.createElement('div');
                    dialogWrapper.id = 'dialog';
                    dialogWrapper.title = 'Edit File';

                    document.body.appendChild(dialogWrapper);
                    $(function () {
                        const dialogQuery = $('#dialog');
                        dialogQuery.dialog({
                            close: function () {
                                $(this).dialog('close');
                                this.closest('.ui-dialog').remove();
                            },
                            width: 350
                        });

                        const dialogInput = document.createElement('input');
                        dialogInput.type = 'text';
                        dialogInput.name = 'videoFile_edit';
                        dialogInput.value = videoPath_current;
                        dialogInput.autofocus = true;

                        dialogQuery.append(dialogInput);
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
            'fix_thumbnail': {
                name: 'Fix Thumbnail',
                icon: 'edit',
                callback: function () {
                    generateThumbnail();
                }
            },
            'divider': '---',
            'remove_bookmarks': {
                name: 'Remove Bookmarks',
                icon: 'delete',
                callback: function () {
                    removeBookmarks();
                },
                disabled: hasNoBookmarks()
            },
            'remove_video': {
                name: 'Remove Video',
                icon: 'delete',
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
            'remove_attribute': {
                name: 'Remove Attribute',
                icon: 'delete',
                callback: function (itemKey, options) {
                    let attributeID = options.$trigger.attr('data-attribute-id');

                    removeAttribute(attributeID);
                }
            }
        }
    });
});
/* Location */
$(function () {
    $.contextMenu({
        selector: '#video > h2 small > span.location',
        items: {
            'remove_location': {
                name: 'Remove Location',
                icon: 'delete',
                callback: function (itemKey, options) {
                    let locationID = options.$trigger.attr('data-location-id');

                    removeLocation(locationID);
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
    const distance_min = {
        x: 5,
        y: 35
    };

    let first = {
        dom: firstElement.getBoundingClientRect(),
        x: $(firstElement).offset().left,
        y: $(firstElement).offset().top
    };

    let second = {
        dom: secondElement.getBoundingClientRect(),
        x: $(secondElement).offset().left,
        y: $(secondElement).offset().top
    };

    let distance = {
        x: Math.abs((first.x + first.dom.width) - second.x),
        y: Math.abs(first.y - second.y)
    };

    return !(
        first.dom.right < second.dom.left ||
        first.dom.left > second.dom.right ||
        first.dom.bottom < second.dom.top ||
        first.dom.top > second.dom.bottom
    ) || (distance.x < distance_min.x && distance.y < distance_min.y);
}

function bookmarkCollision() {
    $(bookmark).attr('data-level', 1);
    for (let i = 0; i < bookmark.length; i++) {
        let level = $(bookmark).eq(i).attr('data-level');

        if (i) {
            let first = bookmark[i - 1];
            let second = bookmark[i];

            (function addSpace() {
                setTimeout(function () {
                    if (collisionCheck(first, second)) {
                        if (level < 10) level = ++level;
                        else level = 1;

                        $(bookmark).eq(i).attr('data-level', level);
                        addSpace();
                    }
                }, 250);
            })();
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
    img.src = `css/images/${src}`;
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