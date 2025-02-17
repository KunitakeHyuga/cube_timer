import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap';
import { Clipboard } from 'react-bootstrap-icons';

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
  const [editedNote, setEditedNote] = useState(selectedSolve ? selectedSolve.note : "");
  const [editedStatus, setEditedStatus] = useState(selectedSolve ? selectedSolve.status : "ok");
  const [linegraphUrl, setLinegraphUrl] = useState(null);
  const [histogramUrl, setHistogramUrl] = useState(null);
  const [boxplotUrl, setBoxplotUrl] = useState(null);

  let interval;
  let worstSingle = -Infinity;
  let bestSingle = Infinity;
  let bestMo3 = Infinity;
  let bestAo5 = Infinity;
  let bestAo12 = Infinity;
  let bestAo100 = Infinity;

  {/* タイマーストップ後の処理をする関数 */}
  const handleStop = async () => {
    try {
      const postData = {
        time: Math.floor(time / 10) / 100, // ミリ秒(4321) → 秒(4.32)に変換
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
    {/* スペースキーを押した瞬間の処理をする関数 */}
    const handleKeyDown = (event) => {
      if (event.code === "Space" && !isKeyDown) {
        setIsKeyDown(true);
        if (isRunning) {
          setIsRunning(false);
          setWasStopped(true); // ストップ直後のフラグを立てる
          handleStop(); // タイマーをストップしたときにPOSTリクエストを送信
          fetchScramble();// 次のスクランブル取得
        }
      }
    };
    
    {/* スペースキーを離した瞬間の処理をする関数 */}
    const handleKeyUp = (event) => {
      if (event.code === "Space" && isKeyDown) {
        setIsKeyDown(false);
        if (!isRunning && !wasStopped) {
          setTime(0);
          setIsRunning(true);
        }
        setWasStopped(false); // 1回の keyup で解除する
                              //タイマーストップのあと連続的にタイマースタートが始まるのを防ぐためのフラグ
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
  
  {/* 表示されるタイマーのフォーマット処理する関数 */}
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = ((time % 1000) / 10).toString().padStart(2, "0");

    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, "0")}.${milliseconds}`;
    } else {
      return `${seconds}.${milliseconds}`;
    }
  };

  {/* DB保存されたタイムのフォーマット処理する関数 */}
  const formatSavedTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 100);

    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`;
    } else {
      return `${seconds}.${milliseconds.toString().padStart(2, "0")}`;
    }
  };

  {/* タイム一覧を取得する関数 */}
  const fetchSolves = async () => {
    try {
      const response = await axios.get("http://localhost:8000/solves");
      const sortedSolves = response.data.sort((a, b) => b.id - a.id); // タイム一覧を表示するときのためのソート
      setSolves(sortedSolves);
    } catch (error) {
      console.error("Error fetching solves:", error);
    }
  };

  {/* スクランブルを取得する関数 */}
  const fetchScramble = async () => {
    try {
      const response = await axios.get('http://localhost:8000/visual');
      setScramble(response.data.scramble);
      setVisual(response.data.visual);
    } catch (error) {
      console.error('Error fetching scramble:', error);
    }
  };

  {/* タブ切り替え関数 */}
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    if (activeTab === "stats") {
      fetchGraphs();
    }
  }, [activeTab]);

  const fetchGraphs = async () => {
    await fetchGraph("http://localhost:8000/graph/moving_average", setLinegraphUrl);
    await fetchGraph("http://localhost:8000/graph/histogram", setHistogramUrl);
    await fetchGraph("http://localhost:8000/graph/boxplot", setBoxplotUrl);
  };
  
  {/* バックエンドから受け取ったキューブvisualを数字の配列から変換するためのカラーマッピング */}
  const colorMapping = {
    1: 'white',
    2: 'orange',
    3: 'green',
    4: 'red',
    5: 'blue',
    6: 'yellow'
  };
  
  {/* バックエンドから受け取ったキューブvisualを数字の配列から変換するための処理 */}
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
  
  
  {/* 初回ロード時にスクランブルとタイム一覧を取得 */}
  useEffect(() => { 
    fetchScramble(); 
    fetchSolves(); 
  }, []);
  
  {/* タイム詳細のモーダルを表示する関数 */}
  const handleShowModal = (solve) => {
    setSelectedSolve(solve);
  setEditedNote(solve.note);  // 選択したソルブのメモを設定
  setEditedStatus(solve.status);  // 選択したソルブのステータスを設定
  setShowModal(true);
  };

  {/* タイム詳細のモーダルを閉じる関数 */}
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSolve(null);
  };
  
  {/* タイム詳細を更新する関数 */}
  const handleUpdateSolve = async () => {
    if (!selectedSolve) return;
  
    const updatedSolve = {
      id: selectedSolve.id,
      time: selectedSolve.time,
      scramble: selectedSolve.scramble,
      created_at: selectedSolve.created_at,
      note: editedNote,
      status: editedStatus,
    };
  
    try {
      // `response` に代入する
      const response = await axios.put(`http://localhost:8000/solves/${selectedSolve.id}`, updatedSolve);
  
      if (response.status === 200) {
        alert('更新しました');
        handleCloseModal();// 更新後にモーダルを閉じる
        fetchSolves(); // 更新後に最新データを取得
      } else {
        alert('更新に失敗しました');
      }
    } catch (error) {
      console.error('エラー:', error);
      alert('通信エラーが発生しました');
    }
  };
  
  {/* タイムを削除する関数 */}
  const handleDeleteSolve = async () => {
    if (!selectedSolve) return;

    if (!window.confirm('本当に削除しますか？')) return; // 削除最終確認のためのアラート

    try {
        // `response` に代入する
        const response = await axios.delete(`http://localhost:8000/solves/${selectedSolve.id}`);

        if (response.status === 200) {
            alert('削除しました');
            handleCloseModal();// 削除後にモーダルを閉じる
            fetchSolves(); // 削除後に最新データを取得
        } else {
            alert('削除に失敗しました');
        }
    } catch (error) {
        console.error('エラー:', error);
        alert('通信エラーが発生しました');
    }
  };

  {/* タイム詳細に表示されたスクランブルをコピーする関数 */}
  const handleCopyScramble = () => {
    if (selectedSolve) {
      navigator.clipboard.writeText(selectedSolve.scramble);
    }
  };

  {/* mo3を計算する関数 */}
  const calculateMo3 = (solves, index) => {
    if ((solves.length - index) < 3) return "-"; // 直近3個のデータがない場合

    // 直近3個のデータを取得
    const lastThree = solves.slice(index, index + 3);

    // タイムを取得し、+2のペナルティを反映
    const times = lastThree.map(solve =>
      solve.status === "DNF" ? "DNF" : solve.status === "+2" ? solve.time + 2 : solve.time
    );

    // DNF の数をカウント
    const dnfCount = times.filter(time => time === "DNF").length;

    if (dnfCount >= 1) return "DNF"; // DNF が1つでもあれば mo3 も DNF

    // DNF 以外のタイムを取得
    const filteredTimes = times.filter(time => time !== "DNF");

    // 平均を計算
    const average = filteredTimes.reduce((sum, time) => sum + time, 0) / filteredTimes.length;

    return formatSavedTime(average);
  };


  {/* ao5を計算する関数 */}
  const calculateAo5 = (solves, index) => {
    if ((solves.length - index) < 5) return "-"; // 直近5個のデータがない場合
  
    // 直近5つのデータを取得
    const lastFive = solves.slice(index, index + 5);
  
    // タイムを取得し、+2のペナルティを反映
    const times = lastFive.map(solve =>
      solve.status === "DNF" ? "DNF" : solve.status === "+2" ? solve.time + 2 : solve.time
    );
  
    // DNF の数をカウント
    const dnfCount = times.filter(time => time === "DNF").length;
    
    if (dnfCount >= 2) return "DNF"; // DNF が2つ以上なら ao5 も DNF
    
    // DNF が 1 つだけなら、それを最遅として扱う
    let filteredTimes = times.filter(time => time !== "DNF").sort((a, b) => a - b);
    if (dnfCount === 1) {
      filteredTimes.push("DNF");
    }
  
    // 最速と最遅を除外
    filteredTimes = filteredTimes.slice(1, 4);
    
    // 平均を計算
    const average = filteredTimes.reduce((sum, time) => sum + time, 0) / filteredTimes.length;
    return formatSavedTime(average);
  };

  {/* ao12を計算する関数 */}
  const calculateAo12 = (solves, index) => {
    if ((solves.length - index) < 12) return "-"; // 直近12個のデータがない場合
  
    // 直近12個のデータを取得
    const lastFive = solves.slice(index, index + 12);
  
    // タイムを取得し、+2のペナルティを反映
    const times = lastFive.map(solve =>
      solve.status === "DNF" ? "DNF" : solve.status === "+2" ? solve.time + 2 : solve.time
    );
  
    // DNF の数をカウント
    const dnfCount = times.filter(time => time === "DNF").length;
    
    if (dnfCount >= 2) return "DNF"; // DNF が2つ以上なら ao5 も DNF
    
    // DNF が 1 つだけなら、それを最遅として扱う
    let filteredTimes = times.filter(time => time !== "DNF").sort((a, b) => a - b);
    if (dnfCount === 1) {
      filteredTimes.push("DNF");
    }
  
    // 最速と最遅を除外
    filteredTimes = filteredTimes.slice(1, 11);
    
    // 平均を計算
    const average = filteredTimes.reduce((sum, time) => sum + time, 0) / filteredTimes.length;
    return formatSavedTime(average);
  };

  {/* ao100を計算する関数 */}
const calculateAo100 = (solves, index) => {
  if ((solves.length - index) < 100) return "-"; // 直近100個のデータがない場合

  // 直近100個のデータを取得
  const lastHundred = solves.slice(index, index + 100);

  // タイムを取得し、+2のペナルティを反映
  const times = lastHundred.map(solve =>
    solve.status === "DNF" ? "DNF" : solve.status === "+2" ? solve.time + 2 : solve.time
  );

  // DNF の数をカウント
  const dnfCount = times.filter(time => time === "DNF").length;

  if (dnfCount >= 10) return "DNF"; // DNFが10個以上なら ao100 も DNF

  // DNF を除外したタイムリストを取得
  let filteredTimes = times.filter(time => time !== "DNF").sort((a, b) => a - b);

  // 最速5つと最遅5つを除外
  filteredTimes = filteredTimes.slice(5, -5);

  // 平均を計算
  const average = filteredTimes.reduce((sum, time) => sum + time, 0) / filteredTimes.length;
  return formatSavedTime(average);
};

  
  {/* 有効試技数を返す関数 */}
  const calculateValidMean = (solves) => {
    if (!Array.isArray(solves) || solves.length === 0) return "N/A";

    const validSolves = solves
        .filter(s => s.status?.toUpperCase() !== "DNF") // DNF以外をフィルター
        .map(s => (s.status === "+2" ? Number(s.time) + 2 : Number(s.time))) // ステータス+2の処理
        .filter(time => !isNaN(time)); // NaN を除外するため

    if (validSolves.length === 0) return "N/A";

    const meanTime = validSolves.reduce((sum, time) => sum + time, 0) / validSolves.length;
    return formatSavedTime(meanTime);
  };

  {/* mo3のベストを返す関数 */}
  const calculateBestMo3 = (solves) => {
    // mo3を配列の長さ分だけループ
    for (let i = 0; i < solves.length; i++) {
      const mo3 = parseFloat(calculateMo3(solves, i));
      
      // 今のmo3とbestmo3を比較し，速ければ置き換え
      if (!isNaN(mo3) && mo3 !== "DNF" && mo3 < bestMo3) {
        bestMo3 = mo3;
      }
    }
    return bestMo3 === Infinity ? "-" : formatSavedTime(bestMo3);
  };

  {/* ao5のベストを返す関数 */}
  const calculateBestAo5 = (solves) => {
    // ao5を配列の長さ分だけループ
    for (let i = 0; i < solves.length; i++) {
      const ao5 = parseFloat(calculateAo5(solves, i));
      
      // 今のao5とbestao5を比較し，速ければ置き換え
      if (!isNaN(ao5) && ao5 !== "DNF" && ao5 < bestAo5) {
        bestAo5 = ao5;
      }
    }
    return bestAo5 === Infinity ? "-" : formatSavedTime(bestAo5);
  };
  
  {/* ao12のベストを返す関数 */}
  const calculateBestAo12 = (solves) => {
    // ao12を配列の長さ分だけループ
    for (let i = 0; i < solves.length; i++) {
      const ao12 = parseFloat(calculateAo12(solves, i));
      
      // 今のao12とbestao12を比較し，速ければ置き換え
      if (!isNaN(ao12) && ao12 !== "DNF" && ao12 < bestAo12) {
        bestAo12 = ao12;
      }
    }
    return bestAo12 === Infinity ? "-" : formatSavedTime(bestAo12);
  };

  {/* ao100のベストを返す関数 */}
  const calculateBestAo100 = (solves) => {
    // ao100を配列の長さ分だけループ
    for (let i = 0; i < solves.length; i++) {
      const ao100 = parseFloat(calculateAo100(solves, i));
      
      // 今のao100とbestao100を比較し，速ければ置き換え
      if (!isNaN(ao100) && ao100 !== "DNF" && ao100 < bestAo100) {
        bestAo100 = ao100;
      }
    }
    return bestAo100 === Infinity ? "-" : formatSavedTime(bestAo100);
  };
  
  {/* 現在の単発を返す関数 */}
  const currentSolve = solves.length > 0 ? solves[0] : null;
  const currentTime = currentSolve
    ? currentSolve.status === "DNF"
      ? "DNF"
      : currentSolve.status === "+2"
        ? `${formatSavedTime((currentSolve.time + 2))}+`
        : formatSavedTime(currentSolve.time)
    : "-";

  {/* ベストの単発を返す関数 */}
  const calculateBestSingle = (solves) => {
    // 単発を配列の長さ分だけループ
    for (let i = 0; i < solves.length; i++) {
      const solve = solves[i];

      if (solve.status === "DNF") continue; // DNFは除外

      const single = solve.status === "+2" ? solve.time + 2 : solve.time; // +2ペナルティの処理
      
      // 今のsingleとbestsingleを比較し，速ければ置き換え
      if (single < bestSingle) {
          bestSingle = single;
      }
    }
    return bestSingle === Infinity ? "-" : formatSavedTime(bestSingle);
  };

  {/* 最遅の単発を返す関数 */}
  const calculateWorstSingle = (solves) => {
    // 単発を配列の長さ分だけループ
    for (let i = 0; i < solves.length; i++) {
      const solve = solves[i];

      if (solve.status === "DNF") continue; // DNFは除外

      const single = solve.status === "+2" ? solve.time + 2 : solve.time; // +2ペナルティの処理
      
      // 今のsingleとbestsingleを比較し，遅ければ置き換え
      if (single > worstSingle) {
        worstSingle = single;
      }
    }
    return worstSingle === Infinity ? "-" : formatSavedTime(worstSingle);
  };

  const fetchGraph = async (url, setUrl) => {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Failed to fetch graph from ${url}`);
      }
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      setUrl(prevUrl => {
        if (prevUrl) URL.revokeObjectURL(prevUrl);
        return objectUrl;
      });
    } catch (error) {
      console.error(`Error fetching graph from ${url}:`, error);
    }
  };

  const calculateElapsedTime = () => {
    if (solves.length === 0) return "-";
    const firstSolveTime = new Date(solves[solves.length - 1].created_at).getTime();
    const currentTime = new Date().getTime();
    const elapsedMilliseconds = currentTime - firstSolveTime;
    const elapsedSeconds = Math.floor((elapsedMilliseconds / 1000) % 60);
    const elapsedMinutes = Math.floor((elapsedMilliseconds / (1000 * 60)) % 60);
    const elapsedHours = Math.floor(elapsedMilliseconds / (1000 * 60 * 60));
    return `${elapsedHours}:${elapsedMinutes}.${elapsedSeconds}`;
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
      {activeTab === 'timer' && (
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
      )}

      {/* メインコンテンツ */}
      {activeTab === 'timer' && (
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
            ao5: {solves.length >= 5 ? calculateAo5(solves, 0) : "-"}
          </h3>
          <h3
            style={{
              fontSize: '4rem',
              fontWeight: 'normal',
              color: '#555',
            }}
          >
            ao12: {solves.length >= 12 ? calculateAo12(solves, 0) : "-"}
          </h3>
          <p>Press Space to Start/Stop</p>
        </div>
     </div>
    )}


    {activeTab === 'timer' && (
    <div
      style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        width: '320px',
        maxHeight: '75vh', 
        overflowY: 'hidden',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '10px',
        border: '3px solid #ccc',
        borderRadius: '10px',
      }}
    >
      <div style={{ textAlign: 'center', fontSize: 18, marginBottom: 10 }}>
        <table style={{ width: '100%', textAlign: 'center', fontSize: 20, marginBottom: 10 }}>
          <thead>
            <tr>
              <th> </th>
              <th>現在</th>
              <th>ベスト</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>タイム</td>
              <td style={{ color: 'blue' }}>{solves.length >= 1 ? currentTime : "-"}</td>
              <td style={{ color: 'blue' }}>{solves.length >= 1 ? calculateBestSingle(solves) : "-"}</td>
            </tr>
            <tr>
              <td>ao5</td>
              <td style={{ color: 'blue' }}>{solves.length >= 5 ? calculateAo5(solves, 0) : "-"}</td>
              <td style={{ color: 'blue' }}>{solves.length >= 5 ? calculateBestAo5(solves) : "-"}</td>
            </tr>
            <tr>
              <td>ao12</td>
              <td style={{ color: 'blue' }}>{solves.length >= 12 ? calculateAo12(solves, 0) : "-"}</td>
              <td style={{ color: 'blue' }}>{solves.length >= 12 ? calculateBestAo12(solves) : "-"}</td>
            </tr>
            <tr>
              <td>ao100</td>
              <td style={{ color: 'blue' }}>{solves.length >= 100 ? calculateAo100(solves, 0) : "-"}</td>
              <td style={{ color: 'blue' }}>{solves.length >= 100 ? calculateBestAo100(solves) : "-"}</td>
            </tr>
          </tbody>
        </table>
        
        <div style={{ textAlign: 'center', fontSize: 20, marginBottom: 10 }}>
          <span><strong>有効試技数: {solves.filter(s => s.status !== "DNF").length} / {solves.length} </strong></span><br></br>
          <span><strong> 平均タイム: {calculateValidMean(solves)} </strong></span>
        </div>
      </div>

      <style>
        {`
          /* スクロールバーを非表示にする */
          div::-webkit-scrollbar {
          display: none;
          }
        `}
      </style>

      {/* スクロール可能なリスト */}
      <div style={{ maxHeight: '300px', overflowY: 'scroll' }}>
        <table className="table table-striped" style={{ width: '100%', lineHeight: '1', fontSize: 20, textAlign: 'center' }}>
          <thead style={{ position: 'sticky', top: 0, background: 'rgba(255, 255, 255, 0.9)' }}>
            <tr>
              <th style={{ textAlign: 'center' }}> </th>
              <th style={{ textAlign: 'center' }}>タイム</th>
              <th style={{ textAlign: 'center' }}>ao5</th>
              <th style={{ textAlign: 'center' }}>ao12</th>
            </tr>
          </thead>
          <tbody>
            {solves.map((solve, index) => (
              <tr key={solve.id} onClick={() => handleShowModal(solve)} style={{ cursor: 'pointer' }}>
                <td>{solves.length - index}</td>
                <td>
                  {solve.status === "DNF"
                    ? "DNF"
                    : solve.status === "+2"
                      ? `${formatSavedTime((solve.time + 2))}+`
                      : formatSavedTime(solve.time)}
                </td>
                <td>{calculateAo5(solves, index)}</td>
                <td>{calculateAo12(solves, index)}</td>
              </tr>
               ))}
           </tbody>
        </table>
      </div>

      {/* モーダルポップアップ */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>詳細情報</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedSolve && (
            <div>
              <p>
                <strong>タイム:</strong> 
                  {selectedSolve.status === "DNF"
                    ? `DNF (${formatSavedTime(selectedSolve.time)} )`
                    : selectedSolve.status === "+2"
                      ? ` ${formatSavedTime((selectedSolve.time + 2))+"+"}`
                      : ` ${formatSavedTime(selectedSolve.time)} `}
              </p>

              <p>
                <strong>スクランブル:</strong><br/> 
                  <span style={{ marginLeft: '10px', flexGrow: 1, wordBreak: 'break-all' }}>
                    {selectedSolve.scramble}
                  </span>
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    onClick={handleCopyScramble} 
                    style={{ marginLeft: '10px' }}
                  >
                    <Clipboard size={16} />
                  </Button>
              </p>

              <p>
                <strong>登録日時:</strong> {new Date(selectedSolve.created_at).toLocaleString()}
              </p>

              {/* メモ編集欄 */}
              <div>
                <label><strong>メモ:</strong></label>
                <textarea
                  value={editedNote}
                  onChange={(e) => setEditedNote(e.target.value)}
                  className="form-control"
                />
              </div>

              {/* ステータス選択 */}
              <div>
                <label><strong>ステータス:</strong></label>
                <div>
                  {['ok', '+2', 'DNF'].map((status) => (
                    <label key={status} className="me-2">
                      <input
                        type="radio"
                        name="status"
                        value={status}
                        checked={editedStatus === status}
                        onChange={(e) => setEditedStatus(e.target.value)}
                      /> {status}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="danger" onClick={handleDeleteSolve}>削除</Button>
          <Button variant="primary" onClick={handleUpdateSolve}>更新する</Button>
          <Button variant="secondary" onClick={handleCloseModal}>閉じる</Button>
        </Modal.Footer>
      </Modal>
    </div>
    )}

    
    {/* Rubik's Cube 展開図 */}
    <div className="position-fixed bottom-0 end-0 mb-3 me-3">
    {activeTab === 'timer' && (
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
    )}

{activeTab === "stats" && (
  <div>
    <div
      style={{
        position: "fixed",
        top: "73px",
        left: "140px",
        width: "600px",
        height: "280px",
        maxWidth: "100%", 
        maxHeight: "100%", 
        objectFit: "contain",
        boxShadow: "5px 5px 15px rgba(0, 0, 0, 0.3)",  // ← 影を追加
        borderRadius: "8px"  // 角を少し丸める（オプション）
        
      }} 
    > 
      <div style={{ textAlign: 'center', fontSize: 20, marginBottom: 10 }}>
          <span><strong>有効試技数: {solves.filter(s => s.status !== "DNF").length} / {solves.length} , 平均タイム: {calculateValidMean(solves)} </strong></span>
          <br></br>総経過時間: {calculateElapsedTime()}
          <br></br>ベスト: {solves.length >= 1 ? calculateBestSingle(solves) : "-"}, ワースト: {solves.length >= 1 ? calculateWorstSingle(solves) : "-"}
      </div>

      <table style={{ width: '80%', textAlign: 'center', fontSize: 20, marginBottom: 10, margin: "auto" }}>
          <thead>
            <tr>
              <th> </th>
              <th>現在</th>
              <th>標準偏差</th>
              <th>ベスト</th>
              <th>標準偏差</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>mo3</td>
              <td style={{ color: 'blue' }}>{solves.length >= 3 ? calculateMo3(solves, 0) : "-"}</td>
              <td>タイム</td>
              <td style={{ color: 'blue' }}>{solves.length >= 3 ? calculateBestMo3(solves) : "-"}</td>
              <td>タイム</td>
            </tr>
            <tr>
              <td>ao5</td>
              <td style={{ color: 'blue' }}>{solves.length >= 5 ? calculateAo5(solves, 0) : "-"}</td>
              <td>タイム</td>
              <td style={{ color: 'blue' }}>{solves.length >= 5 ? calculateBestAo5(solves) : "-"}</td>
              <td>タイム</td>
            </tr>
            <tr>
              <td>ao12</td>
              <td style={{ color: 'blue' }}>{solves.length >= 12 ? calculateAo12(solves, 0) : "-"}</td>
              <td>タイム</td>
              <td style={{ color: 'blue' }}>{solves.length >= 12 ? calculateBestAo12(solves) : "-"}</td>
              <td>タイム</td>
            </tr>
            <tr>
              <td>ao100</td>
              <td style={{ color: 'blue' }}>{solves.length >= 100 ? calculateAo100(solves, 0) : "-"}</td>
              <td>タイム</td>
              <td style={{ color: 'blue' }}>{solves.length >= 100 ? calculateBestAo100(solves) : "-"}</td>
              <td>タイム</td>
            </tr>
          </tbody>
        </table>
    </div>

    <div style={{ position: "fixed", width: "40vw", height: "45vh", bottom: 20, right: 90 }}>
      {linegraphUrl ? (
        <img 
          src={linegraphUrl} 
          alt="Moving Average Graph" 
          style={{ 
            maxWidth: "100%", 
            maxHeight: "100%", 
            objectFit: "contain",
            boxShadow: "5px 5px 15px rgba(0, 0, 0, 0.3)",  // ← 影を追加
            borderRadius: "8px"  // 角を少し丸める（オプション）
          }} 
        />
      ) : (
        <p>Loading graph...</p>
      )}
    </div>

    <div style={{ position: "fixed", width: "40vw", height: "45vh", bottom: 20, left: 140 }}>
      {histogramUrl ? (
        <img 
          src={histogramUrl} 
          alt="Histogram" 
          style={{ 
            maxWidth: "100%", 
            maxHeight: "100%", 
            objectFit: "contain",
            boxShadow: "5px 5px 15px rgba(0, 0, 0, 0.3)",  // ← 影を追加
            borderRadius: "8px"
          }} 
        />
      ) : (
        <p>Loading graph...</p>
      )}
    </div>
  </div>
)}

  
  </div>
  </div>
  );
};

export default App;