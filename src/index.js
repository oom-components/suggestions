import d from 'd_js';
import AjaxSource from './AjaxSource.js';
import DatalistSource from './DatalistSource.js';
import Source from './Source.js';

const keys = {
    40: 'ArrowDown',
    38: 'ArrowUp',
    13: 'Enter',
    27: 'Escape'
};

export { AjaxSource, DatalistSource, Source };

export class Suggestions {
    constructor(element, source) {
        this.events = {};
        this.source = source;
        this.element = element;
        this.element.setAttribute('autocomplete', 'off');

        d.on('input', this.element, event => {
            this.source.refresh(this.element.value);
        });

        let currValue;

        d.on('focus', this.element, event => {
            currValue = this.element.value;
        });

        d.on('keydown', this.element, event => {
            const code = event.code || keys[event.keyCode];

            switch (code) {
                case 'ArrowDown':
                    event.preventDefault();

                    if (!this.source.isClosed) {
                        this.source.selectNext();
                    }
                    break;

                case 'ArrowUp':
                    event.preventDefault();

                    if (!this.source.isClosed) {
                        this.source.selectPrevious();
                    }
                    break;

                case 'Enter':
                    if (!this.source.isClosed) {
                        const item = this.source.getCurrent();

                        this.element.value = item.value;
                        this.trigger('select', [item]);
                        this.source.close();
                        event.preventDefault();
                    }
                    break;

                case 'Escape':
                    this.source.close();
                    this.element.value = currValue;
                    break;
            }
        });

        d.delegate('click', this.source.element, 'li', (e, target) => {
            const item = this.source.getByElement(target);

            if (item) {
                this.element.value = item.value;
                this.trigger('select', [item]);
                this.source.close();
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

    destroy() {
        d.off('input focus keydown', this.element);
        this.source.destroy();
    }
}
