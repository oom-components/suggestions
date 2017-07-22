import d from 'd_js';

export default class Suggestion {
    constructor(data, settings = {}, group) {
        this.data = data;
        this.group = group;
        this.value = settings.value ? data[settings.value] : data.value;
        this.label = settings.label
            ? data[settings.label]
            : data.label || this.value;

        //Render
        if (typeof settings.render === 'function') {
            this.element = d.parse(`<li>${settings.render(this)}</li>`);
        } else {
            this.element = d.parse(`<li>${this.data.label || this.value}</li>`);
        }
    }

    refresh(parent, query, selected) {
        if (this.match(query)) {
            parent.appendChild(this.element);
            this.unselect();
            selected.push(this);
        } else {
            if (this.element.parentElement === parent) {
                parent.removeChild(this.element);
            }
        }
    }

    detach() {
        if (this.element.parentElement) {
            this.element.parentElement.removeChild(this.element);
        }
    }

    scroll(parent, scrollGroup) {
        let rect = this.element.getBoundingClientRect();
        const parentRect = parent.getBoundingClientRect();

        if (parentRect.top - rect.top > 0) {
            parent.scrollTop -= parentRect.top - rect.top;
        } else if (parentRect.bottom < rect.bottom) {
            this.element.scrollIntoView(false);
        }

        if (scrollGroup && this.group && !this.element.previousElementSibling) {
            rect = this.group.wrapperElement.getBoundingClientRect();

            if (parentRect.top - rect.top > 0) {
                parent.scrollTop -= parentRect.top - rect.top;
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
