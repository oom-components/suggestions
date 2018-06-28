import { Suggestions, AjaxSuggestions } from '../src/suggestions.js';

const datalistInput = document.getElementById('input-datalist');

const suggestions = Suggestions.createFromElement(document.getElementById('colors'));
//const suggestions = new AjaxSuggestions('data.json', datalistInput.closest('fieldset'));

suggestions.attachInput(datalistInput);

datalistInput.addEventListener('suggestions:select', e => {
    console.log(e.detail);
});

document.getElementById('reload').addEventListener('click', e => {
    ajax.load([
        {
            label: 'Reload 1',
            options: [
                {
                    label: 'Reload red',
                    value: 'r-red'
                },
                {
                    label: 'Reload Blue',
                    value: 'r-blue'
                },
                {
                    label: 'Reload Green',
                    value: 'r-green'
                }
            ]
        },
        {
            label: 'Reload Yellow',
            value: 'r-yellow'
        },
        {
            label: 'Reload Pink',
            value: 'r-pink'
        }
    ]);
});
