require.config({
    baseUrl: '/base',

    paths: {
        // Application Dependencies
        underscore:           'bower_components/underscore/underscore',
        backbone:             'bower_components/backbone-amd/backbone',
        jquery:               'bower_components/jquery/jquery',
        chai:                 'bower_components/chai/chai',
        sinon:                'bower_components/sinonjs/sinon'
    },

    shim: {
        backbone: {
            deps: ['jquery', 'underscore'],
            exports: 'Backbone'
        },
        sinon: {
            exports: 'sinon'
        },
        underscore: {
            exports: '_'
        }
    },
    enforceDefine: true
});

require([
    'require',
    'mocha.events'
], function(require, mochaSetup) {
    mochaSetup();
    window.__karma__.start();
});
