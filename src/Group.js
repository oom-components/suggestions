import d from 'd_js';

export default class Group {
    constructor(data, settings = {}) {
        this.data = data;
        this.label = settings.label ? data[settings.label] : data.label;

        this.element = d.parse('<ul></ul>');
        this.wrapperElement = d.parse(
            `<li><strong>${this.label}</strong></li>`
        );
        this.wrapperElement.appendChild(this.element);
    }

    load(data) {
        this.element.innerHTML = '';
        this.data = data;
    }

    append(child) {
        this.element.appendChild(child);
    }

    refresh(parent, query, selected) {
        const [element, ul] = this.element;

        this.data.forEach(suggestion =>
            suggestion.refresh(ul, query, selected)
        );

        if (ul.childElementCount) {
            if (element.parentElement !== parent) {
                parent.appendChild(element);
            }
        } else if (element.parentElement === parent) {
            parent.removeChild(element);
        }
    }
}
