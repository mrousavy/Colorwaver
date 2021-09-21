package com.mrousavy.colorwaver;

import android.annotation.SuppressLint;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.media.Image;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.camera.core.ImageProxy;
import androidx.palette.graphics.Palette;
import com.mrousavy.colorwaver.utils.YuvToRgbConverter;
import com.facebook.react.bridge.WritableNativeMap;
import com.mrousavy.camera.frameprocessor.FrameProcessorPlugin;

public class PaletteFrameProcessorPlugin extends FrameProcessorPlugin {
    private final YuvToRgbConverter yuvToRgbConverter;
    @SuppressWarnings("FieldCanBeLocal")
    private static final int DEFAULT_COLOR = Color.BLACK;

    @SuppressLint("UnsafeOptInUsageError")
    @Nullable
    @Override
    public Object callback(@NonNull ImageProxy imageProxy, @NonNull Object[] params) {
        Image image = imageProxy.getImage();
        if (image == null) {
            // Image Proxy is empty!
            return null;
        }

        Bitmap bitmap = Bitmap.createBitmap(image.getWidth(), image.getHeight(), Bitmap.Config.ARGB_8888);
        yuvToRgbConverter.yuvToRgb(image, bitmap);

        Palette palette = new Palette.Builder(bitmap).generate();

        int average = palette.getLightVibrantColor(DEFAULT_COLOR);
        int vibrant = palette.getVibrantColor(DEFAULT_COLOR);
        int darkVibrant = palette.getDarkVibrantColor(DEFAULT_COLOR);
        int dominant = palette.getDominantColor(DEFAULT_COLOR);

        WritableNativeMap result = new WritableNativeMap();
        result.putString("primary", rgbIntToHexString(vibrant));
        result.putString("secondary", rgbIntToHexString(darkVibrant));
        result.putString("detail", rgbIntToHexString(average));
        result.putString("background", rgbIntToHexString(dominant));
        return result;
    }

    private String rgbIntToHexString(int rgb) {
        return String.format("#%06X", (0xFFFFFF & rgb));
    }

    PaletteFrameProcessorPlugin(Context context) {
        super("getColorPalette");
        yuvToRgbConverter = new YuvToRgbConverter(context);
    }
}
