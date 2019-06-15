document.addEventListener('DOMContentLoaded', function () {
    const label_input = document.getElementsByTagName('label');

    const noStar_checkbox = document.querySelector('input[name="no-star_0"]');
    const hasStar_checkbox = document.querySelector('input[name="no-star_1"]');

    const cen_checkbox = document.querySelector('input[name="cen"]');
    const ucen_checkbox = document.querySelector('input[name="ucen"]');

    const franchise_input = document.querySelector('input[name="franchise"]');
    const title_input = document.querySelector('input[name="title"]');
    const attribute_checkbox = document.querySelectorAll('input[name^="attribute"]');
    const category_checkbox = document.querySelectorAll('input[name^="category"]');

    const sort_radio = document.querySelectorAll('input[name="sort"]');
    const loader = document.getElementById('loader');


    const loadData = (function () {
        fetch('video_search-api.php').then(function (jsonData) {
            return jsonData.json();
        }).then(function (data) { // CREATE DOM
            let wrapper = document.getElementById('videos');
            for (let i = 0, elem = data['videos']; i < elem.length; i++) {
                let md5 = elem[i]['md5'];
                let thumbnail = elem[i]['thumbnail'];

                let videoID = elem[i]['videoID'];
                let videoName = elem[i]['videoName'];
                let noStar = elem[i]['noStar'];
                let cen = elem[i]['cen'];
                let franchise = elem[i]['franchise'];

                let attribute = elem[i]['attribute'];
                let category = elem[i]['category'];
                let alias = elem[i]['alias'];

                if (!category.length) category.push('0');
                if (!attribute.length) attribute.push('0');
                if (!alias.length) alias.push('0');

                let a = document.createElement('a');
                a.classList.add('video', 'card');
                a.href = `video.php?id=${videoID}`;
                a.setAttribute('data-nostar', noStar);
                a.setAttribute('data-cen', cen);
                a.setAttribute('data-franchise', franchise);
                a.setAttribute('data-title', videoName);
                a.setAttribute('data-alias', alias);
                a.setAttribute('data-attribute-name', `["${attribute}"]`);
                a.setAttribute('data-category-name', `["${category}"]`);

                let img = document.createElement('img');
                img.classList.add('lazy', 'data-img-top');
                img.setAttribute('data-src', `${thumbnail}?v=${md5}`);

                let span = document.createElement('span');
                span.classList.add('title', 'card-title');
                span.textContent = videoName;

                a.appendChild(img);
                a.appendChild(span);
                wrapper.appendChild(a);
            }
        }).then(function () {
            loader.remove();

            window.video = document.getElementsByClassName('video');
            window.videoLength = video.length;
        }).then(function () {
            /** Label Click **/
            for (let i = 0; i < label_input.length; i++) {
                label_input[i].addEventListener('click', function () {
                    $(label_input[i].previousSibling).click();
                });
            }

            /** Filter **/
            /* noStar */
            noStar_checkbox.addEventListener('change', function () {
                if (this.checked) {
                    hasStar_checkbox.checked = false;
                    $('.video[data-nostar="0"]').addClass('hidden-starcount');
                } else {
                    $('.video[data-nostar="0"].hidden-starcount').removeClass('hidden-starcount');
                }
            });
            hasStar_checkbox.addEventListener('change', function () {
                if (this.checked) {
                    noStar_checkbox.checked = false;
                    $('.video[data-nostar="1"]').addClass('hidden-starcount');
                } else {
                    $('.video[data-nostar="1"].hidden-starcount').removeClass('hidden-starcount');
                }
            });
            hasStar_checkbox.click();

            /* Cen */
            cen_checkbox.addEventListener('change', function () {
                if (this.checked) {
                    ucen_checkbox.checked = false;
                    $('.video[data-cen="0"]').addClass('hidden-cen');
                } else {
                    $('.video[data-cen="0"].hidden-cen').removeClass('hidden-cen');
                }
            });

            ucen_checkbox.addEventListener('change', function () {
                if (this.checked) {
                    cen_checkbox.checked = false;
                    $('.video[data-cen="1"]').addClass('hidden-cen');
                } else {
                    $('.video[data-cen="1"].hidden-cen').removeClass('hidden-cen');
                }
            });

            /* Title */
            if (title_input != null) {
                title_input.addEventListener('keyup', function () {
                    let input = title_input.value.toLowerCase();
                    $(video).removeClass('hidden-title');

                    if (input !== '') {
                        $(video).not(function () {
                            return ((this.getAttribute('data-title').toLowerCase().indexOf(input) > -1) || (this.getAttribute('data-alias').toLowerCase().indexOf(input) > -1));
                        }).addClass('hidden-title');
                    }
                });
            }

            /* Franchise */
            if (franchise_input != null) {
                franchise_input.addEventListener('keyup', function () {
                    let input = franchise_input.value.toLowerCase();
                    $(video).removeClass('hidden-franchise');

                    if (input !== '') {
                        $(video).not(function () {
                            return (this.getAttribute('data-franchise').toLowerCase().indexOf(input) > -1);
                        }).addClass('hidden-franchise');
                    }
                });
            }

            /* Attributes */
            for (let i = 0, wrapperLen = attribute_checkbox.length; i < wrapperLen; i++) {
                attribute_checkbox[i].addEventListener('change', function () {
                    let attribute = this.name.split('attribute_').pop();
                    let attribute_class = attribute.replace(/ /g, '-');

                    for (let i = 0; i < videoLength; i++) {
                        let attribute_raw = video[i].getAttribute('data-attribute-name').slice(2, -2);
                        let attribute_arr = attribute_raw.split(',');

                        for (let j = 0, len = attribute_arr.length; j < len; j++) {
                            if (this.checked && (attribute_arr[j] === attribute)) {
                                video[i].classList.add('tmp');
                            }
                        }
                    }

                    if (this.checked) $('.video:not(.tmp)').addClass(`hidden-attribute-${attribute_class}`);
                    else $(video).removeClass(`hidden-attribute-${attribute_class}`);
                    $(video).removeClass('tmp'); // remove leftover classes
                });
            }

            /* Category */
            for (let i = 0, wrapperLen = category_checkbox.length; i < wrapperLen; i++) {
                category_checkbox[i].addEventListener('change', function () {
                    let category = this.name.split('category_').pop();
                    let category_class = category.replace(/ /g, '-');

                    for (let i = 0; i < videoLength; i++) {
                        let category_raw = video[i].getAttribute('data-category-name').slice(2, -2);
                        let category_arr = category_raw.split(',');

                        for (let j = 0, len = category_arr.length; j < len; j++) {
                            if (this.checked && (category_arr[j] === category)) {
                                video[i].classList.add('tmp');
                            }
                        }
                    }

                    if (this.checked) $('.video:not(.tmp)').addClass(`hidden-category-${category_class}`);
                    else $(video).removeClass(`hidden-category-${category_class}`);
                    $(video).removeClass('tmp'); // remove leftover classes
                });
            }

            /* Sort Radio Buttons */
            for (let i = 0, wrapperLen = sort_radio.length; i < wrapperLen; i++) {
                sort_radio[i].addEventListener('change', function () {
                    switch (sort_radio[i].getAttribute('id').split('_')[1]) {
                        case 'rand':
                            $(video).sort(function () {
                                return 0.5 - Math.random();
                            });
                            break;
                        default:
                            $(video).sort(function (a, b) {
                                return a.getAttribute('data-title').localeCompare(b.getAttribute('data-title'));
                            });
                    }

                    for (let j = 0; j < videoLength; j++) {
                        video[j].parentNode.appendChild(video[j]);
                    }
                });
            }
        }).then(function () {
            new LazyLoad({
                elements_selector: ".lazy",
                threshold: 1500
            });
        });
    })();
});