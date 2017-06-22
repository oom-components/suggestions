import { Suggestions, Source, AjaxSource, DatalistSource } from '../src';

//Datalist
const datalistInput = document.getElementById('input-datalist');

new Suggestions(datalistInput, new DatalistSource(datalistInput));

//Ajax (with options and events)
const suggestions = new Suggestions(
    document.getElementById('input-ajax'),
    new AjaxSource('data.json', {
        optionRender: data => {
            return `<img src="http://placehold.it/30x30"><strong>${data.label}</strong>`;
        }
    })
);

suggestions.on('select', value => {
    console.log(value);
});

//Manual
new Suggestions(
    document.getElementById('input-manual'),
    new Source([
        {
            label: 'RGB',
            options: [
                {
                    label: 'Red',
                    value: 'red'
                },
                {
                    label: 'Blue',
                    value: 'blue'
                },
                {
                    label: 'Green',
                    value: 'green'
                }
            ]
        },
        {
            label: 'Yellow',
            value: 'yellow'
        },
        {
            label: 'Pink',
            value: 'pink'
        }
    ])
);
