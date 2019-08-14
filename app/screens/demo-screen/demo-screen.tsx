import * as React from "react"
import {
  FlatList,
  Image,
  ImageStyle,
  Platform, SafeAreaView,
  TextStyle,
  View,
  Text,
  ViewStyle,
  Button,
} from "react-native"
import { NavigationScreenProps } from "react-navigation"

export interface DemoScreenProps extends NavigationScreenProps<{}> {}

export class DemoScreen extends React.Component<DemoScreenProps, {}> {
  renderItem = (item) => {
    return(
      <Button
        title={item.item}
        onPress={()=>{
          if(item.index == 0) this.props.navigation.navigate('baseMapScreen')
        }}
      />
    )
  }
  render() {
    const mapsArr = ['基础地图', '自定义源']
    return (
      <View style={{ flex: 1 }}>
        <SafeAreaView>
          <FlatList data={mapsArr}
            renderItem={this.renderItem}
            keyExtractor={(item, index) => item + index.toString()}
          />
        </SafeAreaView>
      </View>
    )
  }
}
