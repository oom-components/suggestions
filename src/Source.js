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

        var self = this;

        d.delegate('mouseenter', this.element, 'li', function(e, target) {
            self.selectByElement(target);
        });
    }

    getSuggestion(item, group) {
        if (this.suggestions[item.value]) {
            return this.suggestions[item.value];
        }

        return (this.suggestions[item.value] = new Suggestion(
            item,
            this.settings.suggestions,
            group
        ));
    }

    getGroup(item) {
        if (!this.groups[item.label]) {
            this.groups[item.label] = new Group(item, this.settings.groups);
        }

        const group = this.groups[item.label];

        group.load(item.options.map(item => this.getSuggestion(item, group)));

        return group;
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
            this.result[this.current].select();
        }
    }

    selectNext() {
        if (this.result[this.current + 1]) {
            this.result[this.current].unselect();
            this.current++;

            if (this.result[this.current]) {
                this.result[this.current].select();
                this.result[this.current].scroll(this.element);
            }
        }
    }

    selectPrevious() {
        if (this.result[this.current - 1]) {
            this.result[this.current].unselect();
            this.current--;

            if (this.result[this.current]) {
                this.result[this.current].select();
                this.result[this.current].scroll(this.element, true);
            }
        }
    }

    selectByElement(element) {
        if (this.result[this.current]) {
            const key = this.result.findIndex(item => item.element === element);

            if (key !== -1) {
                this.result[this.current].unselect();
                this.current = key;
                this.result[this.current].select();
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
