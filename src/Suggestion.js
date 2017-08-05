export default class Suggestion {
    constructor(data, settings = {}, group) {
        this.data = data;
        this.group = group;
        this.value = settings.value ? data[settings.value] : data.value;
        this.label = settings.label
            ? data[settings.label]
            : data.label || this.value;

        //Render
        this.element = document.createElement('li');

        if (typeof settings.render === 'function') {
            this.element.innerHTML = settings.render(this);
        } else {
            this.element.innerHTML = this.data.label || this.value;
        }
    }

    refresh(parent, query, selected) {
        if (this.match(query)) {
            parent.append(this.element);
            this.unselect();
            selected.push(this);
        } else {
            if (this.element.parentElement === parent) {
                this.element.remove();
            }
        }
    }

    detach() {
        this.element.remove();
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
