import React, {useState, useContext, useEffect} from 'react'
import {View, Image, TouchableOpacity, StyleSheet, Text, useColorScheme, Pressable} from 'react-native'
import Colors from 'src/constants/Colors'
import {Fonts} from 'src/constants/Fonts'
import {AnimatedCircularProgress} from 'react-native-circular-progress'
import TrackPlayer, { useTrackPlayerEvents, Event, useProgress, usePlaybackState, State } from 'react-native-track-player'
import { Slider } from '@miblanchard/react-native-slider'
import {PlayListContext} from 'src/shared-state'
import {isNil} from 'lodash'
import {onPushEventBus, EventBusName, SocketClient} from 'src/services'

const getStyles = (theme: 'dark' | 'light') => StyleSheet.create({
  wrapper: {
    width: '100%',
    backgroundColor: Colors[theme].background,
    position: 'absolute',
    bottom: 0,
    // marginBottom: 49
  },
  container: {
    width: '100%',
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftView: {
    flex: 0.6,
    flexDirection: 'row',
    paddingLeft: 32,
  },
  rightView: {
    flex: 0.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 32,
  },
  imageCover: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  nameSong: {
    fontFamily: Fonts.fontFamily.GilroyBold,
    fontWeight: '700',
    color: Colors[theme].text,
    fontSize: Fonts.fontSize[14],
  },
  descSong: {
    fontFamily: Fonts.fontFamily.Gilroy,
    fontWeight: '400',
    color: Colors[theme].white60,
    fontSize: Fonts.fontSize[12],
  },
  inprogress: {
    fontWeight: '700',
    fontFamily: Fonts.fontFamily.Gilroy,
    color: Colors[theme].royalBlue,
    fontSize: Fonts.fontSize[12],
  },
  iconPlay: {
    width: 32,
    height: 32,
    marginLeft: 8,
  },
  track: {
    height: 1,
    backgroundColor: '#565656',
    borderRadius: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -1,
    },
    shadowOpacity: 0.36,
    elevation: 11,
  },
  thumb: {
    width: 0,
    height: 0,
  },
  buttonOff: {
    width: 32,
    height: 32,
  }
})

interface PropsMiniPlayer {
  marginBottom?: number
}

export const MiniPlayer = (props: PropsMiniPlayer) => {
  const theme =  useColorScheme() || 'light'
  const styles = getStyles(theme)

  const marginBottom = !isNil(props?.marginBottom) ? props?.marginBottom : 49

  const playListContext = useContext(PlayListContext)
  const {showMiniControl, updateMiniControl, updatePopupPlayer, headphone, energy, updatePositionModalPlayer, playList: {playList: {playlistDetail}}} = playListContext

  const [battery, setBattery] = useState<number>(headphone.battery)
  const [earning, setEarning] = useState<boolean>(headphone.battery > 0 && energy > 0)
  const {position, duration} = useProgress()


  const state = usePlaybackState()
  const isPlaying = state === State.Playing

  const [infoTrack, setTrack] = useState({artwork: '', title: '', artist: '' })
  

  useTrackPlayerEvents([Event.PlaybackTrackChanged], async event => {
    if (event.type === Event.PlaybackTrackChanged && event.nextTrack != null) {
        const track = await TrackPlayer.getTrack(event.nextTrack);
        console.log('track =====>', track)
        // @ts-ignore
        setTrack({artwork: track?.artwork, title: track?.title, artist: track?.artist})
    }
  });

  useEffect(() => {
    setBattery(headphone.battery)
  }, [headphone])


  useEffect(() => {
    const getNameSong = async() => {
      const currentTrack = await TrackPlayer.getCurrentTrack()
      console.log('GET NAME SONG ====>', currentTrack)
      console.log('currentTrack ===>', currentTrack)
      if (!infoTrack.title) {
        const track = playlistDetail?.[currentTrack!]
        setTrack({title: track?.song?.name, artist: track?.song?.artists?.[0]?.artistInfo?.name || '', artwork: ''})
      }
    }
    getNameSong()
  }, [])

  useEffect(() => {
    if (headphone.battery <= 0 || energy <= 0) {
      setEarning(false)
    } else if (headphone.battery && energy) {
      setEarning(true)
    }
  }, [headphone, energy])


  const onPressPlayer = () => {
    updateMiniControl(false)
    // updatePopupPlayer(true)
    onPushEventBus({type: EventBusName.CHECK_UPDATE_MINI_PLAYER, payload: false})
    updatePositionModalPlayer(0)
  }

  const onPressButton = () => {
    onPushEventBus({type: EventBusName.PRESS_ACTION_ON_MINI_PLAYER})
    if (isPlaying) {
      TrackPlayer.pause()
    } else {
      TrackPlayer.play()
    }
  }

  const onPressTurnOff = () => onPushEventBus({type: EventBusName.PRESS_TURN_OFF_MINI_PLAYER})

  if (!showMiniControl) {
    return null
  }
  return (
    <View style={{...styles.wrapper, marginBottom}}>
      <Pressable onPress={onPressPlayer} style={styles.container}>
        <View style={styles.leftView}>
          <Image source={{uri: infoTrack?.artwork}} style={styles.imageCover} />
          <View>
            <Text style={styles.nameSong}>{infoTrack?.title}</Text>
            <Text style={styles.descSong}>{infoTrack?.artist || 'Unknown'}</Text>
          </View>
        </View>

        <View style={styles.rightView}>

          {!isPlaying
            ? (
                <TouchableOpacity onPress={onPressTurnOff}>
                  <Image
                  style={styles.buttonOff}
                    source={require('@assets/images/player/control/turn_off.png')}
                  />
                </TouchableOpacity>
              ) 
            :  <AnimatedCircularProgress
                size={30}
                width={4}
                fill={battery}
                tintColor={Colors[theme].white}
                rotation={0}
                children={() => <Text style={styles.inprogress}>{battery || '-'}</Text>}
                backgroundColor={Colors[theme].white38} 
                style={{marginHorizontal: 12}}
              />
           }

            <Pressable onPress={onPressButton}>
              <Image
                source={isPlaying
                  ? require('src/assets/images/player/control/icon_pausebtn.png')
                  : require('src/assets/images/player/control/icon_playbtn.png')
                } 
                style={styles.iconPlay}
              />
          </Pressable>

        </View>
         
      </Pressable>
      <Slider
        containerStyle={{backgroundColor: 'white', height: 1}}
         disabled
          value={position}
          trackClickable={false}
          minimumValue={0}
          maximumValue={duration}
          minimumTrackTintColor="#FFF"
          maximumTrackTintColor="#565656"
          onSlidingComplete={value => {}}
          thumbImage={undefined}
          trackStyle={styles.track}
          thumbStyle={styles.thumb}
      />
    </View>
  )
}
