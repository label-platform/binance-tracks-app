import { UserContext } from '../UserContext'
import React, { useState, createContext, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { User, StatusUser, PropsUserProvider } from 'src/constants/Interface'

export const UserProvider = (props: PropsUserProvider) => {
  const {accessToken, userData, isLogin, setLogin, refreshToken} = props
  const [user, setUser] = useState<StatusUser>({ 
    isLogin: isLogin || false,
    user: userData || {}, 
    accessToken: accessToken || '', 
    refreshToken: refreshToken || ''
  })

  return (
    <UserContext.Provider
      value={{
        user: user,
        logOut: async () => {
          await AsyncStorage.multiRemove(['accessToken', 'user',  'refreshToken'])
          setUser({ user: {}, isLogin: false, accessToken: '', refreshToken: '' })
          setLogin(false)
        },
        logIn: async ({ userInfo, accessToken, refreshToken }: {userInfo: User, accessToken: string, refreshToken: string}) => {
          await AsyncStorage.multiSet([['accessToken', accessToken], ['user', JSON.stringify(userInfo)], ['refreshToken', refreshToken]])
          setUser({ isLogin: true, user: userInfo, accessToken, refreshToken })
        },
        changeToken: async (token: string) => {
          await AsyncStorage.setItem('accessToken', token);
          setUser((prevInfo) => ({ ...prevInfo, accessToken: token }))
        },
        changeWalletAddress: (address: string) => {
          setUser((state) => ({...state, user: { ...state.user, walletAddress: address }}));
        }
      }}>
      {props?.children}
    </UserContext.Provider>
  )
}

