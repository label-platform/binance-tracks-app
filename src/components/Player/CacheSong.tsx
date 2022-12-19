import RNFS from 'react-native-fs'
import FNFetchBlod from 'rn-fetch-blob'
import React, {useState, useContext, useEffect} from 'react'
import TrackPlayer, {useTrackPlayerEvents, Event, Track} from 'react-native-track-player'
import {PlayListContext} from 'src/shared-state'
import { getPath } from 'src/utils/file'
import { Subscription } from 'rxjs'
import EventBus, { EventBusName } from 'src/services/EventBus'


export const CacheSong = () => {
  const subscription = new Subscription()
  const playListContext = useContext(PlayListContext)
  const {playList: {playList}} = playListContext
  const pathSavePlayList = getPath() + `/playList${playList?.id}`

  const [idsSaveTrack, setIdsSaveTrack] = useState<number[]>([0])

  const cacheTrack = async (indexTrack: number) => {
    try {
      let idTrack = playList?.playlistDetail?.[indexTrack]?.song?.id
      let urlTrack = playList?.playlistDetail?.[indexTrack]?.song?.s3Name
      // console.log('PATH ===>', pathSavePlayList.concat(`/song${idTrack}.mp3`))
      if (urlTrack?.includes('http') || urlTrack?.includes('https')) {
        FNFetchBlod.config({
          path: pathSavePlayList.concat(`/song${idTrack}.mp3`),
        }).fetch('GET', urlTrack)
        .then(async (response) => {
          // console.log('RESPONSE CACHE ===>', response)
          const path = response?.path()
          if (path) {
            const currentTrack = await TrackPlayer.getCurrentTrack()
            let newTrack: Track = { ...playList?.playlistDetail?.[indexTrack]?.song, url: path }
            await TrackPlayer.updateMetadataForTrack(currentTrack!, newTrack)
          }
        })
        .catch(err => {
          console.log('ERROR CACHE FILE ===>', err)
        })
      }
    } catch(err) {
      console.log('ERROR ===>', err)
    }
  }

  const onRegisterEventBus = () => {
    subscription.add(
      EventBus.getInstance().events.subscribe((res: any) => {
        if (res?.type === EventBusName.PRESS_TURN_OFF_MINI_PLAYER) {
          setIdsSaveTrack([])
        } 
      }),
    );
  };

  useEffect(() => {
    cacheTrack(0)
    onRegisterEventBus()
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useTrackPlayerEvents([Event.PlaybackTrackChanged], event => {
    const {nextTrack, track} = event
    // console.log('EVENT CACHE SONG ===>', event)
    if (!idsSaveTrack?.includes(nextTrack)) {
      cacheTrack(nextTrack)
      setIdsSaveTrack([...idsSaveTrack, nextTrack])
    }
  })
  return null
}