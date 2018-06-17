/**
 * Class to manage an individual suggestion
 */
class Suggestion {
    static create(data, parent) {
        return new Suggestion(data, parent);
    }

    constructor(data, parent) {
        this.data = data;
        this.search = data.search;
        this.label = data.label;
        this.value = data.value;
        this.parent = parent;
        this.element = this.render();
    }

    render() {
        const element = document.createElement('li');
        element.innerHTML = this.label;

        return element;
    }

    refresh(filter) {
        this.unselect();

        if (filter(this)) {
            this.parent.appendChild(this.element);
        } else {
            this.element.remove();
        }
    }

    scroll(scrollGroup) {
        let rect = this.element.getBoundingClientRect();
        const parentRect = this.parent.getBoundingClientRect();

        if (parentRect.top - rect.top > 0) {
            this.parent.scrollTop -= parentRect.top - rect.top;
        } else if (parentRect.bottom < rect.bottom) {
            this.element.scrollIntoView(false);
        }

        if (scrollGroup && this.group && !this.element.previousElementSibling) {
            rect = this.group.wrapperElement.getBoundingClientRect();

            if (parentRect.top - rect.top > 0) {
                this.parent.scrollTop -= parentRect.top - rect.top;
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

/**
 * Class to group suggestions
 */
class Group {
    static create(data, parent) {
        const group = new Group(data, parent);

        if (data.options) {
            data.options.forEach(option => group.addSuggestion(Suggestion.create(option)));
        }
        
        return group;
    }

    constructor(data, parent) {
        this.data = data;
        this.label = data.label;
        this.parent = parent;
        this.element = this.render();
        this.suggestions = [];
    }

    addSuggestion(suggestion) {
        suggestion.parent = this.parent.content;
        this.suggestions.push(suggestion);
    }

    render() {
        const container = document.createElement('li');
        const content = document.createElement('ul');

        container.innerHTML = `<strong>${this.label}</strong>`;
        container.appendChild(content);

        return {container, content};
    }

    refresh(filter) {
        this.suggestions.forEach(suggestion => suggestion.refresh(filter));

        if (this.element.content.childElementCount) {
            this.parent.appendChild(this.element.container);
        } else {
            this.element.container.remove();
        }
    }
}

export default class Source {
    constructor(data, parent = document.body) {
        this.isClosed = true;
        this.suggestions = [];
        this.result = [];
        this.current = 0;

        this.element = this.render();
        parent.appendChild(this.element);

        if (data) {
            this.load(data);
        }

        delegate(this.element, 'mouseenter', 'li', (e, target) => {
            this.selectByElement(target);
        });
    }

    render() {
        return document.createElement('ul');
    }

    load(options) {
        this.suggestions = options.map(option => 
            option.options ? Group.create(option, this.element) : Suggestion.create(option, this.element)
        );
    }

    selectFirst() {
        this.current = 0;

        if (this.result[this.current]) {
            this.result[this.current].select();
        }
    }

    selectNext() {
        if (this.result[this.current + 1]) {
            this.result[this.current].unselect();
            this.current++;

            if (this.result[this.current]) {
                this.result[this.current].select();
                this.result[this.current].scroll(this.element);
            }
        }
    }

    selectPrevious() {
        if (this.result[this.current - 1]) {
            this.result[this.current].unselect();
            this.current--;

            if (this.result[this.current]) {
                this.result[this.current].select();
                this.result[this.current].scroll(this.element, true);
            }
        }
    }

    selectByElement(element) {
        if (this.result[this.current]) {
            const key = this.result.findIndex(item => item.element === element);

            if (key !== -1) {
                this.result[this.current].unselect();
                this.current = key;
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
        //this.element.innerHTML = '';
        this.element.classList.remove('is-open');
    }

    open() {
        this.isClosed = false;
        this.element.classList.add('is-open');
    }

    each(callback) {
        this.data.forEach(suggestion => {
            if (suggestion instanceof Group) {
                suggestion.data.forEach(item => callback(item, suggestion));

                if (suggestion.element.childElementCount) {
                    if (
                        suggestion.wrapperElement.parentElement !== this.element
                    ) {
                        this.element.appendChild(suggestion.wrapperElement);
                    }
                } else if (
                    suggestion.wrapperElement.parentElement === this.element
                ) {
                    suggestion.wrapperElement.remove();
                }
            } else {
                callback(suggestion, this);
            }
        });
    }

    refresh(filter) {
        this.suggestions.forEach(suggestion => suggestion.refresh(filter));

        if (this.element.childElementCount) {
            this.open();
        } else {
            this.close();
        }
    }

    filter(query) {
        query = cleanString(query);

        if (!query.length) {
            return this.close();
        }

        query = query.split(' ');

        this.refresh(suggestion => {
            if (!suggestion.search) {
                suggestion.search = cleanString(
                    suggestion.label + suggestion.value
                );
            }

            return query.every(q => suggestion.search.indexOf(q) !== -1);
        });
    }

    update(filter) {
        this.element.innerHTML = '';
        this.result = [];
        this.current = 0;

        this.each((suggestion, parent) => {
            suggestion.unselect();

            if (!filter || filter(suggestion)) {
                parent.element.appendChild(suggestion.element);
                this.result.push(suggestion);
            } else if (suggestion.element.parentElement === parent.element) {
                suggestion.element.remove();
            }
        });

        if (this.result.length) {
            this.selectFirst();
            this.open();
        } else {
            this.close();
        }
    }

    destroy() {
        this.element.remove();
    }
}

function cleanString(str) {
    const replace = {
        a: /á/gi,
        e: /é/gi,
        i: /í/gi,
        o: /ó/gi,
        u: /ú/gi
    };

    str = str.toLowerCase();

    for (let r in replace) {
        str = str.replace(replace[r], r);
    }

    return str
        .replace(/[^\wñç\s]/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function delegate(context, event, selector, callback) {
    context.addEventListener(
        event,
        function(event) {
            for (
                let target = event.target;
                target && target != this;
                target = target.parentNode
            ) {
                if (target.matches(selector)) {
                    callback.call(target, event, target);
                    break;
                }
            }
        },
        true
    );
}
