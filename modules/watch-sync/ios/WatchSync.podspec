Pod::Spec.new do |s|
  s.name           = 'WatchSync'
  s.version        = '1.0.0'
  s.summary        = 'Phone-to-watch zodiac sync via WatchConnectivity'
  s.description    = 'Pushes the user zodiac selection to the LunarCal watch app.'
  s.author         = 'LunarCal'
  s.homepage       = 'https://github.com/raeyean/LunarCal'
  s.license        = 'MIT'
  s.platforms      = { :ios => '15.1' }
  s.source         = { :git => '' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.source_files = '**/*.swift'
  s.frameworks = 'WatchConnectivity'
end
