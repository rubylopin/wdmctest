// 週視圖類別

class WeekView {
    constructor() {
        this.tasks = [];
    }

    async render(date) {
        try {
            // 取得該週的任務
            const dateStr = DateHelper.formatDate(date);
            this.tasks = await API.getTasksByWeek(dateStr);

            // 取得週的每一天
            const weekDays = DateHelper.getWeekDays(date);

            // 依日期分組任務
            const tasksByDate = this.groupTasksByDate(this.tasks);

            // 渲染 HTML
            const html = this.renderWeekView(weekDays, tasksByDate);
            document.getElementById('taskViewArea').innerHTML = html;

            // 附加事件監聽
            this.attachEventListeners();
        } catch (error) {
            console.error('Error rendering week view:', error);
            Toast.error('載入週視圖失敗：' + error.message);
        }
    }

    groupTasksByDate(tasks) {
        const grouped = {};
        tasks.forEach(task => {
            if (!grouped[task.fill_date]) {
                grouped[task.fill_date] = [];
            }
            grouped[task.fill_date].push(task);
        });
        return grouped;
    }

    renderWeekView(weekDays, tasksByDate) {
        let html = '<div class="week-view-container">';

        weekDays.forEach(day => {
            const dayTasks = tasksByDate[day.dateStr] || [];
            html += this.renderDayCard(day, dayTasks);
        });

        html += '</div>';
        return html;
    }

    renderDayCard(day, tasks) {
        const isToday = DateHelper.isToday(day.date);

        let html = `
            <div class="day-card ${isToday ? 'today' : ''}">
                <div class="day-header">
                    <div class="day-name">${day.dayName}</div>
                    <div class="day-date">${day.month}/${day.day}</div>
                </div>
                <div class="day-tasks">
        `;

        if (tasks.length === 0) {
            html += '<div class="text-center text-muted p-3">無任務</div>';
        } else {
            tasks.forEach(task => {
                html += this.renderTaskItem(task);
            });
        }

        html += `
                </div>
                <button class="btn-add-task" data-date="${day.dateStr}">
                    ➕ 新增任務
                </button>
            </div>
        `;

        return html;
    }

    renderTaskItem(task) {
        const icon = HTMLHelper.getStatusIcon(task.status);

        return `
            <div class="task-item status-${task.status}" data-task-id="${task.id}">
                <div class="task-icon">${icon}</div>
                <div class="task-content">
                    <div class="task-title">${HTMLHelper.escapeHtml(task.work_item_name)}</div>
                    ${task.company_name ? `<div class="task-company">${HTMLHelper.escapeHtml(task.company_name)}</div>` : ''}
                    ${task.description ? `<div class="task-desc">${HTMLHelper.escapeHtml(task.description)}</div>` : ''}
                    ${task.expected_complete_date ? `<div class="task-desc text-muted">預計完成：${task.expected_complete_date}</div>` : ''}
                </div>
                <div class="task-actions">
                    <button class="btn-edit" data-task-id="${task.id}" title="編輯">
                        ✏️
                    </button>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // 點擊任務項目編輯
        document.querySelectorAll('.task-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.btn-edit')) {
                    const taskId = item.dataset.taskId;
                    taskModal.openModal(taskId);
                }
            });
        });

        // 點擊編輯按鈕
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const taskId = btn.dataset.taskId;
                taskModal.openModal(taskId);
            });
        });

        // 點擊新增任務按鈕
        document.querySelectorAll('.btn-add-task').forEach(btn => {
            btn.addEventListener('click', () => {
                const date = btn.dataset.date;
                taskModal.openModal(null, date);
            });
        });
    }
}
