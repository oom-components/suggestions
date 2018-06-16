# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) 
and this project adheres to [Semantic Versioning](http://semver.org/).

## UNRELEASED

### Changed

- Rename package to `@oom/suggestions`
- The `package.json` is now more browser-friendly using `browser` and `files` keys
- Browser tests

### Removed

- Webpack & babel tools. This package should work as native ES6 modules. Progressive enhancement strategy should fallback to css and html for old browsers.

## [0.5.1] - 2018-02-20

### Fixed

- The label/value config of suggestions/groups was not used always

## [0.5.0] - 2017-11-06

### Added

- New `search` property added to suggestions
- New property `query` containing the latest query used

### Changed

- Do not remove the suggestions on close, in order to allow to reopen it again with the same result
- On press the down arrow and the suggestions is closed but with result, reopen it again.

### Fixed

- Do not remove `ç` character in cleanString
- Close suggestions if the input value is empty

## [0.4.1] - 2017-10-27

### Fixed

- npm was ignoring required files on publish.

## [0.4.0] - 2017-10-27

### Added

- Allow to search words in different order

### Changed

- Removed non alphanumeric characters in the query.

### Removed

- ES2015 dist version has been removed. From now, this library is ES6 only. You must use Babel or other transpiler for old browsers compatibility.

## [0.3.3] - 2017-10-19

### Fixed

- Exported `Source` class

## [0.3.2] - 2017-10-19

### Changed

- Moved some code from `AjaxSource` and `DatalistSource` to `Source` in order to reuse it and allow to create more ways to load and consume sources.

## [0.3.1] - 2017-08-05

### Changed

- Upgraded `d_js` to 2.0.

## [0.3.0] - 2017-07-22

### Added

- New method `.destroy()` to unbind all events and restore the input to the previous state.

### Changed

- The escape key not only closes the list of suggestions but also restore the previous value
- Selected any element on mouseover (#1)

### Fixed

- Fixed scroll behaviour (#2)
- Switch from `fetch` to `XMLHttpRequest` to fix cors problems in firefox + browsersync (#3)

## [0.2.0] - 2017-07-03

### Added

- Auto-scroll the suggestions list if the currently selected element is not visible

### Changed

- Do not filter the suggestions in ajaxSource, it's supossed to be filtered by the server.

### Fixed

- Remove the `is-selected` class to the suggestions on refresh.

## 0.1.0 - 2017-06-25

First version with basic features

[0.5.1]: https://github.com/progressive-web-components/suggestions/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/progressive-web-components/suggestions/compare/v0.4.1...v0.5.0
[0.4.1]: https://github.com/progressive-web-components/suggestions/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/progressive-web-components/suggestions/compare/v0.3.3...v0.4.0
[0.3.3]: https://github.com/progressive-web-components/suggestions/compare/v0.3.2...v0.3.3
[0.3.2]: https://github.com/progressive-web-components/suggestions/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/progressive-web-components/suggestions/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/progressive-web-components/suggestions/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/progressive-web-components/suggestions/compare/v0.1.0...v0.2.0
