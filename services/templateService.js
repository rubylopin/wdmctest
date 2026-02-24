const db = require('../database/db');

class TemplateService {
    // 自動產生指定月份的範本任務
    async autoGenerateMonthlyTasks(year, month) {
        console.log(`[${new Date().toISOString()}] [TemplateService] Auto-generating tasks for ${year}-${month}`);

        // 取得所有啟用的範本
        const templates = await db.all(`
            SELECT t.*, c.name as company_name, w.name as work_item_name
            FROM task_templates t
            LEFT JOIN companies c ON t.company_id = c.id
            JOIN work_items w ON t.work_item_id = w.id
            WHERE t.is_active = 1
        `);

        const generatedTasks = [];
        const generationDate = `${year}-${String(month).padStart(2, '0')}-01`;

        for (const template of templates) {
            // 檢查是否已經產生過
            const existing = await db.get(`
                SELECT id FROM template_generation_log
                WHERE template_id = ? AND generation_date = ?
            `, [template.id, generationDate]);

            if (existing) {
                console.log(`[TemplateService] Template ${template.id} already generated for ${generationDate}`);
                continue; // 已產生過，跳過
            }

            // 判斷是否需要在這個月產生
            if (!this.shouldGenerateThisMonth(template, year, month)) {
                continue;
            }

            // 計算任務日期
            const taskDate = this.calculateTaskDate(template, year, month);
            const expectedCompleteDate = this.calculateExpectedCompleteDate(
                taskDate,
                template.duration_days
            );

            // 新增任務
            const result = await db.run(`
                INSERT INTO tasks (
                    fill_date, expected_complete_date, company_id,
                    work_item_id, description, status,
                    is_from_template, template_id
                ) VALUES (?, ?, ?, ?, ?, 'pending', 1, ?)
            `, [
                taskDate,
                expectedCompleteDate,
                template.company_id,
                template.work_item_id,
                template.description || `自動產生：${template.name}`,
                template.id
            ]);

            // 記錄產生歷史
            await db.run(`
                INSERT INTO template_generation_log (
                    template_id, generation_date, task_id
                ) VALUES (?, ?, ?)
            `, [template.id, generationDate, result.lastID]);

            generatedTasks.push({
                taskId: result.lastID,
                templateName: template.name,
                taskDate: taskDate
            });

            console.log(`[TemplateService] Generated task ${result.lastID} from template ${template.id}`);
        }

        return generatedTasks;
    }

    // 手動從範本產生任務
    async generateFromTemplate(templateId, targetYear, targetMonth) {
        console.log(`[${new Date().toISOString()}] [TemplateService] Manually generating task from template ${templateId}`);

        const template = await db.get(`
            SELECT t.*, c.name as company_name, w.name as work_item_name
            FROM task_templates t
            LEFT JOIN companies c ON t.company_id = c.id
            JOIN work_items w ON t.work_item_id = w.id
            WHERE t.id = ?
        `, [templateId]);

        if (!template) {
            throw new Error('Template not found');
        }

        const year = targetYear || new Date().getFullYear();
        const month = targetMonth || (new Date().getMonth() + 1);

        const taskDate = this.calculateTaskDate(template, year, month);
        const expectedCompleteDate = this.calculateExpectedCompleteDate(
            taskDate,
            template.duration_days
        );

        // 新增任務
        const result = await db.run(`
            INSERT INTO tasks (
                fill_date, expected_complete_date, company_id,
                work_item_id, description, status,
                is_from_template, template_id
            ) VALUES (?, ?, ?, ?, ?, 'pending', 1, ?)
        `, [
            taskDate,
            expectedCompleteDate,
            template.company_id,
            template.work_item_id,
            template.description || `手動產生：${template.name}`,
            template.id
        ]);

        console.log(`[TemplateService] Manually generated task ${result.lastID}`);

        return {
            taskId: result.lastID,
            templateName: template.name,
            taskDate: taskDate
        };
    }

    // 判斷是否需要在這個月產生
    shouldGenerateThisMonth(template, year, month) {
        if (template.repeat_type === 'monthly') {
            return true;
        }
        if (template.repeat_type === 'quarterly') {
            return [1, 4, 7, 10].includes(month); // 每季第一個月
        }
        if (template.repeat_type === 'yearly') {
            return month === template.repeat_month;
        }
        return false;
    }

    // 計算任務日期
    calculateTaskDate(template, year, month) {
        const day = template.repeat_day || 1;
        const lastDay = new Date(year, month, 0).getDate();
        const actualDay = Math.min(day, lastDay); // 避免超過當月天數

        return `${year}-${String(month).padStart(2, '0')}-${String(actualDay).padStart(2, '0')}`;
    }

    // 計算預計完成日期
    calculateExpectedCompleteDate(taskDate, durationDays) {
        const date = new Date(taskDate);
        date.setDate(date.getDate() + (durationDays || 1));
        return date.toISOString().split('T')[0];
    }
}

module.exports = new TemplateService();
