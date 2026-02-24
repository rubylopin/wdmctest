const express = require('express');
const router = express.Router();
const db = require('../database/db');

// 取得任務列表（支援日期範圍和狀態篩選）
router.get('/', async (req, res) => {
    try {
        const { start, end, status, company_id } = req.query;

        let sql = `
            SELECT t.*,
                   c.name as company_name,
                   w.name as work_item_name
            FROM tasks t
            LEFT JOIN companies c ON t.company_id = c.id
            JOIN work_items w ON t.work_item_id = w.id
            WHERE 1=1
        `;
        const params = [];

        if (start && end) {
            sql += ' AND t.fill_date BETWEEN ? AND ?';
            params.push(start, end);
        }

        if (status) {
            sql += ' AND t.status = ?';
            params.push(status);
        }

        if (company_id) {
            sql += ' AND t.company_id = ?';
            params.push(company_id);
        }

        sql += ' ORDER BY t.fill_date ASC, t.created_at DESC';

        console.log(`[${new Date().toISOString()}] GET /api/tasks - Fetching tasks with filters:`, { start, end, status, company_id });

        const tasks = await db.all(sql, params);
        res.json(tasks);
    } catch (error) {
        console.error('[tasks] Error fetching tasks:', error);
        res.status(500).json({ error: error.message });
    }
});

// 取得指定週的任務
router.get('/week/:date', async (req, res) => {
    try {
        const { date } = req.params;
        const targetDate = new Date(date);

        // 計算週的起始日（週日）和結束日（週六）
        const day = targetDate.getDay();
        const weekStart = new Date(targetDate);
        weekStart.setDate(targetDate.getDate() - day);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        const startStr = weekStart.toISOString().split('T')[0];
        const endStr = weekEnd.toISOString().split('T')[0];

        console.log(`[${new Date().toISOString()}] GET /api/tasks/week/${date} - Week range: ${startStr} to ${endStr}`);

        const tasks = await db.all(`
            SELECT t.*,
                   c.name as company_name,
                   w.name as work_item_name
            FROM tasks t
            LEFT JOIN companies c ON t.company_id = c.id
            JOIN work_items w ON t.work_item_id = w.id
            WHERE t.fill_date BETWEEN ? AND ?
            ORDER BY t.fill_date ASC, t.created_at DESC
        `, [startStr, endStr]);

        res.json(tasks);
    } catch (error) {
        console.error('[tasks] Error fetching week tasks:', error);
        res.status(500).json({ error: error.message });
    }
});

// 取得指定月份的任務
router.get('/month/:year/:month', async (req, res) => {
    try {
        const { year, month } = req.params;
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;

        // 計算月份的最後一天
        const nextMonth = new Date(parseInt(year), parseInt(month), 1);
        const lastDay = new Date(nextMonth - 1).getDate();
        const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

        console.log(`[${new Date().toISOString()}] GET /api/tasks/month/${year}/${month} - Month range: ${startDate} to ${endDate}`);

        const tasks = await db.all(`
            SELECT t.*,
                   c.name as company_name,
                   w.name as work_item_name
            FROM tasks t
            LEFT JOIN companies c ON t.company_id = c.id
            JOIN work_items w ON t.work_item_id = w.id
            WHERE t.fill_date BETWEEN ? AND ?
            ORDER BY t.fill_date ASC, t.created_at DESC
        `, [startDate, endDate]);

        res.json(tasks);
    } catch (error) {
        console.error('[tasks] Error fetching month tasks:', error);
        res.status(500).json({ error: error.message });
    }
});

// 新增任務
router.post('/', async (req, res) => {
    try {
        const {
            fill_date,
            expected_complete_date,
            company_id,
            work_item_id,
            description,
            status
        } = req.body;

        // 驗證必填欄位
        if (!fill_date || !work_item_id) {
            return res.status(400).json({
                error: 'fill_date and work_item_id are required'
            });
        }

        console.log(`[${new Date().toISOString()}] POST /api/tasks - Creating new task`);

        const result = await db.run(`
            INSERT INTO tasks (
                fill_date, expected_complete_date, company_id,
                work_item_id, description, status
            ) VALUES (?, ?, ?, ?, ?, ?)
        `, [
            fill_date,
            expected_complete_date || null,
            company_id || null,
            work_item_id,
            description || null,
            status || 'pending'
        ]);

        res.json({
            success: true,
            id: result.lastID,
            message: 'Task created successfully'
        });
    } catch (error) {
        console.error('[tasks] Error creating task:', error);
        res.status(500).json({ error: error.message });
    }
});

// 更新任務
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            fill_date,
            expected_complete_date,
            company_id,
            work_item_id,
            description,
            status
        } = req.body;

        console.log(`[${new Date().toISOString()}] PUT /api/tasks/${id} - Updating task`);

        await db.run(`
            UPDATE tasks SET
                fill_date = ?,
                expected_complete_date = ?,
                company_id = ?,
                work_item_id = ?,
                description = ?,
                status = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [
            fill_date,
            expected_complete_date,
            company_id,
            work_item_id,
            description,
            status,
            id
        ]);

        res.json({ success: true, message: 'Task updated successfully' });
    } catch (error) {
        console.error('[tasks] Error updating task:', error);
        res.status(500).json({ error: error.message });
    }
});

// 刪除任務
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        console.log(`[${new Date().toISOString()}] DELETE /api/tasks/${id} - Deleting task`);

        await db.run('DELETE FROM tasks WHERE id = ?', [id]);
        res.json({ success: true, message: 'Task deleted successfully' });
    } catch (error) {
        console.error('[tasks] Error deleting task:', error);
        res.status(500).json({ error: error.message });
    }
});

// 更新任務狀態
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'in_progress', 'completed'].includes(status)) {
            return res.status(400).json({
                error: 'Invalid status value'
            });
        }

        console.log(`[${new Date().toISOString()}] PATCH /api/tasks/${id}/status - Updating status to ${status}`);

        const completedAt = status === 'completed' ?
            new Date().toISOString() : null;

        await db.run(`
            UPDATE tasks SET
                status = ?,
                completed_at = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [status, completedAt, id]);

        res.json({ success: true, message: 'Status updated successfully' });
    } catch (error) {
        console.error('[tasks] Error updating status:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
