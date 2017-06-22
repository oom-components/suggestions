import d from 'd_js';
import Source from './Source.js';

export default class DatalistSource extends Source {
    constructor(element, settings = {}) {
        const listElement = element.ownerDocument.getElementById(
            element.getAttribute('list')
        );
        element.removeAttribute('list');

        if (!settings.parent) {
            settings.parent = listElement.parentElement;
        }
        super(getAvailableOptions(listElement), settings);
    }
}

function getAvailableOptions(element) {
    const data = [];

    d.getAll({ optgroup: element }).forEach(optgroup => {
        data.push({
            label: optgroup.label,
            options: d.getAll({ option: optgroup }).map(createItem)
        });
    });

    d.getAll({ option: element }).forEach(option => {
        if (option.parentElement.tagName !== 'OPTGROUP') {
            data.push(createItem(option));
        }
    });

    return data;
}

function createItem(option) {
    const item = d.data(option, 'data') || {};
    item.label = option.label;
    item.value = option.value;

    return item;
}
