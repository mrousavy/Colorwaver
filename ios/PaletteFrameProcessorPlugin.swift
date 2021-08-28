//
//  PaletteFrameProcessorPlugin.swift
//  Colorwaver
//
//  Created by Marc Rousavy on 28.08.21.
//

import Foundation
import UIImageColors

@objc(PaletteFrameProcessorPlugin)
public class PaletteFrameProcessorPlugin: NSObject, FrameProcessorPluginBase {
  private static let context = CIContext(options: nil)
  
  @objc
  public static func callback(_ frame: Frame!, withArgs _: [Any]!) -> Any! {
    let imageBuffer = CMSampleBufferGetImageBuffer(frame.buffer)!
    let ciImage = CIImage(cvPixelBuffer: imageBuffer)

    let cgImage = context.createCGImage(ciImage, from: ciImage.extent)!
    let image = UIImage(cgImage: cgImage)
    let colors = image.getColors()!
    
    return [
      "primary": colors.primary,
      "secondary": colors.secondary,
      "background": colors.background,
      "detail": colors.detail
    ]
  }
}
