import ExpoModulesCore

public class ExpoSignCameraModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoSignCamera")
    View(ExpoSignCameraView.self) {
      Events("onLandmarks", "onCameraError")
      Prop("hand") { (view: ExpoSignCameraView, hand: String) in view.hand = hand }
    }
  }
}
