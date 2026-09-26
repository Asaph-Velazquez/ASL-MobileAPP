Pod::Spec.new do |s|
  s.name = 'ExpoSignCamera'
  s.version = '1.0.0'
  s.summary = 'On-device hand landmarks for ASL recognition'
  s.description = s.summary
  s.license = 'MIT'
  s.author = 'ASL-System'
  s.homepage = 'https://github.com/Asaph-Velazquez/ASL-MobileAPP'
  s.platform = :ios, '15.1'
  s.source = { :git => 'https://github.com/Asaph-Velazquez/ASL-MobileAPP.git', :tag => s.version.to_s }
  s.source_files = '**/*.swift'
  s.resources = ['hand_landmarker.task']
  s.dependency 'ExpoModulesCore'
  s.dependency 'MediaPipeTasksVision', '0.10.21'
  s.swift_version = '5.9'
end
