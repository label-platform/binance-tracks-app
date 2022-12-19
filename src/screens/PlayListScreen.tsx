import {useContext, useState} from 'react'
import TrackPlayer, {usePlaybackState, State} from 'react-native-track-player'

import URLWebView from 'src/constants/UrlWebView'
import { WebViewMessageEvent } from 'react-native-webview'
import { RootTabScreenProps } from 'types'
import BasicWebview from 'src/atomics/Webview/BasicWebview'
import EventsWebView from 'src/constants/Events'
import {PlayList, StateModalPlayer} from 'src/constants/Interface'
import {PlayListContext} from 'src/shared-state'
import { EventBusName, onPushEventBus, SetupService } from 'src/services'
import ModalPlayer from 'src/components/Player/ModalAction'
import {getPath, createFolderSaveRootPlayList, checkFileExists, createFolder} from 'src/utils/file'
import RNFS from 'react-native-fs'
import {View, ActivityIndicator, StyleSheet, Dimensions} from 'react-native'

export default function PlayListScreen({
  navigation,
}: RootTabScreenProps<'PlayListScreen'>) {
  const context = useContext(PlayListContext)

  const {
    updatePlayList, updatePopupPlayer, playList, headphone, energy,
    showPopupPlayer, updatePositionModalPlayer, updateMiniControl
  } = context
  const [stateModal, setStateModal] = useState<StateModalPlayer>({isVisible: false, description: '', textNegative: '', textPositive: '', typeModal: ''})
  const [params, setParams] = useState<PlayList>({
    createdAt: '',
    updatedAt: '',
    id: 0,
    name: '',
    img: '',
    display: '',
    order: 0,
    playlistDetail: [],
    playlistImg: '',
    playlistName: ''
  })

  const [loading, setLoading] = useState<boolean>(true)

  const onLoadEndWebView = () => {
    setLoading(false)
  }

  const state = usePlaybackState()


  const onMessage = async (event: WebViewMessageEvent) => {
    const {name} = JSON.parse(event.nativeEvent.data)
    const params: PlayList = JSON.parse(event.nativeEvent.data)?.params
    if (name === EventsWebView.PLAY_SONG) {
      setParams(params)
      const result = checkPlayer()
      if (result) {
        runPlayer(params)
      }
    }
  }

  const runPlayer = async (params: PlayList) => {
    console.log('PLAYLIST ===>', params)
    // return
    const path = getPath()
    await createFolderSaveRootPlayList()
    const pathChild = path.concat(`/playList${params?.id}`)
    const folderPlayListChild = await checkFileExists(pathChild)
    if (!folderPlayListChild) {
      await createFolder(pathChild)
    } else {
      // TODO:
      const checkDataFolder = await RNFS.readDir(pathChild)
      if (checkDataFolder?.length) {
        for(const song of checkDataFolder) {
          params?.playlistDetail?.forEach(e => {
            if (`song${e?.song?.id}.mp3` === song?.name) {
              e.song.s3Name = song?.path
            }
          })
        }
      }
    }
    updatePlayList({dataPlayList: params})
    await SetupService()
    TrackPlayer.reset()
    params?.playlistDetail?.forEach((item, index) => {
      TrackPlayer.add({
        url: item?.song?.s3Name,
        title: item?.song?.name,
        artist: item?.song?.artists?.[0]?.artistInfo?.name,
        artwork: params?.playlistImg,
        // artwork: params.img,
        album: params?.name,
      })
    })

    const queue = await TrackPlayer.getQueue()
    console.log('QUEUE ====>', queue)
    onPushEventBus({type: EventBusName.IS_PLAYING, payload: true})

    if (!showPopupPlayer) {
      updatePopupPlayer(true)
    } else {
      onPushEventBus({type: EventBusName.PLAY_NEW_LIST})
      updatePositionModalPlayer(0)
      updateMiniControl(false)
    }
  }

  const checkPlayer = () => {
    if (!energy) {
      setStateModal({
        isVisible: true, 
        typeModal: 'energy', 
        description: 'The energy is running out of energy. You won\'t accumulate rewards even if you keep listening.', 
        showNegativeButton: true,
        textPositive: 'Keep listening',
        textNegative: 'Stop listening', 
      })
      return false
    } else if (!headphone?.battery || !headphone?.headphoneID) {
      setStateModal({
        isVisible: true,
        typeModal: 'battery', 
        description: 'The battery in the headset is dead. The headset can be replaced or charged to continue.', 
        showNegativeButton: false,
        textPositive: 'Okay',
        textNegative: '', 
      })
      return false
    }
    return true
  }

  const onPressCloseModal = () => {
    setStateModal({...stateModal, isVisible: false})
  }

  const onPressPositive = () => {
    if (stateModal.typeModal === 'battery') {
      setStateModal({...stateModal, isVisible: false})
    } else if (stateModal.typeModal === 'energy') {
      setStateModal({...stateModal, isVisible: false})
      runPlayer(params)
    }
  }


  const onPressNegative = () => {
    if (stateModal.typeModal === 'battery') {
      return
    } else if (stateModal.typeModal === 'energy') {
      setStateModal({...stateModal, isVisible: false})
    } 
  }

  return (
    <View style={styles.container}>
      {
      loading && 
        <ActivityIndicator color={"white"} size='large' style={styles.loading} />
      }
      <BasicWebview 
        uri={URLWebView.PLAYLIST}
        onReceiveMessage={onMessage}
        onLoadEnd={onLoadEndWebView}
      />
      <ModalPlayer 
        isVisible={stateModal.isVisible} 
        textNegative={stateModal.textNegative} 
        textPositive={stateModal.textPositive} 
        onPressPositive={onPressPositive}
        onPressClose={onPressCloseModal}
        onPressNegative={onPressNegative}
        showNegativeButton={stateModal.showNegativeButton}
        desc={stateModal.description}
      />
    </View>
     
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#121212',
  },
  loading: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    marginTop: (Dimensions.get('screen').height / 2) - 100,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  webview: {
    backgroundColor: '#121212',
    zIndex: 1,
  }
})
