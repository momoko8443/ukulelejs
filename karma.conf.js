// Karma configuration
// Generated on Wed Jun 24 2015 00:04:53 GMT+0800 (中国标准时间)
var webpackConfig = require('./webpack.config');
module.exports = function(config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',
    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],
    // list of files / patterns to load in the browser
    files: [
      {pattern: 'test/**/*.ts' ,watch: false}
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test/**/*.ts':['webpack']
    },
    webpack: {
      module: webpackConfig.module,
      resolve:webpackConfig.resolve
    },
    webpackMiddleware: {
      // webpack-dev-middleware configuration
      // i. e.
      stats: 'errors-only'
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],
    //browsers: ['PhantomJS'],
    //plugins : ['karma-jasmine', 'karma-phantomjs-launcher', 'karma-chrome-launcher']

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    //singleRun: false,
    concurrency: Infinity
  });
};
