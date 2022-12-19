import { PlayListContext } from '../index'
import React, { useState } from 'react'
import {PlayListProps, PlayList, HeadPhone } from 'src/constants/Interface'

export const PlayListProvider = (props: any) => {
  const [playList, setPlayList] = useState<PlayListProps>({
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
  })
  const [showMiniControl, setShowMiniControl] = useState<boolean>(false)
  const [showPopupPlayer, setShowPopupPlayer] = useState<boolean>(false)
  const [headphone, setHeadphone] = useState<HeadPhone>({headphoneID: 0, battery: 0, detail: {}})
  const [energy, setEnergy] = useState<number>(0)
  const [positionModal, setPositionModal] = useState(0)
  return (
    <PlayListContext.Provider value={{
      playList: playList,
      headphone,
      energy,
      showMiniControl: showMiniControl,
      showPopupPlayer,
      updatePlayList: ({dataPlayList}: {dataPlayList: PlayList}) => {
        setPlayList({
          playList: dataPlayList, 
        })
      },
      updateMiniControl: (value) => {
        setShowMiniControl(value)
      },
      updatePopupPlayer: (value) => {
        if (value) {
          setShowMiniControl(false)
        }
        setShowPopupPlayer(value)
      },
      updateEnergy: (value) => {
        setEnergy(value)
      },
      updateHeadPhone: (data) => {
        setHeadphone({headphoneID: data?.headphoneID, battery: data?.battery, detail: data?.detail })
      },
      positionModalPlayer: positionModal,
      updatePositionModalPlayer: (position) => {
        setPositionModal(position)
      }
    }}>
    {props?.children}
    </PlayListContext.Provider>
  )
} 