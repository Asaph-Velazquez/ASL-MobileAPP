import AVFoundation
import ExpoModulesCore
import MediaPipeTasksVision
import QuartzCore

final class ExpoSignCameraView: ExpoView, AVCaptureVideoDataOutputSampleBufferDelegate {
  let onLandmarks = EventDispatcher()
  let onCameraError = EventDispatcher()
  var hand = "right"

  private let session = AVCaptureSession()
  private let captureQueue = DispatchQueue(label: "asl.sign.camera")
  private let preview = AVCaptureVideoPreviewLayer()
  private var landmarker: HandLandmarker?
  private var lastFrameAt = 0

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    clipsToBounds = true
    preview.videoGravity = .resizeAspectFill
    preview.session = session
    layer.addSublayer(preview)
  }

  override func layoutSubviews() {
    super.layoutSubviews()
    preview.frame = bounds
  }

  override func didMoveToWindow() {
    super.didMoveToWindow()
    if window != nil {
      captureQueue.async { [weak self] in self?.startCamera() }
    } else {
      captureQueue.async { [weak self] in
        self?.session.stopRunning()
        self?.landmarker = nil
      }
    }
  }

  private func startCamera() {
    guard !session.isRunning else { return }
    guard let modelPath = Bundle.main.path(forResource: "hand_landmarker", ofType: "task") else {
      DispatchQueue.main.async { self.onCameraError(["message": "Hand model unavailable"]) }
      return
    }
    do {
      let options = HandLandmarkerOptions()
      options.baseOptions.modelAssetPath = modelPath
      options.runningMode = .video
      options.numHands = 2
      landmarker = try HandLandmarker(options: options)

      guard let camera = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .front) else {
        throw NSError(domain: "ExpoSignCamera", code: 1, userInfo: [NSLocalizedDescriptionKey: "Front camera unavailable"])
      }
      session.beginConfiguration()
      session.sessionPreset = .medium
      session.inputs.forEach { session.removeInput($0) }
      session.outputs.forEach { session.removeOutput($0) }
      let input = try AVCaptureDeviceInput(device: camera)
      if session.canAddInput(input) { session.addInput(input) }
      let output = AVCaptureVideoDataOutput()
      output.alwaysDiscardsLateVideoFrames = true
      if session.canAddOutput(output) { session.addOutput(output) }
      if let connection = output.connection(with: .video) {
        connection.automaticallyAdjustsVideoMirroring = false
        if connection.isVideoMirroringSupported { connection.isVideoMirrored = false }
        if connection.isVideoOrientationSupported { connection.videoOrientation = .portrait }
      }
      output.setSampleBufferDelegate(self, queue: captureQueue)
      session.commitConfiguration()
      session.startRunning()
    } catch {
      DispatchQueue.main.async { self.onCameraError(["message": error.localizedDescription]) }
    }
  }

  func captureOutput(_ output: AVCaptureOutput, didOutput sampleBuffer: CMSampleBuffer, from connection: AVCaptureConnection) {
    let now = Int(CACurrentMediaTime() * 1000)
    guard now - lastFrameAt >= 33, let landmarker else { return }
    lastFrameAt = now
    do {
      let image = try MPImage(sampleBuffer: sampleBuffer)
      let result = try landmarker.detect(videoFrame: image, timestampInMilliseconds: now)
      var selected: [Float]?
      var detectedHands: [String] = []
      for (index, points) in result.landmarks.enumerated() {
        guard index < result.handedness.count, let category = result.handedness[index].first else { continue }
        // MediaPipe assumes mirrored input; the capture output is not mirrored.
        let physical = category.categoryName?.lowercased() == "left" ? "right" : "left"
        detectedHands.append(physical)
        if physical != hand { continue }
        selected = points.flatMap { [$0.x, $0.y, $0.z] }
      }
      DispatchQueue.main.async { self.onLandmarks(["landmarks": selected ?? NSNull(), "detectedHands": detectedHands]) }
    } catch {
      DispatchQueue.main.async { self.onCameraError(["message": error.localizedDescription]) }
    }
  }
}
