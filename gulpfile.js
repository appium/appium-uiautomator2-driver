'use strict';

const gulp = require('gulp');
const boilerplate = require('appium-gulp-plugins').boilerplate.use(gulp);

boilerplate({
  build: 'appium-uiautomator2-driver',
  testTimeout: 120000,
  e2eTest: { android: true }
});
