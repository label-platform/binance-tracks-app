import React from 'react'
import {PlayListContextProps} from 'src/constants/Interface'

const samplePlayListContext: PlayListContextProps = {
  playList: {
    playList: {
      createdAt: '',
      updatedAt: '',
      id: 0,
      name: '',
      img: '',
      display: '',
      order: 0,
      playlistDetail: []
    },
  },
  headphone: {headphoneID: 0, battery: 0, detail: {}},
  energy: 0,
  showMiniControl: false,
  showPopupPlayer: false,
  updatePlayList: () => {},
  updateMiniControl: () => {},
  updatePopupPlayer: () => {},
  updateHeadPhone: () => {},
  updateEnergy: () => {},
  positionModalPlayer: 0,
  updatePositionModalPlayer: () => {}
};

export const PlayListContext = React.createContext<PlayListContextProps>(samplePlayListContext)
