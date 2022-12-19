import TrackPlayer, {Event, State} from 'react-native-track-player'

let wasPausedByDuck = false

export async function PlaybackService() {
  TrackPlayer.addEventListener(Event.RemotePause, () => {
    // console.log('RUN PAUSE ====>')
    // TrackPlayer.pause()
  })

  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    // console.log('STOP 121212 =====>')
  })

  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    // TrackPlayer.play()
  })

  TrackPlayer.addEventListener(Event.RemoteNext, () => {
    // TrackPlayer.skipToNext()
    // TrackPlayer.pause()
  })

  TrackPlayer.addEventListener(Event.RemotePrevious, () => {
    // console.log('PRESS SKIP TO PREVIOUS ===>')
    // TrackPlayer.skipToPrevious()
    // TrackPlayer.pause()
  })

  TrackPlayer.addEventListener(
    Event.RemoteDuck,
    async ({permanent, paused}) => {
      if (permanent) {
        TrackPlayer.pause()
        return
      }
      if (paused) {
        const playerState = await TrackPlayer.getState()
        wasPausedByDuck = playerState !== State.Paused
        TrackPlayer.pause()
      } else {
        if (wasPausedByDuck) {
          TrackPlayer.play()
          wasPausedByDuck = false
        }
      }
    },
  )

  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, event => {
    // console.log('Event.PlaybackQueueEnded', event)
  })

  TrackPlayer.addEventListener(Event.PlaybackTrackChanged, event => {
    // console.log('Event.PlaybackTrackChanged', event)
  })

  TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, event => {
    // console.log('Event.PlaybackProgressUpdated', event)
  })

  TrackPlayer.addEventListener(Event.RemoteSeek, event => {
    // console.log('Event.RemoteSeek', event),
  })
}
