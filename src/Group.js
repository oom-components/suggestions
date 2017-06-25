import d from 'd_js';

export default class Group {
    constructor(data, settings) {
        this.data = data;
        this.label = settings.label ? data[settings.label] : data.label;

        this.render = settings.render;
    }

    set render(render) {
        let element;

        if (render) {
            element = d.parse(`<li>${render(this)}</li>`);
        } else {
            element = d.parse(`<li><strong>${this.label}</strong></li>`);
        }

        const ul = d.parse('<ul></ul>');
        element.appendChild(ul);

        this.element = [element, ul];
    }

    load(data) {
        this.element[1].innerHTML = '';
        this.data = data;
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
