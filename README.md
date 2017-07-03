# PW Suggestions

Javascript library to autocomplete/suggest values in inputs. It has the following features:

* Follows the progressive enhancement strategy: **if javascript fails, the web page keeps working**
* Can get the values from `<datalist>` or ajax.
* Support for `<optgroups>`.
* No default CSS styles provided (yes, it's a feature).

## Install

Requirements:

* NPM or Yarn to install [the package and the dependencies](https://www.npmjs.com/package/pw-suggestions)
* Webpack (or any other javascript loader)

```sh
npm install pw-suggestions
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
import {Suggestions, DatalistSource} from 'pw-suggestions';

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

### The available sources

As you can see, the constructor of the class `Suggestions` needs two arguments: the input and the source used to search and display the suggestions. There are different sources for different needs:

* `DatalistSource`: Get the source from the `<datalist>` element associated to the input.
* `AjaxSource`: Get the source from an ajax request returning a json with the data.

Example with ajax:

```js
import {Suggestions, AjaxSource} from 'pw-suggestions';

const suggestions = new Suggestions(
    document.getElementById('my-input'),
    new AjaxSource('/api/suggestions')
);
```

All sources have the following options:

Name | Type | Description
-----|------|------------
**parent** | `Node` | The parent node in which the suggestions are inserted in the DOM. By default is `document.body` unless `DatalistSource` that uses the parent element of the `<datalist>` element.
**suggestions.render** | `function` | A function to customize the html of each suggestion.
**suggestions.label** | `string` | The object key used to generate the label of the suggestion. By default is `label`.
**suggestions.value** | `string` | The object key used to generate the value of the suggestion. By default is `value`.
**group.label** | `string` | The object key used to generate the label of the group of suggestion. By default is `label`.

Example:

```js
import {Suggestions, AjaxSource} from 'pw-suggestions';

const suggestions = new Suggestions(
    document.getElementById('my-input'),
    new AjaxSource('/api/suggestions', {
        parent: document.getElementById('suggestions-wrapper'),
        suggestions: {
            label: 'title',
            value: 'id',
            search: function (option) {
                return option.label + option.value + option.data.description;
            },
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

You should see something in `http://localhost:8080/`
