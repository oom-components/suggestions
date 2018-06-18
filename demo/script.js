import { Suggestions, Source, AjaxSource } from '../src/suggestions.js';

const datalistInput = document.getElementById('input-datalist');
// const source = Source.createFromElement(document.getElementById('colors'));
const ajax = new AjaxSource('data.json', datalistInput.closest('fieldset'));

const suggestions = new Suggestions(
    datalistInput,
    ajax
);

datalistInput.addEventListener('suggestion:choosen', e => {
    console.log(e.detail);
});

document.getElementById('reload').addEventListener('click', e => {
	ajax.load([
		{
			"label": "Reload 1",
			"options": [
				{
					"label": "Reload red",
					"value": "r-red"
				},{
					"label": "Reload Blue",
					"value": "r-blue"
				},{
					"label": "Reload Green",
					"value": "r-green"
				}
			]
		}, 
		{
			"label": "Reload Yellow",
			"value": "r-yellow"
		}, 
		{
			"label": "Reload Pink",
			"value": "r-pink"
		}
	]);
})