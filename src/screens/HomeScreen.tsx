import {RootTabScreenProps} from '../../types'
import BasicWebview from '../atomics/Webview/BasicWebview'
import { WebViewMessageEvent } from 'react-native-webview'
import URLWebView from 'src/constants/UrlWebView'
import {View, StyleSheet, ActivityIndicator, Dimensions} from 'react-native'
import { useState } from 'react'

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

function HomeScreen({navigation}: RootTabScreenProps<'HomeScreen'>) {
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
          uri={URLWebView.HOME} 
          onReceiveMessage={onMessage}
          onLoadEnd={onLoadEndWebView}
        />
    </View>
  )
}



export default HomeScreen
