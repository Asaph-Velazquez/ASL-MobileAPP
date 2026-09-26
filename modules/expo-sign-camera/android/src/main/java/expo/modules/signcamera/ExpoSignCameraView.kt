package expo.modules.signcamera

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Matrix
import android.os.SystemClock
import android.view.View
import android.view.ViewGroup
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarker
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView
import java.util.concurrent.Executors

class ExpoSignCameraView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  private val onLandmarks by EventDispatcher()
  private val onCameraError by EventDispatcher()
  private val previewView = PreviewView(context)
  private val executor = Executors.newSingleThreadExecutor()
  private var provider: ProcessCameraProvider? = null
  private var landmarker: HandLandmarker? = null
  private var lastFrameAt = 0L
  var hand = "right"

  init {
    previewView.implementationMode = PreviewView.ImplementationMode.COMPATIBLE
    previewView.layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
    // CameraX inserts its surface after React Native's initial layout pass.
    previewView.setOnHierarchyChangeListener(object : ViewGroup.OnHierarchyChangeListener {
      override fun onChildViewAdded(parent: View?, child: View?) {
        layoutPreview(width, height)
      }

      override fun onChildViewRemoved(parent: View?, child: View?) = Unit
    })
    addView(previewView)
  }

  override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
    measureChild(previewView, widthMeasureSpec, heightMeasureSpec)
    setMeasuredDimension(
      ViewGroup.resolveSize(previewView.measuredWidth, widthMeasureSpec),
      ViewGroup.resolveSize(previewView.measuredHeight, heightMeasureSpec)
    )
  }

  override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
    layoutPreview(right - left, bottom - top)
  }

  private fun layoutPreview(width: Int, height: Int) {
    if (width <= 0 || height <= 0) return
    previewView.measure(
      View.MeasureSpec.makeMeasureSpec(width, View.MeasureSpec.EXACTLY),
      View.MeasureSpec.makeMeasureSpec(height, View.MeasureSpec.EXACTLY)
    )
    previewView.layout(0, 0, width, height)
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    try {
      val options = HandLandmarker.HandLandmarkerOptions.builder()
        .setBaseOptions(BaseOptions.builder().setModelAssetPath("hand_landmarker.task").build())
        .setRunningMode(RunningMode.VIDEO)
        .setNumHands(2)
        .build()
      landmarker = HandLandmarker.createFromOptions(context, options)
      val future = ProcessCameraProvider.getInstance(context)
      future.addListener({
        try {
          val lifecycle = appContext.currentActivity as? LifecycleOwner
            ?: throw IllegalStateException("Camera requires a lifecycle owner")
          val cameraProvider = future.get()
          provider = cameraProvider
          val preview = Preview.Builder().build().also { it.surfaceProvider = previewView.surfaceProvider }
          val analysis = ImageAnalysis.Builder()
            .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST).build()
          analysis.setAnalyzer(executor) { frame ->
            try {
              val now = SystemClock.uptimeMillis()
              if (now - lastFrameAt < 33) return@setAnalyzer
              lastFrameAt = now
              val source = frame.toBitmap()
              val rotation = frame.imageInfo.rotationDegrees.toFloat()
              val matrix = Matrix().apply { postRotate(rotation) }
              val bitmap = Bitmap.createBitmap(source, 0, 0, source.width, source.height, matrix, true)
              val result = landmarker?.detectForVideo(BitmapImageBuilder(bitmap).build(), now)
              var selected: List<Float>? = null
              val detectedHands = mutableListOf<String>()
              if (result != null) {
                for (i in result.landmarks().indices) {
                  // MediaPipe labels assume mirrored input; CameraX analysis frames are not mirrored.
                  val label = result.handednesses()[i][0].categoryName().lowercase()
                  val physical = if (label == "left") "right" else "left"
                  detectedHands.add(physical)
                  if (physical != hand) continue
                  selected = result.landmarks()[i].flatMap { listOf(it.x(), it.y(), it.z()) }
                }
              }
              post { onLandmarks(mapOf("landmarks" to (selected ?: emptyList<Float>()), "detectedHands" to detectedHands)) }
            } catch (error: Exception) {
              post { onCameraError(mapOf("message" to (error.message ?: "Camera analysis failed"))) }
            } finally {
              frame.close()
            }
          }
          cameraProvider.unbindAll()
          cameraProvider.bindToLifecycle(lifecycle, CameraSelector.DEFAULT_FRONT_CAMERA, preview, analysis)
        } catch (error: Exception) {
          onCameraError(mapOf("message" to (error.message ?: "Camera unavailable")))
        }
      }, ContextCompat.getMainExecutor(context))
    } catch (error: Exception) {
      onCameraError(mapOf("message" to (error.message ?: "Hand model unavailable")))
    }
  }

  override fun onDetachedFromWindow() {
    provider?.unbindAll()
    provider = null
    landmarker?.close()
    landmarker = null
    super.onDetachedFromWindow()
  }
}
