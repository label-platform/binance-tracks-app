import {ActivityIndicator, Dimensions, Platform, StyleSheet, View} from 'react-native'
import {RootTabScreenProps} from '../../types'
import BasicWebview from '../atomics/Webview/BasicWebview'
import {SafeAreaView} from 'react-native-safe-area-context'
import { WebViewMessageEvent } from 'react-native-webview'
import URLWebView from 'src/constants/UrlWebView'
import React, { useState } from 'react'

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

function Inventories({navigation}: RootTabScreenProps<'Inventory'>) {
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
          uri={URLWebView.INVENTORY} 
          onReceiveMessage={onMessage}
          onLoadEnd={onLoadEndWebView}
        />
    </View>
  )
}

export default Inventories

