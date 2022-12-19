import React, {useEffect, useState} from 'react'
import {Image, Pressable, StyleSheet, Text, View} from 'react-native'
import TrackPlayer, {
  useTrackPlayerEvents,
  Event,
} from 'react-native-track-player'

export const SongInfo: React.FC<any> = () => {
  const [infoTrack, setTrack] = useState({artwork: '', title: '', artist: ''})

  useTrackPlayerEvents([Event.PlaybackTrackChanged], async event => {
    if (event.type === Event.PlaybackTrackChanged && event.nextTrack != null) {
      const track = await TrackPlayer.getTrack(event.nextTrack)
      // @ts-ignore
      setTrack({
        artwork: track?.artwork,
        title: track?.title,
        artist: track?.artist,
      })
    }
  })

  return (
    <View style={styles.container}>
      <Image
        source={{uri: infoTrack?.artwork}}
        style={styles.video}
        resizeMode="cover"
      />
      <View style={styles.song}>
        <View>
          <Text style={styles.titleText}>{infoTrack.title}</Text>
          <Text style={styles.artistText}>{infoTrack?.artist}</Text>
        </View>
        <Pressable>
          <Image
            source={require('@assets/images/player/icon_favorite_song.png')}
          />
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  song: {
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 24,
  },
  video: {
    width: 240,
    height: 240,
    marginTop: 30,
    backgroundColor: 'grey',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  artistText: {
    fontSize: 14,
    fontWeight: '200',
    color: '#FFFFFF3c',
  },
})
