// 共用函數庫

// API 基礎 URL
const API_BASE_URL = '/api';

// API 呼叫工具類別
class API {
    // 任務 API
    static async getTasks(filters = {}) {
        const params = new URLSearchParams(filters);
        const response = await fetch(`${API_BASE_URL}/tasks?${params}`);
        if (!response.ok) throw new Error('Failed to fetch tasks');
        return await response.json();
    }

    static async getTasksByWeek(date) {
        const response = await fetch(`${API_BASE_URL}/tasks/week/${date}`);
        if (!response.ok) throw new Error('Failed to fetch week tasks');
        return await response.json();
    }

    static async getTasksByMonth(year, month) {
        const response = await fetch(`${API_BASE_URL}/tasks/month/${year}/${month}`);
        if (!response.ok) throw new Error('Failed to fetch month tasks');
        return await response.json();
    }

    static async createTask(taskData) {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
        if (!response.ok) throw new Error('Failed to create task');
        return await response.json();
    }

    static async updateTask(id, taskData) {
        const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
        if (!response.ok) throw new Error('Failed to update task');
        return await response.json();
    }

    static async deleteTask(id) {
        const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete task');
        return await response.json();
    }

    static async updateTaskStatus(id, status) {
        const response = await fetch(`${API_BASE_URL}/tasks/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (!response.ok) throw new Error('Failed to update status');
        return await response.json();
    }

    // 公司 API
    static async getCompanies() {
        const response = await fetch(`${API_BASE_URL}/companies`);
        if (!response.ok) throw new Error('Failed to fetch companies');
        return await response.json();
    }

    static async createCompany(companyData) {
        const response = await fetch(`${API_BASE_URL}/companies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(companyData)
        });
        if (!response.ok) throw new Error('Failed to create company');
        return await response.json();
    }

    static async updateCompany(id, companyData) {
        const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(companyData)
        });
        if (!response.ok) throw new Error('Failed to update company');
        return await response.json();
    }

    static async deleteCompany(id) {
        const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete company');
        return await response.json();
    }

    // 工作項目 API
    static async getWorkItems() {
        const response = await fetch(`${API_BASE_URL}/work-items`);
        if (!response.ok) throw new Error('Failed to fetch work items');
        return await response.json();
    }

    static async createWorkItem(workItemData) {
        const response = await fetch(`${API_BASE_URL}/work-items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(workItemData)
        });
        if (!response.ok) throw new Error('Failed to create work item');
        return await response.json();
    }

    static async updateWorkItem(id, workItemData) {
        const response = await fetch(`${API_BASE_URL}/work-items/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(workItemData)
        });
        if (!response.ok) throw new Error('Failed to update work item');
        return await response.json();
    }

    static async deleteWorkItem(id) {
        const response = await fetch(`${API_BASE_URL}/work-items/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete work item');
        return await response.json();
    }

    // 範本 API
    static async getTemplates() {
        const response = await fetch(`${API_BASE_URL}/templates`);
        if (!response.ok) throw new Error('Failed to fetch templates');
        return await response.json();
    }

    static async createTemplate(templateData) {
        const response = await fetch(`${API_BASE_URL}/templates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(templateData)
        });
        if (!response.ok) throw new Error('Failed to create template');
        return await response.json();
    }

    static async updateTemplate(id, templateData) {
        const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(templateData)
        });
        if (!response.ok) throw new Error('Failed to update template');
        return await response.json();
    }

    static async deleteTemplate(id) {
        const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete template');
        return await response.json();
    }

    static async generateFromTemplate(id, year, month) {
        const response = await fetch(`${API_BASE_URL}/templates/${id}/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ year, month })
        });
        if (!response.ok) throw new Error('Failed to generate from template');
        return await response.json();
    }

    static async autoGenerateTemplates(year, month) {
        const response = await fetch(`${API_BASE_URL}/templates/auto-generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ year, month })
        });
        if (!response.ok) throw new Error('Failed to auto-generate templates');
        return await response.json();
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
