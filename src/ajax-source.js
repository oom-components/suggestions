import Source from './source.js';

export default class AjaxSource extends Source {
    constructor(endpoint, settings = {}) {
        super(settings);
        this.endpoint = endpoint;
        this.cache = {};
    }

    refresh(query) {
        if (query.length < 2) {
            return this.close();
        }

        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        this.query = query;

        if (this.cache[query]) {
            this.data = this.cache[query];
            delete this.query;
            this.update();
            return;
        }

        this.timeout = setTimeout(() => {
            fetch(this.endpoint + '?q=' + query, {
                headers: {
                    Accept: 'application/json'
                }
            })
                .then(res => {
                    if (res.status < 200 || res.status >= 400) {
                        throw new Error(
                            `The request status code is ${res.status}`
                        );
                    }

                    return res;
                })
                .then(res => res.json())
                .then(data => {
                    this.load(data);
                    this.cache[query] = this.data;
                    this.update();

                    clearTimeout(this.timeout);
                    delete this.timeout;

                    if (this.query && query !== this.query) {
                        query = this.query;
                        delete this.query;
                        return this.update();
                    }

                    delete this.query;
                });
        }, 200);
    }
}
