from fastapi import FastAPI
import random

app = FastAPI()


def generate_scramble():
    moves = ["U", "D", "R", "L", "F", "B"]
    modifiers = ["", "'", "2"]  # 通常, 逆回転, 2回転
    scramble = []
    
    length = 0  # 文字数カウント
    prev_move = None  # 直前の回転記号を記憶
    
    while length < 30:
        move = random.choice(moves)
        if move == prev_move:
            continue  # 同じ回転記号の連続を防ぐ
        
        modifier = random.choice(modifiers)
        scramble.append(move + modifier)
        
        length += 1 if modifier == "" or modifier == "'" else 2
        prev_move = move
    
    return {"scramble": " ".join(scramble)}
