import {FontAwesome} from '@expo/vector-icons'
import * as Font from 'expo-font'
// import * as SplashScreen from 'expo-splash-screen';
import {useEffect, useState} from 'react'

export default function useCachedResources() {
  const [isLoadingComplete, setLoadingComplete] = useState(false)

  // Load any resources or data that we need prior to rendering the app
  const loadResourcesAndDataAsync = async () => {
    try {
      await Font.loadAsync({
        ...FontAwesome.font,
        'space-mono': require('../assets/fonts/SpaceMono-Regular.ttf'),
        Gilroy: require('../assets/fonts/Gilroy-Light.otf'),
        GilroyBold: require('../assets/fonts/Gilroy-ExtraBold.otf'),
      })
      setLoadingComplete(true)
    } catch (e) {
      // We might want to provide this error information to an error reporting service
      console.warn(e)
      console.log('ERROR SPLASH SCREEN ===>', e)
      setLoadingComplete(true)
    }
  }
  useEffect(() => {
    loadResourcesAndDataAsync()
  }, [])

  return isLoadingComplete
}
