const keys = {
    40: 'ArrowDown',
    38: 'ArrowUp',
    13: 'Enter',
    27: 'Escape'
};

export default class Suggestions {
    constructor(element, source) {
        this.events = {};
        this.source = source;
        this.element = element;
        this.element.setAttribute('autocomplete', 'off');
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

        this.element.addEventListener('keydown', event => {
            const code = event.code || keys[event.keyCode];

            switch (code) {
                case 'ArrowDown':
                    event.preventDefault();

                    if (!this.source.isClosed) {
                        this.source.selectNext();
                    } else if (this.query) {
                        this.source.open();
                    }
                    break;

                case 'ArrowUp':
                    event.preventDefault();

                    if (!this.source.isClosed) {
                        this.source.selectPrevious();
                    }
                    break;

                case 'Enter':
                    if (!this.source.isClosed) {
                        const item = this.source.getCurrent();

                        this.element.value = item.label;
                        this.trigger('select', [item]);
                        this.source.close();
                        event.preventDefault();
                    }
                    break;

                case 'Escape':
                    this.source.close();
                    this.element.value = currValue;
                    break;
            }
        });

        delegate(this.source.element, 'click', 'li', (e, target) => {
            const item = this.source.getByElement(target);

            if (item) {
                this.element.value = item.label;
                this.trigger('select', [item]);
                this.source.close();
            }
        });
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }

        this.events[event].push(callback);
    }

    off(event, callback) {
        if (this.events[event]) {
            if (!callback) {
                delete this.events[event];
            } else {
                const index = this.events[event].indexOf(callback);

                if (index !== -1) {
                    this.events[event].splice(index, 1);
                }
            }
        }
    }

    trigger(event, args = []) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback.apply(this, args));
        }
    }

    destroy() {
        this.element.removeEventListener('input');
        this.element.removeEventListener('focus');
        this.element.removeEventListener('keydown');
        this.source.destroy();
    }
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
