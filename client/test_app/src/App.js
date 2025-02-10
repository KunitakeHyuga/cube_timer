import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap';

const App = () => {
  const [activeTab, setActiveTab] = useState('timer');
  const [scramble, setScramble] = useState("");
  const [visual, setVisual] = useState(null);
  const [solves, setSolves] = useState([]);
  const [rubikColors, setRubikColors] = useState([]);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isKeyDown, setIsKeyDown] = useState(false);
  const [wasStopped, setWasStopped] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedSolve, setSelectedSolve] = useState(null);
  let interval;

  const handleStop = async () => {
    try {
      const postData = {
        time: time / 1000, // ミリ秒 → 秒に変換
        scramble: scramble,
        note: "",
        status: "ok",
      };
  
      await axios.post("http://localhost:8000/solves", postData);
      console.log("Solve posted successfully:", postData);
      fetchSolves();
    } catch (error) {
      console.error("Error posting solve:", error);
    }
  };
  
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === "Space" && !isKeyDown) {
        setIsKeyDown(true);
        if (isRunning) {
          setIsRunning(false);
          setWasStopped(true); // ストップ直後のフラグを立てる
          handleStop(); // タイマーをストップしたときにPOSTリクエストを送信
          fetchScramble();
        }
      }
    };
  
    const handleKeyUp = (event) => {
      if (event.code === "Space" && isKeyDown) {
        setIsKeyDown(false);
        if (!isRunning && !wasStopped) {
          setTime(0);
          setIsRunning(true);
        }
        setWasStopped(false); // 1回の keyup で解除する
      }
    };
  
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isRunning, isKeyDown, wasStopped, time, scramble]);

  useEffect(() => {
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = Math.floor((time % 1000) / 10).toString().padStart(2, "0");

    if (minutes > 0) {
        return `${minutes}:${seconds.toString().padStart(2, "0")}.${milliseconds}`;
    } else {
        return `${seconds}.${milliseconds}`;
    }
};
const fetchSolves = async () => {
  try {
    const response = await axios.get("http://localhost:8000/solves");
    const sortedSolves = response.data.sort((a, b) => b.id - a.id);
    setSolves(sortedSolves);
  } catch (error) {
    console.error("Error fetching solves:", error);
  }
};

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
        '', '', '', '',colorMapping[visual.white[0][0]], colorMapping[visual.white[0][1]], colorMapping[visual.white[0][2]], '','', '', '', '', '', '','',
        '', '', '', '',colorMapping[visual.white[1][0]], colorMapping[visual.white[1][1]], colorMapping[visual.white[1][2]], '','', '', '', '', '', '','',
        '', '', '', '',colorMapping[visual.white[2][0]], colorMapping[visual.white[2][1]], colorMapping[visual.white[2][2]], '','', '', '', '', '', '','',
        colorMapping[visual.orange[0][0]], colorMapping[visual.orange[0][1]], colorMapping[visual.orange[0][2]], '',colorMapping[visual.green[0][0]], colorMapping[visual.green[0][1]], colorMapping[visual.green[0][2]], '',colorMapping[visual.red[0][0]], colorMapping[visual.red[0][1]], colorMapping[visual.red[0][2]], '',colorMapping[visual.blue[0][0]], colorMapping[visual.blue[0][1]], colorMapping[visual.blue[0][2]],
        colorMapping[visual.orange[1][0]], colorMapping[visual.orange[1][1]], colorMapping[visual.orange[1][2]], '',colorMapping[visual.green[1][0]], colorMapping[visual.green[1][1]], colorMapping[visual.green[1][2]], '',colorMapping[visual.red[1][0]], colorMapping[visual.red[1][1]], colorMapping[visual.red[1][2]], '',colorMapping[visual.blue[1][0]], colorMapping[visual.blue[1][1]], colorMapping[visual.blue[1][2]],
        colorMapping[visual.orange[2][0]], colorMapping[visual.orange[2][1]], colorMapping[visual.orange[2][2]], '',colorMapping[visual.green[2][0]], colorMapping[visual.green[2][1]], colorMapping[visual.green[2][2]], '',colorMapping[visual.red[2][0]], colorMapping[visual.red[2][1]], colorMapping[visual.red[2][2]], '',colorMapping[visual.blue[2][0]], colorMapping[visual.blue[2][1]], colorMapping[visual.blue[2][2]],
        '', '', '', '',colorMapping[visual.yellow[0][0]], colorMapping[visual.yellow[0][1]], colorMapping[visual.yellow[0][2]], '','', '', '', '', '', '','',
        '', '', '', '',colorMapping[visual.yellow[1][0]], colorMapping[visual.yellow[1][1]], colorMapping[visual.yellow[1][2]], '','', '', '', '', '', '','',
        '', '', '', '',colorMapping[visual.yellow[2][0]], colorMapping[visual.yellow[2][1]], colorMapping[visual.yellow[2][2]], '','', '', '', '', '', '', ''
      ]);
    }
  }, [visual]); // `visual` が更新されるたびに `rubikColors` を再計算
  
  
  // 初回ロード時にスクランブルを取得
  useEffect(() => { 
    fetchScramble(); 
    fetchSolves(); 
  }, []);

  const handleShowModal = (solve) => {
    setSelectedSolve(solve);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSolve(null);
  };

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
          fontVariantNumeric: 'tabular-nums', 
        }}
      >
        {formatTime(time)}
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
      <p>Press Space to Start/Stop</p>
    </div>
  ) : (
    <div>
      <h2>統計</h2>
      <p>統計情報をここに追加</p>
    </div>
  )}
</div>


<div
  style={{
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '300px',
    maxHeight: '50vh',
    overflowY: 'auto',
    background: 'rgba(255, 255, 255, 0.9)',
    padding: '10px',
    borderTop: '2px solid #ccc',
    borderRight: '2px solid #ccc',
    borderRadius: '10px 10px 0 0',
  }}
>
<h2>タイム一覧</h2>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>タイム</th>
          </tr>
        </thead>
        <tbody>
          {solves.map((solve) => (
            <tr key={solve.id} onClick={() => handleShowModal(solve)} style={{ cursor: 'pointer' }}>
              <td>{solve.id}</td>
              <td>{solve.time.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* モーダルポップアップ */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>詳細情報</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSolve && (
            <div>
              <p><strong>ID:</strong> {selectedSolve.id}</p>
              <p><strong>タイム:</strong> {selectedSolve.time.toFixed(2)} s</p>
              <p><strong>スクランブル:</strong> {selectedSolve.scramble}</p>
              <p><strong>登録日時:</strong> {new Date(selectedSolve.created_at).toLocaleString()}</p>
              <p><strong>メモ:</strong> {selectedSolve.note || "なし"}</p>
              <p><strong>ステータス:</strong> {selectedSolve.status}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>閉じる</Button>
        </Modal.Footer>
      </Modal>
</div>


      {/* Rubik's Cube 展開図 */}
      <div className="position-fixed bottom-0 end-0 mb-3 me-3">
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 25px) 7px repeat(3, 25px) 7px repeat(3, 25px) 7px repeat(3, 25px)', // 列数を15に設定
      gridGap: '0px', // 通常のセル間隔
      backgroundColor: '#e9ecef',
      padding: '8px',
      border: '4px solid #ced4da',
      borderRadius: '15px'
    }}
  >
    {rubikColors.map((color, index) => {
      // 3×3ブロックの間隔を開ける
      const isGapRow = Math.floor(index / 15) % 3 === 2 && Math.floor(index / 15) !== 0;

      return (
        <div
          key={index}
          style={{
            width: '25px',
            height: '25px',
            backgroundColor: color || 'transparent',
            border: color ? '1px solid black' : 'none',
            marginBottom: isGapRow ? '7px' : '0px', // 3行ごとに隙間
          }}
        />
      );
    })}
  </div>
</div>

    </div>
  );
};

export default App;
