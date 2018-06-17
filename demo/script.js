import { Suggestions, Source, AjaxSource } from '../src/suggestions.js';

const datalistInput = document.getElementById('input-datalist');

const suggestions = new Suggestions(
    datalistInput,
    new AjaxSource('data.json', datalistInput.closest('fieldset'))
    // Source.createFromElement(document.getElementById('colors'))
);

datalistInput.addEventListener('suggestion:choosen', e => {
    console.log(e.detail);
});
