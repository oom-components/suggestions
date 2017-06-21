import { Suggestions, AjaxResult } from '../src';

const search = new Suggestions(document.getElementById('search'));
const results = new AjaxResult('data.json');
const search2 = new Suggestions(
    document.getElementById('search-ajax'),
    results
);
