#!/bin/bash
concurrently \
"export PLATFORM_VERSION=7.0 && export DEVICE_NAME='Samsung Galaxy S6 GoogleAPI Emulator' && mocha -t 7000000 build/test/functional/commands/find/" \ 
"echo FUCK!!!!" \ 
"export PLATFORM_VERSION=7.0 && export DEVICE_NAME='Samsung Galaxy S6 GoogleAPI Emulator' && mocha -t 7000000 build/test/functional/commands/general/" \