package io.selendroid.standalone.server;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.testng.annotations.AfterSuite;
import org.testng.annotations.Test;
import io.selendroid.client.SelendroidDriver;
import io.selendroid.common.SelendroidCapabilities;

public class TestSelendroid {

    private WebDriver driver;

    @Test
    public void selendroidTest() throws Exception {
        SelendroidCapabilities caps = new SelendroidCapabilities();
        caps.setAut("com.guru99app:1.0");
        caps.setAutomationName("uiautomator");

        driver = new SelendroidDriver(caps);
        WebElement inputField = driver.findElement(By.id("edtText"));
        inputField.sendKeys("Hello Guru");
        WebElement button = driver.findElement(By.id("btnShow"));
        button.click();
        Thread.sleep(5000);
        WebElement txtView = driver.findElement(By.id("txtView"));
        String expected = txtView.getText();
        junit.framework.Assert
                .assertEquals(expected, inputField.getText());
    }

    @AfterSuite
    public void tearDown() {
        driver.quit();
    }
}