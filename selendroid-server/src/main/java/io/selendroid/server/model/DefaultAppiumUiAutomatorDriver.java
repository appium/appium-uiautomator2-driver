/*
 * Copyright 2012-2014 eBay Software Foundation and selendroid committers.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */
package io.selendroid.server.model;


import android.support.test.uiautomator.UiDevice;
import android.test.InstrumentationTestCase;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.math.BigInteger;
import java.security.SecureRandom;
import java.util.List;
import java.util.Set;

import io.selendroid.server.ServerInstrumentation;
import io.selendroid.server.android.InstrumentedKeySender;
import io.selendroid.server.android.KeySender;
import io.selendroid.server.android.internal.Dimension;
import io.selendroid.server.common.exceptions.SelendroidException;
import io.selendroid.server.util.SelendroidLogger;

//import android.support.test.uiautomator.UiDevice;

public class DefaultAppiumUiAutomatorDriver implements SelendroidDriver {

    public static final String BROWSER_NAME = "browserName";
    public static final String PLATFORM = "platform";
    public static final String SUPPORTS_JAVASCRIPT = "javascriptEnabled";
    public static final String TAKES_SCREENSHOT = "takesScreenshot";
    public static final String VERSION = "version";
    public static final String SUPPORTS_ALERTS = "handlesAlerts";
    public static final String ROTATABLE = "rotatable";
    public static final String ACCEPT_SSL_CERTS = "acceptSslCerts";
    public static final String SUPPORTS_NETWORK_CONNECTION = "networkConnectionEnabled";
    private static UiDevice device;
    private ServerInstrumentation serverInstrumentation = null;
    private KeySender keySender = null;
    private Session session = null;

    public DefaultAppiumUiAutomatorDriver(ServerInstrumentation serverInstrumentation) {
        this.keySender = new InstrumentedKeySender(serverInstrumentation);
        ;
        this.serverInstrumentation = serverInstrumentation;
    }

    @Override
    public AndroidElement findElement(By by) {
        return null;
    }

    @Override
    public List<AndroidElement> findElements(By by) {
        return null;
    }

    @Override
    public String getCurrentUrl() {
        return null;
    }

    @Override
    public Session getSession() {
        return session;
    }

    @Override
    public JSONObject getSessionCapabilities(String sessionId) {
        SelendroidLogger.info("session: " + sessionId);

        JSONObject copy;
        try {
            JSONObject capabilities = session.getCapabilities();
            if (capabilities != null) {
                copy = new JSONObject(capabilities.toString());
            } else {
                copy = new JSONObject();
            }
            copy.put(TAKES_SCREENSHOT, true);
            copy.put(BROWSER_NAME, "selendroid");
            copy.put("automationName", "UiAutomator");
            copy.put("platformName", "android");
            copy.put("platformVersion", serverInstrumentation.getOsVersion());
            copy.put(ROTATABLE, true);
            copy.put(PLATFORM, "android");
            copy.put(SUPPORTS_ALERTS, true);
            copy.put(SUPPORTS_JAVASCRIPT, true);
            copy.put(SUPPORTS_NETWORK_CONNECTION, true);
            copy.put("version", serverInstrumentation.getServerVersion());
            copy.put(ACCEPT_SSL_CERTS, true);
            SelendroidLogger.info("capabilities: " + copy);
            return copy;
        } catch (JSONException e) {
            throw new SelendroidException(e);
        }
    }

    @Override
    public JSONObject getFullWindowTree() {
        return null;
    }

    @Override
    public String getWindowSource() {
        return null;
    }

    @Override
    public String initializeSession(JSONObject desiredCapabilities) {
        //Temporary solution for session creation and this needs to be modified
        SecureRandom random = new SecureRandom();
        return new BigInteger(130, random).toString(32);
    }

    @Override
    public void stopSession() {

    }

    @Override
    public void switchContext(String type) {

    }

    @Override
    public byte[] takeScreenshot() {
        return new byte[0];
    }

    @Override
    public Keyboard getKeyboard() {
        return null;
    }

    @Override
    public String getTitle() {
        return null;
    }

    @Override
    public void get(String url) {

    }

    @Override
    public TouchScreen getTouch() {
        return null;
    }

    @Override
    public void addCookie(String url, Cookie cookie) {

    }

    @Override
    public void deleteCookie(String url) {

    }

    @Override
    public void deleteNamedCookie(String url, String name) {

    }

    @Override
    public Set<Cookie> getCookies(String url) {
        return null;
    }

    @Override
    public Object executeScript(String script, JSONArray args) {
        return null;
    }

    @Override
    public Object executeScript(String script, Object... args) {
        return null;
    }

    @Override
    public Object executeAsyncScript(String script, JSONArray args) {
        return null;
    }

    @Override
    public String getContext() {
        return null;
    }

    @Override
    public Set<String> getContexts() {
        return null;
    }

    @Override
    public Dimension getWindowSize() {
        return null;
    }

    @Override
    public void setFrameContext(Object index) throws JSONException {

    }

    @Override
    public void back() {

    }

    @Override
    public void forward() {

    }

    @Override
    public void refresh() {

    }

    @Override
    public boolean isAlertPresent() {
        return false;
    }

    @Override
    public String getAlertText() {
        return null;
    }

    @Override
    public void setAlertText(CharSequence... keysToSend) {


    }

    @Override
    public void acceptAlert() {

    }

    @Override
    public void dismissAlert() {

    }

    @Override
    public ScreenOrientation getOrientation() {
        return null;
    }

    @Override
    public void rotate(ScreenOrientation orientation) {

    }

    @Override
    public void setAsyncTimeout(long timeout) {

    }

    @Override
    public void setPageLoadTimeout(long timeout) {

    }

    @Override
    public boolean isAirplaneMode() {
        return false;
    }

    @Override
    public void roll(int dimensionX, int dimensionY) {

    }
}
