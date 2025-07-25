const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'smart-attendance-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Initialize SQLite Database
const db = new sqlite3.Database('attendance.db');

// Create tables
db.serialize(() => {
    // Users table (students, teachers, hods, principal)
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        department TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Students table
    db.run(`CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        roll_number TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        department TEXT NOT NULL,
        year INTEGER NOT NULL,
        email TEXT,
        phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Attendance table
    db.run(`CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        subject TEXT NOT NULL,
        date DATE NOT NULL,
        status TEXT NOT NULL,
        marked_by INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id),
        FOREIGN KEY (marked_by) REFERENCES users(id)
    )`);

    // Subjects table
    db.run(`CREATE TABLE IF NOT EXISTS subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        department TEXT NOT NULL,
        year INTEGER NOT NULL,
        teacher_id INTEGER,
        FOREIGN KEY (teacher_id) REFERENCES users(id)
    )`);

    // Insert default users
    const defaultUsers = [
        { username: 'student1', password: 'password123', role: 'student', name: 'John Doe', email: 'john@example.com', department: 'Computer Science' },
        { username: 'teacher1', password: 'password123', role: 'teacher', name: 'Dr. Smith', email: 'smith@example.com', department: 'Computer Science' },
        { username: 'hod1', password: 'password123', role: 'hod', name: 'Prof. Johnson', email: 'johnson@example.com', department: 'Computer Science' },
        { username: 'principal1', password: 'password123', role: 'principal', name: 'Dr. Principal', email: 'principal@example.com', department: 'Administration' }
    ];

    defaultUsers.forEach(user => {
        const hashedPassword = bcrypt.hashSync(user.password, 10);
        db.run(`INSERT OR IGNORE INTO users (username, password, role, name, email, department) 
                VALUES (?, ?, ?, ?, ?, ?)`, 
                [user.username, hashedPassword, user.role, user.name, user.email, user.department]);
    });

    // Insert sample students
    const sampleStudents = [
        { roll_number: 'CS2021001', name: 'Alice Johnson', department: 'Computer Science', year: 3, email: 'alice@example.com', phone: '1234567890' },
        { roll_number: 'CS2021002', name: 'Bob Smith', department: 'Computer Science', year: 3, email: 'bob@example.com', phone: '1234567891' },
        { roll_number: 'CS2021003', name: 'Charlie Brown', department: 'Computer Science', year: 3, email: 'charlie@example.com', phone: '1234567892' },
        { roll_number: 'CS2021004', name: 'Diana Prince', department: 'Computer Science', year: 3, email: 'diana@example.com', phone: '1234567893' }
    ];

    sampleStudents.forEach(student => {
        db.run(`INSERT OR IGNORE INTO students (roll_number, name, department, year, email, phone) 
                VALUES (?, ?, ?, ?, ?, ?)`, 
                [student.roll_number, student.name, student.department, student.year, student.email, student.phone]);
    });

    // Insert sample subjects
    const sampleSubjects = [
        { name: 'Data Structures', code: 'CS301', department: 'Computer Science', year: 3, teacher_id: 2 },
        { name: 'Database Management', code: 'CS302', department: 'Computer Science', year: 3, teacher_id: 2 },
        { name: 'Operating Systems', code: 'CS303', department: 'Computer Science', year: 3, teacher_id: 2 }
    ];

    sampleSubjects.forEach(subject => {
        db.run(`INSERT OR IGNORE INTO subjects (name, code, department, year, teacher_id) 
                VALUES (?, ?, ?, ?, ?)`, 
                [subject.name, subject.code, subject.department, subject.year, subject.teacher_id]);
    });
});

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.session.user || !roles.includes(req.session.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        req.session.user = {
            id: user.id,
            username: user.username,
            role: user.role,
            name: user.name,
            department: user.department
        };
        
        res.json({ 
            success: true, 
            user: req.session.user,
            redirectUrl: `/dashboard.html?role=${user.role}`
        });
    });
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Get current user
app.get('/api/user', requireAuth, (req, res) => {
    res.json(req.session.user);
});

// Get students (for all roles)
app.get('/api/students', requireAuth, (req, res) => {
    let query = 'SELECT * FROM students';
    let params = [];
    
    if (req.session.user.role === 'student') {
        // Students can only see their own data
        query += ' WHERE roll_number = (SELECT roll_number FROM students WHERE name = ?)';
        params = [req.session.user.name];
    }
    
    db.all(query, params, (err, students) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(students);
    });
});

// Get attendance data
app.get('/api/attendance', requireAuth, (req, res) => {
    let query = `
        SELECT a.*, s.name as student_name, s.roll_number, u.name as marked_by_name
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        JOIN users u ON a.marked_by = u.id
    `;
    let params = [];
    
    if (req.session.user.role === 'student') {
        query += ' WHERE s.name = ?';
        params = [req.session.user.name];
    }
    
    query += ' ORDER BY a.date DESC, a.subject';
    
    db.all(query, params, (err, attendance) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(attendance);
    });
});

// Mark attendance (teacher, hod, principal only)
app.post('/api/attendance', requireAuth, requireRole(['teacher', 'hod', 'principal']), (req, res) => {
    const { student_id, subject, date, status } = req.body;
    
    db.run(`INSERT INTO attendance (student_id, subject, date, status, marked_by) 
            VALUES (?, ?, ?, ?, ?)`, 
            [student_id, subject, date, status, req.session.user.id], 
            function(err) {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true, id: this.lastID });
    });
});

// Update attendance (teacher, hod, principal only)
app.put('/api/attendance/:id', requireAuth, requireRole(['teacher', 'hod', 'principal']), (req, res) => {
    const { status } = req.body;
    const attendanceId = req.params.id;
    
    db.run('UPDATE attendance SET status = ? WHERE id = ?', [status, attendanceId], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true });
    });
});

// Add/Update student (hod, principal only)
app.post('/api/students', requireAuth, requireRole(['hod', 'principal']), (req, res) => {
    const { roll_number, name, department, year, email, phone } = req.body;
    
    db.run(`INSERT INTO students (roll_number, name, department, year, email, phone) 
            VALUES (?, ?, ?, ?, ?, ?)`, 
            [roll_number, name, department, year, email, phone], 
            function(err) {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true, id: this.lastID });
    });
});

// Update student details (hod, principal only)
app.put('/api/students/:id', requireAuth, requireRole(['hod', 'principal']), (req, res) => {
    const { name, department, year, email, phone } = req.body;
    const studentId = req.params.id;
    
    db.run(`UPDATE students SET name = ?, department = ?, year = ?, email = ?, phone = ? 
            WHERE id = ?`, 
            [name, department, year, email, phone, studentId], 
            function(err) {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ success: true });
    });
});

// Get detained students (hod, principal only)
app.get('/api/detained', requireAuth, requireRole(['hod', 'principal']), (req, res) => {
    const query = `
        SELECT s.*, 
               COUNT(a.id) as total_classes,
               SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
               ROUND((SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) * 100.0 / COUNT(a.id)), 2) as attendance_percentage
        FROM students s
        LEFT JOIN attendance a ON s.id = a.student_id
        GROUP BY s.id
        HAVING attendance_percentage < 75 OR attendance_percentage IS NULL
        ORDER BY attendance_percentage ASC
    `;
    
    db.all(query, [], (err, detainedStudents) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(detainedStudents);
    });
});

// Get all users (principal only)
app.get('/api/users', requireAuth, requireRole(['principal']), (req, res) => {
    db.all('SELECT id, username, role, name, email, department FROM users', [], (err, users) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(users);
    });
});

// Get subjects
app.get('/api/subjects', requireAuth, (req, res) => {
    db.all('SELECT * FROM subjects', [], (err, subjects) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(subjects);
    });
});

// Get attendance statistics
app.get('/api/statistics', requireAuth, (req, res) => {
    const statsQuery = `
        SELECT 
            s.department,
            COUNT(DISTINCT s.id) as total_students,
            COUNT(a.id) as total_attendance_records,
            ROUND(AVG(CASE WHEN a.status = 'present' THEN 100.0 ELSE 0.0 END), 2) as average_attendance
        FROM students s
        LEFT JOIN attendance a ON s.id = a.student_id
        GROUP BY s.department
    `;
    
    db.all(statsQuery, [], (err, stats) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(stats);
    });
});

app.listen(PORT, () => {
    console.log(`Smart Attendance System running on http://localhost:${PORT}`);
    console.log('\nDefault Login Credentials:');
    console.log('Student: student1 / password123');
    console.log('Teacher: teacher1 / password123');
    console.log('HOD: hod1 / password123');
    console.log('Principal: principal1 / password123');
});