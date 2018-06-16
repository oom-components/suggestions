/**
 * Class to manage an individual suggestion
 */
class Suggestion {
    constructor(data, settings = {}, group) {
        this.data = data;
        this.group = group;
        this.value = settings.value ? data[settings.value] : data.value;
        this.search = data.search;
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

/**
 * Class to group suggestions
 */
class Group {
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

export default class Source {
    constructor(settings = {}) {
        this.settings = settings;
        this.settings.groups = this.settings.groups || {};
        this.settings.suggestions = this.settings.suggestions || {};

        this.suggestions = {};
        this.groups = {};
        this.isClosed = true;
        this.result = [];
        this.current = 0;

        this.element = document.createElement('ul');
        (this.settings.parent || document.body).append(this.element);

        delegate(this.element, 'mouseenter', 'li', (e, target) => {
            this.selectByElement(target);
        });
    }

    getSuggestion(item, group) {
        const key = item[this.settings.suggestions.value || 'value'];

        if (this.suggestions[key]) {
            return this.suggestions[key];
        }

        return (this.suggestions[key] = new Suggestion(
            item,
            this.settings.suggestions,
            group
        ));
    }

    getGroup(item) {
        const key = item[this.settings.groups.label || 'label'];

        if (!this.groups[key]) {
            this.groups[key] = new Group(item, this.settings.groups);
        }

        const group = this.groups[key];

        group.load(item.options.map(item => this.getSuggestion(item, group)));

        return group;
    }

    load(data) {
        this.data = data.map(
            item =>
                item.options ? this.getGroup(item) : this.getSuggestion(item)
        );
    }

    append(child) {
        this.element.appendChild(child);
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

    refresh(query) {
        query = cleanString(query);

        if (!query.length) {
            return this.close();
        }

        query = query.split(' ');

        this.update(suggestion => {
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
