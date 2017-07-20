import { Suggestions, Source, AjaxSource, DatalistSource } from '../src';

//Datalist
const datalistInput = document.getElementById('input-datalist');

const suggestions = new Suggestions(
    datalistInput,
    new DatalistSource(datalistInput, {
        suggestions: {
            render: option => {
                return `<strong>${option.label}</strong>`;
            }
        }
    })
);

suggestions.on('select', value => {
    console.log(value);
});
