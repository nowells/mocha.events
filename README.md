Mocha.Events
============

[![Build
Status](https://travis-ci.org/nowells/mocha.events.png?branch=master)](https://travis-ci.org/nowells/mocha.events)

Automatically test for event cleanup for Backbone and jQuery in your Mocha
tests.

Usage
-----

This library assumes that you have the following modules defined in your
RequireJS config, or have these variables loaded on the global window object if
you do not use RequireJS:

* chai
* sinon
* mocha
* backbone
* jQuery
* underscore

Building
--------

To get started developing Mocha.Events you must first run two commands to
install all of the dependencies:

    npm install
    bower install

In order to compile the Mocha.Events code for release you must run:

	grunt

Which will generate `mocha.events.min.js` in the root of the project. Whenever
you wish to run this command, please be sure to increment the version defined
in `package.json` as well as `bower.json`.

Tests
-----

There are two ways to run tests:

	npm test

Or if you want more control over how your tests are run (such as continuous
testing with auto-running tests on file changes you can run:

	./node_modules/.bin/karma start --dev --browsers Chrome,PhantomJS

