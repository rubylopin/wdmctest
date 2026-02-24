// 月視圖類別

class MonthView {
    constructor() {
        this.tasks = [];
    }

    async render(year, month) {
        try {
            // 取得該月的任務
            this.tasks = await API.getTasksByMonth(year, month);

            // 取得月份的所有天數（包含前後填充）
            const monthDays = DateHelper.getMonthDays(year, month);

            // 依日期分組任務
            const tasksByDate = this.groupTasksByDate(this.tasks);

            // 渲染 HTML
            const html = this.renderMonthView(monthDays, tasksByDate, month);
            document.getElementById('taskViewArea').innerHTML = html;

            // 附加事件監聽
            this.attachEventListeners();
        } catch (error) {
            console.error('Error rendering month view:', error);
            Toast.error('載入月視圖失敗：' + error.message);
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

    renderMonthView(monthDays, tasksByDate, currentMonth) {
        let html = '<div class="month-view-container">';
        html += '<div class="calendar-grid">';

        // 週標題
        html += '<div class="week-header">';
        ['日', '一', '二', '三', '四', '五', '六'].forEach(day => {
            html += `<div class="week-day-name">${day}</div>`;
        });
        html += '</div>';

        // 將日期分組為週
        const weeks = [];
        for (let i = 0; i < monthDays.length; i += 7) {
            weeks.push(monthDays.slice(i, i + 7));
        }

        // 渲染每週
        weeks.forEach(week => {
            html += '<div class="calendar-week">';
            week.forEach(day => {
                const dayTasks = tasksByDate[day.dateStr] || [];
                html += this.renderDayCell(day, dayTasks, currentMonth);
            });
            html += '</div>';
        });

        html += '</div></div>';
        return html;
    }

    renderDayCell(day, tasks, currentMonth) {
        const isCurrentMonth = day.month === currentMonth;
        const isToday = DateHelper.isToday(day.date);

        const completedCount = tasks.filter(t => t.status === 'completed').length;
        const totalCount = tasks.length;

        let html = `
            <div class="calendar-day ${isCurrentMonth ? '' : 'other-month'} ${isToday ? 'today' : ''}"
                 data-date="${day.dateStr}">
                <div class="day-number">${day.day}</div>
        `;

        if (totalCount > 0) {
            const progress = totalCount > 0 ? (completedCount / totalCount * 100) : 0;

            html += `
                <div class="day-task-summary">
                    <div class="task-count">${totalCount} 項任務</div>
                    <div class="task-progress">
                        <div class="progress-bar" style="width: ${progress}%"></div>
                    </div>
                    <div class="task-list-mini">
            `;

            // 顯示前 3 個任務
            tasks.slice(0, 3).forEach(task => {
                html += `
                    <div class="mini-task status-${task.status}" title="${HTMLHelper.escapeHtml(task.work_item_name)}">
                        ${HTMLHelper.getStatusIcon(task.status)} ${HTMLHelper.escapeHtml(task.work_item_name)}
                    </div>
                `;
            });

            // 如果還有更多任務
            if (tasks.length > 3) {
                html += `<div class="mini-task-more">+${tasks.length - 3} 更多...</div>`;
            }

            html += `
                    </div>
                </div>
            `;
        }

        html += '</div>';
        return html;
    }

    attachEventListeners() {
        // 點擊日期格子可以新增任務或查看詳情
        document.querySelectorAll('.calendar-day').forEach(cell => {
            cell.addEventListener('click', () => {
                const date = cell.dataset.date;
                // 如果該日有任務，可以顯示該日所有任務
                // 這裡簡化為直接開啟新增任務 Modal
                taskModal.openModal(null, date);
            });
        });
    }
}
