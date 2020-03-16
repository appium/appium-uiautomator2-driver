#!/usr/bin/env bash

# This script was copy-pasted from https://docs.microsoft.com/en-us/azure/devops/pipelines/languages/android?view=azure-devops#test-on-the-android-emulator
# with some changes

# Use Java 8 for these tasks, or it will error with
# Exception in thread "main" java.lang.NoClassDefFoundError: javax/xml/bind/annotation/XmlSchema
export JAVA_HOME=`/usr/libexec/java_home -v 1.8`

# Install AVD files
declare -r emulator="system-images;android-$ANDROID_SDK_VERSION;google_apis;x86"
echo "y" | $ANDROID_HOME/tools/bin/sdkmanager --install "$emulator"

# Create emulator
echo "no" | $ANDROID_HOME/tools/bin/avdmanager create avd -n testemulator -k "$emulator" --force

echo $ANDROID_HOME/emulator/emulator -list-avds

echo "Starting emulator"

# Start emulator in background
nohup $ANDROID_HOME/emulator/emulator -avd testemulator -accel auto -nojni -no-boot-anim -no-snapshot > /dev/null 2>&1 &
$ANDROID_HOME/platform-tools/adb wait-for-device shell 'while [[ -z $(getprop sys.boot_completed | tr -d '\r') ]]; do sleep 1; done; input keyevent 82'

$ANDROID_HOME/platform-tools/adb devices

sleep 30s

echo "Emulator started"
