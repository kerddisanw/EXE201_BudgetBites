# Quick Start Guide

## Running the Application with Docker

1. **Open Terminal/PowerShell** in the project directory

2. **Start all services:**
   ```bash
   docker-compose up --build
   ```
   
   This will start:
   - PostgreSQL database on port 5432
   - Spring Boot backend on port 8080
   - React frontend on port 5173

3. **Wait for all services to start** (approximately 2-3 minutes)
   - You'll see "Started StudentMealComboApplication" in the logs
   - Frontend will show "ready in X ms"

4. **Access the application:**
   - Open browser: http://localhost:5173
   - API Docs: http://localhost:8080/api/swagger-ui.html

5. **Create your first account:**
   - Click "Register here"
   - Fill in the form
   - Login with your credentials

6. **Stop the application:**
   ```bash
   Ctrl+C
   docker-compose down
   ```

## First Time Setup

### Create an Admin User

1. Register a normal user through the web interface
2. Connect to the database:
   ```bash
   docker exec -it studentmeal-postgres psql -U studentmeal_user -d studentmeal_db
   ```
3. Update user role:
   ```sql
   UPDATE customers SET role = 'ADMIN' WHERE email = 'your-email@example.com';
   \q
   ```

### Add Sample Meal Packages (Admin Only)

Use Swagger UI at http://localhost:8080/api/swagger-ui.html

1. Login with admin credentials
2. Copy the JWT token from response
3. Click "Authorize" button, enter: `Bearer YOUR_TOKEN`
4. Use POST /api/packages to create packages

Sample package:
```json
{
  "name": "Student Breakfast Package",
  "description": "Healthy breakfast for 30 days",
  "price": 150.00,
  "durationDays": 30,
  "mealsPerDay": 1,
  "packageType": "BREAKFAST",
  "active": true
}
```

## Mobile App Setup

1. Install Expo Go on your phone
2. Navigate to mobile directory:
   ```bash
   cd mobile
   npm install
   ```
3. Find your computer's IP address:
   - Windows: `ipconfig` (look for IPv4)
   - Mac/Linux: `ifconfig` (look for inet)
4. Update `app.json`:
   ```json
   "extra": {
     "apiUrl": "http://YOUR_IP:8080/api"
   }
   ```
5. Start Expo:
   ```bash
   npm start
   ```
6. Scan QR code with Expo Go app

## Troubleshooting

**Backend won't start:**
- Wait for PostgreSQL to be ready (check logs)
- Ensure port 8080 is not in use

**Frontend can't connect to backend:**
- Check if backend is running: http://localhost:8080/api/health
- Verify CORS settings in SecurityConfig.java

**Database connection error:**
- Ensure PostgreSQL container is running
- Check credentials in .env file

**Mobile app can't connect:**
- Use your computer's IP, not localhost
- Ensure phone and computer are on same network
- Check firewall settings

## Development Workflow

1. **Make code changes**
2. **Rebuild containers:**
   ```bash
   docker-compose up --build
   ```
3. **Or develop locally:**
   - Backend: `cd be && mvn spring-boot:run`
   - Frontend: `cd fe && npm run dev`
   - Mobile: `cd mobile && npm start`

## Common Commands

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Reset database
docker-compose down -v
docker-compose up --build

# Access database
docker exec -it studentmeal-postgres psql -U studentmeal_user -d studentmeal_db

# Stop all services
docker-compose down

# Remove everything including volumes
docker-compose down -v --rmi all
```

---

**Need help?** Check the main README.md for detailed documentation.
