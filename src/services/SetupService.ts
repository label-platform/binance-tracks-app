import TrackPlayer, {Capability} from 'react-native-track-player';
import {AppKilledPlaybackBehavior} from 'react-native-track-player'

export const SetupService = async (): Promise<boolean> => {
  let isSetup = false;
  try {
    // this method will only reject if player has not been setup yet
    await TrackPlayer.getCurrentTrack();
    // await TrackPlayer.
    isSetup = true;
  } catch {
    await TrackPlayer.setupPlayer({
      minBuffer: 10000,
      maxBuffer: 30000,
      maxCacheSize: 204800,
      // playBuffer
      // playBuffer: 10,
    });
    await TrackPlayer.updateOptions({
      // compactCapabilities
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification
      },
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
        Capability.SeekTo,
        Capability.Skip,
        // Capability.JumpForward,
        // Capability.JumpBackward,
        // Capability.Like,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        // Capability.Like,
        Capability.SeekTo,
        Capability.Stop,
        Capability.Skip,
        // Capability.JumpForward,
        // Capability.JumpBackward,
      ],
      progressUpdateEventInterval: 1,
    });

    isSetup = true;
  } finally {
    return isSetup;
  }
};
