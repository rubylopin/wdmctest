const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database/db');

const app = express();
const PORT = 3000;

// 中間件
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));

// 導入路由
const tasksRoute = require('./routes/tasks');
const companiesRoute = require('./routes/companies');
const workItemsRoute = require('./routes/workItems');
const templatesRoute = require('./routes/templates');

// API 路由
app.use('/api/tasks', tasksRoute);
app.use('/api/companies', companiesRoute);
app.use('/api/work-items', workItemsRoute);
app.use('/api/templates', templatesRoute);

// 根路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 初始化資料庫並啟動伺服器
async function startServer() {
    try {
        await db.initialize();
        app.listen(PORT, () => {
            console.log(`[${new Date().toISOString()}] Server running at http://localhost:${PORT}`);
            console.log(`[${new Date().toISOString()}] 工作管理系統已啟動！`);
        });
    } catch (error) {
        console.error('[Server] Failed to start:', error);
        process.exit(1);
    }
}

startServer();
