"use strict";

var gulp = require('gulp'),
    boilerplate = require('appium-gulp-plugins').boilerplate.use(gulp);

boilerplate({
  build: 'appium-uiautomator2-driver',
  jscs: false,
  testTimeout: 120000,
  e2eTest: { android: true }
});
