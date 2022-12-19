import {forwardRef, useContext, useEffect, useRef, useState} from 'react'
import {
  Dimensions,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
} from 'react-native'
import {Video} from 'expo-av'
import {Modalize} from 'react-native-modalize'
import LinearGradient from 'react-native-linear-gradient'
import {View} from '@components/Themed'
import {PlayerControls} from '@components/Player/PlayerControls'
import {Progress} from '@components/Player/Progress'
import {SongInfo} from '@components/Player/SongInfo'
import {DashboardPlayer} from '@components/Player/DashboardPlayer'
import {useCurrentTrack} from '@hooks/useCurrentTrack'
import {useCombinedRefs} from '../../utils/use-combined-refs'
import {SetupService} from '../../services'
import {PlayListContext} from 'src/shared-state'
import {useNavigation} from '@react-navigation/native'

const {height} = Dimensions.get('window')
const HEADER_HEIGHT = 100

const Player = forwardRef(({animated, song, headphone}: any, ref) => {
  const navigation = useNavigation()
  const video = useRef<Video>(null)
  const modalizeRef = useRef(null)
  const combinedRef = useCombinedRefs(ref, modalizeRef)
  const [handle, setHandle] = useState(false)
  const track = useCurrentTrack()
  const [isPlayerReady, setIsPlayerReady] = useState<boolean>(false)

  const playListContext = useContext(PlayListContext)
  const {showMiniControl, updateMiniControl, updatePopupPlayer} =
    playListContext

  useEffect(() => {
    async function run() {
      const isSetup = await SetupService()
      setIsPlayerReady(isSetup)
    }

    run()
  }, [])

  const handlePosition = (position: string) => {
    setHandle(position === 'top')
  }
  if (!isPlayerReady) {
    return null
  }

  const onHiddenPlayer = () => {
    // console.log('PRESS HIDDEN ===>')
    // navigation.goBack()
    updatePopupPlayer(false)
    updateMiniControl(true)
  }

  return (
    <Modalize
      ref={combinedRef}
      alwaysOpen={height}
      withHandle={false}
      handlePosition="outside"
      onPositionChange={handlePosition}
      withOverlay={true}
      // modalTopOffset={0}
      modalStyle={{
        flex: 1,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        backgroundColor: 'red',
      }}>
      <ScrollView>
        {/* <Earning data={{event: 'earning', song_id: 1}} /> */}
        <View style={{paddingBottom: 0, height}}>
          <LinearGradient
            colors={['#121212', '#121212', '#121212']}
            style={{flex: 1, justifyContent: 'space-between'}}>
            <View style={s.wrapperViewHeader}>
              <Pressable onPress={onHiddenPlayer}>
                <Image
                  source={require('@assets/images/player/icon_arrow_down.png')}
                />
              </Pressable>
              <Pressable>
                <Image
                  source={require('@assets/images/player/icon_playinglist.png')}
                />
              </Pressable>
            </View>
            <View
              style={{
                marginHorizontal: 24,
                backgroundColor: 'transparent',
                flex: 1,
              }}>
              <SongInfo song={song} video={video} headphone={headphone} />
              <Progress />
              <PlayerControls />
              <DashboardPlayer />
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </Modalize>
  )
})

export default Player

const s = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#212121',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapperViewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    marginHorizontal: 24,
    marginTop: 35,
  },
  earning: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
  },
})
