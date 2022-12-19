import React, {useEffect, useState, useContext} from 'react'
import {
  View,
  StyleSheet,
  Image,
  Pressable,
  TouchableOpacity,
} from 'react-native'
import TrackPlayer, {
  State,
  usePlaybackState,
  Event,
  useTrackPlayerEvents,
  RepeatMode,
} from 'react-native-track-player'
import {useOnTogglePlayback} from '@hooks/useOnTogglePlayback'
import {EventBusName, onPushEventBus} from 'src/services'
import {
  DataPlaying,
  SocketEnergy,
  StateModalPlayer,
} from 'src/constants/Interface'
import {PlayListContext, UserContext} from 'src/shared-state'
import EventBus from 'src/services/EventBus'
import {Subscription} from 'rxjs'
import ModalPlayer from './ModalAction'
import _, {isNil} from 'lodash'
import io, {Socket} from 'socket.io-client'

const socketEndpoint = 'http://clesson-dev.duckdns.org:5000/play/events'
// const socketEndpoint = 'https://ws.tracks.label.community/play/events'

const events = [
  Event.PlaybackState,
  Event.PlaybackError,
  Event.RemotePause,
  Event.RemoteStop,
  Event.RemotePlay,
  Event.RemoteNext,
  Event.RemotePrevious,
  Event.PlaybackQueueEnded,
  Event.PlaybackTrackChanged,
  Event.PlaybackProgressUpdated,
  Event.RemoteSeek,
]

export const PlayerControls: React.FC = () => {
  const playListContext = useContext(PlayListContext)
  const userContext = useContext(UserContext)
  const {
    user: {accessToken},
  } = userContext
  const state = usePlaybackState()
  const onTogglePlayback = useOnTogglePlayback()
  const subscription = new Subscription()

  const {
    playList,
    updatePopupPlayer,
    headphone,
    updateEnergy,
    updateHeadPhone,
    energy,
    updateMiniControl,
    updatePositionModalPlayer,
  } = playListContext
  const listSong = playList.playList.playlistDetail
  const isPlaying = state === State.Playing
  const isBuffering = state === State.Buffering
  const isStopped = state === State.Stopped
  const isReady = state === State.Ready
  const isConnect = state === State.Connecting
  const headphoneId = headphone.headphoneID

  const [songId, setSongId] = useState<number>(listSong?.[0]?.song?.id)
  const [repeatMode, setRepeatMode] = useState<RepeatMode>(RepeatMode.Off)
  const [dataPlaying, setData] = useState<DataPlaying>({
    position: 0,
    track: 0,
    duration: 0,
  })
  const [shuffle, setShuffle] = useState<boolean>(false)

  const [runTime, setRunTime] = useState<number>(0)
  const [error, setError] = useState<boolean>(false)

  const [stateModal, setStateModal] = useState<StateModalPlayer>({
    isVisible: false,
    description: '',
    textNegative: '',
    textPositive: '',
    typeModal: '',
  })

  const [instanceSocket, setInstanceSocket] = useState<Socket | undefined>(
    undefined,
  )

  const onStartSocketIO = async () => {
    const socket = io(socketEndpoint, {
      auth: {
        token: accessToken,
      },
      transports: ['websocket'],
    })

    console.log('socket ==>', socket)

    socket.on('connect', () => {
      socket.on('disconnect', reason => {
        console.log('DISCONNECT ====>', reason)
        TrackPlayer?.pause()
        setRunTime(0)
        setInstanceSocket(undefined)
        onPushEventBus({type: EventBusName.IS_PLAYING, payload: false})
      })

      socket.on('connected', data => {
        setInstanceSocket(socket)
      })
    })
  }

  const onPressButtonPlayPause = async () => {
    const position = await TrackPlayer.getPosition()
    const currentState = await TrackPlayer.getState()
    const isPlaying = State.Playing
    const isStopped = State.Stopped
    const isPaused = State.Paused
    onPushEventBus({type: EventBusName.RE_LOAD_BALANCE})
    if (isBuffering || error || !instanceSocket?.connected) {
      return
    } else {
      if (position === 0 && currentState === isPlaying) {
        console.log('EMIT START ===>')
        instanceSocket?.emit('start', {headphoneId, songId, playTime: 0})
      }
      if (position && currentState === isPaused) {
        console.log('EMIT PAUSE')
        instanceSocket?.emit('pause', {headphoneId, songId, playTime: runTime})
        setRunTime(0)
      }
      if (position && currentState === isPlaying) {
        console.log('EMIT CONTINUE ')
        instanceSocket?.emit('continue', {headphoneId, songId, playTime: 0})
      }
      if (currentState === isStopped) {
        // play done list and repeat mode = off
        TrackPlayer.skip(0, 0)
        setRunTime(0)
        TrackPlayer.play()
      }
    }
  }

  const onPressPrevious = async () => {
    socketUpdateEnergy(runTime)
    setRunTime(0)
    let currentTrack = await TrackPlayer.getCurrentTrack()
    if (+dataPlaying.position >= 10 || currentTrack === 0) {
      TrackPlayer.skip(currentTrack!, 0)
      instanceSocket?.emit('replay', {headphoneId, songId, playTime: 0})
      instanceSocket?.emit('continue', {headphoneId, songId, playTime: 0})
    } else {
      const nextTrack = +currentTrack! === 0 ? 0 : currentTrack! - 1
      let newSongId = listSong?.[nextTrack]?.song?.id
      TrackPlayer.skip(nextTrack, 0)
      instanceSocket?.emit('pause', {headphoneId, songId, playTime: runTime})
      instanceSocket?.emit('previous', {
        headphoneId,
        songId: newSongId,
        playTime: runTime,
      })
    }
  }

  const onPressNext = () => {
    socketUpdateEnergy(runTime)
    setRunTime(0)
    TrackPlayer.skipToNext()
  }

  const onPressSuffer = () => {
    setShuffle(!shuffle)
  }

  const onPressRepeatMode = () => {
    if (repeatMode === RepeatMode.Off) {
      TrackPlayer.setRepeatMode(RepeatMode.Track)
      setRepeatMode(RepeatMode.Track)
    } else if (repeatMode === RepeatMode.Track) {
      TrackPlayer.setRepeatMode(RepeatMode.Queue)
      setRepeatMode(RepeatMode.Queue)
    } else if (repeatMode === RepeatMode.Queue) {
      TrackPlayer.setRepeatMode(RepeatMode.Off)
      setRepeatMode(RepeatMode.Off)
    }
  }

  const onPressStop = async () => {
    instanceSocket?.emit('stop-earning', {
      headphoneId,
      songId,
      playTime: runTime,
    })
    instanceSocket?.emit('stop')
    TrackPlayer.pause()
    TrackPlayer.clearNowPlayingMetadata()
    TrackPlayer.reset()
    updateMiniControl(false)
    updatePopupPlayer(false)
    updatePositionModalPlayer(0)
    onPushEventBus({
      type: EventBusName.CHECK_UPDATE_MINI_PLAYER,
      payload: false,
    })
    onPushEventBus({type: EventBusName.UPDATE_BALANCE_EARNING})
    setInstanceSocket(undefined)
  }

  useTrackPlayerEvents(events, async event => {
    if (event.type === Event.RemotePause) {
      TrackPlayer.pause()
      onPressButtonPlayPause()
    }
    if (event.type === Event.RemotePlay) {
      TrackPlayer.play()
      onPressButtonPlayPause()
    }
    if (event.type === Event.RemoteNext) {
      socketUpdateEnergy(runTime)
      setRunTime(0)
      TrackPlayer.skipToNext()
    }
    if (event.type === Event.RemotePrevious) {
      onPressPrevious()
    }
    if (event.type === Event.PlaybackProgressUpdated) {
      console.log('Event.PlaybackProgressUpdated ===>', {event, runTime})
      const {position, track, duration} = event
      setData({position, track, duration})
      let data = runTime + 1
      if (data >= 10) {
        socketUpdateEnergy(data)
        setRunTime(0)
      } else {
        setRunTime(runTime + 1)
      }
    }
    if (event.type === Event.PlaybackTrackChanged) {
      console.log('Event.PlaybackTrackChanged ===>', {event, instanceSocket})
      if (_.isNil(event?.nextTrack)) {
        // track play done all song
        instanceSocket?.emit('pause', {headphoneId, songId, playTime: runTime})
      } else {
        setSongId(listSong?.[event?.nextTrack]?.song?.id)

        const nextTrack = event?.nextTrack
        const idTrack = playList?.playList?.playlistDetail?.[nextTrack]?.id
        const idPlayList = playList?.playList?.id
        onPushEventBus({
          type: EventBusName.SEND_INFO_CURRENT_SONG,
          payload: {idTrack, idPlayList},
        })

        if (event?.nextTrack === event?.track) {
          // repeat mode: track and this event is auto trigger after play a song
          // console.log('EMIT PAUSE REPAY ===>')
          instanceSocket?.emit('pause', {
            headphoneId,
            songId,
            playTime: runTime,
          })
          instanceSocket?.emit('repay', {headphoneId, songId, playTime: 0})
          instanceSocket?.emit('continue', {headphoneId, songId, playTime: 0})
          setRunTime(0)
        } else {
          // console.log('EMIT PAUSE NEXT ===>', listSong?.[event?.nextTrack]?.song?.id)
          instanceSocket?.emit('pause', {
            headphoneId,
            songId,
            playTime: runTime,
          })
          instanceSocket?.emit('next', {
            headphoneId,
            songId: listSong?.[event?.nextTrack]?.song?.id,
            playTime: 0,
          })
          instanceSocket?.emit('continue', {
            headphoneId,
            songId: listSong?.[event?.nextTrack]?.song?.id,
            playTime: 0,
          })
          setRunTime(0)
        }
      }
    }
  })

  const onRegisterEventBus = () => {
    subscription.add(
      EventBus.getInstance().events.subscribe(async (res: any) => {
        if (res?.type === EventBusName.PRESS_ACTION_ON_MINI_PLAYER) {
          onPressButtonPlayPause()
        } else if (res?.type === EventBusName.PRESS_TURN_OFF_MINI_PLAYER) {
          onPressConfirmTurnOff()
        } else if (res?.type === EventBusName.SEEK_TO) {
          handleEmit()
        } else if (res?.type === EventBusName.PLAY_NEW_LIST) {
          instanceSocket?.emit('pause', {
            headphoneId,
            songId,
            playTime: runTime,
          })
          setRunTime(0)
        } else if (res?.type === EventBusName.SEND_PLAY_SONG) {
          const nextTrack = playList?.playList?.playlistDetail?.findIndex(
            e => +e?.id === res?.payload?.idTrack,
          )
          if (!_.isNil(nextTrack)) {
            TrackPlayer.skip(nextTrack)
          }
        } else if (res?.type === EventBusName?.LOG_OUT) {
          onPressStop()
        }
      }),
    )
  }

  const handleEmit = () => {
    // console.log('EMIT SKIP ====>', {instanceSocket, songId})
    instanceSocket?.emit('skip', {headphoneId, songId, playTime: 0})
    instanceSocket?.emit('continue', {headphoneId, songId, playTime: 0})
  }

  const socketUpdateEnergy = (data: number) => {
    if (data >= 10 && energy) {
      // console.log('update energy ===>', {headphoneId, songId, playTime: data})
      instanceSocket?.emit('update-energy', {
        headphoneId,
        songId,
        playTime: data,
      })
    }
  }

  const onPressCloseModal = () => {
    setStateModal({...stateModal, isVisible: false})
    if (
      stateModal.typeModal === 'battery' ||
      stateModal.typeModal === 'energy'
    ) {
      return
    } else if (stateModal.typeModal === 'off') {
      setStateModal({...stateModal, isVisible: false})
    }
  }

  const onPressPositive = () => {
    if (stateModal.typeModal === 'battery') {
      onPressStop()
    } else if (stateModal.typeModal === 'energy') {
      instanceSocket?.emit('stop-earning', {
        headphoneId,
        songId,
        playTime: runTime,
      })
      TrackPlayer.play()
      setStateModal({...stateModal, isVisible: false})
    } else if (stateModal.typeModal === 'off') {
      onPressStop()
    }
  }

  const onPressNegative = () => {
    if (stateModal.typeModal === 'battery') {
      if (!energy) {
        onPressStop()
      }
      return
    } else if (stateModal.typeModal === 'energy') {
      onPressStop()
    } else if (stateModal.typeModal === 'off') {
      setStateModal({...stateModal, isVisible: false})
    }
  }

  const onPressConfirmTurnOff = () => {
    setStateModal({
      isVisible: true,
      typeModal: 'off',
      description: 'Do you want to end listening to music?',
      showNegativeButton: true,
      textPositive: 'Yes',
      textNegative: 'Keep listening',
    })
  }

  useEffect(() => {
    const getCurrenMode = async () => {
      const mode = await TrackPlayer.getRepeatMode()
      setRepeatMode(mode)
    }
    getCurrenMode()
  }, [])

  useEffect(() => {
    if (instanceSocket) {
      instanceSocket?.on('update-remaining-energy', (data: SocketEnergy) => {
        // console.log('ON update-remaining-energy ===>', data)
        updateEnergy(data?.energy)
        updateHeadPhone({
          headphoneID: headphone.headphoneID,
          battery: data?.battery,
          detail: headphone.detail,
        })
      })
      instanceSocket?.on('system-error', () => {
        console.log('ERROR system-error ===>')
        TrackPlayer.pause()
        setError(true)
      })
    }
  }, [instanceSocket])

  useEffect(() => {
    console.log('instanceSocket ===>', instanceSocket)
    if (instanceSocket) {
      onRegisterEventBus()
    }
    return () => {
      subscription.unsubscribe()
    }
  }, [instanceSocket, songId])

  useEffect(() => {
    if (instanceSocket && state === State.None) {
      console.log('EMIT STOP EARNING ===>', {
        headphoneId,
        songId,
        instanceSocket,
      })
      onPressStop()
    }
  }, [state])

  useEffect(() => {
    onStartSocketIO()
  }, [])

  useEffect(() => {
    if (!headphone.battery) {
      setStateModal({
        isVisible: true,
        typeModal: 'battery',
        description:
          'The battery in the headset is dead. The headset can be replaced or charged to continue.',
        showNegativeButton: false,
        textPositive: 'Okay',
        textNegative: '',
      })
      TrackPlayer.pause()
    } else if (!energy) {
      setStateModal({
        isVisible: true,
        typeModal: 'energy',
        description:
          "The energy is running out of energy. You won't accumulate rewards even if you keep listening.",
        showNegativeButton: true,
        textPositive: 'Keep listening',
        textNegative: 'Stop listening',
      })
      TrackPlayer.pause()
    }
  }, [headphone, energy])

  const renderActionIsPlaying = () => {
    let source = require('src/assets/images/player/control/icon_refeat.png')
    if (repeatMode === RepeatMode.Queue) {
      source = require('src/assets/images/player/control/repeat_all.png')
    } else if (repeatMode === RepeatMode.Track) {
      source = require('src/assets/images/player/control/repeat_one.png')
    }
    return (
      <View style={styles.row}>
        <Pressable onPress={onPressSuffer}>
          <Image
            source={
              shuffle
                ? require('@assets/images/player/control/shuffle_active.png')
                : require('@assets/images/player/control/icon_shuffle.png')
            }
          />
        </Pressable>
        <Pressable onPress={onPressPrevious}>
          <Image
            source={require('@assets/images/player/control/icon_previousbtn.png')}
          />
        </Pressable>
        <Pressable
          onPress={() => {
            onPressButtonPlayPause()
            onTogglePlayback()
          }}>
          <Image
            source={
              isPlaying
                ? require('@assets/images/player/control/icon_pausebtn.png')
                : require('@assets/images/player/control/icon_playbtn.png')
            }
          />
        </Pressable>
        <Pressable onPress={onPressNext}>
          <Image
            source={require('@assets/images/player/control/icon_nextbtn.png')}
          />
        </Pressable>
        <Pressable onPress={onPressRepeatMode}>
          <Image source={source} />
        </Pressable>
      </View>
    )
  }

  const renderActionPause = () => (
    <View style={styles.rowActionPause}>
      <TouchableOpacity
        onPress={() => {
          onPressButtonPlayPause()
          onTogglePlayback()
        }}>
        <Image
          source={require('@assets/images/player/control/icon_playbtn.png')}
        />
      </TouchableOpacity>
      <View style={styles.spacerStyle} />
      <TouchableOpacity onPress={onPressConfirmTurnOff}>
        <Image source={require('@assets/images/player/control/turn_off.png')} />
      </TouchableOpacity>
    </View>
  )
  if (state === State.Connecting) {
    return null
  }
  return (
    <View style={styles.container}>
      {isPlaying || isBuffering ? renderActionIsPlaying() : renderActionPause()}

      <ModalPlayer
        isVisible={stateModal.isVisible}
        textNegative={stateModal.textNegative}
        textPositive={stateModal.textPositive}
        onPressPositive={onPressPositive}
        onPressClose={onPressCloseModal}
        onPressNegative={onPressNegative}
        showNegativeButton={stateModal.showNegativeButton}
        desc={stateModal.description}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {},
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowActionPause: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacerStyle: {
    minWidth: 32,
  },
})
