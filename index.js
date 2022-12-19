import {registerRootComponent} from 'expo'
import TrackPlayer from 'react-native-track-player'

import App from './src/App'
import {PlaybackService} from './src/services'

registerRootComponent(App)
TrackPlayer.registerPlaybackService(() => PlaybackService)
