import React, {useContext, useEffect, useState} from 'react'
import {
  BackHandler,
  ColorSchemeName,
  Image,
  Text,
  View,
  Animated,
  Dimensions,
  Easing,
} from 'react-native'
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native'
import Clipboard from '@react-native-clipboard/clipboard'
import {createNativeStackNavigator} from '@react-navigation/native-stack'
import NotFoundScreen from '../screens/NotFoundScreen'
import HomeScreen from '@screens/HomeScreen'
import Inventory from '@screens/InventoriesScreen'
import PlayListScreen from '@screens/PlayListScreen'
import MarketScreen from '@screens/MarketScreen'
import MoreScreen from '@screens/MoreScreen'
import PlaySong from '@screens/PlaySong'
import PopupPlayer from '@screens/PopupPlayer'
import DetailScreen from '@screens/DetailWithoutMenuScreen'
import Modal from 'react-native-modal'
import {MiniPlayer} from '@screens/MiniControlPlayer'
import {
  RootStackParamList,
  RootTabParamList,
  RootTabScreenProps,
} from '../../types'
import LinkingConfiguration from './LinkingConfiguration'
import {UserContext, PlayListContext} from 'src/shared-state'
import Header from 'src/components/layouts/Header'
import {SafeAreaView} from 'react-native-safe-area-context'
import {Subscription} from 'rxjs'
import EventBus, {EventBusName, onPushEventBus} from 'src/services/EventBus'
import {CommonActions, useNavigation} from '@react-navigation/native'

export default function MainStack({
  colorScheme,
}: {
  colorScheme: ColorSchemeName
}) {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootNavigator />
    </NavigationContainer>
  )
}
const Stack = createNativeStackNavigator<RootStackParamList>()

function RootNavigator(props: any) {
  const subScription = new Subscription()
  const userContext = useContext(UserContext)
  const {
    user: {accessToken},
  } = userContext
  const navigation = useNavigation()

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Root"
        component={BottomTabNavigator}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="NotFound"
        component={NotFoundScreen}
        options={{title: 'Oops!'}}
      />
      <Stack.Screen
        name="DetailScreen"
        component={DetailScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  )
}

const BottomTab = createBottomTabNavigator<RootTabParamList>()

function BottomTabNavigator() {
  const userContext = useContext(UserContext)
  const playListContext = useContext(PlayListContext)
  const {
    user: {accessToken},
    changeToken,
  } = userContext
  const {showPopupPlayer, updatePopupPlayer, positionModalPlayer} =
    playListContext

  const [bottomPosition, setBottomPosition] = useState(
    new Animated.Value(positionModalPlayer),
  )

  useEffect(() => {
    // setBottomPosition(new Animated.Value(positionModalPlayer))
    setBottomPosition(bottomPosition)

    // if (positionModalPlayer !== 0) {
    //   Animated.timing(bottomPosition, {
    //     toValue: positionModalPlayer,
    //     duration: 500,
    //     easing: Easing.linear,
    //     useNativeDriver: false,
    //   }).start()
    //   setBottomPosition(bottomPosition)
    // } else {
    //   Animated.timing(bottomPosition, {
    //     toValue: 0,
    //     duration: 500,
    //     easing: Easing.linear,
    //     useNativeDriver: false,
    //   }).start()
    //   setBottomPosition(bottomPosition)
    // }
  }, [positionModalPlayer, bottomPosition])

  const [blockPress, setBlockPress] = useState<boolean>(false)

  const subscription = new Subscription()

  const onRegisterEventBus = () => {
    subscription.add(
      EventBus.getInstance().events.subscribe((res: any) => {
        if (res?.type === EventBusName.BLOCK_PRESS_MENU) {
          setBlockPress(true)
        } else if (res?.type === EventBusName.UN_BLOCK_PRESS_MENU) {
          setBlockPress(false)
        } else if (res?.type === EventBusName.UPDATE_NEW_TOKEN) {
          changeToken(res?.payload)
        }
      }),
    )
  }

  useEffect(() => {
    const checkBackPress = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        onPushEventBus({type: EventBusName.PRESS_BACK, payload: {main: true}})
        return true
      },
    )
    return () => checkBackPress.remove()
  }, [])

  useEffect(() => {
    onRegisterEventBus()
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <View style={{flex: 1, position: 'relative'}}>
      <SafeAreaView />
      <Header />
      <BottomTab.Navigator
        initialRouteName="PlayListScreen"
        screenListeners={{
          tabPress: e => {
            if (blockPress) {
              e.preventDefault()
            }
          },
        }}
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: '#000',
            borderTopColor: '#000',
          },
        }}>
        <BottomTab.Screen
          name="PlayListScreen"
          component={PlayListScreen}
          options={({navigation}: RootTabScreenProps<'PlayListScreen'>) => ({
            tabBarIcon: ({focused}) => (
              <Image
                style={{width: 40, height: 40}}
                source={
                  focused
                    ? require('@assets/images/icons/tabbar/icon_tabbar_playlist_w.png')
                    : require('@assets/images/icons/tabbar/icon_tabbar_playlist.png')
                }
              />
            ),
          })}
        />
        <BottomTab.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={({navigation}: RootTabScreenProps<'HomeScreen'>) => ({
            tabBarIcon: ({focused}) => (
              <Image
                style={{width: 40, height: 40}}
                source={
                  focused
                    ? require('@assets/images/icons/tabbar/bottomnav_my.png')
                    : require('@assets/images/icons/tabbar/bottomnav_my_dimmed.png')
                }
              />
            ),
          })}
        />
        <BottomTab.Screen
          name="Inventory"
          component={Inventory}
          options={({navigation}: RootTabScreenProps<'Inventory'>) => ({
            tabBarIcon: ({focused}) => (
              <Image
                style={{width: 50, height: 40}}
                source={
                  focused
                    ? require('@assets/images/icons/tabbar/bottomnav_collection.png')
                    : require('@assets/images/icons/tabbar/bottomnav_collection_dimmed.png')
                }
              />
            ),
          })}
        />
        <BottomTab.Screen
          name="MarketScreen"
          component={MarketScreen}
          options={({navigation}: RootTabScreenProps<'MarketScreen'>) => ({
            tabBarIcon: ({focused}) => (
              <Image
                style={{width: 40, height: 40}}
                source={
                  focused
                    ? require('src/assets/images/icons/tabbar/icon_tabbar_market_w.png')
                    : require('@assets/images/icons/tabbar/icon_tabbar_market.png')
                }
              />
            ),
          })}
        />
      </BottomTab.Navigator>

      {showPopupPlayer && (
        <View
          style={{
            flex: 1,
            zIndex: 10,
            position: 'absolute',
            width: '100%',
            height: '100%',
            marginTop: 80,
            ...(positionModalPlayer < 0 && {bottom: positionModalPlayer}),
          }}>
          <PopupPlayer />
        </View>
      )}

      <MiniPlayer />
    </View>
  )
}
