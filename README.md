# Smart Attendance System

A comprehensive web-based attendance management system with role-based access control for educational institutions.

## 🚀 Features

### Role-Based Access Control
- **Student**: View personal attendance records (read-only access)
- **Teacher**: Mark and modify attendance records
- **HOD (Head of Department)**: Full attendance management + student details management + detained students list
- **Principal**: Complete system access including user management

### Core Functionality
- ✅ Role-based login system with 4 distinct user types
- ✅ Interactive dashboard with real-time statistics
- ✅ Attendance marking and modification
- ✅ Student profile management
- ✅ Detained students tracking (< 75% attendance)
- ✅ User management (Principal only)
- ✅ Search and filter capabilities
- ✅ Responsive modern UI design
- ✅ Real-time data updates

## 🛠️ Technologies Used

### Backend
- **Node.js** with Express.js framework
- **SQLite** database for data storage
- **bcryptjs** for password hashing
- **express-session** for session management

### Frontend
- **Vanilla JavaScript** (ES6+)
- **HTML5** & **CSS3**
- **Font Awesome** icons
- **Responsive Design** (Mobile-friendly)

## 📋 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-attendance-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Access the application**
   Open your browser and navigate to: `http://localhost:3000`

## 🔐 Default Login Credentials

The system comes with pre-configured demo accounts:

| Role | Username | Password | Permissions |
|------|----------|----------|-------------|
| **Student** | `student1` | `password123` | View personal attendance only |
| **Teacher** | `teacher1` | `password123` | Mark/modify attendance |
| **HOD** | `hod1` | `password123` | Full attendance + student management + detained list |
| **Principal** | `principal1` | `password123` | Complete system access + user management |

## 🎯 User Guide

### For Students
1. **Login** using student credentials
2. **Dashboard**: View attendance percentage and statistics
3. **My Attendance**: Check attendance records by subject
4. **My Profile**: View personal information

### For Teachers
1. **Login** using teacher credentials
2. **Dashboard**: Overview of class statistics
3. **Attendance**: 
   - Mark new attendance records
   - View and modify existing records
4. **Students**: View student information

### For HOD (Head of Department)
1. **Login** using HOD credentials
2. **Dashboard**: Department-wide statistics
3. **Attendance Management**: Full attendance control
4. **Student Management**: 
   - Add new students
   - Modify student details
5. **Detained Students**: View students with < 75% attendance

### For Principal
1. **Login** using principal credentials
2. **Complete System Access**: All features available
3. **User Management**: View all system users
4. **Administrative Control**: Full oversight capabilities

## 📊 System Features

### Dashboard Analytics
- Real-time attendance statistics
- Role-specific data visualization
- Quick access to key metrics
- Modern card-based layout

### Attendance Management
- Date-wise attendance marking
- Subject-wise tracking
- Status options: Present, Absent, Late
- Bulk operations support

### Student Information System
- Comprehensive student profiles
- Department and year-wise organization
- Contact information management
- Academic year tracking

### Search & Filter
- Real-time search across all data
- Multiple filter options
- Export capabilities
- Print-friendly views

## 🔧 Technical Architecture

### Database Schema
- **Users**: Authentication and role management
- **Students**: Student information and profiles
- **Attendance**: Daily attendance records
- **Subjects**: Course and subject management

### Security Features
- Password hashing with bcrypt
- Session-based authentication
- Role-based access control
- Input validation and sanitization

### API Endpoints
- `POST /api/login` - User authentication
- `GET /api/user` - Current user information
- `GET /api/students` - Student data (role-filtered)
- `GET /api/attendance` - Attendance records
- `POST /api/attendance` - Mark attendance
- `PUT /api/attendance/:id` - Update attendance
- `GET /api/detained` - Detained students list
- `GET /api/users` - User management (Principal only)

## 🎨 UI/UX Features

### Modern Design
- Clean, professional interface
- Gradient backgrounds and modern styling
- Smooth animations and transitions
- Responsive grid layouts

### Interactive Elements
- Role-based navigation menus
- Real-time form validation
- Loading states and feedback
- Modal dialogs for editing

### Mobile Responsive
- Fully responsive design
- Touch-friendly interface
- Optimized for all screen sizes
- Progressive web app ready

## 📈 Performance

- Lightweight SQLite database
- Efficient query optimization
- Client-side data caching
- Minimal resource footprint

## 🔮 Future Enhancements

- Email notifications for low attendance
- Biometric integration
- Advanced analytics and reporting
- Parent portal access
- Mobile application
- Bulk import/export functionality
- Advanced user role customization

## 🐛 Troubleshooting

### Common Issues

1. **Server won't start**
   - Check if port 3000 is available
   - Ensure Node.js is properly installed
   - Run `npm install` to install dependencies

2. **Database errors**
   - Delete `attendance.db` file and restart server
   - Check file permissions

3. **Login issues**
   - Use the default credentials provided
   - Clear browser cache and cookies

## 📞 Support

For technical support or feature requests, please create an issue in the repository.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Smart Attendance System** - Streamlining educational attendance management with modern technology.
