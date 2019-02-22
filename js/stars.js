document.addEventListener('DOMContentLoaded', function () {
    const AUTO = new URL(location.href).searchParams.get('auto');

    const inputField = document.querySelector('input[name="star"]');
    const inputText = document.querySelectorAll('p.missing .name');

    if(inputText.length){
        inputField.value = inputText[0].textContent;
        if(AUTO === '1') $('input[name="addStar"]')[0].click();
    }
});