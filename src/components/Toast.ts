import Toast from 'react-native-root-toast'

export const showAlert = (message: string) => {
  Toast.show(message, {
    position: Toast.positions.CENTER,
    duration: Toast.durations.LONG,
    backgroundColor: '#000',
    textColor: '#fff',
    animation: true
  })
}