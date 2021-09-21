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
  
  private static func convertQuality(quality: Int) -> UIImageColorsQuality {
    switch (quality) {
    case 0:
      return .lowest
    case 1:
      return .low
    case 2:
      return .high
    case 3:
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
      if let qualityNumber = args[0] as? NSNumber {
        quality = convertQuality(quality: qualityNumber.intValue)
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
