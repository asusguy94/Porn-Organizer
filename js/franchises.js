document.addEventListener('DOMContentLoaded', function () {
    function renameFranchise(oldName, newName) {
        let arguments = 'franchiseOld=' + encodeURIComponent(oldName) + '&franchiseNew=' + encodeURIComponent(newName);
        ajax('ajax/franchise_renameall.php', arguments);
    }

    function renameVideo(oldName, newName) {
        let arguments = 'franchiseOld=' + encodeURIComponent(oldName) + '&franchiseNew=' + encodeURIComponent(newName);
        ajax('ajax/franchise_renamevideoall.php', arguments);
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

    $(function () {
        $.contextMenu({
            selector: '.franchise',
            items: {
                "rename": {
                    name: "Rename",
                    icon: "edit",
                    callback: function (itemKey, options) {
                        let franchiseName_current = options.$trigger.text();

                        $('body').append('<div id="dialog" title="Edit Star"></div>');

                        $(function () {
                            $('#dialog').dialog({
                                close: function () {
                                    $('#dialog').remove();
                                },
                                width: 250
                            });

                            $('#dialog').append('<input type="text" name="franchise_edit" value="' + franchiseName_current + '" autofocus>');
                            let input = $('input[name="franchise_edit"]');
                            let len = input.val().length;
                            input[0].focus();
                            input[0].setSelectionRange(len, len);

                            document.querySelector('input[name="franchise_edit"]').addEventListener('keydown', function (e) {
                                if (e.keyCode === 13) {
                                    renameFranchise(franchiseName_current, this.value);
                                    renameVideo(franchiseName_current, this.value);
                                }
                            });
                        });
                    }
                }
            }
        });
    });
});