document.addEventListener('DOMContentLoaded', function () {
    const AUTO = new URL(location.href).searchParams.get('auto');
    const autoBtn = document.getElementsByName('auto')[0];

    const inputField = document.querySelector('input[name="star"]');
    const inputText = document.querySelectorAll('p.missing .name');

    if (inputText.length) {
        inputField.value = inputText[0].textContent;
        if (AUTO === '1') $('input[name="addStar"]')[0].click();
    } else if (AUTO === '1') {
        resetUrl();
    }

    autoBtn.addEventListener('change', function () {
        if (this.checked) location.href = '?auto=1';
        else resetUrl();
    });
});

function resetUrl() {
    location.href = location.pathname;
}