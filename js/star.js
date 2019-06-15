document.addEventListener('DOMContentLoaded', function () {
    window.starID = window.location.href.split('id=')[1];
    window.video = document.getElementsByTagName('video');

    window.startTime = 100;

    dropbox();
    autoComplete();

    let form = document.getElementsByTagName('form');
    for (let i = 0; i < form.length; i++) {
        form[i].addEventListener('keydown', function (e) {
            switch (e.keyCode) {
                case 13:
                    form[i].submit();
                    break;
                case 9:
                    e.preventDefault();

                    if (i < form.length - 1) $('form').eq(i + 1).find('input')[0].focus();
                    else $('#next')[0].click();
                    break;
            }
        });
    }

    setFocus();

    videoHover();
});

function addStarImage(id, url) {
    let arguments = 'id=' + id + '&image=' + url;
    ajax('ajax/add_star_image.php', arguments);
}

function removeStarImage(id) {
    let arguments = 'id=' + id;
    ajax('ajax/remove_star_image.php', arguments);
}

function removeStarAttribute(starID, attributeID) {
    let arguments = 'starID=' + starID + '&attributeID=' + attributeID;
    ajax('ajax/remove_star_attribute.php', arguments);
}

function deleteStar(starID) {
    let arguments = 'starID=' + starID;
    ajax('ajax/remove_star.php', arguments);
}

function renameStar(starID, starName) {
    let arguments = 'starID=' + starID + '&starName=' + starName;
    ajax('ajax/rename_star.php', arguments);
}

function ajax(page, params) {
    let url = page + '?' + params;

    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.send();
    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) reloadPage();
    }
}

function reloadPage() {
    window.location.href = window.location.href;
}

/* Context Menu */
/* Image */
$(function () {
    $.contextMenu({
        selector: '#star > img',
        items: {
            "delete_image": {
                name: "Delete Image",
                icon: "delete",
                callback: function () {
                    removeStarImage(starID);
                }
            },
            "delete_star": {
                name: "Delete Star",
                icon: "delete",
                callback: function () {
                    deleteStar(starID);
                },
                visible: hasNoVideos()
            }
        }
    });
});
/* Dropbox */
$(function () {
    $.contextMenu({
        selector: '#star > #dropbox',
        items: {
            "delete_star": {
                name: "Delete Star",
                icon: "delete",
                callback: function () {
                    deleteStar(starID);
                }
            }
        }
    });
});
/* Attribute */
$(function () {
    $.contextMenu({
        selector: '#star .attribute',
        items: {
            "remove": {
                name: "Remove",
                icon: "delete",
                callback: function (itemKey, options) {
                    let id = options.$trigger.attr('data-attribute-id');
                    removeStarAttribute(starID, id);
                }
            }
        }
    });
});
/* Title */
$(function () {
    $.contextMenu({
        selector: '#star > h2',
        zIndex: 2,
        items: {
            "rename": {
                name: "Rename",
                icon: "rename",
                callback: function () {

                    $('body').append('<div id="dialog" title="Edit Star"></div>');

                    $(function () {
                        $('#dialog').dialog({
                            close: function () {
                                $('#dialog').remove();
                            },
                            width: 250
                        });

                        $('#dialog').append('<input type="text" name="starName_edit" value="' + $('#star > h2').text() + '" autofocus>');
                        let input = $('input[name="starName_edit"]');
                        let len = input.val().length;
                        input[0].focus();
                        input[0].setSelectionRange(len, len);

                        document.querySelector('input[name="starName_edit"]').addEventListener('keydown', function (e) {
                            if (e.keyCode === 13) {
                                renameStar(starID, this.value);
                            }
                        });
                    });
                }
            }
        }
    });
});

/* Drag'n'Drop */
function dropbox() {
    let dropbox = document.getElementById('dropbox');
    if (!!dropbox) {
        dropbox.addEventListener('dragenter', dropboxDefault, false);
        dropbox.addEventListener('dragexit', dropboxDefault, false);
        dropbox.addEventListener('dragover', dropboxDefault, false);
        dropbox.addEventListener('drop', drop, false);

        function dropboxDefault(evt) {
            evt.stopPropagation();
            evt.preventDefault();
        }

        function drop(evt) {
            let image = evt.dataTransfer.getData('text');
            dropboxDefault(evt);
            addStarImage(starID, image);
        }
    }
}

function hasNoVideos() {
    return !$('.video').length;
}

function autoComplete() {
    function changeOrder(first, second, array) {
        let index_one = array.indexOf(first);
        let index_two = array.indexOf(second);
        if (index_one >= 0 && index_two >= 0) {
            let tmp = array[index_one];

            array[index_one] = array[index_two];
            array[index_two] = tmp;
        }
    }

    function removeDuplicate() {
        for (let i = 0; i < $('.attribute > .btn').length; i++) {
            $('#attributes > .attribute').filter(function () {
                return ($(this).text() === $('.attribute > .btn').eq(i).text());
            }).remove();
        }
    }

    removeDuplicate();

    let breasts = [],
        eyeColors = [],
        hairColors = [],
        hairLengths = [],
        hairStyles = [],
        attributes = [];
    for (let i = 0, $this = $('.breast'); i < $this.length; i++) breasts.push($this.eq(i).text());
    for (let i = 0, $this = $('.eyecolor'); i < $this.length; i++) eyeColors.push($this.eq(i).text());
    for (let i = 0, $this = $('.haircolor'); i < $this.length; i++) hairColors.push($this.eq(i).text());
    for (let i = 0, $this = $('.hairstyle'); i < $this.length; i++) hairStyles.push($this.eq(i).text());
    for (let i = 0, $this = $('#attributes > .attribute'); i < $this.length; i++) attributes.push($this.eq(i).text());

    changeOrder('Schoolgirl', 'School Nurse', attributes);
    changeOrder('Headmaster', 'Teacher', attributes);
    changeOrder('Elf', 'Angel', attributes);
    changeOrder('Tan Lines', 'Futanari', attributes);
    changeOrder('Adolescent', 'Schoolgirl', attributes);
    changeOrder('Android', 'Idol', attributes);

    $('input[name="breast"]').autocomplete({source: [breasts]});
    $('input[name="eyecolor"]').autocomplete({source: [eyeColors]});
    $('input[name="haircolor"]').autocomplete({source: [hairColors]});
    $('input[name="hairlength"]').autocomplete({source: [hairLengths]});
    $('input[name="hairstyle"]').autocomplete({source: [hairStyles]});
    $('input[name="attribute"]').autocomplete({source: [attributes]});
}

function setFocus() {
    for (let $this = $('form'), i = $this.length - 1; i >= 0; i--) {
        let value = $this.eq(i).find('input')[0].value;

        if (i === $this.length - 1) {
            if ($('.attribute > .btn').length) {
                $('form').eq(i).find('input')[0].focus();
                break;
            }
        } else if (value !== '') {
            $this.eq(i + 1).find('input')[0].focus();
            break;
        } else if (i === 0) {
            $this.eq(i).find('input')[0].focus();
            break;
        }
    }
}

/* Video */
function isPlaying(index = 0) {
    return !video[index].paused;
}

function goToAndStop(index, time = startTime) {
    video[index].currentTime = time;
    if (isPlaying(index)) video[index].pause();
}

function goToAndPlay(index, time = startTime) {
    video[index].currentTime = time;
    if (!isPlaying(index)) video[index].play();
}


function videoHover() {
    let thumbnail = undefined;
    for (let i = 0; i < video.length; i++) {
        video[i].addEventListener('mouseenter', function () {
            startThumbnailPlayback(i);
        });

        video[i].addEventListener('mouseleave', function () {
            stopThumbnailPlayback(i);
        });
    }

    function startThumbnailPlayback(index) {
        let time = 120; // first thumbnail image
        let offset = 60; // next thumbnail images
        let duration = 1.5;

        goToAndPlay(index, time += startTime);
        thumbnail = setInterval(function () {
            time += offset;
            if (time > video[index].duration) {
                clearInterval(thumbnail);
                startThumbnailPlayback(index);
            }
            goToAndPlay(index, time);
        }, duration * 1000);
    }

    function stopThumbnailPlayback(index) {
        goToAndStop(index);
        clearInterval(thumbnail);
    }
}

