import d from 'd_js';
import Result from './Result.js';

export default class AjaxResult extends Result {
    constructor(endpoint, settings = {}) {
        super([], settings);
        this.endpoint = endpoint;
        this.cache = {};
    }

    refresh(query) {
        if (!this.element) {
            this.render();
        }

        if (this.cache[query]) {
            this.load(this.cache[query]);
            super.refresh(query);
            return;
        }

        fetch(this.endpoint + '?q=' + query)
            .then(response => response.json())
            .then(data => {
                this.cache[query] = data;
                this.load(data);
                super.refresh(query);
            });
    }
}
