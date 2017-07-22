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

    match(suggestion, query) {
        return (
            suggestion.label.toLowerCase().indexOf(query) !== -1 ||
            suggestion.value.toLowerCase().indexOf(query) !== -1
        );
    }

    refresh(query) {
        this.element.innerHTML = '';
        this.result = [];
        this.current = 0;

        if (!query) {
            return this.close();
        }

        query = query.toLowerCase();

        this.each((suggestion, parent) => {
            suggestion.unselect();

            if (this.match(suggestion, query)) {
                parent.element.appendChild(suggestion.element);
                this.result.push(suggestion);
            } else if (suggestion.element.parentElement === parent.element) {
                parent.element.removeChild(suggestion.element);
            }
        });

        if (this.result.length) {
            this.selectFirst();
            this.open();
        } else {
            this.close();
        }
    }

    destroy() {
        this.input.setAttribute('list', this.listId);
        super.destroy();
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
