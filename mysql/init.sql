CREATE DATABASE IF NOT EXISTS cube_solver;

USE cube_solver;

CREATE TABLE IF NOT EXISTS solves (
    id INT AUTO_INCREMENT PRIMARY KEY,
    time INT NOT NULL,
    scramble VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    note TEXT,
    status ENUM('ok', '+2', 'DNF') NOT NULL DEFAULT 'ok'
);
