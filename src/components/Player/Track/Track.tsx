import React from 'react'
import Slider from '@react-native-community/slider'

const Track = () => {
  return (
    <Slider
      style={{width: 200, height: 40}}
      minimumValue={0}
      maximumValue={1}
      minimumTrackTintColor="#FFFFFF"
      maximumTrackTintColor="#000000"
      thumbImage={require('@assets/images/player/track/icon_track_circle.png')}
    />
  )
}

export default Track
