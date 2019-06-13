document.addEventListener('DOMContentLoaded', function () {
    const title = document.getElementById('star-name');

    window.starName = document.getElementById('star-name').textContent;
    window.starID = window.location.href.split('id=')[1];
    window.video = document.getElementsByTagName('video');
    window.startTime = 40;

    dropbox();
    autoComplete();

    let form = document.getElementsByTagName('form');
    for (let i = 0; i < form.length; i++) {
        form[i].addEventListener('keydown', function (e) {
            switch (e.keyCode) {
                case 13: // enter
                    $(form).eq(i).submit();
                    break;
                case 9: // tab
                    e.preventDefault();

                    if (i < form.length - 1) $(form).eq(i + 1).find("input")[0].focus();
                    else $("#next")[0].click();
            }
        });
    }

    setFocus();
    videoHover();

    if (isIgnored()) title.classList.add('ignored');
    if ($(".ribbon-green").length === 1) alert('Warning!');
});

function isIgnored() {
    return ($('h2 > #star-name[data-star-ignore]').attr('data-star-ignore') === '1');
}

function ignoreStar() {
    ajax('ajax/ignoreStar.php', `starID=${starID}`);
}

function enableStar() {
    ajax('ajax/enableStar.php', `starID=${starID}`);
}

function addStarImage(url) {
    let ext = getExtension(pathToFname(url));
    if (ext === 'jpe' || ext === 'jpeg') ext = 'jpg';

    ajax('ajax/add_star_image.php', `id=${starID}&image=${url}`, function (data) {
        let dropbox = document.getElementById('dropbox');

        let img = document.createElement('img');
        img.src = `images/stars/${starID}.${ext}?v=${data.responseText}`;

        insertBefore(dropbox, img);
        dropbox.remove();
    });
}

function addStarImage_local(file) {
    let ext = getExtension(file.name);
    console.log(file);

    ajax_post('ajax/add_star_image_local.php', [
        {
            'name': 'file',
            'value': file,
        }, {
            'name': 'starID',
            'value': starID
        }
    ], function (data) {
        let dropbox = document.getElementById('dropbox');

        let img = document.createElement('img');
        img.src = `images/stars/${starID}.${ext}?v=${data.responseText}`;

        insertBefore(dropbox, img);
        dropbox.remove();
    });
}

function removeStarImage(id) {
    ajax('ajax/remove_star_image.php', `id=${id}`);
}

function deleteStar(starID) {
    ajax('ajax/remove_star.php', `starID=${starID}`);
}

function renameStar(starID, starName) {
    ajax('ajax/rename_star.php', `starID=${starID}&starName=${starName}`);
}

function addStarAlias(alias) {
    ajax('ajax/addStarAlias.php', `starID=${starID}&aliasName=${alias}`);
}

function removeStarAlias(id) {
    ajax('ajax/removeStarAlias.php', `aliasID=${id}`);
}

function removeVideoStar(videoID) {
    ajax('ajax/remove_videostar.php', `videoID=${videoID}&starID=${starID}`);
}

function aliasSwapTitle(aliasID) {
    ajax('ajax/alias_swap_title.php', `aliasID=${aliasID}&starID=${starID}`);
}


function ajax(page, params, callback = function () {
    location.href = location.href
}) {
    let url = `${page}?${params}`;

    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.send();
    xhr.onload = function () {
        callback(this);
    }
}

function ajax_post(url, postObj, callback = function () {
    location.href = location.href;
}) {
    let formData = new FormData();
    for (let postData of postObj) {
        formData.append(postData['name'], postData['value']);
    }

    let xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.send(formData);

    xhr.onload = function () {
        callback(this);
    }
}

/* Context Menu */
/* Image */
$(function () {
    $.contextMenu({
        selector: '#star > img',
        items: {
            'delete_image': {
                name: 'Delete Image',
                icon: 'delete',
                callback: function () {
                    removeStarImage(starID);
                }
            }
        }
    });
});
/* Dropbox */
$(function () {
    $.contextMenu({
        selector: '#star > #dropbox',
        items: {
            'delete_star': {
                name: 'Delete Star',
                icon: 'delete',
                callback: function () {
                    deleteStar(starID);
                },
                disabled: !hasNoVideos()
            }
        }
    });
});
/* Title */
$(function () {
    $.contextMenu({
        selector: '#star #star-name',
        zIndex: 2,
        items: {
            'rename': {
                name: 'Rename',
                icon: 'rename',
                callback: function () {
                    const dialogWrapper = document.createElement('div');
                    dialogWrapper.id = 'dialog';
                    dialogWrapper.title = 'Edit Star';

                    document.body.appendChild(dialogWrapper);
                    $(function () {
                        const dialogQuery = $('#dialog');
                        dialogQuery.dialog({
                            close: function () {
                                this.closest('.ui-dialog').remove();
                            },
                            width: 250
                        });

                        const dialogInput = document.createElement('input');
                        dialogInput.type = 'text';
                        dialogInput.name = 'starName_edit';
                        dialogInput.value = $('#star > h2 > #star-name').text();
                        dialogInput.autofocus = true;

                        dialogQuery.append(dialogInput);
                        let input = $('input[name="starName_edit"]');
                        let len = input.val().length;
                        input[0].focus();
                        input[0].setSelectionRange(len, len);

                        document.querySelector('input[name="starName_edit"]').addEventListener('keydown', function (e) {
                            if (e.keyCode === 13) {
                                renameStar(starID, this.value.trim());
                            }
                        });
                    });
                }
            },
            "add_alias": {
                name: "Add Alias",
                callback: function () {
                    const dialogWrapper = document.createElement('div');
                    dialogWrapper.id = 'dialog';
                    dialogWrapper.title = 'Add Alias';

                    document.body.appendChild(dialogWrapper);

                    $(function () {
                        const dialogQuery = $('#dialog');
                        dialogQuery.dialog({
                            close: function () {
                                this.closest('.ui-dialog').remove();
                            },
                            width: 250
                        });

                        const dialogInput = document.createElement('input');
                        dialogInput.type = 'text';
                        dialogInput.name = 'starName_alias';
                        dialogInput.autofocus = true;

                        dialogQuery.append(dialogInput);
                        document.querySelector('input[name="starName_alias"]').addEventListener('keydown', function (e) {
                            if (e.keyCode === 13) {
                                addStarAlias(this.value);
                            }
                        });
                    });
                }
            },
            'ignore_star': {
                name: 'Ignore Star',
                callback: function () {
                    ignoreStar();
                },
                visible: !isIgnored()
            },
            'enable_star': {
                name: 'Enable Star',
                callback: function () {
                    enableStar();
                },
                visible: isIgnored()
            }
        }
    });
});
/* Alias */
$(function () {
    $.contextMenu({
        selector: '#star .alias',
        zIndex: 2,
        items: {
            'edit_alias': {
                name: 'Remove Alias',
                callback: function (itemKey, options) {
                    let id = options.$trigger.attr('data-alias-id');
                    removeStarAlias(id);
                }
            },
            'swap_alias_and_title': {
                name: 'Make Default',
                callback: function (itemKey, options) {
                    let id = options.$trigger.attr('data-alias-id');
                    aliasSwapTitle(id);
                }
            }
        }
    });
});
/* Video */
$(function () {
    $.contextMenu({
        selector: '.video',
        items: {
            'remove_star': {
                name: 'Remove',
                icon: 'delete',
                callback: function (itemKey, options) {
                    let id = options.$trigger.attr('href').split('id=')[1];
                    removeVideoStar(id);
                }
            }
        }
    });
});

/* Drag'n'Drop */
function dropbox() {
    const dropArea = document.getElementById('dropbox');

    if (dropArea) {
        dropArea.addEventListener('dragenter dragover', function (e) {
            dropboxDefault(e);
            add();
        }, false);
        dropArea.addEventListener('dragover', function (e) {
            dropboxDefault(e);
            add();
        }, false);
        dropArea.addEventListener('dragleave', function (e) {
            dropboxDefault(e);
            remove();
        }, false);
        dropArea.addEventListener('drop', function (e) {
            dropboxDefault(e);
            remove();
            drop(e);
        }, false);
    }

    function add() {
        dropArea.classList.add('hover');
    }

    function remove() {
        dropArea.classList.remove('hover');
    }

    function dropboxDefault(evt) {
        evt.stopPropagation();
        evt.preventDefault();
    }

    function drop(evt) {
        let image = evt.dataTransfer.getData('text');

        if (isLocalFile(image)) {
            /* TODO Needs fix */

            image = evt.dataTransfer.files;
            if (image.length === 1) {
                image = image[0];
                addStarImage_local(image);
            }
        } else {
            addStarImage(imageWithoutParameter(image));
        }
    }
}

function imageWithoutParameter(image) {
    let strpos = image.lastIndexOf('.');
    if (strpos > -1) {
        let index = -1;
        for (let i = strpos; i < image.length; i++) {
            if (image[i] === '?') {
                index = i;
                break;
            }
        }

        if (index > -1) {
            let newImage = '';
            for (let i = 0; i < index; i++) {
                newImage += image[i];
            }
            return newImage;
        } else {
            return image
        }
    } else {
        return image;
    }
}

function hasNoVideos() {
    return !$('.video').length;
}

function autoComplete() {
    function swapOrder(first, second, array) {
        let index_one = array.indexOf(first);
        let index_two = array.indexOf(second);
        if (index_one >= 0 && index_two >= 0) {
            let tmp = array[index_one];

            array[index_one] = array[index_two];
            array[index_two] = tmp;
        }
    }

    let breasts = [],
        eyes = [],
        hair = [],
        ethnicity = [],
        country = [],
        start = [],
        end = [];

    const breastQuery = $('.breast'),
        eyeQuery = $('.eye'),
        hairQuery = $('.hair'),
        ethnicityQuery = $('.ethnicity'),
        countryQuery = $('.country'),
        startQuery = $('.start'),
        endQuery = $('.end');

    for (let i = 0; i < breastQuery.length; i++) breasts.push(breastQuery.eq(i).text());
    for (let i = 0; i < eyeQuery.length; i++) eyes.push(eyeQuery.eq(i).text());
    for (let i = 0; i < hairQuery.length; i++) hair.push(hairQuery.eq(i).text());
    for (let i = 0; i < ethnicityQuery.length; i++) ethnicity.push(ethnicityQuery.eq(i).text());
    for (let i = 0; i < countryQuery.length; i++) country.push(countryQuery.eq(i).text());
    for (let i = 0; i < startQuery.length; i++) start.push(startQuery.eq(i).text());
    for (let i = 0; i < endQuery.length; i++) end.push(endQuery.eq(i).text());

    swapOrder('Russia', 'Belarus', country);

    $('input[name="breast"]').autocomplete({source: [breasts]});
    $('input[name="eye"]').autocomplete({source: [eyes]});
    $('input[name="hair"]').autocomplete({source: [hair]});
    $('input[name="ethnicity"]').autocomplete({source: [ethnicity]});
    $('input[name="country"]').autocomplete({source: [country]});
    $('input[name="height"]').autocomplete({source: []});
    $('input[name="weight"]').autocomplete({source: []});
    $('input[name="birthdate"]').autocomplete({source: []});
    $('input[name="start"]').autocomplete({source: [start]});
    $('input[name="end"]').autocomplete({source: [end]});
}

function setFocus() {
    let form = $('form').find('input').closest('form');
    let formLength = $(form).length;

    for (let i = formLength - 1; i >= 0; i--) {
        let value = $(form).eq(i).find('input')[0].value;

        if (value !== '') {
            if (i < (formLength - 1)) $(form).eq(i + 1).find('input')[0].focus();
            else $(form).eq(i).find('input')[0].focus();
            break;
        } else if (!i) {
            $(form).eq(i).find('input')[0].focus();
            break;
        }
    }
}

/* Video */
function isPlaying(index = 1) {
    return !video[index].paused;
}

function goToAndStop(index, time = startTime) {
    video[index].currentTime = time;
    if (isPlaying(index)) video[index].pause();
}

function goToAndPlay(index, time = 0) {
    video[index].currentTime = time;
    if (!isPlaying(index)) video[index].play();
}

function videoHover() {
    let thumbnail;

    for (let i = 0; i < video.length; i++) {
        video[i].addEventListener('loadedmetadata', function () {
            this.currentTime = startTime;
        });

        video[i].addEventListener('mouseenter', function () {
            startThumbnailPlayback(i);
        });

        video[i].addEventListener('mouseleave', function () {
            stopThumbnailPlayback(i);
        });
    }

    function startThumbnailPlayback(index) {
        let time = 120; // first thumbnail image
        let offset = 120; // next thumbnail images
        let duration = 1.5; // duration of preview (seconds)

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

function pathToFname(path) {
    return path.substr(path.lastIndexOf("/") + 1);
}

function getExtension(fname) {
    return fname.substr(fname.lastIndexOf(".") + 1);
}

function insertBefore(referenceNode, el) {
    referenceNode.parentNode.insertBefore(el, referenceNode);
}

function isLocalFile(path) {
    return !((path.indexOf('http://') > -1) || (path.indexOf('https://') > -1));
}


/* TODO WORK IN PROGRESS
function createModal(title, content) {
    // SETUP
    let modal = document.createElement('div');
    modal.classList.add('modal');
    modal.role = 'dialog';

    let modal_dialog = document.createElement('div');
    modal_dialog.classList.add('modal-dialog');

    let modal_content = document.createElement('div');
    modal_content.classList.add('modal-content');

    let modal_header = document.createElement('div');
    modal_header.classList.add('modal-header');

    let modal_title = document.createElement('h4');
    modal_title.classList.add('modal-title');
    modal_title.textContent = title;

    let modal_close = document.createElement('button');
    modal_close.type = 'button';
    modal_close.classList.add('close');
    modal_close.setAttribute('data-dismiss', 'modal');
    modal_close.innerHTML = '&times;';

    let modal_body = document.createElement('div');
    modal_body.classList.add('modal_body');
    modal_body.innerHTML = content;

    // BUILD
    modal_header.appendChild(modal_title);
    modal_header.appendChild(modal_close);

    modal_content.appendChild(modal_header);
    modal_content.appendChild(modal_body);

    modal_dialog.appendChild(modal_content);

    modal.appendChild(modal_dialog);

    document.body.appendChild(modal);

    // RETURN ELEMENT
    $('.modal').modal('show');
}
*/