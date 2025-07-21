#!/bin/bash

# Cisco IOS RAG System - Stop Script
# This script kills processes on ports 8007 and 5177

echo "🛑 Stopping Cisco IOS RAG System..."
echo "=================================="

# Function to kill process on a specific port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo "🔄 Killing process on port $port (PID: $pid)"
        kill -9 $pid
        sleep 2
        echo "✅ Process on port $port stopped"
    else
        echo "✅ Port $port is already free"
    fi
}

echo ""
echo "🧹 Cleaning up ports..."
echo "----------------------"

kill_port 8007
kill_port 5177

echo ""
echo "✅ All servers stopped!"
echo "======================" 