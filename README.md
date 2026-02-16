# JavaBite - Coffee Portal Management System

A full-stack restaurant management system designed for coffee shops and cafes, built with React and Spring Boot.

## 🚀 Features

### Admin Dashboard
- **Customer Management**: View and manage customer accounts
- **Menu Management**: Add, edit, and delete menu items with image uploads
- **Order Management**: Monitor and process all orders
- **Staff Management**: Manage chef and waiter accounts
- **Table Management**: Configure and manage table bookings
- **Feedback Dashboard**: View and analyze customer feedback

### Chef Portal
- **Order Queue**: View and manage incoming orders
- **Profile Management**: Update personal information

### Customer Portal
- **Browse Menu**: View available items with images and descriptions
- **Place Orders**: Order food items directly
- **Table Booking**: Reserve tables for dining
- **Order History**: Track current and past orders
- **Feedback System**: Submit and view feedback history
- **Profile Management**: Update personal details

### Waiter Features
- **Order Management**: Take and manage customer orders
- **Table Service**: Track table assignments

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.1.1
- **Build Tool**: Vite 7.1.7
- **Routing**: React Router DOM 7.9.5
- **HTTP Client**: Axios 1.13.2
- **Authentication**: JWT (jwt-decode 4.0.0)
- **Charts**: Recharts 3.4.1
- **Styling**: CSS

### Backend
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **Database**: MongoDB
- **Security**: Spring Security + JWT
- **Build Tool**: Maven
- **Authentication**: JWT tokens

## 📋 Prerequisites

### Option 1: Using Docker (Recommended)
- **Docker** (20.10+)
- **Docker Compose** (v2.0+)

### Option 2: Local Development
- **Node.js** (v18 or higher)
- **Java** (JDK 17)
- **Maven** (3.6+)
- **MongoDB** (4.4+)

## 🔧 Installation & Setup

### Option 1: Quick Start with Docker 🐳

The easiest way to run the application is using Docker Compose:

```bash
# Clone the repository
git clone https://github.com/dineshkarthick21/Coffee-Portal-springboot.git
cd "coffee portal"

# Start all services (MongoDB + Backend)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

The services will be available at:
- **Backend API**: http://localhost:8080
- **MongoDB**: localhost:27017

#### Docker Commands
```bash
# Build and start services
docker-compose up --build

# Stop services but keep data
docker-compose stop

# Remove everything (including volumes/data)
docker-compose down -v

# View service status
docker-compose ps

# Access backend container shell
docker-compose exec backend sh
```

### Option 2: Local Development Setup

#### 1. Clone the Repository
```bash
git clone https://github.com/dineshkarthick21/Coffee-Portal-springboot.git
cd "coffee portal"
```

#### 2. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Configure MongoDB connection in `src/main/resources/application.properties`:
```properties
spring.data.mongodb.uri=mongodb://localhost:27017/javabite
spring.data.mongodb.database=javabite
```

Build and run the backend:
```bash
./mvnw clean install
./mvnw spring-boot:run
```

Or build Docker image manually:
```bash
docker build -t javabite-backend .
docker run -p 8080:8080 -e MONGODB_URI=mongodb://host.docker.internal:27017/javabite javabite-backend
```

The backend server will start on `http://localhost:8080`

#### 3. Frontend Setup

Navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Configure API endpoint in `src/api/apiClient.js` if needed.

Run the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## 📁 Project Structure

```
coffee portal/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       ├── application-dev.properties
│   │   │       └── application-secure.properties
│   │   └── test/
│   ├── uploads/          # Uploaded images storage
│   └── pom.xml
│
└── frontend/
    ├── src/
    │   ├── api/          # API client configuration
    │   ├── auth/         # Authentication context & routes
    │   ├── components/   # Reusable components
    │   ├── layout/       # Layout components
    │   ├── pages/        # Page components
    │   │   ├── Admin/
    │   │   ├── Chef/
    │   │   ├── Customer/
    │   │   ├── Payment/
    │   │   └── Waiter/
    │   └── styles/       # Global styles
    ├── package.json
    └── vite.config.js
```

## � Docker Configuration

The project includes Docker support for easy deployment:

### Files
- **`backend/Dockerfile`**: Multi-stage build for the Spring Boot application
- **`backend/.dockerignore`**: Excludes unnecessary files from Docker context
- **`docker-compose.yml`**: Orchestrates MongoDB and Backend services

### Docker Architecture
- **Stage 1**: Uses Maven to build the application
- **Stage 2**: Creates lightweight runtime image with JRE 17
- **Volumes**: Persists MongoDB data and uploaded files
- **Networks**: Isolated bridge network for service communication
- **Health Checks**: Monitors service availability

### Environment Variables
Configure these in `docker-compose.yml` or pass at runtime:
- `SPRING_PROFILES_ACTIVE`: Application profile (dev/prod/secure)
- `SPRING_DATA_MONGODB_URI`: MongoDB connection string
- `SPRING_DATA_MONGODB_DATABASE`: Database name
## 🚀 Deployment on Render.com

### Prerequisites
1. Create a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free cluster or use another MongoDB provider
2. Get your MongoDB connection string
3. Fork or have access to this GitHub repository

### Step-by-Step Deployment

#### 1. Set up MongoDB Atlas (Free Tier)
```
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account and cluster
3. Create a database user
4. Whitelist all IPs (0.0.0.0/0) for Render access
5. Copy your connection string (replace <password> with your actual password)
   Example: mongodb+srv://username:password@cluster.mongodb.net/javabite
```

#### 2. Deploy on Render.com

**Option A: Using Render Blueprint (Automated)**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Render will detect `render.yaml` and configure automatically
5. Add environment variable:
   - `SPRING_DATA_MONGODB_URI`: Your MongoDB Atlas connection string
6. Click "Apply" to deploy

**Option B: Manual Deployment**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: javabite-backend
   - **Environment**: Docker
   - **Region**: Oregon (or closest to you)
   - **Branch**: main
   - **Docker Build Context**: ./backend
   - **Dockerfile Path**: ./backend/Dockerfile
5. Add Environment Variables:
   ```
   SPRING_PROFILES_ACTIVE=dev
   SPRING_DATA_MONGODB_URI=your-mongodb-atlas-connection-string
   SPRING_DATA_MONGODB_DATABASE=javabite
   PORT=8080
   JWT_SECRET=your-secret-key-here
   JWT_EXPIRATION=86400000
   ```
6. Click "Create Web Service"

#### 3. Deploy Frontend (Optional)

**Option A: Using Render Blueprint** (Deploys both backend and frontend)
- The `render.yaml` file already includes frontend configuration
- Frontend will automatically connect to your backend API

**Option B: Manual Frontend Deployment**
1. After backend is deployed, click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: javabite-frontend
   - **Environment**: Docker
   - **Region**: Oregon (same as backend)
   - **Branch**: main
   - **Docker Build Context**: ./frontend
   - **Dockerfile Path**: ./frontend/Dockerfile
4. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend-name.onrender.com
   ```
5. Click "Create Web Service"

#### 4. Update Frontend API Configuration

After deployment, update your frontend `src/api/apiClient.js` to use the environment variable or your backend URL:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
```

#### 5. Verify Deployment
Once deployed, your services will be available at:
- **Backend API**: `https://javabite-backend.onrender.com`
- **Frontend**: `https://javabite-frontend.onrender.com`

Test the endpoints:
```bash
# Backend health check
curl https://your-backend-name.onrender.com/actuator/health

# Frontend health check
curl https://your-frontend-name.onrender.com/health
```

### Important Notes
- **Free Tier Limitations**: 
  - Service spins down after 15 minutes of inactivity
  - First request after spin-down takes ~30-50 seconds
  - 750 hours/month of runtime
- **Environment Variables**: Never commit secrets to git
- **MongoDB**: Use MongoDB Atlas free tier (512MB storage)
- **Uploads**: File uploads will be lost on restart (use cloud storage for production)

### Updating Your Deployment
Render automatically redeploys when you push to the connected branch:
```bash
git add .
git commit -m "Update application"
git push origin main
```
## �🔐 User Roles

The system supports multiple user roles with different permissions:

1. **Admin**: Full system access and management
2. **Chef**: Access to kitchen order management
3. **Waiter**: Access to table and order management
4. **Customer**: Access to menu, ordering, and booking

## 🚀 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `./mvnw spring-boot:run` - Run the application
- `./mvnw clean install` - Build the project
- `./mvnw test` - Run tests

## 🌐 Environment Profiles

The backend supports multiple profiles:
- **default**: Standard configuration
- **dev**: Development environment
- **secure**: Production with enhanced security

Activate a profile:
```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

## 📸 Features in Detail

### Menu Management
- Upload menu item images
- Set prices and descriptions
- Categorize items
- Enable/disable availability

### Order System
- Real-time order status updates
- Order history tracking
- Multiple payment methods
- Order confirmation

### Table Booking
- Check table availability
- Reserve tables with date/time
- Booking confirmation
- Booking history

### Feedback System
- Submit ratings and reviews
- View feedback history
- Admin feedback analytics

## 🔒 Security

- JWT-based authentication
- Role-based access control (RBAC)
- Secure password hashing
- Protected API endpoints
- CORS configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

JavaBite Development Team

## 📧 Support

For support, email support@javabite.com or open an issue in the repository.

---

**Note**: Make sure MongoDB is running before starting the backend server.
