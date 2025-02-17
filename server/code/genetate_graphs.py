from db import get_db, engine, Base
import crud
from sqlalchemy.orm import Session
from fastapi import FastAPI, Depends, HTTPException
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
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

    # 図の作成（全体サイズを設定）
    fig = plt.figure(figsize=(7, 4))

    # グリッドレイアウトの作成（ヒストグラム3: 箱ひげ図1 の比率）
    gs = gridspec.GridSpec(1, 2, width_ratios=[4, 1])  # [ヒストグラム, 箱ひげ図]
    
    # **背景色を変更**
    fig.patch.set_facecolor("#f3f4f6")

    # ヒストグラム（左側に配置・横向き）
    ax_hist = plt.subplot(gs[0, 0])
    ax_hist.hist(solve_times, bins=10, color='blue', edgecolor='black', alpha=0.7, orientation='horizontal')
    ax_hist.set_xlabel("Frequency")  # 横軸 = 頻度
    ax_hist.set_ylabel("Time (seconds)")  # 縦軸 = タイム
    ax_hist.set_title("Solve Time Distribution")
    ax_hist.grid(True)

    # 箱ひげ図（右側に配置・縦向き）
    ax_box = plt.subplot(gs[0, 1])
    ax_box.boxplot(solve_times, vert=True, patch_artist=True, widths=0.6)  # 縦向きに設定
    ax_box.set_xticks([])  # 横軸の数値を削除
    ax_box.set_title("Solve Time Boxplot")

    # **ヒストグラムと箱ひげ図の縦軸（時間）を統一**
    ax_box.set_ylim(ax_hist.get_ylim())

    # レイアウト調整
    plt.tight_layout()

    # 画像をバッファに保存
    buf = io.BytesIO()
    plt.savefig(buf, format="png", bbox_inches='tight')  # bbox_inches で余白を調整
    buf.seek(0)
    plt.close()

    return Response(content=buf.getvalue(), media_type="image/png")

# **箱ひげ図**
def get_boxplot(db: Session = Depends(get_db)):
    solves = crud.get_solves(db)
    if not solves:
        raise HTTPException(status_code=404, detail="No solves found")
    
    solve_times = [solve.time for solve in solves]
    
    # 図の作成（元のサイズ 4x4 のまま）
    fig, ax = plt.subplots(figsize=(4, 4))

    # 箱ひげ図の描画
    ax.boxplot(solve_times, vert=True, patch_artist=True, widths=0.6)

    # 軸の設定
    ax.set_ylabel("Time (seconds)")
    ax.set_title("Solve Time Boxplot")

    # 横軸の数値を削除
    ax.set_xticks([])

    # **グラフを中心に配置するための調整**
    ax.set_position([0.3, 0.2, 0.4, 0.6])  # (left, bottom, width, height) の順で調整

    # バッファに保存
    buf = io.BytesIO()
    plt.savefig(buf, format="png", bbox_inches='tight')  # bbox_inches で余白を調整
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

    # 図の作成（7x5インチ）
    fig = plt.figure(figsize=(7, 4))
    
    # グリッドレイアウトの作成（1行1列）
    gs = gridspec.GridSpec(1, 1)
    ax = plt.subplot(gs[0, 0])
    
    # **背景色を変更**
    fig.patch.set_facecolor("#f3f4f6")

    # グラフの描画
    ax.plot(solve_counts, solve_times, linestyle='-', color='b', label="Single")
    ax.plot(solve_counts, moving_avg_5, linestyle='-', color='r', label=f"Average of {window_size_5}")
    ax.plot(solve_counts, moving_avg_12, linestyle='-', color='g', label=f"Average of {window_size_12}")

    # 軸とタイトルの設定
    ax.set_xlabel("Solve Count")
    ax.set_ylabel("Time (seconds)")
    ax.set_title("Moving Average of Solve Times")
    ax.legend()
    ax.grid(True)

    # レイアウト調整
    plt.tight_layout()

    # 画像をバッファに保存
    buf = io.BytesIO()
    plt.savefig(buf, format="png", bbox_inches='tight')  # bbox_inches で余白を調整
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