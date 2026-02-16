# Student Meal Combo - Full Stack Application

A comprehensive meal subscription management system for students, built with Spring Boot, React, React Native, PostgreSQL, and Docker.

## 🏗️ Architecture

### Technology Stack

**Backend:**
- Java 17
- Spring Boot 3.2.2
- Spring Security with JWT
- Spring Data JPA
- PostgreSQL 15
- Maven
- Swagger/OpenAPI

**Frontend:**
- React 18
- Vite
- React Router
- Axios

**Mobile:**
- React Native
- Expo
- React Navigation

**Infrastructure:**
- Docker & Docker Compose
- PostgreSQL with persistent volumes

## 📁 Project Structure

```
student-meal-combo/
├── docker-compose.yml          # Docker orchestration
├── .env                        # Environment variables
├── README.md                   # This file
│
├── be/                         # Backend (Spring Boot)
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
│       └── main/
│           ├── java/com/studentmeal/
│           │   ├── controller/      # REST controllers
│           │   ├── service/         # Business logic
│           │   ├── repository/      # Data access
│           │   ├── entity/          # JPA entities
│           │   ├── dto/             # Data transfer objects
│           │   ├── config/          # Configuration
│           │   ├── security/        # JWT & Security
│           │   └── exception/       # Exception handling
│           └── resources/
│               └── application.yml  # App configuration
│
├── fe/                         # Frontend (React)
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── pages/              # React pages
│       ├── services/           # API services
│       └── config/             # Configuration
│
└── mobile/                     # Mobile (React Native)
    ├── package.json
    ├── app.json
    ├── App.js
    └── src/
        ├── screens/            # Mobile screens
        └── services/           # API services
```

## 🚀 Quick Start

### Prerequisites

- Docker Desktop installed
- Docker Compose installed
- Git (optional)

### Running with Docker (Recommended)

1. **Navigate to project directory:**
   ```bash
   cd student-meal-combo
   ```

2. **Start all services:**
   ```bash
   docker-compose up --build
   ```

3. **Access the applications:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080/api
   - Swagger UI: http://localhost:8080/api/swagger-ui.html
   - PostgreSQL: localhost:5432

4. **Stop all services:**
   ```bash
   docker-compose down
   ```

5. **Stop and remove volumes (clean slate):**
   ```bash
   docker-compose down -v
   ```

## 🔧 Development Setup

### Backend Development

**Prerequisites:**
- JDK 17 or higher
- Maven 3.6+
- PostgreSQL 15 (or use Docker)

**Steps:**

1. Navigate to backend directory:
   ```bash
   cd be
   ```

2. Install dependencies:
   ```bash
   mvn clean install
   ```

3. Run the application:
   ```bash
   mvn spring-boot:run
   ```

4. API will be available at: http://localhost:8080/api

### Frontend Development

**Prerequisites:**
- Node.js 18+ and npm

**Steps:**

1. Navigate to frontend directory:
   ```bash
   cd fe
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Frontend will be available at: http://localhost:5173

### Mobile Development

**Prerequisites:**
- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your mobile device

**Steps:**

1. Navigate to mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update API URL in `app.json` to your computer's IP address:
   ```json
   "extra": {
     "apiUrl": "http://YOUR_IP_ADDRESS:8080/api"
   }
   ```

4. Start Expo:
   ```bash
   npm start
   ```

5. Scan QR code with Expo Go app

## 📊 Database Schema

### Entities

1. **Customer** - User accounts with role-based access
2. **MealPartner** - Food vendors/restaurants
3. **MealPackage** - Meal subscription packages
4. **Subscription** - Customer subscriptions to packages
5. **Payment** - Payment transactions

### Relationships

- Customer → Subscription (One-to-Many)
- MealPackage → Subscription (One-to-Many)
- MealPartner → MealPackage (One-to-Many)
- Subscription → Payment (One-to-Many)

## 🔐 Authentication & Authorization

### JWT Authentication

- Token-based authentication
- Bearer token in Authorization header
- Token expiration: 24 hours (configurable)

### User Roles

- **CUSTOMER**: Regular users, can view packages and manage subscriptions
- **ADMIN**: Full access, can manage packages and view all subscriptions

### Default Credentials

Create an admin user by registering and manually updating the database:

```sql
UPDATE customers SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Meal Packages
- `GET /api/packages` - Get all active packages
- `GET /api/packages/{id}` - Get package by ID
- `POST /api/packages` - Create package (Admin only)
- `PUT /api/packages/{id}` - Update package (Admin only)
- `DELETE /api/packages/{id}` - Delete package (Admin only)

### Subscriptions
- `POST /api/subscriptions` - Create subscription
- `GET /api/subscriptions/my` - Get my subscriptions
- `GET /api/subscriptions` - Get all subscriptions (Admin only)
- `GET /api/subscriptions/{id}` - Get subscription by ID
- `PATCH /api/subscriptions/{id}/status` - Update status (Admin only)

### Health Check
- `GET /api/health` - Service health check

## 🌐 Environment Variables

Configure in `.env` file:

```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=studentmeal_db
DB_USER=studentmeal_user
DB_PASSWORD=studentmeal_pass_2024

# JWT
JWT_SECRET=your-secret-key-change-this-in-production-min-256-bits-long
JWT_EXPIRATION=86400000

# Application
SPRING_PROFILES_ACTIVE=dev
SERVER_PORT=8080

# Frontend
VITE_API_URL=http://localhost:8080/api

# Mobile
EXPO_PUBLIC_API_URL=http://localhost:8080/api
```

## 🧪 Testing

### Backend Testing

```bash
cd be
mvn test
```

### Frontend Testing

```bash
cd fe
npm test
```

## 📦 Building for Production

### Backend

```bash
cd be
mvn clean package
java -jar target/student-meal-combo-1.0.0.jar
```

### Frontend

```bash
cd fe
npm run build
# Serve the dist folder with any static server
```

### Mobile

```bash
cd mobile
expo build:android
expo build:ios
```

## 🐛 Troubleshooting

### Docker Issues

**Port already in use:**
```bash
# Change ports in docker-compose.yml or stop conflicting services
docker-compose down
```

**Database connection failed:**
```bash
# Wait for PostgreSQL to be ready
docker-compose logs postgres
```

**Backend not starting:**
```bash
# Check backend logs
docker-compose logs backend
```

### Development Issues

**CORS errors:**
- Ensure backend CORS configuration includes your frontend URL
- Check SecurityConfig.java

**JWT token expired:**
- Login again to get a new token
- Increase JWT_EXPIRATION in .env

**Database schema issues:**
```bash
# Reset database
docker-compose down -v
docker-compose up --build
```

## 📝 Features

### Implemented Features

✅ User registration and authentication  
✅ JWT-based security  
✅ Role-based access control (CUSTOMER/ADMIN)  
✅ Meal package management  
✅ Subscription creation and tracking  
✅ Payment tracking  
✅ Responsive web interface  
✅ Mobile application  
✅ RESTful API with Swagger documentation  
✅ Docker containerization  
✅ Database persistence  

### Future Enhancements

- Payment gateway integration
- Email notifications
- QR code for meal redemption
- Rating and review system
- Analytics dashboard for admins
- Push notifications for mobile
- Multi-language support

## 👥 Team & Support

**Project Type:** University Project  
**Academic Level:** Senior Year  
**Course:** Software Engineering / Full Stack Development  

## 📄 License

This project is created for educational purposes.

## 🎓 Academic Notes

This project demonstrates:
- Monolithic architecture design
- RESTful API development
- JWT authentication implementation
- Database design and relationships
- Docker containerization
- Full-stack development (Backend + Web + Mobile)
- Modern development practices

---

**Built with ❤️ for student meal management**
