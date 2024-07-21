import React, { useState, useEffect } from 'react';
import './App.css';
import { Loader } from '@googlemaps/js-api-loader';

const touristSpots = [
  {
    name: '美観地区',
    description: '倉敷美観地区は、白壁の蔵や柳並木が美しい歴史的な町並みで、倉敷川沿いの風景や古い町家が魅力的な観光地です。昼夜を問わず、訪れる人々に和やかな時間を提供します。',
    imageUrl: './images/bikan-district.jpg',
  },
  {
    name: '後楽園',
    description: '岡山後楽園は、美しい日本庭園で、四季折々の景色と歴史的建造物が楽しめる観光名所です。特に春の桜と秋の紅葉は見事です。',
    imageUrl: './images/korakuen.jpg',
  },
  {
    name: '岡山城',
    description: '岡山城は、黒い外観が印象的な「烏城」として親しまれ、豪華な内装と歴史展示が見どころです。城からの眺望も素晴らしく、岡山のシンボルとして人気です。',
    imageUrl: './images/okayamajyo.jpg',
  },
  {
    name: '満奇洞',
    description: '岡山県新見市にある満奇洞は、幻想的な鍾乳洞で、カラフルなLEDライトアップが神秘的な雰囲気を演出しています。歌人与謝野晶子が絶賛したこの洞窟は、見どころ満載で、四季を通じて楽しめる観光地です。',
    imageUrl: './images/mankidou.jpg',
  },
  {
    name: '豪渓',
    description: '豪渓は、岡山県総社市にある自然豊かな景勝地で、奇岩や絶壁が連なり、秋には紅葉が美しい名所として知られています。訪れる人々を魅了する豪渓は、四季折々の景色を楽しめるスポットです。',
    imageUrl: 'images/goukei.jpg',
  },
  {
    name: '大原美術館',
    description: '岡山県倉敷市にある大原美術館は、日本初の西洋美術中心の私立美術館で、エル・グレコやモネの名作を含む約3000点の美術品が展示されています。古代から現代までの芸術作品が楽しめる、歴史と文化の宝庫です。',
    imageUrl: './images/bijyutu.jpg',
  },
  {
    name: '児島ジーンズストリート',
    description: '児島ジーンズストリートは、岡山県倉敷市に位置し、国産ジーンズの聖地として知られています。約400mにわたり、オリジナリティ溢れるジャパンデニムのショップが軒を連ね、多くの観光客が訪れる人気スポットです。',
    imageUrl: './images/kojima.jpg',
  },
  {
    name: '吉備津神社',
    description: '岡山市にある吉備津神社は、桃太郎伝説の源流とされ、国宝の建物や360mの廻廊があります。鳴釜神事で知られ、四季折々の自然が楽しめる神秘的な場所です。',
    imageUrl: './images/kiti.jpg',
  },
  {
    name: '鷲羽山',
    description: '鷲羽山は、瀬戸内海国立公園内にあり、鷲が羽を広げた形に似ていることから名付けられました。山頂からは、瀬戸大橋と美しい瀬戸内海の多島美を一望でき、日本の夕陽百選にも選ばれている絶景スポットです。',
    imageUrl: './images/wasyuzan.jpg',
  },
  {
    name: 'まほらファーム',
    description: '岡山県津山市にあるまほらファームは、いちごや桃、ぶどうの収穫体験ができる農園です。家族連れに人気で、農作業体験もできるので、自然と触れ合いながら楽しい時間を過ごせます。',
    imageUrl: 'images/mahora.jpg',
  },
  {
    name: '蒜山高原',
    description: '蒜山高原は、岡山県真庭市に位置する自然豊かな高原で、ジャージー牛の放牧や美味しい地元グルメ、遊園地など、家族で楽しめる多彩なアクティビティが魅力です。避暑地としても人気があり、四季折々の景色を楽しむことができます。',
    imageUrl: './images/hiru.jpg',
  },
  {
    name: '湯原温泉',
    description: '湯原温泉は、美作三湯の一つで、豊富なアルカリ性単純温泉が自慢です。趣のある温泉街と豊かな自然に囲まれた「秘境の温泉」で、癒しの時間を提供します。',
    imageUrl: './images/yuhara.jpg',
  },
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
  const [markers, setMarkers] = useState([]);
  const [routePath, setRoutePath] = useState(null);

  useEffect(() => {
    loader.load().then(() => {
      window.initMap = initMap;
      initMap();
    }).catch(e => {
      console.error("Failed to load Google Maps API", e);
    });
  }, []);

  useEffect(() => {
    if (routeInfo && mapInitialized) {
      addMarkers(from, to, waypoints);
    }
  }, [routeInfo, mapInitialized]);

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
    clearMarkersAndRoute(); // 検索前に既存のマーカーとルートをクリア
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
        if (mapInitialized) {
          displayRoute(data.overviewPolyline);
        }
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
    const newRoutePath = new google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2,
    });
    newRoutePath.setMap(map);
    setRoutePath(newRoutePath); // 現在のルートパスを保存
  };

  const addMarkers = (from, to, waypoints) => {
    if (!window.google || !map) {
      console.error('Google Maps API or map is not initialized.');
      return;
    }

    const geocoder = new google.maps.Geocoder();
    const newMarkers = [];

    // Add marker for the start location
    geocoder.geocode({ address: from }, (results, status) => {
      if (status === 'OK') {
        const marker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location,
          title: `出発点: ${from}`,
          label: 'S'
        });
        newMarkers.push(marker);
        map.setCenter(results[0].geometry.location); // 中心を設定
      }
    });

    // Add marker for the end location
    geocoder.geocode({ address: to }, (results, status) => {
      if (status === 'OK') {
        const marker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location,
          title: `到着点: ${to}`,
          label: 'E'
        });
        newMarkers.push(marker);
      }
    });

    // Add markers for waypoints
    waypoints.forEach((waypoint, index) => {
      geocoder.geocode({ address: waypoint.value }, (results, status) => {
        if (status === 'OK') {
          const marker = new google.maps.Marker({
            map: map,
            position: results[0].geometry.location,
            title: `経由地${index + 1}: ${waypoint.value}`,
            label: `${index + 1}`
          });
          newMarkers.push(marker);
        }
      });
    });

    setMarkers(newMarkers); // 現在のマーカーを保存
  };

  const clearMarkersAndRoute = () => {
    // 既存のマーカーをクリア
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);

    // 既存のルートをクリア
    if (routePath) {
      routePath.setMap(null);
      setRoutePath(null);
    }
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
    console.log("Hi");
    setModalData({ isVisible: true, imgSrc, caption });
  };

  const closeModal = () => {
    setModalData({ isVisible: false, imgSrc: '', caption: '' });
  };

  const renderTouristSpots = (spots, className) => {
  const result = [];
  for (let i = 0; i < spots.length; i += 2) {
    result.push(
      <ul key={i} className={className}>
        {spots.slice(i, i + 2).map((spot, index) => (
          <li key={spot.name} className={`contents-${index % 2 === 0 ? 'left' : 'right'}-il`}>
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
    );
  }
  return result;
};


  return (
    <div className="App">
      <header className="header">
        <div className="header-div">
        <img className="header-discription" src='./images/image.png'></img>
        </div>
      </header>

      <div className="sidebar">
        {!routeInfo ? (
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
          </div>
        ) : (
          <div className="sidebar-contents">
            <p className="input-from">
              距離: {routeInfo.distance}<br></br>
              所要時間: {routeInfo.duration}
            </p>
          </div>
        )}
      </div>

      <div className="contents">
        <div className={`${routeInfo ? 'hidden' : ''}`}>
        {renderTouristSpots(touristSpots.slice(0, 2), 'contents-ul-top', { marginTop: '80px' })}
        {renderTouristSpots(touristSpots.slice(2), 'contents-ul')}
        </div>
        <div id="map" style={{ height: '700px', width: '1100px'}} className={`${routeInfo ? '' : 'hidden'}`}></div>
      </div>

      {modalData.isVisible && (
        <div id="myModal" className="modal show" onClick={closeModal}>
          <span className="close" onClick={closeModal}>&times;</span>
          <img className="modal-content" id="img01" src={modalData.imgSrc} alt="Modal" />
          <div className="caption" id="caption">{modalData.caption}</div>
        </div>
      )}
    </div>
  );
}

export default App;
