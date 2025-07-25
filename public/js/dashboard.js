// Global variables
let currentUser = null;
let currentSection = 'overview';
let studentsData = [];
let attendanceData = [];
let subjectsData = [];

// Role-based navigation configuration
const navigationConfig = {
    student: [
        { id: 'overview', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
        { id: 'attendance', label: 'My Attendance', icon: 'fas fa-calendar-check' },
        { id: 'students', label: 'My Profile', icon: 'fas fa-user' }
    ],
    teacher: [
        { id: 'overview', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
        { id: 'attendance', label: 'Attendance', icon: 'fas fa-calendar-check' },
        { id: 'students', label: 'Students', icon: 'fas fa-users' }
    ],
    hod: [
        { id: 'overview', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
        { id: 'attendance', label: 'Attendance', icon: 'fas fa-calendar-check' },
        { id: 'students', label: 'Students', icon: 'fas fa-users' },
        { id: 'detained', label: 'Detained Students', icon: 'fas fa-exclamation-triangle' }
    ],
    principal: [
        { id: 'overview', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
        { id: 'attendance', label: 'Attendance', icon: 'fas fa-calendar-check' },
        { id: 'students', label: 'Students', icon: 'fas fa-users' },
        { id: 'detained', label: 'Detained Students', icon: 'fas fa-exclamation-triangle' },
        { id: 'users', label: 'User Management', icon: 'fas fa-user-cog' }
    ]
};

// Role icons
const roleIcons = {
    student: 'fas fa-user-graduate',
    teacher: 'fas fa-chalkboard-teacher',
    hod: 'fas fa-user-tie',
    principal: 'fas fa-crown'
};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadCurrentUser();
        setupNavigation();
        setupEventListeners();
        await loadInitialData();
        showSection('overview');
    } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        window.location.href = '/';
    }
});

// Load current user information
async function loadCurrentUser() {
    try {
        const response = await fetch('/api/user');
        if (!response.ok) throw new Error('Not authenticated');
        
        currentUser = await response.json();
        updateUserInterface();
    } catch (error) {
        throw error;
    }
}

// Update user interface with current user info
function updateUserInterface() {
    if (!currentUser) return;
    
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userRole').textContent = currentUser.role.toUpperCase();
    document.getElementById('userRoleIcon').className = roleIcons[currentUser.role];
}

// Setup navigation based on user role
function setupNavigation() {
    const navMenu = document.getElementById('navMenu');
    const navigation = navigationConfig[currentUser.role] || [];
    
    navMenu.innerHTML = navigation.map(item => `
        <li class="${item.id === currentSection ? 'active' : ''}" data-section="${item.id}">
            <a href="#" onclick="showSection('${item.id}')">
                <i class="${item.icon}"></i>
                ${item.label}
            </a>
        </li>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Attendance form
    const attendanceForm = document.getElementById('attendanceForm');
    if (attendanceForm) {
        attendanceForm.addEventListener('submit', handleMarkAttendance);
    }
    
    // Student form
    const studentForm = document.getElementById('studentForm');
    if (studentForm) {
        studentForm.addEventListener('submit', handleAddStudent);
    }
    
    // Search and filter functionality
    setupSearchAndFilters();
    
    // Set default date to today
    const dateInput = document.getElementById('attendanceDate');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
}

// Setup search and filter functionality
function setupSearchAndFilters() {
    // Attendance search and filter
    const attendanceSearch = document.getElementById('attendanceSearch');
    const statusFilter = document.getElementById('statusFilter');
    
    if (attendanceSearch) {
        attendanceSearch.addEventListener('input', filterAttendanceTable);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterAttendanceTable);
    }
    
    // Student search and filter
    const studentSearch = document.getElementById('studentSearch');
    const departmentFilter = document.getElementById('departmentFilter');
    
    if (studentSearch) {
        studentSearch.addEventListener('input', filterStudentsTable);
    }
    
    if (departmentFilter) {
        departmentFilter.addEventListener('change', filterStudentsTable);
    }
}

// Load initial data
async function loadInitialData() {
    await Promise.all([
        loadStudents(),
        loadAttendance(),
        loadSubjects()
    ]);
}

// Load students data
async function loadStudents() {
    try {
        const response = await fetch('/api/students');
        if (response.ok) {
            studentsData = await response.json();
        }
    } catch (error) {
        console.error('Failed to load students:', error);
    }
}

// Load attendance data
async function loadAttendance() {
    try {
        const response = await fetch('/api/attendance');
        if (response.ok) {
            attendanceData = await response.json();
        }
    } catch (error) {
        console.error('Failed to load attendance:', error);
    }
}

// Load subjects data
async function loadSubjects() {
    try {
        const response = await fetch('/api/subjects');
        if (response.ok) {
            subjectsData = await response.json();
            populateSubjectSelect();
        }
    } catch (error) {
        console.error('Failed to load subjects:', error);
    }
}

// Populate subject select dropdown
function populateSubjectSelect() {
    const subjectSelect = document.getElementById('subjectSelect');
    if (subjectSelect && subjectsData) {
        subjectSelect.innerHTML = '<option value="">Select Subject</option>' +
            subjectsData.map(subject => 
                `<option value="${subject.name}">${subject.name} (${subject.code})</option>`
            ).join('');
    }
}

// Show specific section
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(`${sectionId}Section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update navigation
    document.querySelectorAll('.dashboard-nav li').forEach(li => {
        li.classList.remove('active');
    });
    
    const activeNavItem = document.querySelector(`[data-section="${sectionId}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
    
    currentSection = sectionId;
    
    // Load section-specific data
    switch (sectionId) {
        case 'overview':
            renderOverview();
            break;
        case 'attendance':
            renderAttendanceSection();
            break;
        case 'students':
            renderStudentsSection();
            break;
        case 'detained':
            renderDetainedSection();
            break;
        case 'users':
            renderUsersSection();
            break;
    }
}

// Render overview section
async function renderOverview() {
    try {
        // Load statistics
        const response = await fetch('/api/statistics');
        const stats = response.ok ? await response.json() : [];
        
        // Calculate role-specific stats
        const roleStats = calculateRoleStats();
        
        // Render stats grid
        renderStatsGrid(roleStats);
        
    } catch (error) {
        console.error('Failed to render overview:', error);
    }
}

// Calculate role-specific statistics
function calculateRoleStats() {
    const stats = [];
    
    if (currentUser.role === 'student') {
        const myAttendance = attendanceData.filter(record => 
            record.student_name === currentUser.name
        );
        const totalClasses = myAttendance.length;
        const presentClasses = myAttendance.filter(record => record.status === 'present').length;
        const attendancePercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;
        
        stats.push(
            { title: 'My Attendance', value: `${attendancePercentage}%`, icon: 'fas fa-percentage', color: attendancePercentage >= 75 ? 'success' : 'danger' },
            { title: 'Total Classes', value: totalClasses, icon: 'fas fa-calendar-alt', color: 'primary' },
            { title: 'Present', value: presentClasses, icon: 'fas fa-check-circle', color: 'success' },
            { title: 'Absent', value: totalClasses - presentClasses, icon: 'fas fa-times-circle', color: 'danger' }
        );
    } else {
        const totalStudents = studentsData.length;
        const totalAttendanceRecords = attendanceData.length;
        const avgAttendance = calculateAverageAttendance();
        const detainedCount = calculateDetainedCount();
        
        stats.push(
            { title: 'Total Students', value: totalStudents, icon: 'fas fa-users', color: 'primary' },
            { title: 'Attendance Records', value: totalAttendanceRecords, icon: 'fas fa-calendar-check', color: 'info' },
            { title: 'Average Attendance', value: `${avgAttendance}%`, icon: 'fas fa-chart-line', color: avgAttendance >= 75 ? 'success' : 'warning' },
            { title: 'Detained Students', value: detainedCount, icon: 'fas fa-exclamation-triangle', color: 'danger' }
        );
    }
    
    return stats;
}

// Calculate average attendance percentage
function calculateAverageAttendance() {
    if (attendanceData.length === 0) return 0;
    
    const presentRecords = attendanceData.filter(record => record.status === 'present').length;
    return Math.round((presentRecords / attendanceData.length) * 100);
}

// Calculate detained students count
function calculateDetainedCount() {
    const studentAttendance = {};
    
    attendanceData.forEach(record => {
        if (!studentAttendance[record.student_id]) {
            studentAttendance[record.student_id] = { present: 0, total: 0 };
        }
        studentAttendance[record.student_id].total++;
        if (record.status === 'present') {
            studentAttendance[record.student_id].present++;
        }
    });
    
    let detainedCount = 0;
    Object.values(studentAttendance).forEach(stats => {
        const percentage = (stats.present / stats.total) * 100;
        if (percentage < 75) detainedCount++;
    });
    
    return detainedCount;
}

// Render stats grid
function renderStatsGrid(stats) {
    const statsGrid = document.getElementById('statsGrid');
    if (!statsGrid) return;
    
    statsGrid.innerHTML = stats.map(stat => `
        <div class="stat-card">
            <div class="stat-card-header">
                <h3>${stat.title}</h3>
                <i class="${stat.icon}"></i>
            </div>
            <div class="stat-value">${stat.value}</div>
        </div>
    `).join('');
}

// Render attendance section
function renderAttendanceSection() {
    // Show/hide mark attendance form based on role
    const markAttendanceForm = document.getElementById('markAttendanceForm');
    if (markAttendanceForm) {
        if (['teacher', 'hod', 'principal'].includes(currentUser.role)) {
            markAttendanceForm.style.display = 'block';
            populateStudentSelect();
        } else {
            markAttendanceForm.style.display = 'none';
        }
    }
    
    // Render attendance table
    renderAttendanceTable();
}

// Populate student select dropdown
function populateStudentSelect() {
    const studentSelect = document.getElementById('studentSelect');
    if (studentSelect && studentsData) {
        studentSelect.innerHTML = '<option value="">Select Student</option>' +
            studentsData.map(student => 
                `<option value="${student.id}">${student.name} (${student.roll_number})</option>`
            ).join('');
    }
}

// Render attendance table
function renderAttendanceTable() {
    const tableBody = document.getElementById('attendanceTableBody');
    if (!tableBody) return;
    
    const filteredData = getFilteredAttendanceData();
    
    tableBody.innerHTML = filteredData.map(record => `
        <tr>
            <td>${formatDate(record.date)}</td>
            <td>${record.student_name}</td>
            <td>${record.roll_number}</td>
            <td>${record.subject}</td>
            <td>
                <span class="status-badge status-${record.status}">
                    ${record.status.toUpperCase()}
                </span>
            </td>
            <td>${record.marked_by_name}</td>
            <td class="actions-col">
                ${getAttendanceActions(record)}
            </td>
        </tr>
    `).join('');
}

// Get filtered attendance data
function getFilteredAttendanceData() {
    let filtered = [...attendanceData];
    
    // Apply search filter
    const searchTerm = document.getElementById('attendanceSearch')?.value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(record => 
            record.student_name.toLowerCase().includes(searchTerm) ||
            record.roll_number.toLowerCase().includes(searchTerm) ||
            record.subject.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply status filter
    const statusFilter = document.getElementById('statusFilter')?.value;
    if (statusFilter) {
        filtered = filtered.filter(record => record.status === statusFilter);
    }
    
    return filtered;
}

// Get attendance action buttons based on role
function getAttendanceActions(record) {
    if (['teacher', 'hod', 'principal'].includes(currentUser.role)) {
        return `
            <div class="table-actions">
                <button class="btn btn-sm btn-warning" onclick="editAttendance(${record.id})">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        `;
    }
    return '';
}

// Handle mark attendance form submission
async function handleMarkAttendance(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const attendanceData = {
        student_id: formData.get('studentSelect') || document.getElementById('studentSelect').value,
        subject: formData.get('subjectSelect') || document.getElementById('subjectSelect').value,
        date: formData.get('attendanceDate') || document.getElementById('attendanceDate').value,
        status: formData.get('attendanceStatus') || document.getElementById('attendanceStatus').value
    };
    
    if (!attendanceData.student_id || !attendanceData.subject || !attendanceData.date || !attendanceData.status) {
        showNotification('Please fill all fields', 'error');
        return;
    }
    
    try {
        showLoading(true);
        
        const response = await fetch('/api/attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(attendanceData)
        });
        
        if (response.ok) {
            showNotification('Attendance marked successfully', 'success');
            e.target.reset();
            document.getElementById('attendanceDate').value = new Date().toISOString().split('T')[0];
            await loadAttendance();
            renderAttendanceTable();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to mark attendance', 'error');
        }
    } catch (error) {
        console.error('Error marking attendance:', error);
        showNotification('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Edit attendance
async function editAttendance(attendanceId) {
    const record = attendanceData.find(r => r.id === attendanceId);
    if (!record) return;
    
    const newStatus = prompt(`Change status for ${record.student_name} on ${formatDate(record.date)}:`, record.status);
    if (newStatus && ['present', 'absent', 'late'].includes(newStatus.toLowerCase())) {
        try {
            showLoading(true);
            
            const response = await fetch(`/api/attendance/${attendanceId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus.toLowerCase() })
            });
            
            if (response.ok) {
                showNotification('Attendance updated successfully', 'success');
                await loadAttendance();
                renderAttendanceTable();
            } else {
                const error = await response.json();
                showNotification(error.error || 'Failed to update attendance', 'error');
            }
        } catch (error) {
            console.error('Error updating attendance:', error);
            showNotification('Network error. Please try again.', 'error');
        } finally {
            showLoading(false);
        }
    }
}

// Render students section
function renderStudentsSection() {
    // Show/hide add student form based on role
    const addStudentForm = document.getElementById('addStudentForm');
    if (addStudentForm) {
        if (['hod', 'principal'].includes(currentUser.role)) {
            addStudentForm.style.display = 'block';
        } else {
            addStudentForm.style.display = 'none';
        }
    }
    
    // Render students table
    renderStudentsTable();
}

// Render students table
function renderStudentsTable() {
    const tableBody = document.getElementById('studentsTableBody');
    if (!tableBody) return;
    
    const filteredData = getFilteredStudentsData();
    
    tableBody.innerHTML = filteredData.map(student => `
        <tr>
            <td>${student.roll_number}</td>
            <td>${student.name}</td>
            <td>${student.department}</td>
            <td>${student.year}</td>
            <td>${student.email || 'N/A'}</td>
            <td>${student.phone || 'N/A'}</td>
            <td class="actions-col">
                ${getStudentActions(student)}
            </td>
        </tr>
    `).join('');
}

// Get filtered students data
function getFilteredStudentsData() {
    let filtered = [...studentsData];
    
    // Apply search filter
    const searchTerm = document.getElementById('studentSearch')?.value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(student => 
            student.name.toLowerCase().includes(searchTerm) ||
            student.roll_number.toLowerCase().includes(searchTerm) ||
            student.email?.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply department filter
    const departmentFilter = document.getElementById('departmentFilter')?.value;
    if (departmentFilter) {
        filtered = filtered.filter(student => student.department === departmentFilter);
    }
    
    return filtered;
}

// Get student action buttons based on role
function getStudentActions(student) {
    if (['hod', 'principal'].includes(currentUser.role)) {
        return `
            <div class="table-actions">
                <button class="btn btn-sm btn-primary" onclick="editStudent(${student.id})">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        `;
    }
    return '';
}

// Handle add student form submission
async function handleAddStudent(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const studentData = {
        roll_number: formData.get('rollNumber') || document.getElementById('rollNumber').value,
        name: formData.get('studentName') || document.getElementById('studentName').value,
        department: formData.get('department') || document.getElementById('department').value,
        year: parseInt(formData.get('year') || document.getElementById('year').value),
        email: formData.get('email') || document.getElementById('email').value,
        phone: formData.get('phone') || document.getElementById('phone').value
    };
    
    if (!studentData.roll_number || !studentData.name || !studentData.department || !studentData.year) {
        showNotification('Please fill all required fields', 'error');
        return;
    }
    
    try {
        showLoading(true);
        
        const response = await fetch('/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData)
        });
        
        if (response.ok) {
            showNotification('Student added successfully', 'success');
            e.target.reset();
            await loadStudents();
            renderStudentsTable();
            populateStudentSelect();
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to add student', 'error');
        }
    } catch (error) {
        console.error('Error adding student:', error);
        showNotification('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Edit student
function editStudent(studentId) {
    const student = studentsData.find(s => s.id === studentId);
    if (!student) return;
    
    // Create modal content for editing
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <form id="editStudentForm">
            <div class="form-group">
                <label for="editName">Name:</label>
                <input type="text" id="editName" value="${student.name}" required>
            </div>
            <div class="form-group">
                <label for="editDepartment">Department:</label>
                <input type="text" id="editDepartment" value="${student.department}" required>
            </div>
            <div class="form-group">
                <label for="editYear">Year:</label>
                <select id="editYear" required>
                    <option value="1" ${student.year === 1 ? 'selected' : ''}>1st Year</option>
                    <option value="2" ${student.year === 2 ? 'selected' : ''}>2nd Year</option>
                    <option value="3" ${student.year === 3 ? 'selected' : ''}>3rd Year</option>
                    <option value="4" ${student.year === 4 ? 'selected' : ''}>4th Year</option>
                </select>
            </div>
            <div class="form-group">
                <label for="editEmail">Email:</label>
                <input type="email" id="editEmail" value="${student.email || ''}">
            </div>
            <div class="form-group">
                <label for="editPhone">Phone:</label>
                <input type="tel" id="editPhone" value="${student.phone || ''}">
            </div>
            <button type="submit" class="btn btn-primary">Update Student</button>
        </form>
    `;
    
    document.getElementById('modalTitle').textContent = 'Edit Student';
    document.getElementById('editModal').style.display = 'flex';
    
    // Handle form submission
    document.getElementById('editStudentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const updatedData = {
            name: document.getElementById('editName').value,
            department: document.getElementById('editDepartment').value,
            year: parseInt(document.getElementById('editYear').value),
            email: document.getElementById('editEmail').value,
            phone: document.getElementById('editPhone').value
        };
        
        try {
            showLoading(true);
            
            const response = await fetch(`/api/students/${studentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            
            if (response.ok) {
                showNotification('Student updated successfully', 'success');
                closeModal();
                await loadStudents();
                renderStudentsTable();
                populateStudentSelect();
            } else {
                const error = await response.json();
                showNotification(error.error || 'Failed to update student', 'error');
            }
        } catch (error) {
            console.error('Error updating student:', error);
            showNotification('Network error. Please try again.', 'error');
        } finally {
            showLoading(false);
        }
    });
}

// Render detained section
async function renderDetainedSection() {
    try {
        const response = await fetch('/api/detained');
        if (response.ok) {
            const detainedStudents = await response.json();
            renderDetainedTable(detainedStudents);
        }
    } catch (error) {
        console.error('Failed to load detained students:', error);
    }
}

// Render detained students table
function renderDetainedTable(detainedStudents) {
    const tableBody = document.getElementById('detainedTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = detainedStudents.map(student => `
        <tr>
            <td>${student.roll_number}</td>
            <td>${student.name}</td>
            <td>${student.department}</td>
            <td>${student.total_classes || 0}</td>
            <td>${student.present_count || 0}</td>
            <td>
                <span class="status-badge status-detained">
                    ${student.attendance_percentage || 0}%
                </span>
            </td>
            <td>
                <span class="status-badge status-detained">
                    DETAINED
                </span>
            </td>
        </tr>
    `).join('');
}

// Render users section
async function renderUsersSection() {
    try {
        const response = await fetch('/api/users');
        if (response.ok) {
            const users = await response.json();
            renderUsersTable(users);
        }
    } catch (error) {
        console.error('Failed to load users:', error);
    }
}

// Render users table
function renderUsersTable(users) {
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = users.map(user => `
        <tr>
            <td>${user.username}</td>
            <td>${user.name}</td>
            <td>
                <span class="status-badge status-${user.role}">
                    ${user.role.toUpperCase()}
                </span>
            </td>
            <td>${user.department}</td>
            <td>${user.email || 'N/A'}</td>
            <td class="actions-col">
                <div class="table-actions">
                    <button class="btn btn-sm btn-info" onclick="viewUser(${user.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// View user details
function viewUser(userId) {
    // Implementation for viewing user details
    showNotification('User details view coming soon!', 'info');
}

// Filter attendance table
function filterAttendanceTable() {
    renderAttendanceTable();
}

// Filter students table
function filterStudentsTable() {
    renderStudentsTable();
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${message}
    `;
    
    // Add to page
    const main = document.querySelector('.dashboard-main');
    main.insertBefore(notification, main.firstChild);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

// Logout function
async function logout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/';
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = '/';
    }
}