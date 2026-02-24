const express = require('express');
const router = express.Router();
const db = require('../database/db');
const templateService = require('../services/templateService');

// 取得範本列表
router.get('/', async (req, res) => {
    try {
        console.log(`[${new Date().toISOString()}] GET /api/templates - Fetching templates`);

        const templates = await db.all(`
            SELECT t.*,
                   c.name as company_name,
                   w.name as work_item_name
            FROM task_templates t
            LEFT JOIN companies c ON t.company_id = c.id
            JOIN work_items w ON t.work_item_id = w.id
            WHERE t.is_active = 1
            ORDER BY t.repeat_type ASC, t.repeat_day ASC
        `);

        res.json(templates);
    } catch (error) {
        console.error('[templates] Error fetching templates:', error);
        res.status(500).json({ error: error.message });
    }
});

// 新增範本
router.post('/', async (req, res) => {
    try {
        const {
            name,
            company_id,
            work_item_id,
            description,
            repeat_type,
            repeat_day,
            repeat_month,
            duration_days
        } = req.body;

        // 驗證必填欄位
        if (!name || !work_item_id || !repeat_type) {
            return res.status(400).json({
                error: 'name, work_item_id and repeat_type are required'
            });
        }

        console.log(`[${new Date().toISOString()}] POST /api/templates - Creating template: ${name}`);

        const result = await db.run(`
            INSERT INTO task_templates (
                name, company_id, work_item_id, description,
                repeat_type, repeat_day, repeat_month, duration_days
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            name,
            company_id || null,
            work_item_id,
            description || null,
            repeat_type,
            repeat_day || 1,
            repeat_month || null,
            duration_days || 1
        ]);

        res.json({
            success: true,
            id: result.lastID,
            message: 'Template created successfully'
        });
    } catch (error) {
        console.error('[templates] Error creating template:', error);
        res.status(500).json({ error: error.message });
    }
});

// 更新範本
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            company_id,
            work_item_id,
            description,
            repeat_type,
            repeat_day,
            repeat_month,
            duration_days
        } = req.body;

        console.log(`[${new Date().toISOString()}] PUT /api/templates/${id} - Updating template`);

        await db.run(`
            UPDATE task_templates SET
                name = ?,
                company_id = ?,
                work_item_id = ?,
                description = ?,
                repeat_type = ?,
                repeat_day = ?,
                repeat_month = ?,
                duration_days = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [
            name,
            company_id,
            work_item_id,
            description,
            repeat_type,
            repeat_day,
            repeat_month,
            duration_days,
            id
        ]);

        res.json({ success: true, message: 'Template updated successfully' });
    } catch (error) {
        console.error('[templates] Error updating template:', error);
        res.status(500).json({ error: error.message });
    }
});

// 刪除範本（軟刪除）
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        console.log(`[${new Date().toISOString()}] DELETE /api/templates/${id} - Soft deleting template`);

        await db.run(`
            UPDATE task_templates SET
                is_active = 0,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [id]);

        res.json({ success: true, message: 'Template deleted successfully' });
    } catch (error) {
        console.error('[templates] Error deleting template:', error);
        res.status(500).json({ error: error.message });
    }
});

// 手動從範本產生任務
router.post('/:id/generate', async (req, res) => {
    try {
        const { id } = req.params;
        const { year, month } = req.body;

        console.log(`[${new Date().toISOString()}] POST /api/templates/${id}/generate - Manually generating task`);

        const result = await templateService.generateFromTemplate(
            parseInt(id),
            year,
            month
        );

        res.json({
            success: true,
            task: result,
            message: '任務已從範本產生'
        });
    } catch (error) {
        console.error('[templates] Error generating from template:', error);
        res.status(500).json({ error: error.message });
    }
});

// 自動產生本月所有範本任務
router.post('/auto-generate', async (req, res) => {
    try {
        const { year, month } = req.body;

        const now = new Date();
        const targetYear = year || now.getFullYear();
        const targetMonth = month || (now.getMonth() + 1);

        console.log(`[${new Date().toISOString()}] POST /api/templates/auto-generate - Auto-generating tasks for ${targetYear}-${targetMonth}`);

        const results = await templateService.autoGenerateMonthlyTasks(
            targetYear,
            targetMonth
        );

        res.json({
            success: true,
            generated: results.length,
            tasks: results,
            message: `成功產生 ${results.length} 個任務`
        });
    } catch (error) {
        console.error('[templates] Error auto-generating tasks:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
