import d from 'd_js';
import Option from './Option.js';
import Group from './Group.js';

export default class Result {
    constructor(data = [], settings = {}) {
        this.settings = settings;
        this.options = {};
        this.groups = {};
        this.load(data);
        this.isClosed = true;
    }

    load(data) {
        this.data = data.map(item => {
            if (item.options) {
                if (!this.groups[item.label]) {
                    return (this.groups[item.label] = new Group(
                        item.label,
                        item.options,
                        this.settings
                    ));
                }

                this.groups[item.label].load(item.options);
                return this.groups[item.label];
            }

            if (this.options[item.value]) {
                return this.options[item.value];
            }

            return (this.options[item.value] = new Option(item, this.settings));
        });
    }

    render() {
        this.element = d.parse('<ul></ul>');
        (this.settings.parent || document.body).appendChild(this.element);
    }

    refresh(query) {
        if (!this.element) {
            this.render();
        }

        this.result = [];
        this.current = 0;
        this.data.forEach(opt => opt.refresh(this.element, query, this.result));

        if (this.result[this.current]) {
            this.result.forEach(option => option.unselect());
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

    getCurrentValue() {
        if (this.result[this.current]) {
            return this.result[this.current].value;
        }
    }

    close() {
        this.isClosed = true;
        this.element.innerHTML = '';
        this.element.classList.remove('is-open');
    }
}
