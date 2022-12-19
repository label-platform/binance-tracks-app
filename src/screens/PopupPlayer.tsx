import {useContext} from 'react'
import {Dimensions, StyleSheet, Pressable, Image} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import {View} from '@components/Themed'
import {PlayerControls} from '@components/Player/PlayerControls'
import {Progress} from '@components/Player/Progress'
import {SongInfo} from '@components/Player/SongInfo'
import {DashboardPlayer} from '@components/Player/DashboardPlayer'
import {CacheSong} from '@components/Player/CacheSong'
import {PlayListContext} from 'src/shared-state'
import {EventBusName, onPushEventBus} from 'src/services'
import {useNavigation} from '@react-navigation/native'
import URLWebView from 'src/constants/UrlWebView'
import TrackPlayer from 'react-native-track-player'

const PopupPlayer = () => {
  const playListContext = useContext(PlayListContext)
  const {updateMiniControl, updatePositionModalPlayer, playList} =
    playListContext
  const navigation = useNavigation()

  const onHiddenPlayer = () => {
    console.log('PRESS HIDDEN ===>')
    updateMiniControl(true)
    onPushEventBus({type: EventBusName.CHECK_UPDATE_MINI_PLAYER, payload: true})
    updatePositionModalPlayer(-Dimensions.get('screen').height)
  }

  const onPressDetail = async () => {
    console.log('PLAYLIST ===>', playList)
    updateMiniControl(true)
    onPushEventBus({type: EventBusName.CHECK_UPDATE_MINI_PLAYER, payload: true})
    navigation.navigate('DetailScreen', {
      url: `${URLWebView.HOME}/playlist/on-playing/${playList?.playList?.id}`,
      miniPlayerMB: 0,
    })
  }

  return (
    <View style={{flex: 1}}>
      <LinearGradient
        colors={['#121212', '#121212', '#121212']}
        style={{flex: 1, paddingHorizontal: 24}}>
        <View style={s.wrapperViewHeader}>
          <Pressable
            onPress={onHiddenPlayer}
            hitSlop={{top: 10, bottom: 10, right: 10, left: 10}}>
            <Image
              source={require('@assets/images/player/icon_arrow_down.png')}
            />
          </Pressable>
          <Pressable
            hitSlop={{top: 10, bottom: 10, right: 10, left: 10}}
            onPress={onPressDetail}>
            <Image
              source={require('@assets/images/player/icon_playinglist.png')}
            />
          </Pressable>
        </View>

        <SongInfo />
        <Progress />
        <PlayerControls />
        <DashboardPlayer />
        <CacheSong />
      </LinearGradient>
    </View>
  )
}

export default PopupPlayer

const s = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#212121',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    backgroundColor: 'transparent',
    marginTop: 24,
    paddingHorizontal: 0,
  },
  wrapperViewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    // marginHorizontal: 24,
    marginTop: 35,
  },
  earning: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
})
