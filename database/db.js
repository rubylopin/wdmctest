const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'work_manager.db');
const INIT_SQL_PATH = path.join(__dirname, 'init.sql');

class Database {
    constructor() {
        this.db = null;
    }

    async initialize() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(DB_PATH, (err) => {
                if (err) {
                    console.error('[Database] Connection error:', err);
                    reject(err);
                } else {
                    console.log(`[${new Date().toISOString()}] Connected to SQLite database: ${DB_PATH}`);
                    this.runInitSQL().then(resolve).catch(reject);
                }
            });
        });
    }

    async runInitSQL() {
        console.log(`[${new Date().toISOString()}] Running initialization SQL...`);

        // 啟用外鍵支援
        await this.run('PRAGMA foreign_keys = ON');

        // 讀取並執行初始化 SQL
        const initSQL = fs.readFileSync(INIT_SQL_PATH, 'utf8');
        const statements = initSQL.split(';').filter(stmt => stmt.trim());

        for (const statement of statements) {
            if (statement.trim()) {
                await this.run(statement);
            }
        }

        console.log(`[${new Date().toISOString()}] Database initialized successfully`);
    }

    // Promise 包裝的 run 方法
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ lastID: this.lastID, changes: this.changes });
                }
            });
        });
    }

    // Promise 包裝的 get 方法
    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // Promise 包裝的 all 方法
    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log(`[${new Date().toISOString()}] Database connection closed`);
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }
}

// 建立單例
const db = new Database();

module.exports = db;
