# PW Suggestions

Javascript library to autocomplete/suggest values in inputs. It has the following features:

* Follows the progressive enhancement strategy: **if javascript fails, the web page keeps working**
* Can get the values from `<datalist>` or ajax.

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
import {Suggestions} from 'pw-suggestions';

//Init the suggestion loader
const loader = new Suggestions(document.getElementById('name-input'));
```

## Demo

To run the demo, just clone this repository enter in the directory and execute:

```sh
npm install
npm start
```

You should see something in `http://localhost:8080/`
