import Suggestions from '../src/suggestions.js';
import DatalistSource from '../src/datalist-source.js';

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

suggestions.on('select', function(value) {
    console.log(this.query, value);
});
