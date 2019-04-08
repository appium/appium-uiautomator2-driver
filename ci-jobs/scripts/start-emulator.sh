#!/usr/bin/env bash

# This script was copy-pasted from https://docs.microsoft.com/en-us/azure/devops/pipelines/languages/android?view=azure-devops#test-on-the-android-emulator
# with some changes

# Install AVD files
declare -r emulator="system-images;android-$ANDROID_SDK_VERSION;google_apis;x86"
echo "y" | $ANDROID_HOME/tools/bin/sdkmanager --install "$emulator"

# Create emulator
echo "no" | $ANDROID_HOME/tools/bin/avdmanager create avd -n $ANDROID_AVD -k "$emulator" --force

echo $ANDROID_HOME/emulator/emulator -list-avds

echo "Starting emulator"

# Start emulator in background
nohup $ANDROID_HOME/emulator/emulator -avd $ANDROID_AVD -no-snapshot > /dev/null 2>&1 &

# Wait for emulator to start
$ANDROID_HOME/platform-tools/adb wait-for-device get-serialno
secondsStarted=`date +%s`
TIMEOUT=360
while [[ $(( `date +%s` - $secondsStarted )) -lt $TIMEOUT ]]; do
  processList=`adb shell ps`
  if [[ "$processList" =~ "com.android.systemui" ]]; then
    echo "System UI process is running. Checking IME services availability"
    $ANDROID_HOME/platform-tools/adb shell ime list && break
  fi
  sleep 5
  secondsElapsed=$(( `date +%s` - $secondsStarted ))
  secondsLeft=$(( $TIMEOUT - $secondsElapsed ))
  echo "Waiting until emulator finishes services startup; ${secondsElapsed}s elapsed; ${secondsLeft}s left"
done

bootDuration=$(( `date +%s` - $secondsStarted ))
echo "Emulator booting took ${bootDuration}s"
adb shell input keyevent 82

$ANDROID_HOME/platform-tools/adb devices
