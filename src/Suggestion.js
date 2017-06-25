import d from 'd_js';

export default class Suggestion {
    constructor(data, settings) {
        this.data = data;
        this.value = settings.value ? data[settings.value] : data.value;
        this.label = settings.label
            ? data[settings.label]
            : data.label || this.value;

        this.search = settings.search || data.search;
        this.render = settings.render;
    }

    set search(search) {
        if (typeof search === 'function') {
            this.searchData = search(this);
        } else if (search) {
            this.searchData = search;
        } else {
            this.searchData = `${this.data.label || ''} ${this
                .value}`.toLowerCase();
        }
    }

    set render(render) {
        if (typeof render === 'function') {
            this.element = d.parse(`<li>${render(this)}</li>`);
        } else {
            this.element = d.parse(`<li>${this.data.label || this.value}</li>`);
        }
    }

    match(query) {
        return query && this.searchData.indexOf(query.toLowerCase()) !== -1;
    }

    refresh(parent, query, selected) {
        if (this.match(query)) {
            if (this.element.parentElement !== parent) {
                parent.appendChild(this.element);
                this.unselect();
            }
            selected.push(this);
        } else {
            if (this.element.parentElement === parent) {
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
