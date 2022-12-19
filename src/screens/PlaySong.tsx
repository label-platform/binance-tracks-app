import {useEffect, useRef, useState, useContext} from 'react'
import {Animated, StyleSheet, View} from 'react-native'
import {Modalize} from 'react-native-modalize'
import {gestureHandlerRootHOC} from 'react-native-gesture-handler'
import Player from '@components/Player/Player'
import {RootTabScreenProps} from '../../types'
import {UserContext, PlayListContext} from 'src/shared-state'

function PlaySong({navigation}: RootTabScreenProps<'PlaySong'>) {
  const context = useContext(UserContext)
  const playListContext = useContext(PlayListContext)
  console.log('playListContext ===>', playListContext)
  const {user: {accessToken}} = context
  const player = useRef<Modalize>(null)
  const animated = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (player.current) {
      player.current?.open()
    }
  }, [player])

  return (
    <>
      <Player
        ref={player}
        animated={animated}
      />
    </>
  )
}

export default gestureHandlerRootHOC(PlaySong)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
})
