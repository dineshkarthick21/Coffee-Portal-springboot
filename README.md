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

Before running this application, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Java** (JDK 17)
- **Maven** (3.6+)
- **MongoDB** (4.4+)

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "coffee portal"
```

### 2. Backend Setup

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

The backend server will start on `http://localhost:8080`

### 3. Frontend Setup

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

## 🔐 User Roles

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
