import React, {useState, useEffect} from 'react'
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  useColorScheme,
  View,
  Dimensions,
  Image,
  ImageBackground,
} from 'react-native'
import Modal from 'react-native-modal'
import Colors from 'src/constants/Colors'
import {Fonts} from 'src/constants/Fonts'

interface PropsModalPlayer {
  isVisible: boolean
  showNegativeButton?: boolean
  textPositive: string
  textNegative: string
  desc: string
  onPressPositive?: () => void
  onPressNegative?: () => void
  onPressClose: () => void
}

const getStyles = (theme: 'dark' | 'light') =>
  StyleSheet.create({
    wrapperModal: {
      justifyContent: 'center',
      alignSelf: 'center',
      backgroundColor: Colors[theme].grayCode,
      borderRadius: 16,
      width: Dimensions.get('screen').width - 48,
      paddingHorizontal: 32,
      paddingTop: 28,
      paddingBottom: 32,
    },
    btClose: {
      width: 12,
      height: 12,
      alignSelf: 'flex-end',
    },
    titleModal: {
      fontSize: Fonts.fontSize[24],
      fontWeight: '900',
      // fontFamily: Fonts.fontFamily.GilroyBold,
      // fontFamily: 'Gilroy-ExtraBold',
      marginBottom: 16,
      color: Colors[theme].white,
      textAlign: 'center',
    },
    descModal: {
      fontWeight: '400',
      fontSize: Fonts.fontSize[16],
      color: Colors[theme].text,
      marginBottom: 24,
      textAlign: 'center',
    },
    imageButtonPositive: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: 50,
    },
    textPositive: {
      fontWeight: '900',
      fontSize: Fonts.fontSize[16],
      color: Colors[theme].grayCode,
      alignSelf: 'center',
    },
  })

const ModalPlayer = (props: PropsModalPlayer) => {
  const theme = useColorScheme() || 'light'
  const styles = getStyles(theme)
  return (
    <Modal isVisible={props.isVisible}>
      <View style={styles.wrapperModal}>
        <TouchableOpacity style={styles.btClose} onPress={props.onPressClose}>
          <Image source={require('src/assets/images/btn_exit.png')} />
        </TouchableOpacity>
        <Text style={styles.titleModal}>Warning</Text>
        <Text style={styles.descModal}>{props?.desc}</Text>

        <ImageBackground
          source={require('src/assets/images/bg_button.png')}
          style={styles.imageButtonPositive}
          resizeMode="center">
          <TouchableOpacity onPress={props?.onPressPositive}>
            <Text style={{...styles.textPositive, color: Colors[theme].text}}>
              {props?.textPositive}
            </Text>
          </TouchableOpacity>
        </ImageBackground>

        {props?.showNegativeButton && (
          <ImageBackground
            resizeMode="center"
            source={require('src/assets/images/bg_button_negative.png')}
            style={[styles.imageButtonPositive]}>
            <TouchableOpacity onPress={props?.onPressNegative}>
              <Text style={{...styles.textPositive, color: Colors[theme].text}}>
                {props?.textNegative}
              </Text>
            </TouchableOpacity>
          </ImageBackground>
        )}
      </View>
    </Modal>
  )
}
export default ModalPlayer
