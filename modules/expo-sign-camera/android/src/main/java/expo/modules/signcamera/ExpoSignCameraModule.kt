package expo.modules.signcamera

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoSignCameraModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoSignCamera")
    View(ExpoSignCameraView::class) {
      Events("onLandmarks", "onCameraError")
      Prop("hand") { view: ExpoSignCameraView, hand: String -> view.hand = hand }
    }
  }
}
