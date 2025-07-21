# Cisco IOS RAG System - Scripts Guide

This directory contains convenient scripts to start and stop the Cisco IOS RAG System.

## 📁 Available Scripts

### 🚀 `start_app.sh` - Start the Application
This script will:
1. **Clean up ports** - Kill any existing processes on ports 8007 and 5177
2. **Start Backend** - Activate virtual environment and start FastAPI server on port 8007
3. **Start Frontend** - Start Vite development server on port 5177
4. **Monitor** - Keep both servers running and handle graceful shutdown

### 🛑 `stop_app.sh` - Stop the Application
This script will:
1. **Kill processes** - Stop all processes running on ports 8007 and 5177
2. **Clean up** - Ensure ports are free for future use

## 🎯 Usage

### Starting the Application
```bash
# From the project root directory
./start_app.sh
```

### Stopping the Application
```bash
# From the project root directory
./stop_app.sh
```

### Manual Stop (Alternative)
You can also stop the application by pressing `Ctrl+C` when running `start_app.sh`

## 🌐 Access Points

Once the application is running, you can access:

- **Frontend**: http://localhost:5177
- **Backend API**: http://localhost:8007
- **API Documentation**: http://localhost:8007/docs

## ⚠️ Prerequisites

Before running the scripts, ensure:

1. **Backend Setup**:
   - Python 3.8+ installed
   - Virtual environment created and dependencies installed
   - Data directories exist (`backend/data/documents`, `backend/data/uploads`)

2. **Frontend Setup**:
   - Node.js 16+ installed
   - Dependencies installed (`npm install`)

## 🔧 Troubleshooting

### Port Already in Use
If you get "port already in use" errors:
```bash
# Use the stop script
./stop_app.sh

# Or manually kill processes
sudo lsof -ti:8007 | xargs kill -9
sudo lsof -ti:5177 | xargs kill -9
```

### Virtual Environment Issues
If the backend fails to start:
```bash
cd backend
source venv/bin/activate
python main.py
```

### Frontend Dependencies
If the frontend fails to start:
```bash
npm install
npm run dev
```

## 📝 Script Features

### `start_app.sh` Features:
- ✅ Automatic port cleanup
- ✅ Virtual environment activation
- ✅ Dependency checking
- ✅ Process monitoring
- ✅ Graceful shutdown handling
- ✅ Status reporting
- ✅ Error handling

### `stop_app.sh` Features:
- ✅ Force kill processes on specified ports
- ✅ Status reporting
- ✅ Clean shutdown

## 🎨 Customization

You can modify the scripts to:
- Change default ports
- Add additional startup checks
- Customize startup messages
- Add logging functionality
- Integrate with systemd services

## 📊 Monitoring

The scripts provide real-time feedback:
- 🚀 Starting processes
- ✅ Success confirmations
- ❌ Error messages
- 🔄 Status updates
- 🛑 Shutdown progress 