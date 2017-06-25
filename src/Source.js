import d from 'd_js';
import Suggestion from './Suggestion.js';
import Group from './Group.js';

export default class Source {
    constructor(data = [], settings = {}) {
        this.settings = settings;
        this.settings.groups = this.settings.groups || {};
        this.settings.suggestions = this.settings.suggestions || {};

        this.suggestions = {};
        this.groups = {};
        this.load(data);
        this.isClosed = true;

        this.element = this.render();
        (this.settings.parent || document.body).appendChild(this.element);
    }

    render() {
        return d.parse('<ul></ul>');
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

    refresh(query) {
        this.element.innerHTML = '';
        this.result = [];
        this.current = 0;

        if (!query) {
            return this.close();
        }

        this.data.forEach(suggestion =>
            suggestion.refresh(this.element, query, this.result)
        );

        if (this.result[this.current]) {
            this.result[this.current].select();
            this.element.classList.add('is-open');
            this.isClosed = false;
        } else {
            this.close();
        }
    }

    selectNext() {
        if (this.result[this.current + 1]) {
            this.result[this.current].unselect();
            this.current++;

            if (this.result[this.current]) {
                this.result[this.current].select();
            }
        }
    }

    selectPrevious() {
        if (this.result[this.current - 1]) {
            this.result[this.current].unselect();
            this.current--;

            if (this.result[this.current]) {
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
}
