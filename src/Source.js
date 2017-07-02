import d from 'd_js';
import Suggestion from './Suggestion.js';
import Group from './Group.js';

export default class Source {
    constructor(settings = {}) {
        this.settings = settings;
        this.settings.groups = this.settings.groups || {};
        this.settings.suggestions = this.settings.suggestions || {};

        this.suggestions = {};
        this.groups = {};
        this.isClosed = true;
        this.result = [];
        this.current = 0;

        this.element = d.parse('<ul></ul>');
        (this.settings.parent || document.body).appendChild(this.element);
    }

    getSuggestion(item) {
        if (this.suggestions[item.value]) {
            return this.suggestions[item.value];
        }

        return (this.suggestions[item.value] = new Suggestion(
            item,
            this.settings.suggestions
        ));
    }

    getGroup(item) {
        if (!this.groups[item.label]) {
            this.groups[item.label] = new Group(item, this.settings.groups);
        }

        this.groups[item.label].load(
            item.options.map(item => this.getSuggestion(item))
        );
        return this.groups[item.label];
    }

    load(data) {
        this.data = data.map(
            item =>
                item.options ? this.getGroup(item) : this.getSuggestion(item)
        );
    }

    append(child) {
        this.element.appendChild(child);
    }

    selectFirst() {
        this.current = 0;

        if (this.result[this.current]) {
            this.result[this.current].select(this.element);
        }
    }

    selectNext() {
        if (this.result[this.current + 1]) {
            this.result[this.current].unselect();
            this.current++;

            if (this.result[this.current]) {
                this.result[this.current].select(this.element);
            }
        }
    }

    selectPrevious() {
        if (this.result[this.current - 1]) {
            this.result[this.current].unselect();
            this.current--;

            if (this.result[this.current]) {
                this.result[this.current].select(this.element);
            }
        }
    }

    getByElement(element) {
        const item = this.result.find(item => item.element === element);

        if (item) {
            return item;
        }
    }

    getCurrent() {
        if (this.result[this.current]) {
            return this.result[this.current];
        }
    }

    close() {
        this.isClosed = true;
        this.element.innerHTML = '';
        this.element.classList.remove('is-open');
    }

    open() {
        this.isClosed = false;
        this.element.classList.add('is-open');
    }

    each(callback) {
        this.data.forEach(suggestion => {
            if (suggestion instanceof Group) {
                suggestion.data.forEach(item => callback(item, suggestion));

                if (suggestion.element.childElementCount) {
                    if (
                        suggestion.wrapperElement.parentElement !== this.element
                    ) {
                        this.element.appendChild(suggestion.wrapperElement);
                    }
                } else if (
                    suggestion.wrapperElement.parentElement === this.element
                ) {
                    this.element.removeChild(suggestion.wrapperElement);
                }
            } else {
                callback(suggestion, this);
            }
        });
    }
}
