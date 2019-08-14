import { createStackNavigator } from "react-navigation"
import { BaseMapScreen } from "../screens/welcome-screen"
import { DemoScreen } from "../screens/demo-screen"

export const PrimaryNavigator = createStackNavigator(
  {
    demo: { screen: DemoScreen },
    baseMapScreen: { screen: BaseMapScreen },
  },
  {
    headerMode: "none",
  },
)
