# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) 
and this project adheres to [Semantic Versioning](http://semver.org/).

## 0.3.3 - 2017-10-19

### Fixed

* Exported `Source` class

## 0.3.2 - 2017-10-19

### Changed

* Moved some code from `AjaxSource` and `DatalistSource` to `Source` in order to reuse it and allow to create more ways to load and consume sources.

## 0.3.1 - 2017-08-05

### Changed

* Upgraded `d_js` to 2.0.

## 0.3.0 - 2017-07-22

### Added

* New method `.destroy()` to unbind all events and restore the input to the previous state.

### Changed

* The escape key not only closes the list of suggestions but also restore the previous value
* Selected any element on mouseover (#1)

### Fixed

* Fixed scroll behaviour (#2)
* Switch from `fetch` to `XMLHttpRequest` to fix cors problems in firefox + browsersync (#3)

## 0.2.0 - 2017-07-03

### Added

* Auto-scroll the suggestions list if the currently selected element is not visible

### Changed

* Do not filter the suggestions in ajaxSource, it's supossed to be filtered by the server.

### Fixed

* Remove the `is-selected` class to the suggestions on refresh.

## 0.1.0 - 2017-06-25

First version with basic features
