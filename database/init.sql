-- 工作管理系統資料庫初始化腳本

-- 公司主檔
CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    code TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 工作項目主檔
CREATE TABLE IF NOT EXISTS work_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 固定工作範本
CREATE TABLE IF NOT EXISTS task_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    company_id INTEGER,
    work_item_id INTEGER NOT NULL,
    description TEXT,
    repeat_type TEXT NOT NULL CHECK(repeat_type IN ('monthly', 'quarterly', 'yearly')),
    repeat_day INTEGER,
    repeat_month INTEGER,
    duration_days INTEGER DEFAULT 1,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    FOREIGN KEY (work_item_id) REFERENCES work_items(id) ON DELETE CASCADE
);

-- 任務表
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fill_date DATE NOT NULL,
    expected_complete_date DATE,
    company_id INTEGER,
    work_item_id INTEGER NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed')),
    is_from_template INTEGER DEFAULT 0,
    template_id INTEGER,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    FOREIGN KEY (work_item_id) REFERENCES work_items(id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES task_templates(id) ON DELETE SET NULL
);

-- 範本產生記錄
CREATE TABLE IF NOT EXISTS template_generation_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_id INTEGER NOT NULL,
    generation_date DATE NOT NULL,
    task_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES task_templates(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    UNIQUE(template_id, generation_date)
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_tasks_fill_date ON tasks(fill_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- 插入初始測試資料
INSERT OR IGNORE INTO companies (name, code) VALUES
    ('台灣電子公司', 'TWE001'),
    ('科技創新股份有限公司', 'TIC002');

INSERT OR IGNORE INTO work_items (name, description, category) VALUES
    ('請款', '每月固定請款作業', '財務'),
    ('報表製作', '製作月報表', '行政'),
    ('客戶拜訪', '定期拜訪重要客戶', '業務');
