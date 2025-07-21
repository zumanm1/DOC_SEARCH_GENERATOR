#!/bin/bash

# Cisco IOS RAG System - Startup Script
# This script kills processes on ports 8007 and 5177, then starts backend and frontend

echo "🚀 Starting Cisco IOS RAG System..."
echo "=================================="

# Function to kill process on a specific port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo "🔄 Killing process on port $port (PID: $pid)"
        kill -9 $pid
        sleep 2
    else
        echo "✅ Port $port is already free"
    fi
}

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "❌ Port $port is still in use"
        return 1
    else
        echo "✅ Port $port is available"
        return 0
    fi
}

# Clean up ports
echo ""
echo "🧹 Cleaning up ports..."
echo "----------------------"

kill_port 8007
kill_port 5177

# Wait a moment for processes to fully terminate
sleep 3

# Verify ports are free
echo ""
echo "🔍 Verifying ports are available..."
echo "-----------------------------------"

if ! check_port 8007; then
    echo "❌ Failed to free port 8007. Please check manually."
    exit 1
fi

if ! check_port 5177; then
    echo "❌ Failed to free port 5177. Please check manually."
    exit 1
fi

echo ""
echo "✅ Ports are ready!"

# Function to start backend
start_backend() {
    echo ""
    echo "🐍 Starting Backend Server..."
    echo "----------------------------"
    
    # Check if we're in the backend directory
    if [ ! -f "main.py" ]; then
        echo "❌ Error: main.py not found. Please run this script from the project root."
        exit 1
    fi
    
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        echo "❌ Error: Virtual environment not found. Please run setup first."
        exit 1
    fi
    
    # Activate virtual environment and start backend
    echo "🔧 Activating virtual environment..."
    source venv/bin/activate
    
    echo "🚀 Starting FastAPI server on port 8007..."
    echo "📖 API Documentation will be available at: http://localhost:8007/docs"
    
    # Start backend in background
    python main.py &
    BACKEND_PID=$!
    
    # Wait for backend to start
    echo "⏳ Waiting for backend to start..."
    sleep 5
    
    # Check if backend is running
    if check_port 8007; then
        echo "✅ Backend started successfully (PID: $BACKEND_PID)"
    else
        echo "❌ Backend failed to start"
        exit 1
    fi
}

# Function to start frontend
start_frontend() {
    echo ""
    echo "⚛️  Starting Frontend Server..."
    echo "-------------------------------"
    
    # Navigate to project root
    cd ..
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        echo "❌ Error: package.json not found. Please run this script from the project root."
        exit 1
    fi
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "⚠️  Node modules not found. Installing dependencies..."
        npm install
    fi
    
    echo "🚀 Starting Vite development server on port 5177..."
    echo "🌐 Frontend will be available at: http://localhost:5177"
    
    # Start frontend in background
    npm run dev &
    FRONTEND_PID=$!
    
    # Wait for frontend to start
    echo "⏳ Waiting for frontend to start..."
    sleep 8
    
    # Check if frontend is running
    if check_port 5177; then
        echo "✅ Frontend started successfully (PID: $FRONTEND_PID)"
    else
        echo "❌ Frontend failed to start"
        exit 1
    fi
}

# Function to handle cleanup on script exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    echo "---------------------------"
    
    if [ ! -z "$BACKEND_PID" ]; then
        echo "🔄 Stopping backend (PID: $BACKEND_PID)"
        kill -TERM $BACKEND_PID 2>/dev/null
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        echo "🔄 Stopping frontend (PID: $FRONTEND_PID)"
        kill -TERM $FRONTEND_PID 2>/dev/null
    fi
    
    # Kill any remaining processes on our ports
    kill_port 8007
    kill_port 5177
    
    echo "✅ Cleanup completed"
    exit 0
}

# Set up signal handlers for cleanup
trap cleanup SIGINT SIGTERM

# Start the application
echo ""
echo "🎯 Starting Cisco IOS RAG System..."
echo "=================================="

# Start backend first
start_backend

# Start frontend
start_frontend

echo ""
echo "🎉 Cisco IOS RAG System is now running!"
echo "======================================="
echo "🌐 Frontend: http://localhost:5177"
echo "📖 Backend API: http://localhost:8007"
echo "📚 API Docs: http://localhost:8007/docs"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Keep script running and wait for interrupt
wait 