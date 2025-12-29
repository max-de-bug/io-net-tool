# io.net Worker Manager

A comprehensive full-stack application for managing io.net workers across multiple servers and virtual machines. This tool provides real-time monitoring, automated VM provisioning, and centralized management of distributed worker infrastructure.

## 🚀 Features

- **📊 Dashboard Overview**: Real-time statistics and status monitoring with live updates
- **🖥️ Server Management**: Add, configure, and monitor remote servers via SSH
- **🖳 Virtual Machine Support**: Automated creation and management of KVM/QEMU VMs for isolated workers
- **⚙️ Worker Tracking**: Monitor io.net worker containers with live status updates
- **🔄 Real-time Updates**: WebSocket-based live status synchronization
- **🎨 Modern UI**: Beautiful dark theme with professional aesthetics
- **🔐 Authentication**: Multiple auth methods (Email/Password, OAuth providers)
- **📈 Background Processing**: Celery-based automated status polling
- **📝 Activity Logging**: Complete audit trail of all operations

## 📁 Project Structure

```
io-net-tool/
├── backend-django/              # Django REST API backend
│   ├── ionetTool/
│   │   ├── ionetTool/          # Django project settings
│   │   │   ├── settings.py     # Django configuration
│   │   │   ├── urls.py         # Main URL routing
│   │   │   ├── asgi.py         # ASGI config for WebSockets
│   │   │   └── celery.py       # Celery configuration
│   │   └── workers/            # Workers Django app
│   │       ├── models.py      # Database models
│   │       ├── views.py        # API views
│   │       ├── serializers.py  # DRF serializers
│   │       ├── services/       # Business logic
│   │       │   ├── ssh_service.py
│   │       │   ├── worker_service.py
│   │       │   └── vm_service.py
│   │       ├── tasks.py        # Celery tasks
│   │       ├── consumers.py    # WebSocket consumers
│   │       └── routing.py      # WebSocket routing
│   └── requirements.txt        # Python dependencies
├── src/                         # Next.js frontend
│   ├── app/                    # App router pages
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── api/               # API routes
│   │   └── authChoise/        # Auth pages
│   ├── components/            # React components
│   │   ├── ui/               # UI components
│   │   └── ...               # Feature components
│   ├── hooks/                # Custom React hooks
│   │   ├── useWebSocket.ts
│   │   └── useDashboard.ts
│   └── lib/                  # Utilities and API client
│       └── api.ts            # API client
├── lib/                        # Shared libraries
│   ├── auth.tsx              # NextAuth configuration
│   └── auth-client.tsx       # Client-side auth utilities
├── prisma/                     # Prisma ORM
│   └── prisma/
│       ├── schema.prisma     # Database schema
│       └── prismaClient/     # Generated Prisma client
└── prisma.config.ts           # Prisma 7 configuration
```

## 🛠️ Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **NextAuth.js** - Authentication & session management
- **WebSocket** - Real-time bidirectional communication
- **Prisma** - Type-safe database ORM
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend

- **Django 5** - Python web framework
- **Django REST Framework** - RESTful API endpoints
- **Django Channels** - WebSocket support
- **Daphne** - ASGI server for WebSocket support
- **Celery** - Distributed task queue
- **Redis** - Message broker for Celery & Channels
- **Paramiko** - SSH client library
- **PostgreSQL** - Primary database (SQLite for dev)

## 🚦 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and npm
- **Python** 3.11+
- **PostgreSQL** 14+ (or SQLite for development)
- **Redis** 6+ (for Celery and WebSocket support)
- **Git**

### Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/io-net-tool.git
   cd io-net-tool/io-net-tool
   ```

2. **Set up environment variables**

   ```bash
   # Copy the example file (if exists) or create .env.local
   # See ENV_SETUP.md for detailed instructions
   ```

3. **Install frontend dependencies**

   ```bash
   npm install
   ```

4. **Set up database**

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev
   ```

5. **Set up backend**

   ```bash
   cd backend-django
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt

   cd ionetTool
   python manage.py makemigrations workers
   python manage.py migrate
   python manage.py createsuperuser
   ```

6. **Start Redis** (required for Celery and WebSockets)

   ```bash
   # On Linux/Mac
   redis-server

   # On Windows (using WSL or Docker)
   # Or install Redis for Windows
   ```

7. **Run the application**

   ```bash
   # From project root, run both frontend and backend
   npm run dev:all

   # Or run separately:
   # Terminal 1 - Frontend
   npm run dev

   # Terminal 2 - Backend (with WebSocket support)
   cd backend-django/ionetTool
   daphne -b 0.0.0.0 -p 8000 ionetTool.asgi:application

   # Terminal 3 - Celery Worker
   cd backend-django/ionetTool
   celery -A ionetTool worker -l INFO

   # Terminal 4 - Celery Beat (for scheduled tasks)
   cd backend-django/ionetTool
   celery -A ionetTool beat -l INFO
   ```

8. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api
   - Django Admin: http://localhost:8000/admin

## 🔑 Environment Variables

### Frontend (.env.local)

Create a `.env.local` file in the `io-net-tool` directory:

```env
# Database (REQUIRED)
DATABASE_URL="postgresql://user:password@localhost:5432/ionet_tool?schema=public"

# NextAuth (REQUIRED)
JWT_SECRET="your-random-secret-key-here"

# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:8000/api"
NEXT_PUBLIC_WS_URL="ws://localhost:8000/ws/status/"

# OAuth Providers (OPTIONAL)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
TWITTER_CLIENT_ID=""
TWITTER_CLIENT_SECRET=""
```

**See [ENV_SETUP.md](ENV_SETUP.md) for detailed setup instructions.**

### Backend

Create a `.env` file in `backend-django/ionetTool/`:

```env
# Django Settings
DJANGO_SECRET_KEY="your-django-secret-key-here"
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (if using PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/ionet_tool"

# Celery Configuration
CELERY_BROKER_URL="redis://localhost:6379/0"
CELERY_RESULT_BACKEND="redis://localhost:6379/0"

# Channels (WebSocket)
CHANNEL_LAYERS_REDIS="redis://localhost:6379/1"
```

## 📚 API Documentation

### REST API Endpoints

#### Dashboard

- `GET /api/dashboard/stats/` - Get dashboard statistics

#### Servers

- `GET /api/servers/` - List all servers
- `POST /api/servers/` - Add a new server
- `GET /api/servers/{id}/` - Get server details
- `PUT /api/servers/{id}/` - Update server
- `DELETE /api/servers/{id}/` - Delete a server
- `POST /api/servers/{id}/check_status/` - Check server status
- `POST /api/servers/{id}/check_workers/` - Check workers on server
- `POST /api/servers/{id}/setup_virtualization/` - Setup KVM/QEMU on server

#### Virtual Machines

- `GET /api/vms/` - List all VMs
- `POST /api/vms/` - Create a new VM
- `GET /api/vms/{id}/` - Get VM details
- `DELETE /api/vms/{id}/remove/` - Delete a VM
- `POST /api/vms/{id}/start/` - Start VM
- `POST /api/vms/{id}/stop/` - Stop VM
- `POST /api/vms/{id}/install_worker/` - Install io.net worker on VM

#### Workers

- `GET /api/workers/` - List all workers
- `GET /api/workers/{id}/` - Get worker details
- `POST /api/workers/{id}/start/` - Start worker container
- `POST /api/workers/{id}/stop/` - Stop worker container
- `POST /api/workers/{id}/restart/` - Restart worker container
- `GET /api/workers/{id}/logs/` - Get container logs

#### Bulk Operations

- `POST /api/check-all/` - Check all servers and workers
- `POST /api/install-worker/` - Install new worker
- `GET /api/status-logs/` - Get activity logs

### WebSocket API

Connect to `ws://localhost:8000/ws/status/` for real-time updates.

#### Message Types (Server → Client)

- `initial_data` - Sent on connection with current stats
- `status_update` - Sent when a status changes

#### Actions (Client → Server)

Send JSON messages to trigger actions:

```json
{"action": "refresh"}
{"action": "check_status", "server_id": "uuid"}
```

**For complete API documentation, see [Backend README](backend-django/ionetTool/README.md)**

## 🏗️ Architecture

### System Overview

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Next.js   │◄──HTTP──┤   Django     │◄──SSH───┤   Remote    │
│  Frontend   │         │   Backend    │         │   Servers   │
│             │◄──WS────┤              │         │             │
└─────────────┘         └──────┬───────┘         └─────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
              ┌─────▼─────┐         ┌─────▼─────┐
              │  Celery   │         │  Redis    │
              │  Worker   │         │  Broker   │
              └───────────┘         └───────────┘
```

### Data Flow

1. **User Action** → Frontend sends HTTP request to Django API
2. **Django API** → Executes business logic, updates database
3. **Celery Task** → Polls worker status periodically
4. **WebSocket** → Pushes real-time updates to frontend
5. **Frontend** → Updates UI with new status

## 🧪 Development

### Running Tests

```bash
# Backend tests
cd backend-django/ionetTool
python manage.py test

# Frontend tests (if configured)
npm test
```

### Code Quality

```bash
# Lint frontend
npm run lint

# Format code (if configured)
npm run format
```

### Database Migrations

```bash
# Frontend (Prisma)
npx prisma migrate dev
npx prisma generate

# Backend (Django)
cd backend-django/ionetTool
python manage.py makemigrations workers
python manage.py migrate
```

## 🐛 Troubleshooting

### Common Issues

**1. Database Connection Errors**

- Ensure PostgreSQL is running
- Verify `DATABASE_URL` in `.env.local` is correct
- Check database exists: `psql -l | grep ionet_tool`

**2. Prisma Client Not Found**

- Run `npx prisma generate` after schema changes
- Check `prisma.config.ts` paths are correct

**3. WebSocket Connection Failed**

- Ensure Daphne is running (not Django dev server)
- Check Redis is running for Channels
- Verify `NEXT_PUBLIC_WS_URL` matches backend URL

**4. Celery Tasks Not Running**

- Ensure Redis is running
- Check Celery worker is started
- Verify `CELERY_BROKER_URL` in backend `.env`

**5. SSH Connection Errors**

- Verify server credentials are correct
- Check SSH service is running on remote server
- Ensure firewall allows SSH connections

**6. OAuth Not Working**

- Verify redirect URIs match exactly
- Check OAuth credentials in `.env.local`
- Ensure callback URLs include correct port

### Getting Help

- Check [ENV_SETUP.md](ENV_SETUP.md) for environment setup
- Review [Backend README](backend-django/ionetTool/README.md) for API details
- Open an issue on GitHub with error logs

## 🛡️ Security

- **SSH Credentials**: Stored securely on backend, never exposed to frontend
- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **CORS**: Configured for development and production
- **Environment Variables**: Never commit `.env.local` or `.env` files
- **Input Validation**: Zod schemas on frontend, DRF serializers on backend

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `refactor:` - Code refactoring
- `test:` - Tests
- `chore:` - Maintenance

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- [io.net](https://www.io.net/) - Worker infrastructure
- [Next.js](https://nextjs.org/) - Frontend framework
- [Django](https://www.djangoproject.com/) - Backend framework
- All open-source contributors

---

**Made with ❤️ for the io.net community**
