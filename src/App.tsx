import {useState, useEffect} from 'react'
import {StatusBar} from 'expo-status-bar'
import {SafeAreaProvider} from 'react-native-safe-area-context'

import useColorScheme from './hooks/useColorScheme'
import MainStack from './navigation'
import AuthStack from './navigation/AuthStack'
import {
  UserProvider,
  UserContext,
  PlayListContext,
  PlayListProvider,
} from 'src/shared-state'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {StatusUser} from './constants/Interface'
import * as SplashScreen from 'expo-splash-screen'
import {FontAwesome} from '@expo/vector-icons'
import * as Font from 'expo-font'
import {Api} from './services'
import {RootSiblingParent} from 'react-native-root-siblings'

export default function App() {
  const [isLoadingComplete, setLoading] = useState<boolean>(false)
  const colorScheme = useColorScheme()

  const [isLogin, setIsLogin] = useState<boolean>(false)
  const [getLocalUser, setLocalUser] = useState<boolean>(false)
  // @ts-ignore
  const [user, setUser] = useState<StatusUser>({
    accessToken: '',
    user: {},
    refreshToken: '',
  })

  useEffect(() => {
    SplashScreen.preventAutoHideAsync()
      .then(check => {})
      .catch(err => {})
    prepareResources()
  }, [])

  const expireToken = async () => {
    await AsyncStorage.clear()
    // @ts-ignore
    setUser({accessToken: '', user: {}, refreshToken: ''})
    setIsLogin(false)
  }

  Api.expireToken = expireToken

  const prepareResources = async () => {
    await Font.loadAsync({
      ...FontAwesome.font,
      Gilroy: require('./assets/fonts/Gilroy-Light.otf'),
      GilroyBold: require('./assets/fonts/Gilroy-ExtraBold.otf'),
    })
    setLoading(true)
    await SplashScreen.hideAsync()
  }

  useEffect(() => {
    async function getToken() {
      const dataLocal = await AsyncStorage.multiGet([
        'user',
        'accessToken',
        'refreshToken',
      ])
      if (dataLocal?.length) {
        // const tokenLocal = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkQXQiOiIyMDIyLTA5LTE2VDA3OjQwOjMxIiwidXBkYXRlZEF0IjoiMjAyMi0xMS0yOFQwMzoyNDoyNiIsImlkIjoxMiwidXNlcm5hbWUiOm51bGwsInJvbGUiOiJsaXN0ZW5lciIsImVtYWlsIjoicXV5ZXRwaGFtLmRlLndvcmtAZ21haWwuY29tIiwiYWN0aXZhdGlvbkNvZGVJZCI6MTAsIndhbGxldEFkZHJlc3MiOiIweDFmZmUxNmRkYzQ0YjhkNDczZTJhNTlkMWZkM2I2YTk3NjcxMDE0ZjEiLCJlbmVyZ3lDYXAiOjQwLCJhdmFpbGFibGVFbmVyZ3kiOjQwLCJjb3VudEVuZXJneSI6MjU4LjgsImRhaWx5VG9rZW5FYXJuaW5nTGltaXQiOjQwLCJyZW1haW5lZFRva2VuRWFybmluZ0xpbWl0IjowLCJpc1R3b0ZhY3RvckF1dGhlbnRpY2F0aW9uUmVnaXN0ZXJlZCI6ZmFsc2UsImlzVHdvRmFjdG9yQXV0aGVudGljYXRpb25FbmFibGVkIjpmYWxzZSwic3RhdHVzIjp0cnVlLCJpYXQiOjE2Njk3ODE0ODMsImV4cCI6MTY2OTc4MjM4M30.GlfFlpxTsdqhcBa6VArDkaocElWgTEKf2ifKuZHJ2FY"
        const tokenLocal = dataLocal?.[1]?.[1]
        const userLocal = dataLocal?.[0]?.[1]
        const refreshToken = dataLocal?.[2]?.[1]

        if (userLocal) {
          setUser({
            accessToken: tokenLocal || '',
            user: JSON.parse(userLocal),
            refreshToken: refreshToken!,
          })
          Api.setToken(tokenLocal!, refreshToken!)
          setIsLogin(true)
        }
      }
      setLocalUser(true)
    }
    getToken()
  }, [])

  if (!isLoadingComplete || !getLocalUser) {
    return null
  } else {
    return (
      <UserProvider
        userData={user?.user}
        isLogin={isLogin}
        accessToken={user?.accessToken}
        setLogin={setIsLogin}
        refreshToken={user?.refreshToken}>
        <UserContext.Consumer>
          {context => {
            return (
              <PlayListProvider>
                <PlayListContext.Consumer>
                  {playListContext => {
                    return (
                      <SafeAreaProvider>
                        <RootSiblingParent>
                          {isLogin ? (
                            <MainStack colorScheme={colorScheme} />
                          ) : (
                            <AuthStack setIsLogin={setIsLogin} />
                          )}
                        </RootSiblingParent>
                        <StatusBar style="inverted" backgroundColor="#121212" />
                      </SafeAreaProvider>
                    )
                  }}
                </PlayListContext.Consumer>
              </PlayListProvider>
            )
          }}
        </UserContext.Consumer>
      </UserProvider>
    )
  }
}
