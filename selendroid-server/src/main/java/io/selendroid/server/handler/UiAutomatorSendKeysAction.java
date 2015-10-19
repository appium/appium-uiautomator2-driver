package io.selendroid.server.handler;

import org.json.JSONException;
import org.json.JSONObject;

import io.selendroid.server.common.Response;
import io.selendroid.server.common.SelendroidResponse;
import io.selendroid.server.common.http.HttpRequest;
import io.selendroid.server.model.DefaultAppiumUiAutomatorDriver;
import io.selendroid.server.model.DefaultSelendroidDriver;
import io.selendroid.server.model.SelendroidDriver;
import io.selendroid.server.util.SelendroidLogger;

/**
 * Created by anands on 14-10-2015.
 */
public class UiAutomatorSendKeysAction extends SafeRequestHandler {

    public UiAutomatorSendKeysAction(String mappedUri) {
        super(mappedUri);
    }

    @Override
    public Response safeHandle(HttpRequest request) throws JSONException {
        SelendroidLogger.info("send keys command using ui automator");
        String[] keysToSend = extractKeysToSendFromPayload(request);
        SelendroidDriver appiumUiAutomatorDriver=getSelendroidDriver(request);
        appiumUiAutomatorDriver.getKeyboard();
        return new SelendroidResponse(getSessionId(request), "");
    }
}
