// 任務 Modal 類別

class TaskModal {
    constructor() {
        this.modal = new bootstrap.Modal(document.getElementById('taskModal'));
        this.currentTaskId = null;
        this.companies = [];
        this.workItems = [];

        this.setupEventListeners();
    }

    setupEventListeners() {
        // 儲存按鈕
        document.getElementById('saveTaskBtn').addEventListener('click', () => this.saveTask());

        // 刪除按鈕
        document.getElementById('deleteTaskBtn').addEventListener('click', () => this.deleteTask());

        // Enter 鍵儲存
        document.getElementById('taskForm').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                this.saveTask();
            }
        });
    }

    async loadMasterData() {
        try {
            // 載入公司列表
            this.companies = await API.getCompanies();
            this.updateCompanySelect();

            // 載入工作項目列表
            this.workItems = await API.getWorkItems();
            this.updateWorkItemSelect();
        } catch (error) {
            console.error('Error loading master data:', error);
            Toast.error('載入主檔資料失敗');
        }
    }

    updateCompanySelect() {
        const select = document.getElementById('company_id');
        select.innerHTML = '<option value="">（無）</option>';

        this.companies.forEach(company => {
            const option = document.createElement('option');
            option.value = company.id;
            option.textContent = company.name;
            select.appendChild(option);
        });
    }

    updateWorkItemSelect() {
        const select = document.getElementById('work_item_id');
        select.innerHTML = '<option value="">請選擇...</option>';

        this.workItems.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.name;
            if (item.category) {
                option.textContent += ` (${item.category})`;
            }
            select.appendChild(option);
        });
    }

    async openModal(taskId = null, defaultDate = null) {
        this.currentTaskId = taskId;

        // 重新載入主檔資料（確保是最新的）
        await this.loadMasterData();

        if (taskId) {
            // 編輯模式
            document.getElementById('taskModalLabel').textContent = '編輯任務';
            document.getElementById('deleteTaskBtn').style.display = 'block';
            await this.loadTaskData(taskId);
        } else {
            // 新增模式
            document.getElementById('taskModalLabel').textContent = '新增任務';
            document.getElementById('deleteTaskBtn').style.display = 'none';
            this.resetForm();

            // 設定預設日期
            if (defaultDate) {
                document.getElementById('fill_date').value = defaultDate;
            } else {
                document.getElementById('fill_date').value = DateHelper.formatDate(new Date());
            }
        }

        this.modal.show();
    }

    async loadTaskData(taskId) {
        try {
            const tasks = await API.getTasks();
            const task = tasks.find(t => t.id === parseInt(taskId));

            if (!task) {
                throw new Error('找不到任務');
            }

            // 填入表單
            document.getElementById('taskId').value = task.id;
            document.getElementById('fill_date').value = task.fill_date;
            document.getElementById('expected_complete_date').value = task.expected_complete_date || '';
            document.getElementById('company_id').value = task.company_id || '';
            document.getElementById('work_item_id').value = task.work_item_id;
            document.getElementById('description').value = task.description || '';
            document.getElementById('status').value = task.status;
        } catch (error) {
            console.error('Error loading task data:', error);
            Toast.error('載入任務資料失敗');
        }
    }

    resetForm() {
        document.getElementById('taskForm').reset();
        document.getElementById('taskId').value = '';
        document.getElementById('status').value = 'pending';
    }

    async saveTask() {
        try {
            const formData = {
                fill_date: document.getElementById('fill_date').value,
                expected_complete_date: document.getElementById('expected_complete_date').value || null,
                company_id: document.getElementById('company_id').value || null,
                work_item_id: document.getElementById('work_item_id').value,
                description: document.getElementById('description').value || null,
                status: document.getElementById('status').value
            };

            // 驗證
            if (!formData.fill_date || !formData.work_item_id) {
                Toast.error('請填寫必填欄位（填寫日期、工作項目）');
                return;
            }

            if (this.currentTaskId) {
                // 更新
                await API.updateTask(this.currentTaskId, formData);
                Toast.success('任務已更新');
            } else {
                // 新增
                await API.createTask(formData);
                Toast.success('任務已新增');
            }

            this.modal.hide();

            // 重新載入視圖
            if (typeof reloadCurrentView === 'function') {
                await reloadCurrentView();
            }
        } catch (error) {
            console.error('Error saving task:', error);
            Toast.error('儲存任務失敗：' + error.message);
        }
    }

    async deleteTask() {
        if (!this.currentTaskId) return;

        if (!confirm('確定要刪除這個任務嗎？')) {
            return;
        }

        try {
            await API.deleteTask(this.currentTaskId);
            Toast.success('任務已刪除');

            this.modal.hide();

            // 重新載入視圖
            if (typeof reloadCurrentView === 'function') {
                await reloadCurrentView();
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            Toast.error('刪除任務失敗：' + error.message);
        }
    }
}
