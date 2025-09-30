# Lets Fly LK Aware Application

A comprehensive, role-based security awareness and training platform designed for DynamicBiz IT Solutions. This application provides interactive training modules, quizzes, mini-games, and policy management tailored to different organizational roles.

## 🎯 Project Overview

This project was developed for the **IE3072: Information Security Policy and Management** assignment at Sri Lanka Institute of Information Technology. It demonstrates modern web development practices with a focus on security, user experience, and role-based access control.

## 🏗️ Architecture

- **Frontend**: React.js with TypeScript, Tailwind CSS, and Framer Motion
- **Backend**: Node.js with Express.js and TypeScript
- **Database**: MySQL 8.0 with comprehensive schema design
- **Real-time**: Socket.IO for live updates and notifications
- **Authentication**: JWT with MFA support and RBAC
- **Security**: Helmet, CORS, Rate Limiting, and comprehensive audit logging

## 🚀 Features

### Role-Based Training Content
- **Admin**: System administration, policy management, compliance oversight
- **Security Staff**: Incident response, threat detection, monitoring
- **Accounting**: Fraud prevention, financial data protection
- **Marketing & Customer Care**: Social engineering awareness, customer data protection
- **Developer**: Secure coding practices, OWASP compliance
- **Design & Content**: IP protection, secure collaboration

### Core Functionality
- Interactive mini-games and simulations
- Role-specific quizzes and assessments
- Policy management and acknowledgment tracking
- Real-time notifications and updates
- Comprehensive reporting and analytics
- MFA authentication support
- Audit logging and compliance tracking

## 📋 Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- Docker and Docker Compose (recommended)
- Git

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd dynamicbiz-security-awareness
```

### 2. Start Database Services
```bash
# Start MySQL and Redis containers
docker-compose up -d

# Wait for services to be ready (check with docker-compose ps)
```

### 3. Backend Setup
```bash
cd apps/api

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Edit .env with your configuration
# Update database credentials, JWT secret, etc.

# Build the application
npm run build

# Start development server
npm run dev
```

### 4. Frontend Setup
```bash
cd apps/frontend

# Install dependencies
npm install

# Start development server
npm start
```

### 5. Database Initialization
The MySQL schema will be automatically created when the containers start. The default admin user is:
- **Username**: admin
- **Password**: admin123

## 🌐 Access URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database**: localhost:3306 (MySQL)
- **Redis**: localhost:6379

## 🔐 Default Users

### Admin User
- Username: `admin`
- Password: `admin123`
- Role: System Administrator
- Access: Full system access

### Creating Additional Users
1. Login as admin
2. Navigate to Admin Dashboard
3. Use the User Management section to create new users
4. Assign appropriate roles and departments

## 🎮 Available Mini-Games

### Phishing Simulator
- Identify suspicious emails and links
- Learn to spot social engineering attempts
- Role-specific scenarios for different departments

### Password Challenge
- Test password strength
- Learn secure password creation
- Interactive feedback and tips

### Threat Detection
- Spot security vulnerabilities
- Practice incident response
- Real-world scenario simulations

### Fraud Detection (Accounting)
- Invoice verification exercises
- Financial scam awareness
- Secure transaction practices

### Code Review (Developer)
- Vulnerability identification
- Secure coding practices
- OWASP Top 10 examples

### Watermark Protection (Design)
- IP protection exercises
- Secure file sharing practices
- Copyright awareness

## 📊 Dashboard Features

### Admin Dashboard
- User management and role assignment
- Policy creation and management
- Compliance reporting and analytics
- System monitoring and alerts

### Role-Specific Dashboards
- Customized training modules
- Progress tracking and achievements
- Role-relevant security tips
- Performance metrics

## 🔒 Security Features

- **Multi-Factor Authentication (MFA)**
- **Role-Based Access Control (RBAC)**
- **JWT Token Authentication**
- **Password Policy Enforcement**
- **Rate Limiting and DDoS Protection**
- **Comprehensive Audit Logging**
- **HTTPS/TLS Encryption**
- **Input Validation and Sanitization**

## 📈 Monitoring & Analytics

- Real-time user activity tracking
- Training completion rates
- Quiz performance analytics
- Policy acknowledgment status
- Security incident reporting
- Compliance metrics

## 🧪 Testing

### Backend Tests
```bash
cd apps/api
npm test
```

### Frontend Tests
```bash
cd apps/frontend
npm test
```

## 🚀 Production Deployment

### Environment Variables
Ensure all environment variables are properly configured:
- Database credentials
- JWT secrets
- SMTP settings
- Redis configuration
- Security settings

### Security Checklist
- [ ] Change default admin password
- [ ] Configure proper SSL certificates
- [ ] Set up firewall rules
- [ ] Enable MFA for all users
- [ ] Configure backup procedures
- [ ] Set up monitoring and alerting

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration (admin only)
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Policy Endpoints
- `GET /api/policies` - List policies
- `POST /api/policies` - Create policy (admin only)
- `PUT /api/policies/:id` - Update policy (admin only)
- `DELETE /api/policies/:id` - Delete policy (admin only)

### Quiz Endpoints
- `GET /api/quizzes` - List available quizzes
- `GET /api/quizzes/:id` - Get quiz details
- `POST /api/quizzes/:id/attempt` - Submit quiz attempt
- `GET /api/quizzes/:id/results` - Get quiz results

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is developed for educational purposes as part of the IE3072 course at SLIIT.

## 👥 Team Members

- **IT23415140** - U.L.K.H. Liyanage
- **IT23159730** - W.H.M.S.R. Bandara  
- **IT23269484** - T.H. Ranasinghe
- **IT23187214** - N.K.B.H. Rathnayake
- **IT23171138** - D.P.D.K. Perera

## 🆘 Support

For technical support or questions about this project:
- Check the documentation
- Review the code comments
- Contact the development team

## 🔄 Updates & Maintenance

- Regular security updates
- New training content additions
- Performance optimizations
- Feature enhancements based on user feedback

---

**Note**: This application is designed for educational and demonstration purposes. For production use, ensure proper security hardening, regular updates, and compliance with organizational security policies.
