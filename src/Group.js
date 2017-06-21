import d from 'd_js';
import Option from './Option.js';

export default class Group {
    constructor(label, data = [], settings = {}) {
        this.label = label;
        this.options = {};
        this.groups = {};
        this.settings = settings;
        this.load(data);
    }

    load(data) {
        this.data = data.map(item => {
            if (this.options[item.value]) {
                return this.options[item.value];
            }

            return (this.options[item.value] = new Option(item, this.settings));
        });
    }

    render() {
        const element = d.parse(`<li><strong>${this.label}</strong></li>`);
        const ul = d.parse('<ul></ul>');
        element.appendChild(ul);

        return [element, ul];
    }

    refresh(parent, query, selected) {
        if (!this.element) {
            this.element = this.render();
        }

        const [element, ul] = this.element;

        this.data.forEach(opt => opt.refresh(ul, query, selected));

        if (ul.childElementCount) {
            if (element.parentElement !== parent) {
                parent.appendChild(element);
            }
        } else if (element.parentElement === parent) {
            parent.removeChild(element);
        }
    }
}
