import React, {useContext, useEffect} from 'react'
import {useState} from 'react'
import {
  Image,
  StyleSheet,
  useColorScheme,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from 'react-native'
import Colors from 'src/constants/Colors'
import {Fonts} from 'src/constants/Fonts'
import {range} from 'lodash'
import {PlayListContext, UserContext} from 'src/shared-state'
import {Subscription} from 'rxjs'
import {Api, ApiUrl, SetupService} from 'src/services'
import EventBus, {EventBusName, onPushEventBus} from 'src/services/EventBus'
import {
  DetailHeadPhone,
  Energy,
  ItemSpendingBalance,
  User,
} from 'src/constants/Interface'
import {formatNumber} from 'src/utils/number'
import TrackPlayer, {State, usePlaybackState} from 'react-native-track-player'
import {showAlert} from '@components/Toast'
import URLWebView from 'src/constants/UrlWebView'
import {useNavigation} from '@react-navigation/native'

const pins = range(0, 10)

const renderIconBalance = (
  name: string,
  rotateData: Animated.AnimatedInterpolation,
  reloadBalance: boolean,
) => {
  if (name === 'BLB') {
    return (
      <View style={{position: 'relative'}}>
        <Image
          source={require('src/assets/images/icons/header/headphone.png')}
        />
        {reloadBalance && (
          <Animated.Image
            style={{
              position: 'absolute',
              bottom: -4,
              zIndex: 3,
              right: -4,
              width: 10,
              height: 10,
              transform: [{rotate: rotateData}],
            }}
            source={require('src/assets/images/icons/header/ic_reload.png')}
          />
        )}
      </View>
    )
  } else if (name === 'LBL') {
    return (
      <Image source={require('src/assets/images/icons/header/chrome.png')} />
    )
  } else {
    return (
      <Image
        source={require('src/assets/images/icons/header/icon_token_BNB.png')}
      />
    )
  }
}

const Header = ({style}: {style?: any}) => {
  const theme = useColorScheme() || 'light'
  const styles = getStyles(theme)
  const playListContext = useContext(PlayListContext)
  const userContext = useContext(UserContext)
  const user: User = userContext?.user?.user
  const navigation = useNavigation()

  const [headPhone, setHeadPhone] = useState<DetailHeadPhone | null>(null)
  const [listHeadPhone, setListHeadPhone] = useState<DetailHeadPhone[]>([])
  const [energy, setEnergy] = useState<Energy>({
    availableEnergy: 0,
    energyCap: 0,
  })
  // const [haveWallet, setHaveWallet] = useState<boolean>(true)
  const [haveWallet, setHaveWallet] = useState<boolean>(
    user?.walletAddress ? true : false,
  )
  const [spendingBalance, setSpendingBalance] = useState<ItemSpendingBalance[]>(
    [],
  )

  const [reloadBalance, setReloadBalance] = useState<boolean>(false)
  const [spinValue, setSpinValue] = useState(new Animated.Value(0))

  const [battery, setBattery] = useState<number>(0)

  const rotateData = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  const {
    updatePlayList,
    playList,
    headphone,
    updateHeadPhone,
    updateEnergy,
    showPopupPlayer,
    updatePositionModalPlayer,
    updateMiniControl,
    positionModalPlayer,
  } = playListContext
  const headphoneID = headphone.headphoneID

  const subscription = new Subscription()
  const state = usePlaybackState()

  const onPressBattery = async () => {
    const isSetup = await SetupService()
    if (isSetup) {
      const queue = await TrackPlayer.getQueue()
      if (!queue?.length) {
        onPushEventBus({type: EventBusName.MANAGER_HEADPHONE})
      } else {
        showAlert(`You can't change headphone when playing`)
      }
    } else {
      onPushEventBus({type: EventBusName.MANAGER_HEADPHONE})
    }
  }

  const getHeadPhoneActive = async () => {
    try {
      const res = await Api.get({url: ApiUrl.inventories.getHeadPhoneActive})
      if (res?.status === 200) {
        console.log('GET HEADPHONE ACTIVE ===>', res)
        const data: DetailHeadPhone = res?.data?.content
        setHeadPhone(data)
        updateHeadPhone({
          battery: data?.battery,
          headphoneID: data?.item?.id,
          detail: res?.data?.content,
        })
        setBattery(data?.battery)
      }
    } catch (err) {
      console.log('ERROR GET HEADPHONE ===>', err)
    }
  }

  const getListHeadPhone = async () => {
    try {
      const res = await Api.get({url: ApiUrl.inventories.getListHeadPhone})
      if (res?.status === 200) {
        // console.log('RESPONSE getListHeadPhone ==>', res)
        setListHeadPhone(res?.data?.content?.data)
      }
    } catch (err) {
      //
    }
  }

  const getSpendingBalance = async () => {
    try {
      const res = await Api.get({url: ApiUrl.inventories.getSpendingBalances})
      console.log('getSpendingBalance ===>', res)
      if (res?.status === 200) {
        setSpendingBalance(res?.data?.content)
      }
      setReloadBalance(false)
    } catch (err) {
      setReloadBalance(false)
      console.log('ERROR GET SPENDING BALANCE ===>', err)
    }
  }

  const getEnergy = async () => {
    try {
      const res = await Api.get({url: ApiUrl.energy.getEnergy})
      if (res?.status === 200) {
        // console.log('RESPONSE getEnergy ==>', res)

        setEnergy(res?.data)
        updateEnergy(res?.data?.availableEnergy)
      }
    } catch (err) {
      //
    }
  }

  const renderScreenWallet = () => {
    if (showPopupPlayer && positionModalPlayer <= 0) {
      updateMiniControl(true)
      onPushEventBus({
        type: EventBusName.CHECK_UPDATE_MINI_PLAYER,
        payload: true,
      })
      updatePositionModalPlayer(-Dimensions.get('screen').height)
    }
    navigation.navigate('DetailScreen', {url: `${URLWebView.MAIN}/wallet`})
  }

  const onPressSetupWallet = () => {
    onPushEventBus({type: EventBusName.SETUP_WALLET})
    // navigation.navigate('DetailScreen', {url: `${URLWebView.MAIN}/wallet` })
    // renderScreenWallet()
  }

  const onPressDetailWallet = () => {
    onPushEventBus({type: EventBusName.DETAIL_WALLET})
    renderScreenWallet()
    // navigation.navigate('DetailScreen', {url: `${URLWebView.MAIN}/wallet` })
  }

  useEffect(() => {
    if (headphoneID !== headPhone?.item?.id) {
      getHeadPhoneActive()
    }
  }, [headphoneID])

  useEffect(() => {
    if (reloadBalance) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start()
    } else {
      setSpinValue(new Animated.Value(0))
    }
  }, [reloadBalance])

  useEffect(() => {
    onRegisterEventBus()
    getSpendingBalance()
    getEnergy()
    getListHeadPhone()
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (playListContext.energy >= 0) {
      setEnergy({
        availableEnergy: playListContext.energy,
        energyCap: energy.energyCap,
      })
    }
  }, [playListContext.energy])

  useEffect(() => {
    setBattery(headphone.battery)
  }, [headphone.battery])

  useEffect(() => {
    setHaveWallet(user?.walletAddress ? true : false)
  }, [user])

  const onRegisterEventBus = () => {
    subscription.add(
      EventBus.getInstance().events.subscribe((res: any) => {
        if (res?.type === EventBusName.UPDATE_BALANCE_EARNING) {
          setReloadBalance(true)
          setTimeout(() => {
            getSpendingBalance()
          }, 21000)
        } else if (res?.type === EventBusName.RE_LOAD_BALANCE) {
          if (!reloadBalance) {
            setReloadBalance(true)
          }
        }
      }),
    )
  }

  const renderPin = () => {
    return (
      <TouchableOpacity
        style={styles.rowPin}
        disabled={!enableReloadPin}
        onPress={onPressBattery}>
        {pins?.map((value, index) => {
          if (value === 9) {
            const image =
              battery < 90
                ? require('@assets/images/icons/header/ic_pin_low.png')
                : require('@assets/images/icons/header/ic_pin_full.png')
            return (
              <Image
                key={value}
                resizeMode="center"
                style={{
                  ...styles.iconPin,
                  borderTopRightRadius: 99,
                  borderBottomRightRadius: 99,
                }}
                source={image}
              />
            )
          } else {
            const image =
              (value + 1) * 10 > battery
                ? require('@assets/images/icons/header/ic_pin_low.png')
                : require('@assets/images/icons/header/ic_pin_full.png')
            let tintColor = ''
            if (battery <= 20 && battery > 10 && value === 1) {
              tintColor = 'red'
            }
            if (battery <= 20 && battery > 0 && value === 0) {
              tintColor = 'red'
            }
            return (
              <Image
                key={value}
                style={{...styles.iconPin, tintColor}}
                source={image}
              />
            )
          }
        })}
      </TouchableOpacity>
    )
  }

  const imageHeadPhone = headPhone
    ? {uri: headPhone.item?.imgUrl}
    : require('@assets/images/icons/header/headphone_side.png')
  const enableReloadPin = listHeadPhone?.length
  const imageReload = enableReloadPin
    ? require('@assets/images/icons/header/ic_reload.png')
    : require('@assets/images/icons/header/ic_reload_none.png')

  const renderLeftHeader = () => (
    <View style={styles.viewLeft}>
      <View style={styles.borderView}>
        <Image
          style={styles.iconEnergy}
          source={require('@assets/images/icons/header/icon_energy.png')}
        />
        <Text
          style={
            styles.energy
          }>{`${energy?.availableEnergy}/${energy?.energyCap}`}</Text>
      </View>

      <View style={{...styles.borderView, marginLeft: 16}}>
        <View style={styles.wrapperHeadPhone}>
          <Image style={styles.iconEnergy} source={imageHeadPhone} />
          <TouchableOpacity
            style={styles.iconReload}
            disabled={!enableReloadPin}
            onPress={onPressBattery}>
            <Image source={imageReload} />
          </TouchableOpacity>
        </View>

        {renderPin()}
      </View>
    </View>
  )

  const renderRightHeader = () => {
    return (
      <View style={styles.viewRight}>
        {!haveWallet ? (
          <TouchableOpacity onPress={onPressSetupWallet}>
            <Image
              source={require('src/assets/images/icons/header/setupWallet.png')}
              style={styles.btSetUp}
            />
          </TouchableOpacity>
        ) : (
          <View
            style={{...styles.borderView, width: 154, paddingHorizontal: 10}}>
            {spendingBalance?.map((item, index) => (
              <TouchableOpacity
                style={styles.rowRightItem}
                key={index}
                onPress={onPressDetailWallet}>
                {renderIconBalance(
                  item?.tokenSymbol,
                  rotateData,
                  reloadBalance,
                )}
                <Text style={styles.count}>
                  {formatNumber(item?.availableBalance)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    )
  }

  return (
    <View style={[styles.rowHeader, style]}>
      {renderLeftHeader()}
      {renderRightHeader()}
    </View>
  )
}

export default Header

const getStyles = (theme: 'dark' | 'light') =>
  StyleSheet.create({
    rowHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 4,
      backgroundColor: Colors[theme].grayCode,
      paddingHorizontal: 28,
    },
    viewLeft: {
      flexDirection: 'row',
      flex: 0.5,
    },
    viewRight: {
      flex: 0.5,
      alignItems: 'flex-end',
      justifyContent: 'center',
      paddingVertical: 6,
    },
    borderView: {
      backgroundColor: Colors[theme].mineShaft,
      height: 24,
      borderRadius: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 6,
    },
    iconEnergy: {
      width: 18,
      height: 18,
      zIndex: 2,
      borderRadius: 9,
    },
    energy: {
      marginLeft: 10,
      color: Colors[theme].text,
      fontFamily: Fonts.fontFamily.GilroyBold,
      fontWeight: '600',
      marginRight: 8,
      fontSize: Fonts.fontSize[10],
    },
    rowPin: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: -2,
      zIndex: 1,
    },
    iconPin: {
      //
    },
    wrapperHeadPhone: {
      position: 'relative',
    },
    iconReload: {
      position: 'absolute',
      bottom: -4,
      zIndex: 3,
      right: -6,
    },
    btSetUp: {
      marginBottom: -6,
    },
    rowRightItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    count: {
      color: Colors[theme].text,
      fontFamily: Fonts.fontFamily.GilroyBold,
      fontSize: Fonts.fontSize[10],
      marginLeft: 6,
    },
  })
