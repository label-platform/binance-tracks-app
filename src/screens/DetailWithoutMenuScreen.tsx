import {BackHandler, StyleSheet, View} from 'react-native'
import {RootStackParamList, RootTabScreenProps} from '../../types'
import React, { useEffect, useContext } from 'react'
import BasicWebview from 'src/atomics/Webview/BasicWebview'
import {RouteProp, useRoute} from '@react-navigation/native'
import Header from 'src/components/layouts/Header'
import {SafeAreaView} from 'react-native-safe-area-context'
import { MiniPlayer } from './MiniControlPlayer'
import {PlayListContext} from 'src/shared-state'
import {isNil} from 'lodash'
import { EventBusName, onPushEventBus } from 'src/services'
import TrackPlayer from 'react-native-track-player'
import {useIsFocused, useNavigation} from '@react-navigation/native'

export default function DetailScreen({
  navigation,
}: RootTabScreenProps<'DetailScreen'>) {
  const route: RouteProp<RootStackParamList, 'DetailScreen'> = useRoute()

  const navigationRoot = useNavigation()
  const isFocus = useIsFocused()

  const playListContext = useContext(PlayListContext)
  const {showMiniControl, playList} = playListContext
  const marginBottom = !isNil(route?.params?.miniPlayerMB) 
    ? route?.params?.miniPlayerMB  
    : 49

  useEffect(() => {
    const checkBackPress = BackHandler.addEventListener('hardwareBackPress', () => {
      onPushEventBus({type: EventBusName.PRESS_BACK, payload: { main: false }})
      // navigation.goBack()
      return true
    })
    return () => checkBackPress.remove()
  }, [])

  useEffect(() => {
      if (!showMiniControl && isFocus && route.params?.url?.includes('on-playing') ) {
        navigationRoot.goBack()
      }
  }, [showMiniControl, isFocus])

  return (
    <>
      <View style={{...styles.container}}>
        <SafeAreaView />
        <Header />
        <BasicWebview 
          uri={route.params?.url}
          
        />
      </View>
    <MiniPlayer marginBottom={marginBottom} />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
})
