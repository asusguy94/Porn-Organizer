function editStar(starID){
    let arguments = 'starID=' + starID;
    ajax('edit_star.php', arguments);
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
/* Remove Image */
/*$(function () {
    $.contextMenu({
        selector: '.star[data-star-id]',
        items: {
            "edit": {
                name: "Edit",
                icon: "edit",
                callback: function (itemKey, options) {
                    let id = options.$trigger.attr('data-star-id');
                    let name = $('.star[data-star-id="' + id + '"] .name').text();
                    $('body').append('<div id="dialog" title="' + name + '"></div>');

                    $(function () {
                        $('#dialog').dialog({
                            close: function () {
                                $('#dialog').remove();
                            }
                        });

                        //$('#dialog').append('<div id="dropbox"></a><span>' + name + '</span></div>');
                        //dropbox(id);
                    });
                },
                visible: false
            },
            "remove": {
                name: "Remove",
                icon: "Delete",
                callback: function (itemKey, options) {
                    let id = options.$trigger.attr('data-star-id');
                    $('.star[data-star-id="' + id + '"]').remove();
                }
            }
        }
    });
});*/