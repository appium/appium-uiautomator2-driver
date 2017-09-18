async function getLocale (adb) {
  if (await adb.getApiLevel() < 23) {
    return await adb.getDeviceCountry();
  } else {
    return await adb.getDeviceLocale();
  }
}

export { getLocale };
