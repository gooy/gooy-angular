Gooy Angular
=======

[![GitHub version](https://badge.fury.io/gh/gooy%2Fgooy-angular.svg?style=flat-square)](http://badge.fury.io/gh/gooy%2Fgooy-angular)
[![Build Status](https://travis-ci.org/gooy/gooy-angular.svg?branch=master&style=flat-square)](https://travis-ci.org/gooy/gooy-angular)
[![Dependency Status](https://david-dm.org/gooy/gooy-angular.svg?style=flat-square)](https://david-dm.org/gooy/gooy-angular)
[![devDependency Status](https://david-dm.org/gooy/gooy-angular/dev-status.svg?style=flat-square)](https://david-dm.org/gooy/gooy-angular#info=devDependencies)  
[![ES6 format](https://img.shields.io/badge/JS_format-es6-orange.svg?style=flat-square)](http://www.ecmascript.org/)
[![JSPM](https://img.shields.io/badge/JSPM-gooy/gooy--angular-db772b.svg?style=flat-square)](http://jspm.io)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](http://opensource.org/licenses/MIT)

This is a bootstrapper to create application in ES6 driven by Angular 1.x.

Every module can have a `static metadata()` method to descibe how it should be registered with the framework.  
It can also ask for variables from the dependency injection by using an `static inject()` method.  
The variables will get injected into the component's constructor function.

A modified version of the Aurelia bootstrapper is used to bootstrap the application.

Automatically applied polyfills:

- [core-js](https://github.com/zloirock/core-js)
- [html-template-element](https://github.com/aurelia/html-template-element)
- [scoped-polyfill](https://github.com/PM5544/scoped-polyfill)

## Installation

    jspm install gooy/gooy-angular

## Usage

Look at the [gooy/gooy-angular-demo](http://github.com/gooy/gooy-angular-demo) for a code example.

## Demo

- [Demo App](http://gooy.github.io/gooy-angular-demo)


## Disclaimer

This is an experimental package and no support will be provided, use at your own risk.

:octocat: Pull requests are always welcome and issues might be considered.  
But keep in mind this is just a simple bootstrapper for Angular 1.x, so be sure to not report Angular issues here.
