import {StyleSheet} from 'react-native'
import BasicWebview from '../atomics/Webview/BasicWebview'
import {SafeAreaView} from 'react-native-safe-area-context'
import { WebViewMessageEvent } from 'react-native-webview'
import {UserContext} from 'src/shared-state'
import { useContext } from 'react'
import EventsFromWebView from 'src/constants/Events'
import {isEmpty} from 'lodash'
import URLWebView from 'src/constants/UrlWebView'
import {Api} from 'src/services'


interface PropsLoginScreen {
  setIsLogin: (login:boolean) => void
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

const LoginScreen = (props: PropsLoginScreen) => {
  const context = useContext(UserContext)
const {logIn} = context
const onReceiveMessage = (event: WebViewMessageEvent) => {
  const response = JSON.parse(event?.nativeEvent?.data)
  // console.log('ONMESSAGE 11111 ===>', response)
  if (response?.name === EventsFromWebView.LOGIN && !isEmpty(response?.params?.user)) {
    console.log('RESPONSE LOGIN ===>', response)
    logIn({
      userInfo: response?.params?.user, 
      accessToken: response?.params?.accessToken, 
      refreshToken: response?.params?.refreshToken
    })
    props?.setIsLogin(true)
    Api.setToken(response?.params?.accessToken, response?.params?.refreshToken)
  }
}
  return (
    <SafeAreaView style={styles.container}>
      <BasicWebview uri={URLWebView.LOGIN} 
        onReceiveMessage={onReceiveMessage} 
    />
    </SafeAreaView>
  )
}

export default LoginScreen