import React, {useState, useContext, useEffect} from 'react'
import {
  Text,
  View,
  StyleSheet,
  Image,
  ImageBackground,
  useColorScheme,
} from 'react-native'
import Colors from 'src/constants/Colors'
import {Fonts} from 'src/constants/Fonts'
import {AnimatedCircularProgress} from 'react-native-circular-progress'
import {PlayListContext} from 'src/shared-state'
import {Api, ApiUrl} from 'src/services'
import {EarningLimit} from 'src/constants/Interface'
import {useTrackPlayerEvents, Event} from 'react-native-track-player'
import moment from 'moment'
import {Subscription} from 'rxjs'
import EventBus, {EventBusName} from 'src/services/EventBus'
import BigNumber from 'bignumber.js'

const getStyle = (theme: 'dark' | 'light') =>
  StyleSheet.create({
    wrapper: {
      paddingHorizontal: 26,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      flex: 1,
    },
    container: {
      height: 70,
      marginTop: 20,
    },
    inprogress: {
      fontWeight: '700',
      fontFamily: Fonts.fontFamily.Gilroy,
      color: '#674AE9',
      fontSize: Fonts.fontSize[12],
    },
    iconHeadphone: {
      width: 29,
      height: 29,
    },
    rowTime: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 14,
    },
    timePlayed: {
      fontFamily: Fonts.fontFamily.Gilroy,
      fontSize: Fonts.fontSize[12],
      color: Colors[theme].white38,
    },
    mh8: {
      marginHorizontal: 8,
    },
    timeEarn: {
      fontSize: Fonts.fontSize[12],
      fontFamily: Fonts.fontFamily.GilroyBold,
      color: Colors[theme].white87,
    },
    notEarn: {
      fontSize: Fonts.fontSize[12],
      fontFamily: Fonts.fontFamily.Gilroy,
      color: Colors[theme].white38,
      marginTop: 14,
    },
  })

export const DashboardPlayer = () => {
  const theme = useColorScheme() || 'light'
  const styles = getStyle(theme)
  const playListContext = useContext(PlayListContext)
  const {headphone, energy} = playListContext
  const subscription = new Subscription()

  const [timePlayer, setTimePlayer] = useState<number>(0)

  const [battery, setBattery] = useState<number>(headphone.battery)
  const [earning, setEarning] = useState<boolean>(
    headphone.battery > 0 && energy > 0,
  )
  const [limitEarning, setLimit] = useState<EarningLimit>({
    dailyTokenEarningLimit: 0,
    remainedTokenEarningLimit: 0,
  })

  useTrackPlayerEvents([Event.PlaybackProgressUpdated], event => {
    setTimePlayer(timePlayer + 1)
  })

  useEffect(() => {
    setBattery(headphone.battery)
  }, [headphone])

  const onRegisterEventBus = () => {
    subscription.add(
      EventBus.getInstance().events.subscribe((res: any) => {
        if (res?.type === EventBusName.PRESS_TURN_OFF_MINI_PLAYER) {
          setTimePlayer(0)
          getEarningLimit()
        } else if (res?.type === EventBusName.DISCONNECT_SOCKET) {
          setTimePlayer(0)
          getEarningLimit()
        }
      }),
    )
  }

  useEffect(() => {
    onRegisterEventBus()
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (headphone.battery <= 0 || energy <= 0) {
      setEarning(false)
    } else if (headphone.battery && energy) {
      setEarning(true)
    }
  }, [headphone, energy])

  const getEarningLimit = async () => {
    try {
      const response = await Api.get({url: ApiUrl.user.earningLimit})
      console.log('response getEarningLimit ==>', response)
      if (response?.status === 200) {
        setLimit(response?.data?.content)
      }
    } catch (err) {
      console.log('ERROR getEarningLimit ===>', err)
    }
  }

  useEffect(() => {
    getEarningLimit()
  }, [])

  useEffect(() => {
    if (
      timePlayer % 10 === 0 &&
      headphone?.detail &&
      timePlayer &&
      limitEarning.remainedTokenEarningLimit <
        limitEarning.dailyTokenEarningLimit
    ) {
      setLimit({
        dailyTokenEarningLimit: limitEarning.dailyTokenEarningLimit,
        // @ts-ignore
        remainedTokenEarningLimit: new BigNumber(
          limitEarning.remainedTokenEarningLimit,
        )
          .plus(headphone?.detail?.efficiency)
          .toNumber(),
      })
    }
  }, [timePlayer, limitEarning.dailyTokenEarningLimit])

  const renderTime = () => {
    const time = moment.utc(timePlayer * 1000).format('HH:mm:ss')
    return (
      <View style={styles.rowTime}>
        <Text style={styles.timePlayed}>{time}</Text>
        <Text style={[styles.timePlayed, styles.mh8]}>|</Text>
        <Image
          source={require('src/assets/images/player/control/icon_arrow_up.png')}
          style={{width: 7.5, marginRight: 6, marginTop: 2}}
        />
        <Text style={styles.timeEarn}>
          <Text>{limitEarning?.remainedTokenEarningLimit}</Text>
          <Text style={styles.mh8}> / </Text>
          <Text>{limitEarning?.dailyTokenEarningLimit}</Text>
        </Text>
      </View>
    )
  }
  return (
    <ImageBackground
      style={styles.container}
      resizeMode={'contain'}
      source={require('@assets/images/player/img_background_earning.png')}>
      <View style={styles.wrapper}>
        <AnimatedCircularProgress
          size={40}
          width={4}
          fill={battery}
          tintColor={Colors[theme].white}
          rotation={0}
          children={() => (
            <Text style={styles.inprogress}>{battery || '-'}</Text>
          )}
          backgroundColor={Colors[theme].white38}
        />
        {earning ? (
          renderTime()
        ) : (
          <Text style={styles.notEarn}>Not Earning</Text>
        )}

        <Image
          source={
            !earning
              ? require('src/assets/images/player/control/headphone_off.png')
              : require('src/assets/images/icons/header/headphone.png')
          }
          style={[styles.iconHeadphone]}
        />
      </View>
    </ImageBackground>
  )
}
