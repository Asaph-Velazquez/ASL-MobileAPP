# ExpoSignCamera

Local Expo module for the ASL petition camera. CameraX/AVFoundation display the preview and feed the same frames to MediaPipe Hand Landmarker. JavaScript receives only the selected physical hand's 21 image landmarks in `[x,y,z]` order; the selected hand defaults to right. Camera permission is requested by the existing ASL screens before mounting this view.

The model asset `hand_landmarker.task` is Google's float16 Hand Landmarker, downloaded from `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task` (SHA-256 `fbc2a30080c3c557093b5ddfc334698132eb341044ccee322ccf8bcf3607cde1`). It is bundled separately for Android and iOS; it is **not** the ASL ONNX classifier. MediaPipe Tasks Vision is pinned to 0.10.21 on both platforms.

Build a development client (`npx expo run:android` or `npx expo run:ios` on macOS). Expo Go cannot load this module. Validate the handedness mapping, orientation, timing and recognition quality against `model_onnx/camera_client.py` on real devices before considering the classifier production-ready. On Windows, iOS native compilation is unavailable.
