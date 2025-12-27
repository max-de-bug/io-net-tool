# io.net Worker Manager

A comprehensive full-stack application for managing io.net workers across multiple servers and virtual machines.

## 🚀 Features

- **Dashboard Overview**: Real-time statistics and status monitoring
- **Server Management**: Add, configure, and monitor remote servers via SSH
- **Virtual Machine Support**: Create and manage KVM/QEMU VMs for isolated workers
- **Worker Tracking**: Monitor io.net worker containers with live status updates
- **Real-time Updates**: WebSocket-based live status synchronization
- **Modern UI**: Beautiful dark theme with professional aesthetics

## 📁 Project Structure

```
io-net-tool/
├── backend-django/          # Django REST API backend
│   ├── ionetTool/
│   │   ├── ionetTool/      # Django project settings
│   │   └── workers/        # Workers app with models, views, services
│   └── requirements.txt
├── src/                     # Next.js frontend
│   ├── app/                # App router pages
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   └── lib/               # Utilities and API client
├── lib/                    # NextAuth configuration
└── prisma/                 # Prisma schema and client
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **Tailwind CSS** - Utility-first styling
- **TypeScript** - Type safety
- **NextAuth.js** - Authentication
- **WebSocket** - Real-time updates

### Backend
- **Django 5** - Python web framework
- **Django REST Framework** - API endpoints
- **Channels** - WebSocket support
- **Celery** - Background task processing
- **Paramiko** - SSH connections

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- Redis (for Celery)
- PostgreSQL (optional, SQLite for development)

### Frontend Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your settings

# Run development server
npm run dev
```

### Backend Setup

```bash
# Navigate to backend
cd backend-django

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
cd ionetTool
python manage.py makemigrations workers
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Run server with WebSocket support
daphne -b 0.0.0.0 -p 8000 ionetTool.asgi:application
```

### Run Both (Development)

```bash
npm run dev:all
```

## 🔑 Environment Variables

### Frontend (.env.local)
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/ionet_tool"
JWT_SECRET="your-jwt-secret"
NEXT_PUBLIC_API_URL="http://localhost:8000/api"
NEXT_PUBLIC_WS_URL="ws://localhost:8000/ws/status/"

# OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
TWITTER_CLIENT_ID=""
TWITTER_CLIENT_SECRET=""
```

### Backend
```env
DJANGO_SECRET_KEY="your-secret-key"
DEBUG=True
CELERY_BROKER_URL="redis://localhost:6379/0"
```

## 📚 API Documentation

See [Backend README](backend-django/ionetTool/README.md) for full API documentation.

## 🖼️ Screenshots

### Dashboard
- Real-time statistics overview
- Server and worker status cards
- Live connection indicator

### Server Management
- Add servers via SSH
- Check server status and system info
- Setup virtualization automatically

### Worker Monitoring
- View all workers across servers and VMs
- Start, stop, restart workers
- View container logs

## 🛡️ Security

- SSH credentials stored securely on backend
- Password hashing with bcrypt
- JWT-based authentication
- CORS configured for local development

## 📝 License

MIT License - see LICENSE file for details.
