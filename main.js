// ===== BIẾN TOÀN CỤC =====
var danhSachTask = [];
var priorityDangChon = "Low"; // Mặc định khớp với HTML
var idMoi = 6; // id tự tăng
var viTriSua = -1; // -1 là đang thêm mới, >= 0 là đang sửa task ở vị trí đó

// ===== LẤY DỮ LIỆU TỪ data.json (Hoặc LocalStorage) =====
function loadData() {
    var dataLocal = localStorage.getItem("danhSachTask");
    if (dataLocal != null) {
        danhSachTask = JSON.parse(dataLocal);
        renderTasks();
    } else {
        fetch("data.json")
            .then(function(res) { return res.json(); })
            .then(function(json) {
                danhSachTask = json;
                saveData();
                renderTasks();
            })
            .catch(function(err) {
                console.log("Lỗi đọc data.json:", err);
            });
    }
}

// ===== LƯU XUỐNG LOCALSTORAGE =====
function saveData() {
    localStorage.setItem("danhSachTask", JSON.stringify(danhSachTask));
}

// ===== RENDER DANH SÁCH TASK =====
function renderTasks() {
    var container = document.getElementById("taskList");
    container.innerHTML = "";

    if (danhSachTask.length === 0) {
        container.innerHTML = '<p class="text-muted text-center py-4">No tasks yet. Add a new one!</p>';
        return;
    }

    for (var i = 0; i < danhSachTask.length; i++) {
        var t = danhSachTask[i];

        // 1. Set màu cho Priority
        var priorityClass = "";
        if (t.priority === "High") priorityClass = "priority-high";
        else if (t.priority === "Medium") priorityClass = "priority-medium";
        else priorityClass = "priority-low";

        // 2. Set màu và class cho Status
        var statusCircle = "";
        if (t.status === "To Do") statusCircle = "circle-todo";
        else if (t.status === "In Progress") statusCircle = "circle-progress";
        else if (t.status === "Done") statusCircle = "circle-done";

        // 3. Tạo khối HTML cho từng Task
        var html = `
        <div class="task-item d-flex align-items-center justify-content-between p-3 bg-white shadow-sm rounded-4 mb-3">
            <div class="d-flex align-items-center gap-5 flex-grow-1">
                <div style="min-width: 120px;">
                    <span class="text-muted small d-block">Task</span>
                    <span class="fw-semibold text-dark">${t.task}</span>
                </div>
                <div style="min-width: 100px;">
                    <span class="text-muted small d-block">Priority</span>
                    <span class="fw-bold ${priorityClass}">${t.priority}</span>
                </div>
            </div>
            <div class="d-flex align-items-center gap-4">
                <span class="badge bg-light text-secondary border px-3 py-2 rounded-pill" 
                      style="cursor: pointer;" 
                      onclick="doiTrangThai(${i})" 
                      title="Click to change status">${t.status}</span>
                <div class="status-circle ${statusCircle}"></div>
                
                <div class="action-buttons d-flex gap-2">
                    <button class="btn btn-link p-1 text-secondary" title="Edit" onclick="suaTask(${i})">
                        <i class="bi bi-pencil-square fs-5"></i>
                    </button>
                    <button class="btn btn-link p-1 text-danger-custom" title="Delete" onclick="xoaTask(${i})">
                        <i class="bi bi-trash fs-5"></i>
                    </button>
                </div>
            </div>
        </div>
        `;
        container.innerHTML += html;
    }
}

// ===== MỞ / ĐÓNG FORM =====
document.getElementById("btnMoForm").onclick = function() {
    document.getElementById("formCard").style.display = "block";
    document.getElementById("formTask").reset(); // Xóa trắng form
    document.getElementById("errorTask").style.display = "none";
    document.querySelector("#formCard h5").innerText = "Add Task"; // Đổi tiêu đề form
    document.querySelector("#formTask button[type='submit']").innerText = "Add";
    viTriSua = -1; // Reset về chế độ Thêm mới
    chonPriority("Low"); // Trả về mặc định
};

document.getElementById("btnDongForm").onclick = function() {
    document.getElementById("formCard").style.display = "none";
};

// ===== CHỌN PRIORITY =====
function chonPriority(p) {
    priorityDangChon = p;
    // Xóa active tất cả nút
    document.getElementById("btnHigh").classList.remove("active");
    document.getElementById("btnMedium").classList.remove("active");
    document.getElementById("btnLow").classList.remove("active");
    // Thêm active cho nút được bấm
    document.getElementById("btn" + p).classList.add("active");
}

// ===== SUBMIT FORM (Xử lý cả THÊM và SỬA) =====
document.getElementById("formTask").onsubmit = function(e) {
    e.preventDefault();

    var tenTask = document.getElementById("inputTask").value.trim();
    var errorDiv = document.getElementById("errorTask");

    // Validation
    if (tenTask === "") {
        errorDiv.innerText = "Tên task không được để trống!";
        errorDiv.style.display = "block";
        return;
    }
    if (tenTask.length > 100) {
        errorDiv.innerText = "Tên task không được vượt quá 100 ký tự!";
        errorDiv.style.display = "block";
        return;
    }

    errorDiv.style.display = "none"; // Ẩn lỗi nếu hợp lệ

    if (viTriSua === -1) {
        // CHẾ ĐỘ THÊM MỚI
        var taskMoi = {
            id: idMoi++,
            task: tenTask,
            priority: priorityDangChon,
            status: "To Do" // Mặc định khi thêm mới luôn là To Do
        };
        danhSachTask.push(taskMoi);
    } else {
        // CHẾ ĐỘ SỬA
        danhSachTask[viTriSua].task = tenTask;
        danhSachTask[viTriSua].priority = priorityDangChon;
        // Không đổi status ở đây để giữ nguyên tiến độ của task
    }

    saveData();
    renderTasks();

    // Đóng form
    document.getElementById("formCard").style.display = "none";
};

// ===== ĐỔI TRẠNG THÁI (Click thẳng vào Badge) =====
function doiTrangThai(index) {
    var statusHienTai = danhSachTask[index].status;
    
    // Logic xoay vòng: To Do -> In Progress -> Done -> To Do
    if (statusHienTai === "To Do") {
        danhSachTask[index].status = "In Progress";
    } else if (statusHienTai === "In Progress") {
        danhSachTask[index].status = "Done";
    } else {
        danhSachTask[index].status = "To Do";
    }
    
    saveData();
    renderTasks();
}

// ===== SỬA TASK (Mở form lên và đổ dữ liệu vào) =====
function suaTask(index) {
    viTriSua = index; // Lưu lại vị trí đang sửa
    var taskCanSua = danhSachTask[index];

    // Mở form và đổi tiêu đề
    document.getElementById("formCard").style.display = "block";
    document.querySelector("#formCard h5").innerText = "Edit Task";
    document.querySelector("#formTask button[type='submit']").innerText = "Save Changes";
    document.getElementById("errorTask").style.display = "none";

    // Đổ dữ liệu cũ vào form
    document.getElementById("inputTask").value = taskCanSua.task;
    chonPriority(taskCanSua.priority);
}

// ===== XÓA TASK =====
function xoaTask(index) {
    var xacNhan = confirm("Bạn có chắc muốn xóa task \"" + danhSachTask[index].task + "\" không?");
    if (xacNhan) {
        danhSachTask.splice(index, 1);
        saveData();
        renderTasks();
    }
}


loadData();