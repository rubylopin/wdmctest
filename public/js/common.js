// 共用函數庫

// localStorage 儲存工具
class Store {
    static get(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    static set(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    static getNextId(key) {
        const counterKey = `${key}_id_counter`;
        let id = parseInt(localStorage.getItem(counterKey) || '0') + 1;
        localStorage.setItem(counterKey, id.toString());
        return id;
    }
}

// API 類別 - 使用 localStorage
class API {
    // ========== 任務 API ==========
    static async getTasks(filters = {}) {
        let tasks = Store.get('tasks');
        // join company_name and work_item_name
        const companies = Store.get('companies');
        const workItems = Store.get('work_items');
        tasks = tasks.map(t => ({
            ...t,
            company_name: companies.find(c => c.id === parseInt(t.company_id))?.name || null,
            work_item_name: workItems.find(w => w.id === parseInt(t.work_item_id))?.name || ''
        }));
        return tasks;
    }

    static async getTasksByWeek(date) {
        const d = new Date(date);
        const day = d.getDay();
        const start = new Date(d);
        start.setDate(d.getDate() - day);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);

        const startStr = DateHelper.formatDate(start);
        const endStr = DateHelper.formatDate(end);

        const allTasks = await this.getTasks();
        return allTasks.filter(t => t.fill_date >= startStr && t.fill_date <= endStr);
    }

    static async getTasksByMonth(year, month) {
        const startStr = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endStr = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

        const allTasks = await this.getTasks();
        return allTasks.filter(t => t.fill_date >= startStr && t.fill_date <= endStr);
    }

    static async createTask(taskData) {
        const tasks = Store.get('tasks');
        const newTask = {
            ...taskData,
            id: Store.getNextId('tasks'),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        tasks.push(newTask);
        Store.set('tasks', tasks);
        return newTask;
    }

    static async updateTask(id, taskData) {
        const tasks = Store.get('tasks');
        const index = tasks.findIndex(t => t.id === parseInt(id));
        if (index === -1) throw new Error('Task not found');
        tasks[index] = { ...tasks[index], ...taskData, updated_at: new Date().toISOString() };
        Store.set('tasks', tasks);
        return tasks[index];
    }

    static async deleteTask(id) {
        let tasks = Store.get('tasks');
        tasks = tasks.filter(t => t.id !== parseInt(id));
        Store.set('tasks', tasks);
        return { message: 'Task deleted' };
    }

    static async updateTaskStatus(id, status) {
        return this.updateTask(id, { status });
    }

    // ========== 公司 API ==========
    static async getCompanies() {
        return Store.get('companies');
    }

    static async createCompany(companyData) {
        const companies = Store.get('companies');
        const newCompany = {
            ...companyData,
            id: Store.getNextId('companies'),
            created_at: new Date().toISOString()
        };
        companies.push(newCompany);
        Store.set('companies', companies);
        return newCompany;
    }

    static async updateCompany(id, companyData) {
        const companies = Store.get('companies');
        const index = companies.findIndex(c => c.id === parseInt(id));
        if (index === -1) throw new Error('Company not found');
        companies[index] = { ...companies[index], ...companyData };
        Store.set('companies', companies);
        return companies[index];
    }

    static async deleteCompany(id) {
        let companies = Store.get('companies');
        companies = companies.filter(c => c.id !== parseInt(id));
        Store.set('companies', companies);
        return { message: 'Company deleted' };
    }

    // ========== 工作項目 API ==========
    static async getWorkItems() {
        return Store.get('work_items');
    }

    static async createWorkItem(workItemData) {
        const items = Store.get('work_items');
        const newItem = {
            ...workItemData,
            id: Store.getNextId('work_items'),
            created_at: new Date().toISOString()
        };
        items.push(newItem);
        Store.set('work_items', items);
        return newItem;
    }

    static async updateWorkItem(id, workItemData) {
        const items = Store.get('work_items');
        const index = items.findIndex(w => w.id === parseInt(id));
        if (index === -1) throw new Error('Work item not found');
        items[index] = { ...items[index], ...workItemData };
        Store.set('work_items', items);
        return items[index];
    }

    static async deleteWorkItem(id) {
        let items = Store.get('work_items');
        items = items.filter(w => w.id !== parseInt(id));
        Store.set('work_items', items);
        return { message: 'Work item deleted' };
    }

    // ========== 範本 API ==========
    static async getTemplates() {
        let templates = Store.get('templates');
        const companies = Store.get('companies');
        const workItems = Store.get('work_items');
        templates = templates.map(t => ({
            ...t,
            company_name: companies.find(c => c.id === parseInt(t.company_id))?.name || null,
            work_item_name: workItems.find(w => w.id === parseInt(t.work_item_id))?.name || ''
        }));
        return templates;
    }

    static async createTemplate(templateData) {
        const templates = Store.get('templates');
        const newTemplate = {
            ...templateData,
            id: Store.getNextId('templates'),
            created_at: new Date().toISOString()
        };
        templates.push(newTemplate);
        Store.set('templates', templates);
        return newTemplate;
    }

    static async updateTemplate(id, templateData) {
        const templates = Store.get('templates');
        const index = templates.findIndex(t => t.id === parseInt(id));
        if (index === -1) throw new Error('Template not found');
        templates[index] = { ...templates[index], ...templateData };
        Store.set('templates', templates);
        return templates[index];
    }

    static async deleteTemplate(id) {
        let templates = Store.get('templates');
        templates = templates.filter(t => t.id !== parseInt(id));
        Store.set('templates', templates);
        return { message: 'Template deleted' };
    }

    static async generateFromTemplate(id, year, month) {
        const templates = Store.get('templates');
        const template = templates.find(t => t.id === parseInt(id));
        if (!template) throw new Error('Template not found');

        const now = new Date();
        const y = year || now.getFullYear();
        const m = month || now.getMonth() + 1;
        const day = template.repeat_day || 1;
        const fillDate = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        await this.createTask({
            fill_date: fillDate,
            company_id: template.company_id,
            work_item_id: template.work_item_id,
            description: template.description || '',
            status: 'pending'
        });

        return { message: '任務已從範本產生' };
    }

    static async autoGenerateTemplates(year, month) {
        const templates = Store.get('templates');
        const now = new Date();
        const y = year || now.getFullYear();
        const m = month || now.getMonth() + 1;
        let count = 0;

        for (const template of templates) {
            if (template.repeat_type === 'monthly' ||
                (template.repeat_type === 'quarterly' && [1, 4, 7, 10].includes(m)) ||
                (template.repeat_type === 'yearly' && m === 1)) {
                const day = template.repeat_day || 1;
                const fillDate = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                await this.createTask({
                    fill_date: fillDate,
                    company_id: template.company_id,
                    work_item_id: template.work_item_id,
                    description: template.description || '',
                    status: 'pending'
                });
                count++;
            }
        }

        return { message: `已自動產生 ${count} 筆任務` };
    }
}

// 日期工具類別
class DateHelper {
    static formatDate(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    static getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day;
        return new Date(d.setDate(diff));
    }

    static getWeekEnd(date) {
        const start = this.getWeekStart(date);
        return new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
    }

    static getWeekDays(date) {
        const start = this.getWeekStart(date);
        const days = [];

        for (let i = 0; i < 7; i++) {
            const day = new Date(start);
            day.setDate(start.getDate() + i);
            days.push({
                date: day,
                dateStr: this.formatDate(day),
                dayName: ['日', '一', '二', '三', '四', '五', '六'][day.getDay()],
                day: day.getDate(),
                month: day.getMonth() + 1,
                year: day.getFullYear()
            });
        }

        return days;
    }

    static getMonthDays(year, month) {
        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);
        const days = [];

        // 計算月份開始前需要填充的天數
        const startPadding = firstDay.getDay();
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - startPadding);

        // 計算月份結束後需要填充的天數
        const totalCells = Math.ceil((lastDay.getDate() + startPadding) / 7) * 7;

        for (let i = 0; i < totalCells; i++) {
            const day = new Date(startDate);
            day.setDate(startDate.getDate() + i);
            days.push({
                date: day,
                dateStr: this.formatDate(day),
                day: day.getDate(),
                month: day.getMonth() + 1,
                year: day.getFullYear(),
                isCurrentMonth: day.getMonth() === month - 1
            });
        }

        return days;
    }

    static isToday(date) {
        const today = new Date();
        const d = new Date(date);
        return d.toDateString() === today.toDateString();
    }

    static formatDisplayDate(date) {
        const d = new Date(date);
        return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    }

    static getWeekRange(date) {
        const start = this.getWeekStart(date);
        const end = this.getWeekEnd(date);
        return {
            start: this.formatDate(start),
            end: this.formatDate(end),
            display: `${start.getMonth() + 1}月${start.getDate()}日 - ${end.getMonth() + 1}月${end.getDate()}日`
        };
    }

    static addWeeks(date, weeks) {
        const d = new Date(date);
        d.setDate(d.getDate() + weeks * 7);
        return d;
    }

    static addMonths(date, months) {
        const d = new Date(date);
        d.setMonth(d.getMonth() + months);
        return d;
    }
}

// Toast 提示工具
class Toast {
    static show(message, type = 'success') {
        // 使用 Bootstrap Toast
        const toastElement = document.getElementById('toast');
        if (!toastElement) {
            console.error('Toast element not found');
            return;
        }

        const toastBody = toastElement.querySelector('.toast-body');
        toastBody.textContent = message;

        const bgClass = type === 'error' ? 'text-bg-danger' : 'text-bg-success';
        toastElement.className = `toast align-items-center border-0 ${bgClass}`;

        const toast = new bootstrap.Toast(toastElement);
        toast.show();
    }

    static success(message) {
        this.show(message, 'success');
    }

    static error(message) {
        this.show(message, 'error');
    }
}

// HTML 工具
class HTMLHelper {
    static escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    static getStatusIcon(status) {
        const icons = {
            'pending': '⏳',
            'in_progress': '🔄',
            'completed': '✅'
        };
        return icons[status] || '📌';
    }

    static getStatusText(status) {
        const texts = {
            'pending': '待處理',
            'in_progress': '進行中',
            'completed': '已完成'
        };
        return texts[status] || status;
    }

    static getRepeatTypeText(repeatType) {
        const texts = {
            'monthly': '每月',
            'quarterly': '每季',
            'yearly': '每年'
        };
        return texts[repeatType] || repeatType;
    }
}
