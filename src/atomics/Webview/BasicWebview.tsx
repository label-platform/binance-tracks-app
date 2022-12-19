import {WebView, WebViewMessageEvent, WebViewProps} from 'react-native-webview'
import {useContext, useRef, useEffect, useState} from 'react'
import {
  BackHandler,
  ActivityIndicator,
  View,
  Dimensions,
  StyleSheet,
} from 'react-native'
import {UserContext, PlayListContext} from 'src/shared-state'
import EventsWebView from 'src/constants/Events'
import {Subscription} from 'rxjs'
import EventBus, {EventBusName, onPushEventBus} from 'src/services/EventBus'
import Events from 'src/constants/Events'
import TrackPlayer, {usePlaybackState, State} from 'react-native-track-player'
import * as SecureStore from 'expo-secure-store'
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native'
import URLWebView from 'src/constants/UrlWebView'
import {Api, SetupService} from 'src/services'
import {showAlert} from 'src/components/Toast'
import Clipboard from '@react-native-clipboard/clipboard'
interface IBasicWebview extends WebViewProps {
  uri: string
  onReceiveMessage?: (event: WebViewMessageEvent) => void
}

const BasicWebview = ({uri, onReceiveMessage, ...restProps}: IBasicWebview) => {
  const focused = useIsFocused()
  const navigation = useNavigation()
  const userContext = useContext(UserContext)
  const playListContext = useContext(PlayListContext)
  const {
    logOut,
    changeToken,
    changeWalletAddress,
    user: {refreshToken},
  } = userContext
  const {
    updatePlayList,
    playList,
    showMiniControl,
    updatePopupPlayer,
    headphone,
    updateHeadPhone,
    updateMiniControl,
    showPopupPlayer,
  } = playListContext
  const refWebView = useRef<WebView>(null)
  const subScription = new Subscription()

  const statePlaying = usePlaybackState()

  const onMessage = async (event: WebViewMessageEvent) => {
    console.log('ON MESSAGE BASIC WEBVIEW ===>', event)

    const {name, params} = JSON.parse(event.nativeEvent.data)
    if (
      name === EventsWebView.EXPIRED_TOKEN ||
      name === EventsWebView.LOG_OUT
    ) {
      onPushEventBus({type: EventBusName.LOG_OUT})
      logOut()
      if (showMiniControl) {
        updateMiniControl(false)
      }
      if (showPopupPlayer) {
        updatePopupPlayer(false)
      }
    } else if (name === EventsWebView.CHANGE_HEADPHONE) {
      onChangeHeadPhone(params)
    } else if (name === EventsWebView.REQUEST_PRIVATE_KEY) {
      const privateKey = await SecureStore.getItemAsync('privateKey')

      if (privateKey) {
        onSendEventPrivateKey(privateKey)
      }
    } else if (name === EventsWebView.EXIT_APP) {
      BackHandler.exitApp()
    } else if (name === EventsWebView.SAVE_PASS_CODE) {
      SecureStore.setItemAsync('passCode', params?.passcode)
    } else if (name === EventsWebView.SAVE_PRIVATE_KEY) {
      SecureStore.setItemAsync('privateKey', params?.pk)
      changeWalletAddress(params.address)
    } else if (name === EventsWebView.COVER_NATIVE_DISPLAY) {
      onPushEventBus({type: EventBusName.BLOCK_PRESS_MENU})
    } else if (name === EventsWebView.RELEASE_NATIVE_DISPLAY) {
      onPushEventBus({type: EventBusName.UN_BLOCK_PRESS_MENU})
    } else if (name === EventsWebView.CHECK_PASS_CODE) {
      const passCodeStore = await SecureStore.getItemAsync('passCode')
      if (passCodeStore && passCodeStore === params?.passcode) {
        onSendCheckPassCode(true)
      } else {
        onSendCheckPassCode(false)
      }
    } else if (name === EventsWebView.CHARGE_HEADPHONE) {
      if (+headphone.headphoneID === params?.headphoneID) {
        updateHeadPhone({
          headphoneID: headphone.headphoneID,
          battery: params?.energy,
          detail: headphone?.detail,
        })
      }
    } else if (name === EventsWebView.NO_BOTTOM_MENU) {
      navigation.navigate('DetailScreen', {
        url: `${URLWebView.MAIN}${params?.url}`,
      })
    } else if (name === EventsWebView.SHOW_LOG) {
    } else if (name === EventsWebView.SHOW_ALERT) {
      showAlert(params?.message)
    } else if (name === EventsWebView.SEND_ACCESS_TOKEN) {
      Api.token = params.token
      changeToken(params.token)
    } else if (name === EventsWebView.BACK_TO_PLAYER) {
      navigation.goBack()
      updateMiniControl(false)
    } else if (name === EventsWebView.CHECK_MINI_PLAYER) {
      onSendCheckMiniPlayer(showMiniControl)
    } else if (name === EventsWebView.SEND_PLAY_SONG) {
      console.log('RECEIVE EVENT ====>')
      onPushEventBus({
        type: EventBusName.SEND_PLAY_SONG,
        payload: {idTrack: params?.idTrack},
      })
    } else if (name === EventsWebView.BACK_PRESS) {
      navigation.goBack()
    } else if (name === EventsWebView.REQUEST_CURRENT_SONG_INFO) {
      const currentTrack = await TrackPlayer.getCurrentTrack()
      if (currentTrack !== null) {
        const idTrack = playList?.playList?.playlistDetail?.[currentTrack]?.id
        const idPlayList = playList?.playList?.id
        onPushEventBus({
          type: EventBusName.SEND_INFO_CURRENT_SONG,
          payload: {idTrack, idPlayList},
        })
      }
    } else if (name === EventsWebView.REQUEST_NAVIGATION) {
      navigation.navigate('Root', {screen: params.stack || 'HomeScreen'})
    } else if (name === EventsWebView.WRITE_CLIPBOARD) {
      Clipboard.setString(params.text)
    } else if (name === EventsWebView.READ_CLIPBOARD) {
      const text = await Clipboard.getString()
      onPushEventBus({type: EventBusName.READ_CLIPBOARD, payload: {text}})
    } else {
      onReceiveMessage?.(event)
    }
  }

  const onChangeHeadPhone = async (params: any) => {
    const isSetup = await SetupService()
    console.log('CHANGE HEADPHONE ===>', params)
    if (isSetup) {
      const queue = await TrackPlayer.getQueue()
      console.log('QUEUE ===>', queue)
      if (!queue?.length) {
        updateHeadPhone({
          headphoneID: params?.item?.id,
          battery: params?.battery,
          detail: headphone?.detail,
        })
      } else {
        showAlert(`You can't change headphone when playing`)
      }
    } else {
      updateHeadPhone({
        headphoneID: params?.item?.id,
        battery: params?.battery,
        detail: headphone?.detail,
      })
    }
  }

  const onSendEventManageHeadPhone = () => {
    refWebView?.current?.injectJavaScript(`
    (function() {
      document.dispatchEvent(new MessageEvent('message', {
       data: {
        type: "${Events.MANAGER_HEADPHONE}"
       }
      }));
    })();`)
  }

  const onSendEventSetupWallet = () => {
    refWebView?.current?.injectJavaScript(`
    (function() {
      document.dispatchEvent(new MessageEvent('message', {
       data: {
        type: "${Events.SETUP_WALLET}"
       }
      }));
    })();`)
  }

  const onSendDetailWallet = () => {
    refWebView?.current?.injectJavaScript(`
    (function() {
      document.dispatchEvent(new MessageEvent('message', {
       data: {
        type: "${Events.DETAIL_WALLET}"
       }
      }));
    })();`)
  }

  const onSendEventPressBack = (isMain: boolean) => {
    console.log('SEND EVENT BACK PRESS ===>')
    refWebView?.current?.injectJavaScript(`
    (function() {
      document.dispatchEvent(new MessageEvent('message', {
        data: {
          type: "${Events.BACK_PRESS}",
          params: { isMain: ${isMain} }
        }
      }));
    })();`)
  }

  const onSendEventPrivateKey = (privateKey: string) => {
    refWebView?.current?.injectJavaScript(`
    (function() {
      document.dispatchEvent(new MessageEvent('message', {
        data: {
          type: "${Events.SEND_PRIVATE_KEY}",
          params: {privateKey: "${privateKey}"}
        }
      }));
    })();`)
  }

  const onSendCheckPassCode = (isCorrect: boolean) => {
    refWebView?.current?.injectJavaScript(`
    (function() {
      document.dispatchEvent(new MessageEvent('message', {
        data: {
          params: {isCorrect: ${isCorrect}}, 
          type: "${Events.IS_CORRECT_PASS_CODE}"
        }
      }));
    })();`)
  }

  const onSendCheckMiniPlayer = (show: boolean) => {
    refWebView?.current?.injectJavaScript(`
    (function() {
      document.dispatchEvent(new MessageEvent('message', {
        data: {
          type: "${Events.CHECK_MINI_PLAYER}", 
          params: {isShow: ${show}}
        }
      }));
    })();`)
  }

  const onSendEventIsPlaying = (isPlaying: boolean) => {
    refWebView?.current?.injectJavaScript(`
    (function() {
      document.dispatchEvent(new MessageEvent('message', {
        data: {
          type: "${Events.IS_PLAYING}", 
          params: {isPlaying: ${isPlaying}}
        }
      }));
    })();`)
  }

  const onSendInfoCurrentSong = (idTrack: number, idPlayList: number) => {
    refWebView?.current?.injectJavaScript(`
    (function() {
      document.dispatchEvent(new MessageEvent('message', {
        data: {
          type: "${Events.SEND_INFO_CURRENT_SONG}", 
          params: {idTrack: ${idTrack}, idPlayList: ${idPlayList}}
        }
      }));
    })();`)
  }

  const onReadClipboard = (text: string) => {
    refWebView?.current?.injectJavaScript(`
    (function() {
      document.dispatchEvent(new MessageEvent('message', {
        data: {
          type: "${Events.READ_CLIPBOARD}", 
          params: {text: "${text}"}
        }
      }));
    })();`)
  }

  useFocusEffect(() => {
    onPushEventBus({
      type: EventBusName.CHECK_UPDATE_MINI_PLAYER,
      payload: showMiniControl,
    })
  })

  useEffect(() => {
    if (focused) {
      onRegisterEventBus()
      return () => {
        subScription.unsubscribe()
      }
    }
  })

  const onRegisterEventBus = () => {
    subScription.add(
      EventBus.getInstance().events.subscribe((res: any) => {
        if (res?.type === EventBusName.MANAGER_HEADPHONE) {
          onSendEventManageHeadPhone()
        } else if (res?.type === EventBusName.PRESS_BACK) {
          onSendEventPressBack(res?.payload?.main)
        } else if (res?.type === EventBusName.CHECK_PASS_FROM_WEBVIEW) {
          onSendCheckPassCode(res?.payload)
        } else if (res?.type === EventBusName.CHECK_UPDATE_MINI_PLAYER) {
          onSendCheckMiniPlayer(res?.payload)
        } else if (res?.type === EventBusName.SETUP_WALLET) {
          onSendEventSetupWallet()
        } else if (res?.type === EventBusName.DETAIL_WALLET) {
          onSendDetailWallet()
        } else if (res?.type === EventBusName.IS_PLAYING) {
          onSendEventIsPlaying(res?.payload)
        } else if (res?.type === EventBusName.SEND_INFO_CURRENT_SONG) {
          onSendInfoCurrentSong(res?.payload?.idTrack, res?.payload?.idPlayList)
        } else if (res?.type === EventBusName.READ_CLIPBOARD) {
          onReadClipboard(res?.payload?.text)
        }
      }),
    )
  }

  const runFirst = `
    window.isNativeApp = true;
    window.refreshToken = "${refreshToken}";
    true; // note: this is required, or you'll sometimes get silent failures
  `

  return (
    <WebView
      ref={refWebView}
      source={{
        uri,
        headers: {
          Cookie: `domain=fe.tracks.label.community:path=/`,
        },
      }}
      style={styles.webview}
      allowsBackForwardNavigationGestures={false}
      onMessage={onMessage}
      injectedJavaScriptBeforeContentLoaded={runFirst}
      sharedCookiesEnabled={true}
      {...restProps}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  loading: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    marginTop: Dimensions.get('screen').height / 2 - 100,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  webview: {
    backgroundColor: '#121212',
    zIndex: 1,
  },
})

export default BasicWebview
