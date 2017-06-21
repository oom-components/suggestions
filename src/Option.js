import d from 'd_js';

export default class Option {
    constructor(data, settings = {}) {
        this.label = data.label;
        this.value = data.value;
        this.data = data;
        this.settings = settings;
        this.search = (this.label + ' ' + this.value).toLowerCase();
    }

    match(query) {
        return query && this.search.indexOf(query) !== -1;
    }

    render() {
        return d.parse(`<li>${this.label}</li>`);
    }

    refresh(parent, query, selected) {
        if (this.match(query)) {
            if (!this.element) {
                this.element = this.render();
            }

            if (this.element.parentElement !== parent) {
                parent.appendChild(this.element);
            }

            selected.push(this);
        } else {
            if (this.element && this.element.parentElement === parent) {
                parent.removeChild(this.element);
            }
        }
    }

    select() {
        this.element.classList.add('is-selected');
    }

    unselect() {
        this.element.classList.remove('is-selected');
    }
}
