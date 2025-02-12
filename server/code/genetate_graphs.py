from db import get_db, engine, Base
import crud
from sqlalchemy.orm import Session
from fastapi import FastAPI, Depends, HTTPException
import matplotlib.pyplot as plt
import pandas as pd
import io
import base64
from fastapi.responses import Response

# **折れ線グラフ**
def get_linegraph(db: Session = Depends(get_db)):
    # データベースからソルブデータを取得
    solves = crud.get_solves(db)
    
    if not solves:
        raise HTTPException(status_code=404, detail="No solves found")
    
    # ソルブ回数（x軸）とタイム（y軸）を抽出
    solve_counts = list(range(1, len(solves) + 1))
    solve_times = [solve.time for solve in solves]
    
    # グラフの作成
    plt.figure(figsize=(10, 5))
    plt.plot(solve_counts, solve_times, marker='o', linestyle='-', color='b')
    plt.xlabel("Solve Count")
    plt.ylabel("Time (seconds)")
    plt.title("Rubik's Cube Solve Times")
    plt.grid(True)
    
    # グラフの画像をメモリに保存
    buf = io.BytesIO()
    plt.savefig(buf, format="png")
    buf.seek(0)
    plt.close()
    
    return Response(content=buf.getvalue(), media_type="image/png")

# **ヒストグラム**
def get_histogram(db: Session = Depends(get_db)):
    solves = crud.get_solves(db)
    if not solves:
        raise HTTPException(status_code=404, detail="No solves found")
    
    solve_times = [solve.time for solve in solves]
    
    plt.figure(figsize=(10, 5))
    plt.hist(solve_times, bins=10, color='blue', edgecolor='black', alpha=0.7)
    plt.xlabel("Time (seconds)")
    plt.ylabel("Frequency")
    plt.title("Solve Time Distribution")
    plt.grid(True)
    
    buf = io.BytesIO()
    plt.savefig(buf, format="png")
    buf.seek(0)
    plt.close()
    
    return Response(content=buf.getvalue(), media_type="image/png")

# **箱ひげ図**
def get_boxplot(db: Session = Depends(get_db)):
    solves = crud.get_solves(db)
    if not solves:
        raise HTTPException(status_code=404, detail="No solves found")
    
    solve_times = [solve.time for solve in solves]
    
    plt.figure(figsize=(5, 5))
    plt.boxplot(solve_times, vert=True, patch_artist=True)
    plt.ylabel("Time (seconds)")
    plt.title("Solve Time Boxplot")
    plt.grid(True)
    
    buf = io.BytesIO()
    plt.savefig(buf, format="png")
    buf.seek(0)
    plt.close()
    
    return Response(content=buf.getvalue(), media_type="image/png")

# **移動平均**
def get_moving_average(db: Session = Depends(get_db), window_size_5: int = 5, window_size_12: int = 12):
    solves = crud.get_solves(db)
    if not solves:
        raise HTTPException(status_code=404, detail="No solves found")
    
    solve_counts = list(range(1, len(solves) + 1))
    solve_times = [solve.time for solve in solves]
    
    # 移動平均の計算
    moving_avg_5 = pd.Series(solve_times).rolling(window=window_size_5).mean()
    moving_avg_12 = pd.Series(solve_times).rolling(window=window_size_12).mean() 
    
    plt.figure(figsize=(10, 5))
    plt.plot(solve_counts, solve_times, linestyle='-', color='b', label="Single")
    plt.plot(solve_counts, moving_avg_5, linestyle='-', color='r', label=f"Average of {window_size_5}")
    plt.plot(solve_counts, moving_avg_12, linestyle='-', color='g', label=f"Average of {window_size_12}")
    
    plt.xlabel("Solve Count")
    plt.ylabel("Time (seconds)")
    plt.title("Moving Average of Solve Times")
    plt.legend()
    plt.grid(True)
    
    buf = io.BytesIO()
    plt.savefig(buf, format="png")
    buf.seek(0)
    plt.close()
    
    return Response(content=buf.getvalue(), media_type="image/png")

# ** 散布図 **
def get_scatterplot(db: Session = Depends(get_db)):
    solves = crud.get_solves(db)
    if not solves:
        raise HTTPException(status_code=404, detail="No solves found")
    
    solve_counts = list(range(1, len(solves) + 1))
    solve_times = [solve.time for solve in solves]
    
    plt.figure(figsize=(10, 5))
    plt.scatter(solve_counts, solve_times, color='b', alpha=0.7)
    plt.xlabel("Solve Count")
    plt.ylabel("Time (seconds)")
    plt.title("Scatter Plot of Solve Times")
    plt.grid(True)
    
    buf = io.BytesIO()
    plt.savefig(buf, format="png")
    buf.seek(0)
    plt.close()
    
    return Response(content=buf.getvalue(), media_type="image/png")

# ** 基本統計量 **
def get_statistics(db: Session = Depends(get_db)):
    solves = crud.get_solves(db)
    if not solves:
        raise HTTPException(status_code=404, detail="No solves found")
    
    solve_times = [solve.time for solve in solves]
    df = pd.DataFrame(solve_times, columns=["Time"])
    stats = df.describe()
    
    return stats.to_dict()

# ** 最速・ワーストN件 **
def get_top_bottom_times(db: Session = Depends(get_db), n: int = 5):
    solves = crud.get_solves(db)
    if not solves:
        raise HTTPException(status_code=404, detail="No solves found")
    
    solve_times = [(solve.id, solve.time) for solve in solves]
    sorted_times = sorted(solve_times, key=lambda x: x[1])
    
    top_n = sorted_times[:n]  # 最速N件
    bottom_n = sorted_times[-n:]  # ワーストN件
    
    return {"top_times": top_n, "worst_times": bottom_n}