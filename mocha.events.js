/*global define*/
(function(window, factory) {
  // Set up Backbone appropriately for the environment.
  if (typeof exports !== 'undefined') {
    // Node/CommonJS, no need for jQuery in that case.
    factory(window, exports, require('backbone'), require('underscore'), require('sinon'), require('chai'));
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define(['underscore', 'backbone', 'sinon', 'chai', 'jquery', 'exports'], function(_, Backbone, sinon, chai, $, exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global Backbone.
      window.MochaEvents = factory(window, exports, Backbone, _, sinon, chai, $);
      return window.MochaEvents;
    });
  } else {
    // Browser globals
    window.MochaEvents = factory(window, {}, window.Backbone, window._, window.sinon, window.chai, (window.jQuery || window.Zepto || window.ender || window.$));
  }
}(this, function(window, MochaEvents, Backbone, _, sinon, chai, $) {
    'use strict';

    var expect = chai.expect,
        assert = chai.assert,
        afterEach = window.afterEach,
        beforeEach = window.beforeEach,
        it = window.it,
        describe = window.describe,
        preExistingKey = 'check_pre_existing_leak',
        backboneObjects = [],
        jQueryEventObjects = [],
        jQueryGuids = [];

    Backbone.Events.on(preExistingKey, function() {});
    $(window).on(preExistingKey, function() {});

    function getEventData(el) {
        if ($._data) {
            return $._data(el.get(0)).events || {};
        }
        else {
            return el.data('events');
        }
    }

    return function() {
        var checkEventCleanup;

        checkEventCleanup = function() {
            /* Backbone Event Cleanup */
            var backboneListeners = 0,
                jQueryListeners = 0;

            _(backboneObjects).each(function(obj) {
                if (obj._events) {
                    _(obj._events).each(function(events, key) {
                        _(events).each(function(event) {
                            if (event.context !== obj && !event.preExisting) {
                                backboneListeners += 1;
                            }
                        }, this);
                    }, this);
                }
            }, this);

            assert(
                backboneListeners === 0,
                'There are still ' + backboneListeners +
                ' active Backbone event listeners created in: ' +
                this.currentTest.title
            );

            /* jQuery Event Cleanup */
            jQueryListeners = 0;
            _(jQueryEventObjects).each(function(obj) {
                var events = getEventData(obj);
                if (events && _(events).size() > 0) {
                    _(events).each(function(typeEvents, type) {
                        _(typeEvents).each(function(event) {
                            var preExisting = _(jQueryGuids)
                                .indexOf(event.guid) === -1;

                            if (preExisting) {
                                // jQuery attaches a global unload handler
                                // for Ajax requests in IE that will never be
                                // unregistered, so we need to ignore that
                                if (obj !== window && type !== 'unload') {
                                    jQueryListeners += 1;
                                }
                            }
                        }, this);
                    }, this);
                }
            }, this);

            assert(
                jQueryListeners === 0,
                'There are still ' + jQueryListeners +
                ' active jQuery event listeners created in: ' +
                this.currentTest.title
            );
        };

        var sandbox;

        beforeEach(function() {
            var backboneRegister, backboneEventSpy, fnOn;

            sandbox = sinon.sandbox.create();

            /* Backbone Event Spying */
            backboneObjects = [
                Backbone.history,
                Backbone.Events
            ];

            backboneRegister = function(original) {
                return function() {
                    if (!this._eventLeakRegister) {
                        this._eventLeakRegister = true;
                        backboneObjects.push(this);
                    }
                    original.apply(this, arguments);
                };
            };

            backboneEventSpy = _(function(klass) {
                sandbox.stub(klass, 'on', backboneRegister(klass.on));
            }).bind(this);

            backboneEventSpy(Backbone.Model.prototype);
            backboneEventSpy(Backbone.View.prototype);
            backboneEventSpy(Backbone.Collection.prototype);
            backboneEventSpy(Backbone.Router.prototype);

            _(backboneObjects).each(function(obj) {
                _(obj._events).each(function(events, type) {
                    _(events).each(function(event) {
                        event.preExisting = true;
                    });
                });
            });

            /* jQuery Event Spying */
            jQueryEventObjects = [];

            fnOn = $.fn.on;
            jQueryGuids = [];
            sandbox.stub($.fn, 'on', function() {
                if (!this._eventLeakRegister) {
                    this._eventLeakRegister = true;
                    jQueryEventObjects.push(this);

                    var events = getEventData(this);
                    if (events) {
                        _(events).each(function(typeEvents, type) {
                            _(typeEvents).each(function(event) {
                                jQueryGuids.push(event.guid);
                            });
                        });
                    }
                }

                return fnOn.apply(this, arguments);
            });
        });

        afterEach(function() {
            sandbox.restore();
            checkEventCleanup.call(this);
        });

        describe('setup', function() {
            describe('events', function() {
                var check,
                    noop = function() {};

                beforeEach(function() {
                    check = _(function() {
                        checkEventCleanup.call(this);
                    }).bind(this);
                });

                it('should exclude pre-existing Backbone events from being ' +
                    'considered leaks', function() {
                    var noop = function() {};

                    expect(Backbone.Events._events[preExistingKey])
                        .to.be.an('array');

                    expect(Backbone.Events._events[preExistingKey].length)
                        .to.equal(1);

                    expect(check).to.not.throw();

                    Backbone.Events.on(preExistingKey, noop);

                    try {
                        expect(Backbone.Events._events[preExistingKey].length)
                            .to.equal(2);

                        expect(check).to.throw();

                        Backbone.Events.off(preExistingKey, noop);

                        expect(Backbone.Events._events[preExistingKey].length)
                            .to.equal(1);

                        expect(check).to.not.throw();
                    }
                    finally {
                        Backbone.Events.off(preExistingKey, noop);
                    }
                });

                it('should exclude pre-existing jQuery events from being ' +
                    'considered leaks', function() {
                    var noop = function() {};
                    var el = $(window);

                    expect(getEventData(el)[preExistingKey])
                        .to.be.an('array');

                    expect(getEventData(el)[preExistingKey].length)
                        .to.equal(1);

                    expect(check).to.not.throw();

                    el.on(preExistingKey, noop);

                    try {
                        expect(getEventData(el)[preExistingKey].length)
                            .to.equal(2);

                        expect(check).to.throw();

                        el.off(preExistingKey, noop);

                        expect(getEventData(el)[preExistingKey].length)
                            .to.equal(1);

                        expect(check).to.not.throw();
                    }
                    finally {
                        el.off(preExistingKey, noop);
                    }
                });

                it('should raise an exception if all Backbone.Model events ' +
                   'are not unregistered', function() {
                       var model = new Backbone.Model();
                       model.on('change', noop);

                       expect(check).to.throw();

                       model.off('change', noop);

                       expect(check).to.not.throw();
                   });

                it('should raise an exception if all Backbone.View events ' +
                   'are not unregistered', function() {
                       var view = new Backbone.View();
                       view.$el.off('remove', view.remove);

                       view.on('change', noop);

                       expect(check).to.throw();

                       view.off('change', noop);

                       expect(check).to.not.throw();
                   });

                it('should raise an exception if all Backbone.Collection ' +
                   'events are not unregistered', function() {
                       var collection = new Backbone.Collection();
                       collection.on('change', noop);

                       expect(check).to.throw();

                       collection.off('change', noop);

                       expect(check).to.not.throw();
                   });

                it('should raise an exception if all Backbone.Router ' +
                   'events are not unregistered', function() {
                       var router = new Backbone.Router();
                       router.on('change', noop);

                       expect(check).to.throw();

                       router.off('change', noop);

                       expect(check).to.not.throw();
                   });

                it('should raise an exception if all Backbone.Events ' +
                   'events are not unregistered', function() {
                       Backbone.Events.on('change', noop);

                       expect(check).to.throw();

                       Backbone.Events.off('change', noop);

                       expect(check).to.not.throw();
                   });

                it('should raise an exception if all Backbone.history ' +
                   'events are not unregistered', function() {
                       Backbone.history.on('change', noop);

                       expect(check).to.throw();

                       Backbone.history.off('change', noop);

                       expect(check).to.not.throw();
                   });

                it('should raise an exception if all jQuery ' +
                    'events registerd with $(...).on(...) are not ' +
                    'unregistered', function() {
                        $(window).on('resize', noop);

                        expect(check).to.throw();

                        $(window).off('resize', noop);

                        expect(check).to.not.throw();
                    });

                it('should raise an exception if all jQuery ' +
                   'events registered with $(...).ACTION(...) are not ' +
                   'unregisterd', function() {
                        $(window).click(noop);

                        expect(check).to.throw();

                        $(window).off('click', noop);

                        expect(check).to.not.throw();
                   });
            });
        });
    };
}));
