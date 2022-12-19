import {NavigationContainer} from '@react-navigation/native'
import LoginScreen from 'src/screens/LoginScreen'


interface PropsOfAuthStack {
  setIsLogin: (login:boolean) => void
}



function AuthStack(props: PropsOfAuthStack) {
  return (
    <NavigationContainer>
        <LoginScreen setIsLogin={props?.setIsLogin} />
    </NavigationContainer>
  )
}



export default AuthStack


