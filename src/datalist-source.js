import Source from './source.js';

export default class DatalistSource extends Source {
    constructor(input, parent) {
        const listElement = input.ownerDocument.getElementById(
            input.getAttribute('list')
        );

        input.removeAttribute('list');
        super(getAvailableOptions(listElement), parent || listElement.parentElement);

        this.input = input;
        this.listId = input.getAttribute('list');
    }

    destroy() {
        this.input.setAttribute('list', this.listId);
        super.destroy();
    }
}

function getAvailableOptions(element) {
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
