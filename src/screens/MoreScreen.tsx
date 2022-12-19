import {ActivityIndicator, Dimensions, StyleSheet, View} from 'react-native'

import {RootTabScreenProps} from '../../types'
import React, { useContext, useState } from 'react'
import URLWebView from 'src/constants/UrlWebView'
import BasicWebview from 'src/atomics/Webview/BasicWebview'
import { WebViewMessageEvent } from 'react-native-webview'
import { UserContext } from 'src/shared-state'

export default function MoreScreen({
  navigation,
}: RootTabScreenProps<'MoreScreen'>) {

  const [loading, setLoading] = useState<boolean>(true)

  const onMessage = (event: WebViewMessageEvent) => {
    console.log('MESSAGE HOME ===>', event)
  }

  const onLoadEndWebView = () => {
    setLoading(false)
  }

  return (
    <View style={styles.container}>
      {
      loading && 
        <ActivityIndicator color={"white"} size='large' style={styles.loading} />
      }
        <BasicWebview
          uri={URLWebView.MORE} 
          onReceiveMessage={onMessage}
          onLoadEnd={onLoadEndWebView}
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
