# PW Suggestions

Javascript library to autocomplete/suggest values in inputs. It has the following features:

* Follows the progressive enhancement strategy: **if javascript fails, the web page keeps working**
* Can get the values from javascript objects,  `<datalist>` elements or ajax.
* Support for `<optgroups>`.
* Build with ES6.
* No default CSS styles provided (yes, it's a feature).

## Install

Requirements:

* NPM or Yarn to install [the package](https://www.npmjs.com/package/@oom/suggestions)

```sh
npm install @oom/suggestions
```

## Usage

### HTML

Let's start with the following html code:

```html
<form>
    <label>
        <input type="text" name="name" list="names" id="name-input">
    </label>
    <datalist id="names">
        <option value="ivan">Ivan</option>
        <option value="pablo">Pablo</option>
        <option value="maria">María</option>
        <option value="alejandro">Alejandro</option>
    </datalist>
</form>
```

### JS

Use javascript for a complete experience:

```js
import Suggestions from './suggestions.js';
import DatalistSource from './datalist-source.js';

//Get the input
const input = document.getElementById('name-input');

//Generate the available results from the related <datalist>
const source = new DatalistSource(input);

//Generate the suggestions joining the input and the source values
const suggestions = new Suggestions(input, source);
```

## API

### constructor

Create a new instance of `Suggestions`. The arguments are:

* `input` The input element
* `source` An instance of one of the available sources (see below)

### on

Register events in the page loader workflow. The available events are:

* `select` When the user select an option

```js
suggestions.on('select', option => {
    console.log('You has selected the option ', option.label);
});
```

### off

Unregister one or all callbacks of an event

```js
//unregister one callback
suggestions.on('select', callback1);

//unregister all callbacks
suggestions.on('select');
```

### destroy

Unbind all event listener and restore the inputs to the previous state.

### The available sources

As you can see, the constructor of the class `Suggestions` needs two arguments: the input and the source used to search and display the suggestions. There are different sources for different needs:

* `Source`: The base class extended by other sources. It can be used to load the sources from javascript objects.
* `DatalistSource`: Get the source from the `<datalist>` element associated to the input.
* `AjaxSource`: Get the source from an ajax request returning a json with the data.

Example with ajax:

```js
import Suggestions from './suggestions.js';
import AjaxSource from './ajax-source.js';

const suggestions = new Suggestions(
    document.getElementById('my-input'),
    new AjaxSource('/api/suggestions')
);
```

All sources have the following options:

Name | Type | Description
-----|------|------------
**parent** | `Node` | The parent node in which the suggestions are inserted in the DOM. By default is `document.body` for all sources but `DatalistSource` that uses the parent element of the `<datalist>` element.
**suggestions.render** | `function` | A function to customize the html of each suggestion.
**suggestions.label** | `string` | The object key used to generate the label of the suggestion. By default is `label`.
**suggestions.value** | `string` | The object key used to generate the value of the suggestion. By default is `value`.
**group.label** | `string` | The object key used to generate the label of the group of suggestion. By default is `label`.

Example:

```js
import Suggestions from './suggestions.js';
import AjaxSource from './ajax-source.js';

const suggestions = new Suggestions(
    document.getElementById('my-input'),
    new AjaxSource('/api/suggestions', {
        parent: document.getElementById('suggestions-wrapper'),
        suggestions: {
            label: 'title',
            value: 'id',
            render: function (option) {
                return `<strong>${option.label}</strong>`;
            }
        }
    })
);
```

## Demo

To run the demo, just clone this repository enter in the directory and execute:

```sh
npm install
npm start
```

You should see something in the following urls:

- Demo: `http://localhost:8080/demo`
- Test: `http://localhost:8080/test`
