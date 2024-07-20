import React, { useState, useEffect } from 'react';
import './App.css';

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

function App() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [waypoints, setWaypoints] = useState([{ id: 1, value: '' }]);
  // const [mapLoaded, setMapLoaded] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [modalData, setModalData] = useState({ isVisible: false, imgSrc: '', caption: '' });

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyATXjhgxA95w2Rncd_at9Y8N6f55q1C5Zc&callback=initMap&libraries=geometry`;
    script.defer = true;
    script.async = true;
    script.onload = () => {
      setMapLoaded(true);
    };
    document.head.appendChild(script);
  }, []);

  // const initMap = () => {
  //   const map = new window.google.maps.Map(document.getElementById('map'), {
  //     zoom: 12,
  //     center: { lat: 34.655, lng: 133.919 },
  //   });
  //   window.map = map;
  // };

  const handleSearch = async () => {
    const waypointsParam = waypoints.map(wp => wp.value).join('|');
    try {
      const response = await fetch(`/route?from=${from}&to=${to}&waypoints=${waypointsParam}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.overviewPolyline) {
        displayRoute(data.overviewPolyline);
        setRouteInfo({
          distance: data.distance,
          duration: data.duration,
        });
      } else {
        alert('ルートが見つかりませんでした');
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      alert(`ルート検索中にエラーが発生しました: ${error.message}`);
    }
  };

  const displayRoute = (polyline) => {
    const path = window.google.maps.geometry.encoding.decodePath(polyline);
    const routePath = new window.google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2,
    });
    routePath.setMap(window.map);
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

  // useEffect(() => {
  //   if (mapLoaded) {
  //     initMap();
  //   }
  // }, [mapLoaded]);

  return (
    <div className="App">
      <header className="header">
        <div className="header-div">
          <p className="header-discription">Okayama</p>
        </div>
      </header>

      <section className="section-1">
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
              <div className="sidebar-removecontents">
                <input
                  key={waypoint.id}
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
          </div>
        </div>

        <div className="contents">
          <ul className="contents-ul-top">
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
          {routeInfo && (
            <section className="route-info">
              <p>距離: {routeInfo.distance}</p>
              <p>所要時間: {routeInfo.duration}</p>
            </section>
          )}
          <div id="map" style={{ height: '500px', width: '100%', marginTop: '20px' }}></div>
        </div>
      </section>

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
