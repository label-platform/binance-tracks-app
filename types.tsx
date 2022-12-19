/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import {BottomTabScreenProps} from '@react-navigation/bottom-tabs'
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native'
import {NativeStackScreenProps} from '@react-navigation/native-stack'

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Root: NavigatorScreenParams<RootTabParamList> | undefined
  WebView: undefined
  NotFound: undefined
  AuthStack: undefined
  PlaySong: undefined
  DetailScreen: {url: string, miniPlayerMB?: number}
}

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>

export type RootTabParamList = {
  HomeScreen: undefined
  PlayListScreen: undefined
  LibraryScreen: undefined
  MarketScreen: undefined
  MoreScreen: undefined
  AuthStack: undefined
  PlaySong: undefined
  Inventory: undefined
  DetailScreen: {url: string, miniPlayerMB?: number}

}

export type RootTabScreenProps<Screen extends keyof RootTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<RootTabParamList, Screen>,
    NativeStackScreenProps<RootStackParamList>
  >
