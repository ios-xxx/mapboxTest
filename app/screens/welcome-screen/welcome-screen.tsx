import React from 'react'
import { View, StyleSheet, SafeAreaView } from "react-native"
import MapboxGL from '@react-native-mapbox-gl/maps'
import { Button } from 'react-native-elements'
import token from "./token"
import { lineString as makeLineString } from '@turf/helpers'
import RouteSimulator from '../utils/RouteSimulator'
import MapboxClient from './MapboxClient'
import PulseCircleLayer from './common/PulseCircleLayer'

MapboxGL.setAccessToken(token)
MapboxGL.setTelemetryEnabled(false)

const SF_ZOO_COORDINATE = [113.31931876194517, 23.150404470231246]
const SF_ZOO_COORDINATE2 = [113.31931876194517, 23.138404470231246]
const layerStyles = {
  origin: {
    circleRadius: 5,
    circleColor: 'blue',
  },
  destination: {
    circleRadius: 5,
    circleColor: 'red',
  },
  route: {
    lineColor: 'orange',
    lineWidth: 5,
    lineOpacity: 0.84,
  },
  progress: {
    lineColor: '#314ccd',
    lineWidth: 3,
  },
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'blue',
    borderRadius: 3,
  },
  buttonCnt: {
    backgroundColor: 'transparent',
    bottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    left: 0,
    position: 'absolute',
    right: 0,
  },
})

interface State {
  route: any,
  currentPoint: any,
  routeSimulator: any,
}

export class WelcomeScreen extends React.Component <State> {
  constructor(props) {
    super(props)

    this.state = {
      route: null,
      currentPoint: null,
      routeSimulator: null,
    }

    this.onStart = this.onStart.bind(this)
    this.onStop = this.onStop.bind(this)
  }

  onStart() {
    const routeSimulator = new RouteSimulator(this.state.route)
    routeSimulator.addListener(currentPoint => this.setState({ currentPoint }))
    routeSimulator.start()
    setTimeout(() => {

      routeSimulator.stop()
    },3000)
    this.setState({ routeSimulator })
  }

  onStop() {
    const { routeSimulator } = this.state
    if (routeSimulator) {

      routeSimulator.stop()
      this.setState({routeSimulator})
    }
  }

  componentDidMount() {
    this.getDirections()
  }

  async getDirections() {
    const res = await MapboxClient.getDirections(
      [
        {
          latitude: SF_ZOO_COORDINATE2[1],
          longitude: SF_ZOO_COORDINATE2[0],
        },
        { latitude: SF_ZOO_COORDINATE[1], longitude: SF_ZOO_COORDINATE[0] },
      ],
      { profile: 'walking', geometry: 'polyline' },
    )

    this.setState({
      route: makeLineString(res.entity.routes[0].geometry.coordinates),
    })
    console.warn(this.state.route)
  }

  componentWillUnmount() {
    if (this.state.routeSimulator) {
      this.state.routeSimulator.stop()
    }
  }

  renderActions() {
    const { routeSimulator } = this.state
    // if (routeSimulator) {
    //   return null
    // }
    return (
      <View style={styles.buttonCnt}>
        <Button
          raised
          title="Start"
          onPress={this.onStart}
          style={styles.button}
          disabled={!this.state.route}
        />

        <Button
          raised
          title="Stop"
          onPress={this.onStop}
          style={styles.button}
        />
      </View>
    )
  }

  renderRoute() {
    if (!this.state.route) {
      return null
    }

    return (
      <MapboxGL.ShapeSource id="routeSource" shape={this.state.route}>
        <MapboxGL.LineLayer
          id="routeFill"
          style={layerStyles.route}
          belowLayerID="originInnerCircle"
        />
      </MapboxGL.ShapeSource>
    )
  }

  renderCurrentPoint() {
    if (!this.state.currentPoint) {
      return
    }
    return (
      <PulseCircleLayer
        shape={this.state.currentPoint}
        aboveLayerID="destinationInnerCircle"
      />
    )
  }

  renderProgressLine() {
    if (!this.state.currentPoint) {
      return null
    }

    const { nearestIndex } = this.state.currentPoint.properties
    const coords = this.state.route.geometry.coordinates.filter(
      (c, i) => i <= nearestIndex,
    )
    coords.push(this.state.currentPoint.geometry.coordinates)

    if (coords.length < 2) {
      return null
    }

    const lineString = makeLineString(coords)

    console.log(lineString)
    return (
      <MapboxGL.Animated.ShapeSource id="progressSource" shape={lineString}>
        <MapboxGL.Animated.LineLayer
          id="progressFill"
          style={layerStyles.progress}
          aboveLayerID="routeFill"
        />
      </MapboxGL.Animated.ShapeSource>
    )
  }

  renderOrigin() {
    let backgroundColor = 'white'

    if (this.state.currentPoint) {
      backgroundColor = '#314ccd'
    }

    const style = [layerStyles.origin, { circleColor: backgroundColor }]

    return (
      <MapboxGL.ShapeSource
        id="origin"
        shape={MapboxGL.geoUtils.makePoint(SF_ZOO_COORDINATE2)}
      >
        <MapboxGL.Animated.CircleLayer id="originInnerCircle" style={style} />
      </MapboxGL.ShapeSource>
    )
  }

  render(): React.ReactElement<any> | string | number | {} | React.ReactNodeArray | React.ReactPortal | boolean | null | undefined {
    return (
      <SafeAreaView style={{ flex: 1 }}>

        <MapboxGL.MapView
          style={{ flex: 1 }}
          logoEnabled={false}
          userLocationVerticalAlignment={2}
        >
          <
            MapboxGL.Camera

            centerCoordinate={[113.31931876194517, 23.140404470231246]}
            zoomLevel={16}
            pitch={16}
            animationMode={'moveTo'}
            animationDuration={2000}
            animationType={'sidle'}
            followUserLocation={true}
            followUserMode={'course'}
            userTrackingMode={1}
            showsUserLocation={true}

          />

          <MapboxGL.PointAnnotation
            id={'test'}
            coordinate={[113.31931876194517, 23.140404470231246]}
            title={'这是体育中心'}
            snippet={'这是副标题'}
            anchor={{ x: 1.5, y: 0.5 }}

          />
          <MapboxGL.Callout title='xxxxxx' />
          {this.renderOrigin()}
          {this.renderRoute()}
          {this.renderCurrentPoint()}
          {this.renderProgressLine()}
          <MapboxGL.ShapeSource
            id="destination"
            shape={MapboxGL.geoUtils.makePoint(SF_ZOO_COORDINATE)}
          >
            <MapboxGL.CircleLayer
              id="destinationInnerCircle"
              style={layerStyles.destination}
            />
          </MapboxGL.ShapeSource>

          <MapboxGL.ShapeSource
            id="destination2"
            shape={MapboxGL.geoUtils.makePoint(SF_ZOO_COORDINATE2)}
          >
            <MapboxGL.CircleLayer
              id="destinationInnerCircle2"
              style={layerStyles.destination}
            />
          </MapboxGL.ShapeSource>

        </MapboxGL.MapView>

        {this.renderActions()}
      </SafeAreaView>

    )
  }
}
