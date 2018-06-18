/**
 * An individual suggestion
 * ------------------------
 */
export class Suggestion {
    constructor(data, parent) {
        this.data = data;
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
        element.innerHTML = this.data.label;
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
}

/**
 * A group of suggestions
 * ----------------------
 */
export class Group {
    constructor(data, parent) {
        this.data = data;
        this.parent = parent;
        this.suggestions = [];
        this.cache = {};

        this.element = document.createElement('li');
        this.contentElement = document.createElement('ul');

        this.render(this.element);
        this.element.appendChild(this.contentElement);

        if (data.options) {
            this.load(data.options);
        }
    }

    load(data) {
        this.contentElement.innerHTML = '';
        this.suggestions = data.map(d => this.loadSuggestion(d));
    }

    loadSuggestion(data) {
        if (!this.cache[data.value]) {
            this.cache[data.value] = this.createSuggestion(data, this.contentElement);
        }

        return this.cache[data.value];
    }

    createSuggestion(data, parent) {
        return new Suggestion(data, parent);
    }

    render(element) {
        element.innerHTML = `<strong>${this.data.label}</strong>`;
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

    constructor(parent = document.body) {
        this.closed = true;
        this.cache = {
            groups: {},
            suggestions: {},
        };
        this.data = [];
        this.suggestions = [];
        this.selectedKey = 0;

        this.element = this.render();
        parent.appendChild(this.element);

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

    createSuggestion(data, parent) {
        return new Suggestion(data, parent);
    }

    createGroup(data, parent) {
        return new Group(data, parent);
    }

    load(data) {
        this.element.innerHTML = '';
        this.data = data.map(data => {
            if ('options' in data) {
                const cache = this.cache.groups;

                if (!cache[data.label]) {
                    cache[data.label] = this.createGroup(data, this.element);
                } else {
                    cache[data.label].load(data.options);
                }

                return cache[data.label];
            }

            const cache = this.cache.suggestions;

            if (!cache[data.value]) {
                cache[data.value] = this.createSuggestion(data, this.element);
            }

            return cache[data.value];
        });

        if (this.query) {
            this.filter(this.query, false);
        }

        return this;
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

        return this;
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

        return this;
    }

    selectFirst() {
        return this.select(0);
    }

    selectNext() {
        return this.select(this.selectedKey + 1);
    }

    selectPrevious() {
        return this.select(this.selectedKey - 1);
    }

    close() {
        this.closed = true;
        this.element.classList.remove('is-open');
        this.element.dispatchEvent(new CustomEvent('suggestions:close'));

        return this;
    }

    open() {
        this.closed = false;
        this.element.classList.add('is-open');
        this.element.dispatchEvent(new CustomEvent('suggestions:open'));
        this.current && this.current.select();

        return this;
    }

    filter(query, clean = true) {
        query = clean ? cleanString(query) : query;

        if (!query.length) {
            return this.close();
        }

        this.query = query;
        query = query.split(' ');

        this.refresh(suggestion => {
            if (!suggestion.search) {
                suggestion.search = cleanString(
                    `${suggestion.data.label} ${suggestion.data.value}`
                );
            }

            return query.every(q => suggestion.search.indexOf(q) !== -1);
        });

        return this;
    }

    destroy() {
        this.element.remove();

        return this;
    }
}

/**
 * Create a Source that loads data with ajax
 * -----------------------------------------
 */
export class AjaxSource extends Source {
    constructor(endpoint, parent) {
        super(parent);
        this.endpoint = endpoint;
        this.cache = {
            groups: {},
            suggestions: {}
        };
    }

    filter(query, clean = false) {
        query = clean ? cleanString(query) : query;

        if (query.length < 2) {
            return this.close();
        }

        if (this.query === query) {
            return this.refresh(() => true);
        }

        this.query = query;

        if (!this.waiting) {
            return this.loadData(query)
                .then(() => this.refresh(() => true))
                .then(() => {
                    if (this.query && this.query !== query) {
                        this.filter(this.query);
                    }
                });
        }
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

        this.element.addEventListener('input', event => {
            const query = this.element.value;

            if (query) {
                this.source.filter(query);
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
                    } else if (this.element.value) {
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
        this.element.value = suggestion.data.value;
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
