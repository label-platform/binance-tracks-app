import io, {Manager, Socket} from 'socket.io-client'
import {useEffect, useContext, useState} from 'react'
import {EventBusName, onPushEventBus} from 'src/services'

// const socketEndpoint = '10.4.21.250:5555/play/events'
const socketEndpoint = 'http://clesson-dev.duckdns.org:5000/play/events'


class SocKetUtils {
  static instance: SocKetUtils
  socketRef: any = undefined
  // unsubscribe: any = undefined;
  socket: Socket | undefined

  init = async (accessToken: string) => {
    const res = await this.onStartSocketIO(accessToken)
    return res
  }

  getInstance() {
    if (!SocKetUtils.instance) {
      SocKetUtils.instance = new SocKetUtils()
    }
    return SocKetUtils.instance;
  }
  
  onStartSocketIO = async (accessToken: string) => {
    const socket = io(socketEndpoint, {
      auth: {
        token: accessToken
      },
      transports: ['websocket'],
    })

    socket.on('connect', () => {
      // console.log('CONNECT SOCKET')

      socket.on('disconnect', (reason) => {
        // console.log('DISCONNECT ====>', reason)
        onPushEventBus({type: EventBusName.DISCONNECT_SOCKET})
      })

      socket.on('connected', (data) => {
        // console.log('CONNECTED ===>', data)
        this.socket = socket
        this.socketRef = socket
        onPushEventBus({type: EventBusName.CONNECT_SOCKET})
        return socket
      })
    })
    return socket
  }

  unSubscriberSocket() {
    if (this.socketRef) {
      this.socketRef?.disconnect?.();
      this.socketRef = undefined;
    }

    if (this.socket) {
      this.socket = undefined
    }
  }
}

export const SocketClient = new SocKetUtils()