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
        Name: <input type="text" name="name" list="names" id="name-input">
    </label>

    <datalist id="names">
        <option value="ivan">Ivan</option>
        <option value="pablo">Pablo</option>
        <option value="maria">María</option>
        <option value="alejandro">Alejandro</option>
    </datalist>

    <button type="submit">Send</button>
</form>
```

### JS

Use javascript for a complete experience:

```js
import { Suggestions, Source } from './suggestions.js';

const input = document.getElementById('name-input');
const datalist = document.getElementById('names');

//Generate the available results from the <datalist>
const source = Source.createFromElement(datalist);

//Generate the suggestions joining the input and the source values
const suggestions = new Suggestions(input, source);
```

## API

### constructor

Create a new instance of `Suggestions`. The arguments are:

* `input` The input element
* `source` An instance of one of the available sources (see below)

### destroy

Unbind all event listener and restore the inputs to the previous state.

### The available sources

As you can see, the constructor of the class `Suggestions` needs two arguments: the input and the source used to search and display the suggestions. There are different sources for different needs:

* `Source`: The base class extended by other sources. It can be used to load the sources from javascript objects or using a `<datalist>` or `<select>`.
* `AjaxSource`: Get the source from an ajax request returning a json with the data.

Example with ajax:

```js
import { Suggestions, AjaxSource } from './suggestions.js';

const suggestions = new Suggestions(
    document.getElementById('my-input'),
    new AjaxSource('/api/suggestions')
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
