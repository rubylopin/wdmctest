# 工作管理系統 📋

一個藍色可愛風格的工作管理網頁系統，使用 Node.js + Express + SQLite 開發。

## 功能特色

- ✅ **週視圖與月視圖切換** - 以週或月為單位檢視任務
- ✅ **任務管理** - 新增、編輯、刪除、更新狀態
- ✅ **主檔管理** - 公司主檔、工作項目主檔
- ✅ **固定工作範本** - 支援自動產生和手動複製
- ✅ **藍色可愛風格** - 漸變色背景、圓角卡片、流暢動畫

## 技術架構

- **後端**: Express.js + Node.js
- **資料庫**: SQLite
- **前端**: Bootstrap 5.2 + Vanilla JavaScript
- **樣式**: 自訂 CSS（藍色漸變主題）

## 安裝與啟動

1. 確認已安裝 Node.js

2. 安裝依賴套件（已完成）：
```bash
cd /Users/ruby/Documents/code/work-manager
npm install
```

3. 啟動伺服器：
```bash
node server.js
```

4. 開啟瀏覽器訪問：
```
http://localhost:3000
```

## 使用說明

### 任務管理主頁 (index.html)

- **視圖切換**: 點擊「週視圖」或「月視圖」按鈕
- **日期切換**: 使用「上一期」「今天」「下一期」按鈕
- **新增任務**: 點擊右上角「➕ 新增任務」按鈕
- **編輯任務**: 點擊任務卡片或編輯圖示
- **任務狀態**:
  - ⏳ 待處理（黃色）
  - 🔄 進行中（藍色）
  - ✅ 已完成（綠色）

### 主檔管理頁面 (masters.html)

1. **公司主檔**
   - 新增、刪除公司資料
   - 用於任務的公司別選項

2. **工作項目主檔**
   - 新增、刪除工作項目
   - 可設定分類和說明
   - 用於任務的工作項目選項

3. **固定工作範本**
   - 設定定期工作（每月、每季、每年）
   - 手動產生任務
   - 自動產生本月任務（避免重複）

## 資料庫結構

- `companies` - 公司主檔
- `work_items` - 工作項目主檔
- `task_templates` - 固定工作範本
- `tasks` - 任務表
- `template_generation_log` - 範本產生記錄

## API 端點

### 任務 API
- `GET /api/tasks` - 取得任務列表
- `GET /api/tasks/week/:date` - 取得指定週的任務
- `GET /api/tasks/month/:year/:month` - 取得指定月份的任務
- `POST /api/tasks` - 新增任務
- `PUT /api/tasks/:id` - 更新任務
- `DELETE /api/tasks/:id` - 刪除任務
- `PATCH /api/tasks/:id/status` - 更新任務狀態

### 公司主檔 API
- `GET /api/companies` - 取得公司列表
- `POST /api/companies` - 新增公司
- `PUT /api/companies/:id` - 更新公司
- `DELETE /api/companies/:id` - 刪除公司（軟刪除）

### 工作項目 API
- `GET /api/work-items` - 取得工作項目列表
- `POST /api/work-items` - 新增工作項目
- `PUT /api/work-items/:id` - 更新工作項目
- `DELETE /api/work-items/:id` - 刪除工作項目（軟刪除）

### 範本 API
- `GET /api/templates` - 取得範本列表
- `POST /api/templates` - 新增範本
- `PUT /api/templates/:id` - 更新範本
- `DELETE /api/templates/:id` - 刪除範本
- `POST /api/templates/:id/generate` - 手動從範本產生任務
- `POST /api/templates/auto-generate` - 自動產生本月所有範本任務

## 檔案結構

```
work-manager/
├── server.js                    # Express 伺服器
├── package.json
├── database/
│   ├── init.sql                 # 資料庫初始化 SQL
│   ├── db.js                    # SQLite 連線模組
│   └── work_manager.db          # SQLite 資料庫檔案
├── routes/
│   ├── tasks.js                 # 任務 API
│   ├── companies.js             # 公司主檔 API
│   ├── workItems.js             # 工作項目 API
│   └── templates.js             # 範本 API
├── services/
│   └── templateService.js       # 範本自動產生邏輯
└── public/
    ├── index.html               # 任務管理主頁
    ├── masters.html             # 主檔管理頁面
    ├── css/
    │   ├── common.css           # 共用樣式
    │   └── blue-theme.css       # 藍色可愛風主題
    └── js/
        ├── common.js            # 共用函數（API、日期工具、Toast）
        ├── weekView.js          # 週視圖
        ├── monthView.js         # 月視圖
        └── taskModal.js         # 任務 Modal
```

## 初始測試資料

系統已預設新增以下測試資料：

**公司**：
- 台灣電子公司 (TWE001)
- 科技創新股份有限公司 (TIC002)

**工作項目**：
- 請款（財務）
- 報表製作（行政）
- 客戶拜訪（業務）

## 開發者資訊

- 使用繁體中文
- 藍色漸變主題（#4facfe 到 #00f2fe）
- 圓角卡片設計（border-radius: 20px）
- 支援響應式設計（手機、平板、桌面）

## 注意事項

- 資料庫檔案：`database/work_manager.db`
- 伺服器埠號：3000
- 刪除操作為軟刪除（設定 is_active=0）

## 常見問題

Q: 如何新增範本？
A: 前往「主檔管理」→「固定工作範本」→「➕ 新增範本」

Q: 範本會自動產生任務嗎？
A: 不會自動產生，需要手動點擊「🔄 自動產生本月任務」按鈕

Q: 如何查看過去的任務？
A: 使用「上一期」按鈕切換到過去的週或月

---

🎉 享受使用工作管理系統！
