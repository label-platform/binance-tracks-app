import React from 'react'
import {AppContextInterface} from 'src/constants/Interface'

const sampleAppContext: AppContextInterface = {
  user: {isLogin: false, user: {}, accessToken: ''},
  logIn: () => {},
  logOut: () => {},
  changeToken: () => {},
  changeWalletAddress: () => {}
};

export const UserContext = React.createContext<AppContextInterface>(sampleAppContext)
