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

import java.util.List;
import java.util.Set;

import io.selendroid.server.ServerInstrumentation;
import io.selendroid.server.android.KeySender;
import io.selendroid.server.android.internal.Dimension;

public class DefaultAppiumUiAutomatorDriver implements SelendroidDriver  {

  private ServerInstrumentation serverInstrumentation = null;
  private KeySender keySender = null;

  public DefaultAppiumUiAutomatorDriver(ServerInstrumentation serverInstrumentation) {
    this.keySender = keySender;
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
    return null;
  }

  @Override
  public JSONObject getSessionCapabilities(String sessionId) {
    return null;
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
    return null;
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
  public void acceptAlert() {

  }

  @Override
  public void dismissAlert() {

  }

  @Override
  public void setAlertText(CharSequence... keysToSend) {

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
