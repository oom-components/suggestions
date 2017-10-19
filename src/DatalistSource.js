import d from 'd_js';
import Source from './Source.js';
import Suggestion from './Suggestion.js';
import Group from './Group.js';

export default class DatalistSource extends Source {
    constructor(input, settings = {}) {
        const listElement = input.ownerDocument.getElementById(
            input.getAttribute('list')
        );

        if (!settings.parent) {
            settings.parent = listElement.parentElement;
        }

        super(settings);

        this.input = input;
        this.listId = input.getAttribute('list');

        input.removeAttribute('list');

        this.load(getAvailableOptions(listElement));
    }

    destroy() {
        this.input.setAttribute('list', this.listId);
        super.destroy();
    }
}

function getAvailableOptions(element) {
    const data = [];

    d.getAll({ optgroup: element }).forEach(optgroup => {
        const options = [];
        d
            .getAll({ option: optgroup })
            .forEach(option => options.push(createItem(option)));

        data.push({
            label: optgroup.label,
            options: options
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
