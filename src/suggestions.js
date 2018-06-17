/**
 * An individual suggestion
 * ------------------------
 */
export class Suggestion {
    static create(data, parent) {
        return new Suggestion(data, parent);
    }

    constructor(data, parent) {
        this.data = data;
        this.search = data.search;
        this.label = data.label;
        this.value = data.value;
        this.parent = parent;

        this.element = document.createElement('li');
        this.render(this.element);

        this.element.addEventListener('mouseenter', e => {
            this.element.dispatchEvent(
                new CustomEvent('suggestion:hover', {
                    detail: this,
                    bubbles: true
                })
            );
        });

        this.element.addEventListener('click', e => {
            this.element.dispatchEvent(
                new CustomEvent('suggestion:click', {
                    detail: this,
                    bubbles: true
                })
            );
        });
    }

    get selected() {
        return this.element.classList.contains('is-selected');
    }

    render(element) {
        element.innerHTML = this.label;
    }

    refresh(result, filter) {
        this.unselect();

        if (filter(this)) {
            this.parent.appendChild(this.element);
            result.push(this);
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
        this.element.dispatchEvent(
            new CustomEvent('suggestion:select', {
                detail: this,
                bubbles: true
            })
        );
    }

    unselect() {
        this.element.classList.remove('is-selected');
        this.element.dispatchEvent(
            new CustomEvent('suggestion:unselect', {
                detail: this,
                bubbles: true
            })
        );
    }
}

/**
 * Suggestions groups
 * ------------------
 */
export class Group {
    static create(data, parent) {
        const group = new Group(data, parent);

        if (data.options) {
            data.options.forEach(option =>
                group.addSuggestion(Suggestion.create(option))
            );
        }

        return group;
    }

    constructor(data, parent) {
        this.data = data;
        this.label = data.label;
        this.parent = parent;
        this.suggestions = [];

        this.element = document.createElement('li');
        this.contentElement = document.createElement('ul');

        this.render(this.element);
        this.element.appendChild(this.contentElement);
    }

    addSuggestion(suggestion) {
        suggestion.parent = this.contentElement;
        this.suggestions.push(suggestion);
    }

    render(element) {
        element.innerHTML = `<strong>${this.label}</strong>`;
    }

    refresh(result, filter) {
        this.suggestions.forEach(suggestion =>
            suggestion.refresh(result, filter)
        );

        if (this.contentElement.childElementCount) {
            this.parent.appendChild(this.element);
        } else {
            this.element.remove();
        }
    }
}

/**
 * Manage a data source
 * (groups and suggestions)
 * ------------------------
 */
export class Source {
    //Create a source from a <datalist> or <select> element
    static createFromElement(options, parent) {
        return new Source(
            getOptionsFromElement(options),
            parent || options.parentElement
        );
    }

    constructor(data, parent = document.body) {
        this.closed = true;
        this.data = [];
        this.suggestions = [];
        this.selectedKey = 0;

        this.element = this.render();
        parent.appendChild(this.element);

        if (data) {
            this.load(data);
        }

        this.element.addEventListener('suggestion:hover', e => {
            this.select(
                this.suggestions.findIndex(
                    suggestion => suggestion === e.detail
                )
            );
        });

        this.element.addEventListener('suggestion:click', e => {
            this.select(
                this.suggestions.findIndex(
                    suggestion => suggestion === e.detail
                )
            );
        });
    }

    get current() {
        const curr = this.suggestions[this.selectedKey];

        if (curr && curr.selected) {
            return curr;
        }
    }

    render() {
        return document.createElement('ul');
    }

    createSuggestion(option) {
        return option.options
            ? Group.create(option, this.element)
            : Suggestion.create(option, this.element);
    }

    load(options) {
        this.data = options.map(option => this.createSuggestion(option));
    }

    refresh(filter) {
        this.suggestions = [];
        this.data.forEach(suggestion =>
            suggestion.refresh(this.suggestions, filter)
        );

        if (this.element.childElementCount) {
            this.open();
        } else {
            this.close();
        }

        if (!this.current) {
            this.selectFirst();
        }
    }

    select(key) {
        if (this.suggestions[key]) {
            if (this.suggestions[this.selectedKey]) {
                this.suggestions[this.selectedKey].unselect();
            }

            this.suggestions[key].select();
            this.suggestions[key].scroll(this.element);
            this.selectedKey = key;
        }
    }

    selectFirst() {
        this.select(0);
    }

    selectNext() {
        this.select(this.selectedKey + 1);
    }

    selectPrevious() {
        this.select(this.selectedKey - 1);
    }

    close() {
        this.closed = true;
        this.element.classList.remove('is-open');
        this.element.dispatchEvent(new CustomEvent('suggestions:close'));
    }

    open() {
        this.closed = false;
        this.element.classList.add('is-open');
        this.element.dispatchEvent(new CustomEvent('suggestions:open'));
        this.current && this.current.select();
    }

    filter(query, clean = true) {
        query = clean ? cleanString(query) : query;

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

    destroy() {
        this.element.remove();
    }
}

/**
 * Create a Source that loads data with ajax
 * -----------------------------------------
 */
export class AjaxSource extends Source {
    constructor(endpoint, parent) {
        super(null, parent);
        this.endpoint = endpoint;
        this.cache = {
            groups: {},
            suggestions: {}
        };
    }

    createSuggestion(option) {
        if (option.options) {
            const key = option.label;

            if (!(key in this.cache.groups)) {
                this.cache.groups[key] = super.createSuggestion(option);
            }

            return this.cache.groups[key];
        }

        const key = option.value;

        if (!(key in this.cache.suggestions)) {
            this.cache.suggestions[key] = super.createSuggestion(option);
        }

        return this.cache.suggestions[key];
    }

    filter(query, clean = false) {
        query = clean ? cleanString(query) : query;

        if (query.length < 2) {
            return this.close();
        }

        if (!this.waiting) {
            return this.loadData(query)
                .then(() => this.refresh(() => true))
                .then(() => {
                    if (this.queryQeue && this.queryQeue !== query) {
                        query = this.queryQeue;
                        delete this.queryQeue;

                        this.filter(query);
                    }
                });
        }

        this.queryQeue = query;
    }

    loadData(query) {
        if (this.cache[query]) {
            this.data = this.cache[query];
            return Promise.resolve();
        }

        this.waiting = true;

        return getJson(this.endpoint + '?q=' + query)
            .catch(err => console.error(err))
            .then(data => {
                this.load(data);
                this.cache[query] = this.data;

                return new Promise(resolve =>
                    setTimeout(() => {
                        this.waiting = false;
                        resolve();
                    }, 200)
                );
            });
    }
}

/**
 * Join an input element with suggestions source
 * ---------------------------------------------
 */
export class Suggestions {
    constructor(element, source) {
        this.source = source;
        this.element = element;
        this.element.setAttribute('autocomplete', 'off');
        this.element.removeAttribute('list');
        this.query = null;

        this.element.addEventListener('input', event => {
            this.query = this.element.value || null;

            if (this.query) {
                this.source.filter(this.query);
            } else {
                this.source.close();
            }
        });

        let currValue;

        this.element.addEventListener('focus', event => {
            currValue = this.element.value;
        });

        const keys = {
            40: 'ArrowDown',
            38: 'ArrowUp',
            13: 'Enter',
            27: 'Escape'
        };

        this.element.addEventListener('keydown', event => {
            const code = event.code || keys[event.keyCode];

            switch (code) {
                case 'ArrowDown':
                    event.preventDefault();

                    if (!this.source.closed) {
                        this.source.selectNext();
                    } else if (this.query) {
                        this.source.open();
                    }
                    break;

                case 'ArrowUp':
                    event.preventDefault();

                    if (!this.source.closed) {
                        this.source.selectPrevious();
                    }
                    break;

                case 'Enter':
                    if (!this.source.closed) {
                        this.select(this.source.current);
                        event.preventDefault();
                    }
                    break;

                case 'Escape':
                    this.source.close();
                    this.element.value = currValue;
                    break;
            }
        });

        this.source.element.addEventListener('suggestion:click', e => {
            this.select(e.detail);
        });
    }

    select(suggestion) {
        this.element.value = suggestion.label;
        this.element.dispatchEvent(
            new CustomEvent('suggestion:choosen', { detail: suggestion })
        );
        this.source.close();
    }

    destroy() {
        this.element.removeEventListener('input');
        this.element.removeEventListener('focus');
        this.element.removeEventListener('keydown');
        this.source.destroy();
    }
}

/**
 * Helpers
 * -------
 */
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

function getOptionsFromElement(element) {
    const data = [];

    element.querySelectorAll('optgroup').forEach(optgroup => {
        const options = [];

        optgroup.querySelectorAll('option').forEach(option =>
            options.push(
                Object.assign(
                    {
                        label: option.label,
                        value: option.value
                    },
                    option.dataset
                )
            )
        );

        data.push({
            label: optgroup.label,
            options: options
        });
    });

    element.querySelectorAll('option').forEach(option => {
        if (option.parentElement.tagName !== 'OPTGROUP') {
            data.push(
                Object.assign(
                    {
                        label: option.label,
                        value: option.value
                    },
                    option.dataset
                )
            );
        }
    });

    return data;
}

function getJson(url) {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();

        request.open('GET', url, true);
        request.setRequestHeader('Accept', 'application/json');

        request.onload = () => {
            if (request.status >= 200 && request.status < 400) {
                resolve(JSON.parse(request.responseText));
            } else {
                reject(`The request status code is ${request.status}`);
            }
        };

        request.send();
    });
}
