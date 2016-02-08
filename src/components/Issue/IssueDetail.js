import React, {
  Component,
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  InteractionManager,
} from 'react-native';

import MapView from 'react-native-maps';
import hexToRgba from 'hex-rgba';

import NavBar from '../NavBar/NavBar';
import ActivityIndicator from '../ActivityIndicator';
import IssueAgendaItems from './IssueAgendaItems';

import translationsGeneral from '../../translations/general';
import translationsIssue from '../../translations/issue';

import {getIssuePosition, getIssueCategoryColor, getIssueAddressText, getPolygon} from '../../helpers/issue';
import {calculateDistance, GEOMETRY_TYPE_POLYGON} from '../../helpers/map';

import {detailStyles as styles} from './styles';

class IssueDetail extends Component {
  constructor() {
    super();

    translationsGeneral.setLanguage('fi');
    translationsIssue.setLanguage('fi');

    this.state = {
      position: null,
      distance: null,
      renderMap: false
    };
  }

  componentWillMount() {
    const position = getIssuePosition(this.props.issue);

    this.setState({
      position,
      distance: calculateDistance(this.props.position.coords, position)
    });

    InteractionManager.runAfterInteractions(() => {
      this.setState({
        renderMap: true
      });
    });
  }

  renderPolygon() {
    const issue = this.props.issue;
    const polygon = getPolygon(issue);

    if (!polygon) {
      return null;
    }

    const issueCategoryColor = getIssueCategoryColor(issue);

    return (
      <MapView.Polygon
        coordinates={polygon}
        strokeColor={issueCategoryColor}
        fillColor={hexToRgba(issueCategoryColor, 40)}
      />
    );
  }

  renderMap() {
    if (!this.state.renderMap) {
      return (
        <View style={styles.map}>
          <ActivityIndicator style={styles.mapLoader}/>
        </View>
      );
    }

    const issue = this.props.issue;
    const position = this.state.position;

    return (
      <MapView
        style={styles.map}
        showsUserLocation={true}
        region={{
          latitude: position.latitude,
          longitude: position.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01
        }}>
        {this.renderPolygon()}
        <MapView.Marker
          coordinate={{latitude: position.latitude, longitude: position.longitude}}
          title={getIssueAddressText(issue)}
        />
      </MapView>
    );
  }

  render() {
    const issue = this.props.issue;
    const distance = this.state.distance;

    return (
      <View style={styles.container}>
        <NavBar
          title={{ title: translationsIssue.issueDetailTitle }}
          leftButton={{
            source: require('../../images/arrow-right.png'),
            handler: (event) => {this.props.navigator.pop();}
          }}
        />
        <View style={[styles.divider, {backgroundColor: getIssueCategoryColor(this.props.issue)}]}/>
        <ScrollView style={styles.scroller}>
          {this.renderMap()}
          <View style={styles.top}>
            <Text style={styles.subject}>{issue.subject}</Text>
            <View style={styles.distance}>
              <View style={styles.distanceIcon}><Image source={require('../../images/pin.png')}/></View>
              <Text style={styles.distanceText}>{Math.round(distance * 10) / 10} km</Text>
            </View>
          </View>
          <View style={styles.content}>
            <IssueAgendaItems issue={issue} />
          </View>
        </ScrollView>
      </View>
    );
  }
}

export default IssueDetail;
