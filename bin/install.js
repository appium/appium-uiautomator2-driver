/* eslint-disable no-console */
/* eslint-disable promise/prefer-await-to-then */
/* eslint-disable promise/prefer-await-to-callbacks */
"use strict";

const exec = require("child_process").exec;
const path = require("path");


const MAX_ATTEMPTS = process.env.SERVER_INSTALL_ATTEMPTS || 5;
const INTERVAL = 1500;
let attemptedToBuild = false;

function doInstall () {
  // UiAutomator2 needs Java. Fail early if it doesn't exist
  let androidHelpers = require('appium-android-driver').androidHelpers;
  androidHelpers.getJavaVersion().then(function () {
    let tries = 0;
    function onErr (err) {
      console.log(err.message);
      let codeNotBuilt = err.message.indexOf('Cannot find module') !== -1;
      if (tries >= MAX_ATTEMPTS) {
        console.log("Tried too many times to install UiAutomator2, failing");
        console.log("Original error: " + err.message);
        throw new Error("Unable to import and run the installer. " +
                        "If you're running from source, run `gulp transpile` " +
                        "and then re-run `npm install`");
      }
      tries++;
      if (codeNotBuilt && !attemptedToBuild) {
        attemptedToBuild = true;
        console.log("Attempting to transpile setup code...");
        exec("npm run transpile", {cwd: path.resolve(__dirname, "..")}, function (err) {
          if (err) {
            console.warn("Setup code could not be transpiled: " + err.message);
          } else {
            console.log("Setup code successfully transpiled");
          }
          setTimeout(runInstall, INTERVAL);
        });
      } else {
        console.log("UiAutomator2 setup files do not yet exist, waiting...");
        setTimeout(runInstall, INTERVAL);
      }
    }

    function runInstall () {
      try {
        const setupUiAutomator2 = require('../build/lib/installer').setupUiAutomator2;
        setupUiAutomator2().catch(onErr);
      } catch (err) {
        onErr(err);
      }
    }
    runInstall();
  }).catch(function () {
    console.error("Could not find JAVA, skipping UiAutomator2 install.");
  });

}

if (require.main === module) {
  doInstall();
}
