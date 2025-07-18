"""
WebSocket Manager for real-time communication with frontend
"""

import json
import logging
from typing import Dict, Any
from fastapi import WebSocket
from datetime import datetime

logger = logging.getLogger(__name__)

class WebSocketManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str):
        """Accept WebSocket connection"""
        await websocket.accept()
        self.active_connections[client_id] = websocket
        logger.info(f"Client {client_id} connected")
    
    def disconnect(self, client_id: str):
        """Remove WebSocket connection"""
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            logger.info(f"Client {client_id} disconnected")
    
    async def send_message(self, client_id: str, message: Dict[str, Any]):
        """Send message to specific client"""
        if client_id in self.active_connections:
            try:
                # Add timestamp to all messages
                if isinstance(message, dict) and "timestamp" not in message:
                    message["timestamp"] = datetime.now().isoformat()
                    
                await self.active_connections[client_id].send_text(json.dumps(message))
                logger.debug(f"Message sent to {client_id}: {message.get('type', 'unknown')}") 
            except Exception as e:
                logger.error(f"Error sending message to {client_id}: {str(e)}")
                self.disconnect(client_id)
    
    async def send_error(self, client_id: str, error_message: str):
        """Send error message to client"""
        await self.send_message(client_id, {
            "type": "error",
            "message": error_message,
            "timestamp": str(datetime.now())
        })
    
    async def broadcast(self, message: Dict[str, Any]):
        """Broadcast message to all connected clients"""
        logger.info(f"Broadcasting message of type: {message.get('type', 'unknown')} to {len(self.active_connections)} clients")
        for client_id in list(self.active_connections.keys()):
            await self.send_message(client_id, message)
            
    async def send_progress_update(self, client_id: str, message_type: str, progress: int, status: str, details: str = None):
        """Helper method to send progress updates"""
        message = {
            "type": message_type,
            "progress": progress,
            "status": status,
            "timestamp": datetime.now().isoformat()
        }
        
        if details:
            message["details"] = details
            
        await self.send_message(client_id, message)
