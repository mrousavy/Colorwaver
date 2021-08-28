package com.colorwaver;

import android.annotation.SuppressLint;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.media.Image;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.camera.core.ImageProxy;
import androidx.palette.graphics.Palette;

import com.colorwaver.utils.YuvToRgbConverter;
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

        int pixelSpacing = 5;
        if (params.length > 0 && params[0] instanceof Integer) {
            pixelSpacing = (Integer) params[0];
        }

        int average = calculateAverageColor(bitmap, pixelSpacing);
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

    /**
     * https://gist.github.com/maxjvh/a6ab15cbba9c82a5065d
     * pixelSpacing tells how many pixels to skip each pixel.
     * If pixelSpacing > 1: the average color is an estimate, but higher values mean better performance.
     * If pixelSpacing == 1: the average color will be the real average.
     * If pixelSpacing < 1: the method will most likely crash (don't use values below 1).
     */
    private int calculateAverageColor(@NonNull Bitmap bitmap, int pixelSpacing) {
        int R = 0;
        int G = 0;
        int B = 0;
        int height = bitmap.getHeight();
        int width = bitmap.getWidth();
        int n = 0;
        int[] pixels = new int[width * height];

        bitmap.getPixels(pixels, 0, width, 0, 0, width, height);

        for (int i = 0; i < pixels.length; i += pixelSpacing) {
            int color = pixels[i];
            R += Color.red(color);
            G += Color.green(color);
            B += Color.blue(color);
            n++;
        }
        return Color.rgb(R / n, G / n, B / n);
    }

    private String rgbIntToHexString(int rgb) {
        return String.format("#%06X", (0xFFFFFF & rgb));
    }

    PaletteFrameProcessorPlugin(Context context) {
        super("getColorPalette");
        yuvToRgbConverter = new YuvToRgbConverter(context);
    }
}