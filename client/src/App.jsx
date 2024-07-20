import React, { useState, useEffect } from 'react';
import './App.css';
import { Loader } from '@googlemaps/js-api-loader';

const touristSpots = [
  {
    name: '美観地区',
    description: '美しい景観のある観光地です。',
    imageUrl: '/images/bikan-district.jpg',
  },
  {
    name: '後楽園',
    description: '日本三名園の一つです。',
    imageUrl: '/images/korakuen.jpg',
  },
  // 他の観光地を追加
];

const loader = new Loader({
  apiKey: 'AIzaSyATXjhgxA95w2Rncd_at9Y8N6f55q1C5Zc',
  version: 'weekly',
  libraries: ['geometry', 'places']
});

function App() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [waypoints, setWaypoints] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [modalData, setModalData] = useState({ isVisible: false, imgSrc: '', caption: '' });
  const [isSearching, setIsSearching] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [map, setMap] = useState(null);

  useEffect(() => {
    loader.load().then(() => {
      window.initMap = initMap;
      initMap();
    }).catch(e => {
      console.error("Failed to load Google Maps API", e);
    });
  }, []);

  const initMap = () => {
    console.log('Initializing map...');
    const mapElement = document.getElementById('map');
    if (!mapElement) {
      console.error("Map element not found!");
      return;
    }

    const mapInstance = new google.maps.Map(mapElement, {
      center: { lat: 34.655, lng: 133.919 },
      zoom: 12,
      mapId: 'f43a46398df54a3b',
    });

    setMap(mapInstance);
    setMapInitialized(true);
    console.log('Map initialized.');
  };

  const handleSearch = async () => {
    if (!window.google || !map) {
      console.error('Google Maps API or map is not initialized.');
      return;
    }

    setIsSearching(true);
    const waypointsParam = waypoints.map(wp => wp.value).join('|');
    try {
      const response = await fetch(`/route?from=${from}&to=${to}&waypoints=${waypointsParam}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.overviewPolyline) {
        setRouteInfo({
          distance: data.distance,
          duration: data.duration,
        });
        displayRoute(data.overviewPolyline);
        addMarkers(from, to, waypoints);
      } else {
        alert('ルートが見つかりませんでした');
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      alert(`ルート検索中にエラーが発生しました: ${error.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  const displayRoute = (polyline) => {
    if (!window.google || !map) {
      console.error('Google Maps API or map is not initialized.');
      return;
    }

    const path = google.maps.geometry.encoding.decodePath(polyline);
    const routePath = new google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2,
    });
    routePath.setMap(map);
  };

  const addMarkers = (from, to, waypoints) => {
    if (!window.google || !map) {
      console.error('Google Maps API or map is not initialized.');
      return;
    }

    const geocoder = new google.maps.Geocoder();

    // Add marker for the start location
    geocoder.geocode({ address: from }, (results, status) => {
      if (status === 'OK') {
        new google.maps.Marker({
          map: map,
          position: results[0].geometry.location,
          title: `出発点: ${from}`,
          label: 'S'
        });
        map.setCenter(results[0].geometry.location); // 中心を設定
      }
    });

    // Add marker for the end location
    geocoder.geocode({ address: to }, (results, status) => {
      if (status === 'OK') {
        new google.maps.Marker({
          map: map,
          position: results[0].geometry.location,
          title: `到着点: ${to}`,
          label: 'E'
        });
      }
    });

    // Add markers for waypoints
    waypoints.forEach((waypoint, index) => {
      geocoder.geocode({ address: waypoint.value }, (results, status) => {
        if (status === 'OK') {
          new google.maps.Marker({
            map: map,
            position: results[0].geometry.location,
            title: `経由地${index + 1}: ${waypoint.value}`,
            label: `${index + 1}`
          });
        }
      });
    });
  };

  const addWaypoint = () => {
    if (waypoints.length < 4) {
      setWaypoints([...waypoints, { id: waypoints.length + 1, value: '' }]);
    }
  };

  const removeWaypoint = (id) => {
    setWaypoints(waypoints.filter((wp) => wp.id !== id));
  };

  const handleWaypointChange = (id, value) => {
    const updatedWaypoints = waypoints.map((wp) =>
      wp.id === id ? { ...wp, value } : wp
    );
    setWaypoints(updatedWaypoints);
  };

  const openModal = (imgSrc, caption) => {
    setModalData({ isVisible: true, imgSrc, caption });
  };

  const closeModal = () => {
    setModalData({ isVisible: false, imgSrc: '', caption: '' });
  };

  return (
    <div className="App">
      <header className="header">
        <div className="header-div">
          <p className="header-discription">Okayama</p>
        </div>
      </header>

      <div className="sidebar">
        <div className="sidebar-contents">
          <input
            type="text"
            className="input-from"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="from 入力"
          />
          <input
            type="text"
            className="input-to"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="to 入力"
          />
          {waypoints.map((waypoint) => (
            <div className="sidebar-removecontents" key={waypoint.id}>
              <input
                type="text"
                className="input-waypoint"
                value={waypoint.value}
                onChange={(e) => handleWaypointChange(waypoint.id, e.target.value)}
                placeholder={`経由地 ${waypoint.id}`}
              />
              <button className="sidebar-removebutton" onClick={() => removeWaypoint(waypoint.id)}>削除</button>
            </div>
          ))}
          {waypoints.length < 4 && (
            <button className="sidebar-button" onClick={addWaypoint}>経由地 追加</button>
          )}
        
          <button className="sidebar-button" onClick={handleSearch}>検索</button>
          {routeInfo && (
            <div>
              <p>距離: {routeInfo.distance}</p>
              <p>所要時間: {routeInfo.duration}</p>
            </div>
          )}
        </div>
      </div>

      <div className="contents">
        <ul className={`contents-ul-top ${routeInfo ? 'hidden' : ''}`}>
          {touristSpots.map((spot, index) => (
            <li key={index} className={`contents-${index % 2 === 0 ? 'left' : 'right'}-il`}>
              <div className="contents-box">
                <div className="contents-imgbox">
                  <img
                    className="myImg"
                    data-caption={spot.description}
                    src={spot.imageUrl}
                    alt={spot.name}
                    width="330px"
                    height="240px"
                    onClick={() => openModal(spot.imageUrl, spot.description)}
                  />
                </div>
                <div className="contents-text">
                  <p>{spot.name}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div id="map" className={`${routeInfo ? '' : 'hidden'}`} style={{ height: '700px', width: '1100px'}}></div>
      </div>

      {modalData.isVisible && (
        <div id="myModal" className="modal" onClick={closeModal}>
          <span className="close" onClick={closeModal}>&times;</span>
          <img className="modal-content" id="img01" src={modalData.imgSrc} alt="Modal" />
          <div className="caption" id="caption">{modalData.caption}</div>
        </div>
      )}
    </div>
  );
}

export default App;
