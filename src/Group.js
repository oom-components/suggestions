export default class Group {
    constructor(data, settings = {}) {
        this.data = data;
        this.label = settings.label ? data[settings.label] : data.label;

        this.element = document.createElement('ul');
        this.wrapperElement = document.createElement('li');
        this.wrapperElement.innerHTML = `<strong>${this.label}</strong>`;
        this.wrapperElement.append(this.element);
    }

    load(data) {
        this.element.innerHTML = '';
        this.data = data;
    }

    append(child) {
        this.element.append(child);
    }

    refresh(parent, query, selected) {
        const [element, ul] = this.element;

        this.data.forEach(suggestion =>
            suggestion.refresh(ul, query, selected)
        );

        if (ul.childElementCount) {
            if (element.parentElement !== parent) {
                parent.append(element);
            }
        } else if (element.parentElement === parent) {
            element.remove();
        }
    }
}
