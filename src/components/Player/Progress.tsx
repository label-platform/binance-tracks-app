import React, {useMemo} from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {Slider} from '@miblanchard/react-native-slider'
import TrackPlayer, {useProgress} from 'react-native-track-player'
import {EventBusName, onPushEventBus} from 'src/services'
import moment from 'moment'

export const Progress = () => {
  const {position, duration, buffered} = useProgress()
  console.log('position, duration ===>', {position, duration, buffered})

  const onSlidingComplete = (value: number | Array<number>) => {
    TrackPlayer.seekTo(typeof value === 'number' ? value : value?.[0])
    onPushEventBus({type: EventBusName.SEEK_TO})
  }

  const onSlidingChange = (value: number | Array<number>) => {
    // TrackPlayer.seekTo(typeof(value) === 'number' ? value : value?.[0])
    // onPushEventBus({type: EventBusName.SEEK_TO})
  }

  const valueDuration = useMemo(() => {
    if (duration < 3600) {
      return new Date(duration * 1000).toISOString().substring(14, 19)
    }
    return new Date(duration * 1000).toISOString().substring(11, 19)
  }, [duration])

  return (
    <View style={{marginTop: 24, marginBottom: 42}}>
      <View style={styles.labelContainer}>
        <Text style={styles.labelText}>
          {position < 3600
            ? new Date(position * 1000).toISOString().slice(14, 19)
            : new Date(position * 1000).toISOString().slice(11, 19)}
          {/* {new Date(position * 1000).toISOString().slice(14, 19)} */}
        </Text>
        <Text style={styles.labelText}>{valueDuration}</Text>
      </View>
      <Slider
        containerStyle={styles.container}
        value={position}
        trackClickable={true}
        thumbTouchSize={{width: 60, height: 60}}
        minimumValue={0}
        maximumValue={duration}
        minimumTrackTintColor="#674AE9"
        maximumTrackTintColor="#FFFFFF12"
        onSlidingComplete={onSlidingComplete}
        onValueChange={onSlidingChange}
        thumbTintColor={'#AA93F8'}
        // trackStyle={styles.track}
        thumbStyle={styles.thumb}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  labelText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontVariant: ['tabular-nums'],
  },
  // track: {
  //   height: 4,
  //   backgroundColor: '#FFFFFF12',
  //   borderRadius: 0,
  //   shadowColor: '#000',
  //   shadowOffset: {
  //     width: 0,
  //     height: -1,
  //   },
  //   shadowOpacity: 0.36,
  //   elevation: 11,
  // },
  thumb: {
    width: 8,
    height: 8,
    // backgroundColor: 'transparent',
  },
})
