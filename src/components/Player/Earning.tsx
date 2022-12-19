import io from 'socket.io-client'
import {useEffect, useState, useContext} from 'react'
import {Text, View, StyleSheet} from 'react-native'
import {UserContext} from 'src/shared-state'

const socketEndpoint = 'http://clesson-dev.duckdns.org:5000/play/events'

const Earning = ({data}: any) => {
  const [hasConnection, setConnection] = useState(false)
  const [time, setTime] = useState<string>('')
  const context = useContext(UserContext)
  const {user} = context
  console.log('USER ===>', user)

  useEffect(function didMount() {
    const socket = io(socketEndpoint, {
      auth: {
        token: user?.accessToken
      },
      transports: ['websocket'],
    })

    socket.on('connect', () => {
      console.log('CONNECT SOCKET')
      setConnection(true)
      socket.on('connected', (data) => {
        // console.log('CONNECTED ===>', data)
      })
    })
    socket.on('close', () => {
      console.log('DISCONNECT SOCKET ===>')
      setConnection(false)
    })

    socket.on('time-msg', data => {
      setTime(new Date(data.time).toString())
    })

    return function didUnmount() {
      socket.disconnect()
      socket.removeAllListeners()
    }
  }, [])

  useEffect(() => {}, [data])

  return null
}

export default Earning

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paragraph: {
    fontSize: 16,
  },
  footnote: {
    fontSize: 14,
    fontStyle: 'italic',
  },
})
