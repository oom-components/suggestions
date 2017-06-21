import d from 'd_js';
import Result from './Result.js';
import AjaxResult from './AjaxResult.js';

const keys = {
    40: 'ArrowDown',
    38: 'ArrowUp',
    13: 'Enter',
    27: 'Escape'
};

export { Result };
export { AjaxResult };

export class Suggestions {
    constructor(element, result) {
        this.element = element;

        if (result instanceof Result) {
            this.result = result;
        } else if (typeof result === 'object') {
            this.result = new Result(result, element.parentElement);
        } else if (element.getAttribute('list')) {
            const listElement = element.ownerDocument.getElementById(
                element.getAttribute('list')
            );
            this.result = new Result(
                getAvailableOptions(listElement),
                listElement.parentElement
            );
            d.remove(listElement);
        } else {
            throw new Error('Results not provided');
        }

        this.element.setAttribute('autocomplete', 'off');

        d.on('input', this.element, event => {
            this.result.refresh(this.element.value);
        });

        d.on('keydown', this.element, event => {
            const code = event.code || keys[event.keyCode];

            switch (code) {
                case 'ArrowDown':
                    this.result.selectNext();
                    event.preventDefault();
                    break;

                case 'ArrowUp':
                    this.result.selectPrevious();
                    event.preventDefault();
                    break;

                case 'Enter':
                    const value = this.result.getCurrentValue();

                    if (!this.result.isClosed) {
                        this.element.value = value;
                        this.result.close();
                        event.preventDefault();
                    }
                    break;

                case 'Escape':
                    this.result.close();
                    break;
            }
        });
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }

        this.events[event].push(callback);
    }

    off(event, callback) {
        if (this.events[event]) {
            if (!callback) {
                delete this.events[event];
            } else {
                const index = this.events[event].indexOf(callback);

                if (index !== -1) {
                    this.events[event].splice(index, 1);
                }
            }
        }
    }

    trigger(event, args = []) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback.apply(this, args));
        }
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
