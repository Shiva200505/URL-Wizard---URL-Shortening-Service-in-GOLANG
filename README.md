# 🪄 URL Wizard - URL Shortening Service

URL Wizard is a modern, full-stack URL shortening service built with Go and React. It provides a clean, user-friendly interface for creating and managing shortened URLs with advanced features like analytics, custom slugs, and link expiration.

## 📸 Screenshots

### 🎯 Dashboard
![URL Wizard Dashboard](docs/images/dashboard.png)
*The main dashboard showing your shortened URLs and analytics*

### ✨ URL Creation
![URL Creation](docs/images/url-creation.png)
*Create new shortened URLs with custom slugs and expiration dates*

### 📊 Analytics
![Analytics](docs/images/analytics.png)
*Detailed analytics for your shortened URLs*

### 📱 Mobile View
![Mobile View](docs/images/mobile-view.png)
*Responsive design works perfectly on mobile devices*

## ✨ Features

- 🔗 **URL Shortening**: Create short, memorable links from long URLs
- 👤 **User Authentication**: Secure user accounts with personalized link management
- 📊 **Analytics**: Track clicks, devices, and referrers for each link
- ⚡ **Real-time Updates**: Instant updates when creating or deleting links
- 🎨 **Modern UI**: Clean and responsive design built with React and Tailwind CSS
- 🔒 **Security**: Secure authentication and link management
- ⏱️ **Link Expiration**: Set custom expiration dates for your links
- 📱 **Mobile Responsive**: Works seamlessly on all devices

## 🛠️ Tech Stack

### ⚙️ Backend
- 🦫 Go (Golang)
- 🍃 MongoDB
- 🕷️ Gorilla Mux
- 🔐 JWT Authentication

### 🎨 Frontend
- ⚛️ React
- 📘 TypeScript
- 🎨 Tailwind CSS
- 🔄 React Query
- ✨ Framer Motion

## 📋 Prerequisites

- 🦫 Go 1.21 or higher
- 📦 Node.js 18 or higher
- 🍃 MongoDB
- 🔧 Git

## 🚀 Installation

1. 📥 Clone the repository:
```bash
git clone https://github.com/yourusername/urlwizard.git
cd urlwizard
```

2. ⚙️ Set up the backend:
```bash
cd go-backend
go mod download
```

3. 🎨 Set up the frontend:
```bash
cd client
npm install
```

4. ⚙️ Configure environment variables:
   - Create a `.env` file in the `go-backend` directory:
   ```
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DATABASE=shortlink
   ```

## 🏃‍♂️ Running the Application

1. ⚙️ Start the backend server:
```bash
cd go-backend
go run cmd/server/main.go
```

2. 🎨 Start the frontend development server:
```bash
cd client
npm run dev
```

The application will be available at:
- 🌐 Frontend: http://localhost:5173
- 🔌 Backend API: http://localhost:5001

## 🔌 API Endpoints

### 🔐 Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### 🔗 URLs
- `POST /api/urls` - Create a new short URL
- `GET /api/urls` - Get all URLs for the current user
- `DELETE /api/urls/{id}` - Delete a URL
- `GET /api/r/{slug}` - Redirect to original URL

### 📊 Analytics
- `GET /api/analytics` - Get analytics data

## 📁 Project Structure

```
urlwizard/
├── 🎨 client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   └── pages/        # Page components
│   └── public/           # Static assets
├── ⚙️ go-backend/           # Backend Go application
│   ├── cmd/             # Application entry points
│   ├── internal/        # Private application code
│   │   ├── database/    # Database operations
│   │   ├── handlers/    # HTTP handlers
│   │   └── models/      # Data models
│   └── pkg/             # Public library code
├── 📚 docs/                # Documentation
│   └── images/         # Project screenshots
└── 📄 README.md
```

## 🤝 Contributing

1. 🍴 Fork the repository
2. 🌿 Create your feature branch (`git checkout -b feature/amazing-feature`)
3. 💾 Commit your changes (`git commit -m 'Add some amazing feature'`)
4. 📤 Push to the branch (`git push origin feature/amazing-feature`)
5. 🔄 Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- ⚛️ [React](https://reactjs.org/)
- 🦫 [Go](https://golang.org/)
- 🍃 [MongoDB](https://www.mongodb.com/)
- 🎨 [Tailwind CSS](https://tailwindcss.com/)
- ✨ [Framer Motion](https://www.framer.com/motion/) 