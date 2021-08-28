package com.colorwaver;

import com.facebook.react.ReactActivity;
import com.mrousavy.camera.frameprocessor.FrameProcessorPlugin;
import com.mrousavy.camera.frameprocessor.FrameProcessorRuntimeManager;

import android.os.Bundle;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "Colorwaver";
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(null);
    FrameProcessorPlugin.register(new PaletteFrameProcessorPlugin(getApplicationContext()));
  }
}
