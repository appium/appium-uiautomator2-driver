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

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.math.BigInteger;
import java.security.SecureRandom;
import java.util.*;
import io.selendroid.server.ServerInstrumentation;
import io.selendroid.server.android.InstrumentedKeySender;
import io.selendroid.server.android.KeySender;
import io.selendroid.server.android.internal.Dimension;
import io.selendroid.server.common.exceptions.NoSuchMethodImplementationException;
import io.selendroid.server.common.exceptions.SelendroidException;
import io.selendroid.server.util.SelendroidLogger;


public class DefaultAppiumUiAutomatorDriver implements SelendroidDriver {

    public static final String BROWSER_NAME = "browserName";
    public static final String PLATFORM = "platform";
    public static final String SUPPORTS_JAVASCRIPT = "javascriptEnabled";
    public static final String TAKES_SCREENSHOT = "takesScreenshot";
    public static final String SUPPORTS_ALERTS = "handlesAlerts";
    public static final String ROTATABLE = "rotatable";
    public static final String ACCEPT_SSL_CERTS = "acceptSslCerts";
    public static final String SUPPORTS_NETWORK_CONNECTION = "networkConnectionEnabled";
    public static final String AUTOMATION_NAME = "automationName";
    private ServerInstrumentation serverInstrumentation = null;
    private KeySender keySender = null;
    private Session session = null;

    public DefaultAppiumUiAutomatorDriver(ServerInstrumentation serverInstrumentation) {
        this.keySender = new InstrumentedKeySender(serverInstrumentation);
        this.serverInstrumentation = serverInstrumentation;
    }

    @Override
    public AndroidElement findElement(By by) {
        throw new NoSuchMethodImplementationException("Method not implemented");
    }

    @Override
    public List<AndroidElement> findElements(By by) {
        throw new NoSuchMethodImplementationException("Method not implemented");
    }

    @Override
    public String getCurrentUrl() {
        throw new NoSuchMethodImplementationException("Method not implemented");
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
            copy.put(AUTOMATION_NAME, "uiautomator");
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
        throw new NoSuchMethodImplementationException("Method not implemented");
    }

    @Override
    public String getWindowSource() {
        throw new NoSuchMethodImplementationException("Method not implemented");
    }

    @Override
    public String initializeSession(JSONObject desiredCapabilities) {
        //Temporary solution for session creation and this needs to be modified.
        SecureRandom random = new SecureRandom();
        return new BigInteger(130, random).toString(32);
    }

    @Override
    public void stopSession() {
        throw new NoSuchMethodImplementationException("Method not implemented");
    }

    @Override
    public void switchContext(String type) {
        throw new NoSuchMethodImplementationException("Method not implemented");
    }

    @Override
    public byte[] takeScreenshot() {
        throw new NoSuchMethodImplementationException("Method not implemented");
    }

    @Override
    public Keyboard getKeyboard() {
        throw new NoSuchMethodImplementationException("Method not implemented");
    }

    @Override
    public String getTitle() {
        throw new NoSuchMethodImplementationException("Method not implemented");
    }

    @Override
    public void get(String url) {
        throw new NoSuchMethodImplementationException("Method not implemented");
    }

    @Override
    public TouchScreen getTouch() {
        throw new NoSuchMethodImplementationException("Method not implemented");
    }

    @Override
    public void addCookie(String url, Cookie cookie) {
        throw new NoSuchMethodImplementationException("Method not implemented");
    }

    @Override
    public void deleteCookie(String url) {
        throw new NoSuchMethodImplementationException("Method not implemented");
    }

    @Override
    public void deleteNamedCookie(String url, String name) {
        throw new NoSuchMethodImplementationException("Method not implemented");
    }

    @Override
    public Set<Cookie> getCookies(String url) {
        throw new NoSuchMethodImplementationException("Method not implemented");
    }

    @Override
    public Object executeScript(String script, JSONArray args) {
        throw new NoSuchMethodImplementationException("Method not implemented");
    }

    @Override
    public Object executeScript(String script, Object... args) {
        throw new NoSuchMethodImplementationException("Method not implemented");
    }

    @Override
    public Object executeAsyncScript(String script, JSONArray args) {
        throw new NoSuchMethodImplementationException("Method not implemented");
    }

    @Override
    public String getContext() {
        throw new NoSuchMethodImplementationException("Method not implemented");
    }

    @Override
    public Set<String> getContexts() {
        throw new NoSuchMethodImplementationException("Method not implemented");
    }

    @Override
    public Dimension getWindowSize() {
        throw new NoSuchMethodImplementationException("Method not implemented");
    }

    @Override
    public void setFrameContext(Object index) throws JSONException {
        throw new NoSuchMethodImplementationException("Method not implemented");
    }

    @Override
    public void back() {
        throw new NoSuchMethodImplementationException("Method not implemented");
    }

    @Override
    public void forward() {
        throw new NoSuchMethodImplementationException("Method not implemented");
    }

    @Override
    public void refresh() {
        throw new NoSuchMethodImplementationException("Method not implemented");
    }

    @Override
    public boolean isAlertPresent() {
        return false;
    }

    @Override
    public String getAlertText() {
        throw new NoSuchMethodImplementationException("Method not implemented");
    }

    @Override
    public void setAlertText(CharSequence... keysToSend) {
        throw new NoSuchMethodImplementationException("Method not implemented");
    }

    @Override
    public void acceptAlert() {
        throw new NoSuchMethodImplementationException("Method not implemented");
    }

    @Override
    public void dismissAlert() {
        throw new NoSuchMethodImplementationException("Method not implemented");
    }

    @Override
    public ScreenOrientation getOrientation() {
        throw new NoSuchMethodImplementationException("Method not implemented");
    }

    @Override
    public void rotate(ScreenOrientation orientation) {
        throw new NoSuchMethodImplementationException("Method not implemented");
    }

    @Override
    public void setAsyncTimeout(long timeout) {
        throw new NoSuchMethodImplementationException("Method not implemented");
    }

    @Override
    public void setPageLoadTimeout(long timeout) {
        throw new NoSuchMethodImplementationException("Method not implemented");
    }

    @Override
    public boolean isAirplaneMode() {
        throw new NoSuchMethodImplementationException("Method not implemented");
    }

    @Override
    public void roll(int dimensionX, int dimensionY) {
        throw new NoSuchMethodImplementationException("Method not implemented");
    }
}
