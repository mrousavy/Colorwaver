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
  
  private static func convertQuality(quality: String) -> UIImageColorsQuality {
    switch (quality) {
    case "lowest":
      return .lowest
    case "low":
      return .low
    case "high":
      return .high
    case "highest":
      fallthrough
    default:
      return .highest
    }
  }
  
  @objc
  public static func callback(_ frame: Frame!, withArgs args: [Any]!) -> Any! {
    let imageBuffer = CMSampleBufferGetImageBuffer(frame.buffer)!
    let ciImage = CIImage(cvPixelBuffer: imageBuffer)

    let cgImage = context.createCGImage(ciImage, from: ciImage.extent)!
    let image = UIImage(cgImage: cgImage)
    
    var quality: UIImageColorsQuality = .highest
    
    if !args.isEmpty {
      if let qualityString = args[0] as? NSString {
        quality = convertQuality(quality: qualityString as String)
      }
    }
    
    let colors = image.getColors(quality: quality)!
    
    return [
      "primary": colors.primary.hexString,
      "secondary": colors.secondary.hexString,
      "background": colors.background.hexString,
      "detail": colors.detail.hexString
    ]
  }
}
