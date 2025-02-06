from fastapi import FastAPI
app = FastAPI()

import numpy as np
from fastapi.encoders import jsonable_encoder

# 1から6までの数字で埋めた6つの配列を定義
array1 = np.full((3, 3), 1)  # 白
array2 = np.full((3, 3), 2)  # オレンジ
array3 = np.full((3, 3), 3)  # 緑
array4 = np.full((3, 3), 4)  # 赤
array5 = np.full((3, 3), 5)  # 青
array6 = np.full((3, 3), 6)  # 黄色

def copy_arrays():
    return [arr.copy() for arr in [array1, array2, array3, array4, array5, array6]]

def turn_U():
    global array1, array2, array3, array4, array5, array6
    copy1, copy2, copy3, copy4, copy5, copy6 = copy_arrays()
    
    array2[0] = copy3[0]
    array3[0] = copy4[0]
    array4[0] = copy5[0]
    array5[0] = copy2[0]
    array1 = np.rot90(copy1, -1)

def turn_R():
    global array1, array2, array3, array4, array5, array6
    copy1, copy2, copy3, copy4, copy5, copy6 = copy_arrays()
    
    array1[:, 2] = copy3[:, 2]
    array3[:, 2] = copy6[:, 2]
    array6[:, 2] = np.flip(copy5[:, 0])
    array5[:, 0] = np.flip(copy1[:, 2])
    array4 = np.rot90(copy4, -1)

def turn_L():
    global array1, array2, array3, array4, array5, array6
    copy1, copy2, copy3, copy4, copy5, copy6 = copy_arrays()
    
    array1[:, 0] = np.flip(copy5[:, 2])
    array5[:, 2] = np.flip(copy6[:, 0])
    array6[:, 0] = copy3[:, 0]
    array3[:, 0] = copy1[:, 0]
    array2 = np.rot90(copy2, -1)

def turn_F():
    global array1, array2, array3, array4, array5, array6
    copy1, copy2, copy3, copy4, copy5, copy6 = copy_arrays()
    
    array1[2] = np.flip(copy2[:, 2])
    array2[:, 2] = copy6[0]
    array6[0] = np.flip(copy4[:, 0])
    array4[:, 0] = copy1[2]
    array3 = np.rot90(copy3, -1)

def turn_B():
    global array1, array2, array3, array4, array5, array6
    copy1, copy2, copy3, copy4, copy5, copy6 = copy_arrays()
    
    array1[0] = copy4[:, 2]
    array4[:, 2] = np.flip(copy6[2])
    array6[2] = copy2[:, 0]
    array2[:, 0] = np.flip(copy1[0])
    array5 = np.rot90(copy5, -1)

def turn_D():
    global array1, array2, array3, array4, array5, array6
    copy1, copy2, copy3, copy4, copy5, copy6 = copy_arrays()
    
    array3[2] = copy2[2]
    array2[2] = copy5[2]
    array5[2] = copy4[2]
    array4[2] = copy3[2]
    array6 = np.rot90(copy6, -1)

def execute_turn(turn):
    moves = {
        "U": turn_U,
        "U2": lambda: (turn_U(), turn_U()),
        "U'": lambda: (turn_U(), turn_U(), turn_U()),
        "R": turn_R,
        "R2": lambda: (turn_R(), turn_R()),
        "R'": lambda: (turn_R(), turn_R(), turn_R()),
        "L": turn_L,
        "L2": lambda: (turn_L(), turn_L()),
        "L'": lambda: (turn_L(), turn_L(), turn_L()),
        "F": turn_F,
        "F2": lambda: (turn_F(), turn_F()),
        "F'": lambda: (turn_F(), turn_F(), turn_F()),
        "B": turn_B,
        "B2": lambda: (turn_B(), turn_B()),
        "B'": lambda: (turn_B(), turn_B(), turn_B()),
        "D": turn_D,
        "D2": lambda: (turn_D(), turn_D()),
        "D'": lambda: (turn_D(), turn_D(), turn_D()),
    }
    if turn in moves:
        moves[turn]()
    else:
        print(f"Unknown move: {turn}")


def generate_visual(scramble: dict):
    input_moves = scramble["scramble"]
    moves = input_moves.split()
    for move in moves:
        execute_turn(move)
    
    visual = {
        "white": array1.tolist(),
        "orange": array2.tolist(),
        "green": array3.tolist(),
        "red": array4.tolist(),
        "blue": array5.tolist(),
        "yellow": array6.tolist(),
    }

    return jsonable_encoder(visual)
