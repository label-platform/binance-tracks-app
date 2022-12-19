import {TouchableOpacity} from 'react-native'
import {View, Text} from '@components/Themed'
import {BottomTabBarProps} from '@react-navigation/bottom-tabs'

const BottomTabBar = ({state, descriptors, navigation}: BottomTabBarProps) => {
  return (
    <View style={{flexDirection: 'row'}}>
      {state.routes.map((route, index) => {
        const {options} = descriptors[route.key]
        const label = options.title

        const isFocused = state.index === index

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          })

          if (!isFocused && !event.defaultPrevented) {
            // The `merge: true` option makes sure that the params inside the tab screen are preserved
            navigation.navigate({
              name: route.name,
              merge: true,
              params: undefined,
            })
          }
        }

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          })
        }

        return (
          <TouchableOpacity
            key={label}
            accessibilityRole="button"
            accessibilityState={isFocused ? {selected: true} : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={{flex: 1}}>
            {options.tabBarIcon &&
              options.tabBarIcon({
                focused: isFocused,
                color: '#fff',
                size: 18,
              })}
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

export default BottomTabBar
