package io.selendroid.server.model;

import io.selendroid.server.ServerInstrumentation;

public class DefaultSelendroidDriverFactory implements SelendroidDriverFactory {

    private static SelendroidDriver selendroidDriver = null;

    //How about having an enum?
    private static final String AN_SELENDROID = "Selendroid";
    private static final String AN_UIAUTOMATOR = "UiAutomator";

    @Override
    public SelendroidDriver createSelendroidDriver( ServerInstrumentation androidInstrumentation, String automationName ) {

        if(selendroidDriver == null) {
            if (automationName.equals(AN_SELENDROID)) {
                return new DefaultSelendroidDriver(androidInstrumentation);
            } else if (automationName.equals(AN_UIAUTOMATOR)) { //custom appium Uiautomator driver
                return new DefaultAppiumUiAutomatorDriver(androidInstrumentation);
            }
        }
        return selendroidDriver;
    }

}

