import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  const [activeTab, setActiveTab] = useState('timer'); // 現在のタブ状態
  const [scramble, setScramble] = useState(""); // スクランブル
  const [visual, setVisual] = useState(null);
  const [rubikColors, setRubikColors] = useState([]);
  

  // スクランブルを取得する関数
  const fetchScramble = async () => {
    try {
      const response = await axios.get('http://localhost:8000/visual');
      setScramble(response.data.scramble);
      setVisual(response.data.visual);
    } catch (error) {
      console.error('Error fetching scramble:', error);
    }
  };

  // タブ切り替え関数
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const colorMapping = {
    1: 'white',
    2: 'orange',
    3: 'green',
    4: 'red',
    5: 'blue',
    6: 'yellow'
  };

  function mapVisualToColors(visual) {
    return {
      white: visual.white.map(row => row.map(value => colorMapping[value])),
      orange: visual.orange.map(row => row.map(value => colorMapping[value])),
      green: visual.green.map(row => row.map(value => colorMapping[value])),
      red: visual.red.map(row => row.map(value => colorMapping[value])),
      blue: visual.blue.map(row => row.map(value => colorMapping[value])),
      yellow: visual.yellow.map(row => row.map(value => colorMapping[value]))
    };
  }

  useEffect(() => {
    if (visual) {
      setRubikColors([
        '', '', '', colorMapping[visual.white[0][0]], colorMapping[visual.white[0][1]], colorMapping[visual.white[0][2]], '', '', '', '', '', '',
        '', '', '', colorMapping[visual.white[1][0]], colorMapping[visual.white[1][1]], colorMapping[visual.white[1][2]], '', '', '', '', '', '',
        '', '', '', colorMapping[visual.white[2][0]], colorMapping[visual.white[2][1]], colorMapping[visual.white[2][2]], '', '', '', '', '', '',
        colorMapping[visual.orange[0][0]], colorMapping[visual.orange[0][1]], colorMapping[visual.orange[0][2]], colorMapping[visual.green[0][0]], colorMapping[visual.green[0][1]], colorMapping[visual.green[0][2]], colorMapping[visual.red[0][0]], colorMapping[visual.red[0][1]], colorMapping[visual.red[0][2]], colorMapping[visual.blue[0][0]], colorMapping[visual.blue[0][1]], colorMapping[visual.blue[0][2]],
        colorMapping[visual.orange[1][0]], colorMapping[visual.orange[1][1]], colorMapping[visual.orange[1][2]], colorMapping[visual.green[1][0]], colorMapping[visual.green[1][1]], colorMapping[visual.green[1][2]], colorMapping[visual.red[1][0]], colorMapping[visual.red[1][1]], colorMapping[visual.red[1][2]], colorMapping[visual.blue[1][0]], colorMapping[visual.blue[1][1]], colorMapping[visual.blue[1][2]],
        colorMapping[visual.orange[2][0]], colorMapping[visual.orange[2][1]], colorMapping[visual.orange[2][2]], colorMapping[visual.green[2][0]], colorMapping[visual.green[2][1]], colorMapping[visual.green[2][2]], colorMapping[visual.red[2][0]], colorMapping[visual.red[2][1]], colorMapping[visual.red[2][2]], colorMapping[visual.blue[2][0]], colorMapping[visual.blue[2][1]], colorMapping[visual.blue[2][2]],
        '', '', '', colorMapping[visual.yellow[0][0]], colorMapping[visual.yellow[0][1]], colorMapping[visual.yellow[0][2]], '', '', '', '', '', '',
        '', '', '', colorMapping[visual.yellow[1][0]], colorMapping[visual.yellow[1][1]], colorMapping[visual.yellow[1][2]], '', '', '', '', '', '',
        '', '', '', colorMapping[visual.yellow[2][0]], colorMapping[visual.yellow[2][1]], colorMapping[visual.yellow[2][2]], '', '', '', '', '', ''
      ]);
    }
  }, [visual]); // `visual` が更新されるたびに `rubikColors` を再計算
  
  
  // 初回ロード時にスクランブルを取得
  useEffect(() => {
    fetchScramble();
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f3f4f6, #d1d5db)',
        padding: '0',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ナビゲーションバー */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            Timer App
          </a>
          <div className="navbar-nav">
            <a
              className={`nav-link ${activeTab === 'timer' ? 'active' : ''}`}
              href="#"
              onClick={() => handleTabChange('timer')}
            >
              タイマー
            </a>
            <a
              className={`nav-link ${activeTab === 'stats' ? 'active' : ''}`}
              href="#"
              onClick={() => handleTabChange('stats')}
            >
              統計
            </a>
          </div>
        </div>
      </nav>

      {/* Scramble Display & Next Button */}
      <div
        style={{
          position: 'relative',  // ボタンを絶対位置で配置する基準
          backgroundColor: '#e9ecef',
          padding: '10px 20px',
          textAlign: 'center',
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: '#333',
          borderBottom: '2px solid #ced4da',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* スクランブル文字列（中央表示） */}
        <span>{scramble || "Loading..."}</span>

        {/* 次へボタン（画面の右端に固定） */}
        <button
          onClick={fetchScramble}
          style={{
            position: 'absolute',
            right: '20px', // 画面の右端に配置
            padding: '7px 15px',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = '#0056b3')}
          onMouseOut={(e) => (e.target.style.backgroundColor = '#007bff')}
        >
          次へ
        </button>
      </div>

      {/* メインコンテンツ */}
      <div
  style={{
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start', // Align content towards the top
    alignItems: 'center',
    textAlign: 'center',
    marginTop: '35px', // Add margin to fine-tune the position
  }}
>
  {activeTab === 'timer' ? (
    <div>
      <h1
        style={{
          fontSize: '16rem',
          fontWeight: 'bold',
          marginBottom: '2rem',
          color: '#000',
        }}
      >
        1:05.92
      </h1>
      <h3
        style={{
          fontSize: '4rem',
          fontWeight: 'normal',
          color: '#555',
        }}
      >
        ao5: 1:11.66
      </h3>
      <h3
        style={{
          fontSize: '4rem',
          fontWeight: 'normal',
          color: '#555',
        }}
      >
        ao12: 1:12.68
      </h3>
    </div>
  ) : (
    <div>
      <h2>統計</h2>
      <p>統計情報をここに追加</p>
    </div>
  )}
</div>


      {/* タスクテーブル
      <div className="position-fixed bottom-0 start-0 mb-3 ms-3">
        <table className="table table-bordered bg-white" style={{ width: '300px' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>タイトル</th>
              <th>完了状況</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id}>
                <td>{task.id}</td>
                <td>{task.title}</td>
                <td>{task.done ? '完了' : '未完了'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> */}

      {/* Rubik's Cube 展開図 */}
      <div className="position-fixed bottom-0 end-0 mb-3 me-3">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 25px)', // 列数を12に設定
            gridGap: '2px', // 各セルの間隔
            backgroundColor: '#e9ecef',
            padding: '10px',
            border: '1px solid #ced4da',
          }}
          
        >
          {rubikColors.map((color, index) => (
            <div
              key={index}
              style={{
                width: '25px',
                height: '25px',
                backgroundColor: color || 'transparent',
                border: color ? '1px solid black' : 'none',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
