#!/usr/bin/env python3
"""
Cisco IOS Documentation Discovery & RAG System - Backend Server
FastAPI + WebSockets backend for the React frontend
"""

import asyncio
import json
import logging
import os
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Import our service modules
from services.document_discovery import DocumentDiscoveryService
from services.document_search import DocumentSearchService
from services.ai_agent import AIAgentService
from services.system_config import SystemConfigService
from services.pipeline_manager import PipelineManager
from services.websocket_manager import WebSocketManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Cisco IOS RAG System Backend",
    description="Backend API for Cisco IOS Documentation Discovery & RAG System",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],  # React dev servers and any origin for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
document_discovery = DocumentDiscoveryService()
document_search = DocumentSearchService()
ai_agent = AIAgentService()
system_config = SystemConfigService()
pipeline_manager = PipelineManager()
websocket_manager = WebSocketManager()

# Pydantic models for request/response
class DocumentDiscoveryRequest(BaseModel):
    topic: str
    certification_level: str = "all"
    max_documents: int = 4
    sources: List[str] = []
    use_ai_agent: bool = False

class DocumentSearchRequest(BaseModel):
    query: str
    relevance_threshold: int = 70
    cert_level: str = "all"
    doc_type: str = "all"
    software_type: str = "Cisco IOS"
    date_range: str = "all"
    use_ai_agent: bool = False

class PipelineRequest(BaseModel):
    stage: int  # 1 or 2
    pdf_files: List[str] = []
    output_phase: int = 1
    config: Dict[str, Any] = {}

class SystemConfigRequest(BaseModel):
    database_type: str
    operation_mode: str
    api_keys: Dict[str, str] = {}
    llm_config: Dict[str, Any] = {}

# WebSocket endpoint for real-time communication
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket_manager.connect(websocket, client_id)
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Route message to appropriate service
            await handle_websocket_message(client_id, message)
            
    except WebSocketDisconnect:
        websocket_manager.disconnect(client_id)
        logger.info(f"Client {client_id} disconnected")
    except Exception as e:
        logger.error(f"WebSocket error for client {client_id}: {str(e)}")
        await websocket_manager.send_error(client_id, str(e))

async def handle_websocket_message(client_id: str, message: Dict[str, Any]):
    """Route WebSocket messages to appropriate handlers"""
    try:
        action = message.get("action")
        data = message.get("data", {})
        
        if action == "document_discovery":
            await handle_document_discovery(client_id, data)
        elif action == "process_local_files":
            await handle_process_local_files(client_id, data)
        elif action == "document_search":
            await handle_document_search(client_id, data)
        elif action == "ai_agent":
            await handle_ai_agent(client_id, data)
        elif action == "download_document":
            await handle_document_download(client_id, data)
        elif action == "pipeline_stage1":
            await handle_pipeline_stage1(client_id, data)
        elif action == "pipeline_stage2":
            await handle_pipeline_stage2(client_id, data)
        elif action == "system_config":
            await handle_system_config(client_id, data)
        elif action == "get_status":
            await handle_get_status(client_id, data)
        elif action == "test_llm_connection":
            await handle_test_llm_connection(client_id, data)
        elif action == "check_document_updates":
            await handle_check_document_updates(client_id, data)
        elif action == "get_search_history":
            await handle_get_search_history(client_id, data)
        elif action == "get_saved_searches":
            await handle_get_saved_searches(client_id, data)
        elif action == "advanced_search":
            await handle_advanced_search(client_id, data)
        else:
            await websocket_manager.send_error(client_id, f"Unknown action: {action}")
            
    except Exception as e:
        logger.error(f"Error handling message: {str(e)}")
        await websocket_manager.send_error(client_id, str(e))

async def handle_document_discovery(client_id: str, data: Dict[str, Any]):
    """Handle document discovery requests"""
    try:
        # Send initial status
        await websocket_manager.send_message(client_id, {
            "type": "discovery_status",
            "status": "starting",
            "message": "Starting document discovery..."
        })
        
        # Start discovery process
        async for update in document_discovery.discover_documents(
            topic=data.get("topic", ""),
            certification_level=data.get("certification_level", "all"),
            max_documents=data.get("max_documents", 4),
            sources=data.get("sources", []),
            use_ai_agent=data.get("use_ai_agent", False)
        ):
            await websocket_manager.send_message(client_id, {
                "type": "discovery_update",
                **update
            })
            
    except Exception as e:
        await websocket_manager.send_error(client_id, f"Discovery error: {str(e)}")

async def handle_document_search(client_id: str, data: Dict[str, Any]):
    """Handle document search requests"""
    try:
        # Send initial status
        await websocket_manager.send_message(client_id, {
            "type": "search_status",
            "status": "starting",
            "message": "Starting document search..."
        })
        
        # Perform search
        results = await document_search.search_documents(
            query=data.get("query", ""),
            relevance_threshold=data.get("relevance_threshold", 70),
            cert_level=data.get("cert_level", "all"),
            doc_type=data.get("doc_type", "all"),
            software_type=data.get("software_type", "Cisco IOS"),
            use_ai_agent=data.get("use_ai_agent", False)
        )
        
        await websocket_manager.send_message(client_id, {
            "type": "search_results",
            "results": results
        })
        
    except Exception as e:
        await websocket_manager.send_error(client_id, f"Search error: {str(e)}")

async def handle_ai_agent(client_id: str, data: Dict[str, Any]):
    """Handle AI agent requests"""
    try:
        # Start AI agent process
        async for update in ai_agent.run_agent(
            query=data.get("query", ""),
            certification_level=data.get("certification_level", "all"),
            max_documents=data.get("max_documents", 4)
        ):
            await websocket_manager.send_message(client_id, {
                "type": "ai_agent_update",
                **update
            })
            
    except Exception as e:
        await websocket_manager.send_error(client_id, f"AI Agent error: {str(e)}")
        
# Handle document download requests
async def handle_document_download(client_id: str, data: Dict[str, Any]):
    """Handle document download requests"""
    try:
        document_id = data.get("document_id")
        document = data.get("document")
        
        if not document_id or not document:
            raise ValueError("Missing document_id or document data")
            
        # Send initial status
        await websocket_manager.send_message(client_id, {
            "type": "document_download_update",
            "document_id": document_id,
            "status": "downloading",
            "progress": 0
        })
        
        # Process download through AI agent service
        result = await ai_agent.download_document(document_id, document)
        
        # Send final status
        await websocket_manager.send_message(client_id, {
            "type": "document_download_update",
            "document_id": document_id,
            "status": "completed",
            "progress": 100,
            "result": result
        })
        
    except Exception as e:
        await websocket_manager.send_message(client_id, {
            "type": "document_download_update",
            "document_id": data.get("document_id"),
            "status": "failed",
            "error": str(e)
        })
        
# Handle LLM test connection requests
async def handle_test_llm_connection(client_id: str, data: Dict[str, Any]):
    """Handle LLM test connection requests"""
    try:
        provider = data.get("provider", "groq")
        questions = data.get("questions", [])
        
        if not questions:
            questions = [
                "What is the capital city of France?",
                "What is 2 + 2?",
                "Name one planet in our solar system.",
                "What color do you get when you mix red and blue?"
            ]
            
        # Run test through system config service
        results = await system_config.test_llm_connection(provider)
        
        # Send results
        await websocket_manager.send_message(client_id, {
            "type": "llm_test_results",
            "results": results.get("results", [])
        })
        
    except Exception as e:
        await websocket_manager.send_error(client_id, f"LLM test error: {str(e)}")

async def handle_pipeline_stage1(client_id: str, data: Dict[str, Any]):
    """Handle pipeline stage 1 (document discovery)"""
    try:
        async for update in pipeline_manager.run_stage1(
            topic=data.get("topic", ""),
            config=data.get("config", {})
        ):
            await websocket_manager.send_message(client_id, {
                "type": "pipeline_stage1_update",
                **update
            })
            
    except Exception as e:
        await websocket_manager.send_error(client_id, f"Pipeline Stage 1 error: {str(e)}")

async def handle_pipeline_stage2(client_id: str, data: Dict[str, Any]):
    """Handle pipeline stage 2 (fine-tuning data factory)"""
    try:
        async for update in pipeline_manager.run_stage2(
            pdf_files=data.get("pdf_files", []),
            output_phase=data.get("output_phase", 1),
            config=data.get("config", {})
        ):
            await websocket_manager.send_message(client_id, {
                "type": "pipeline_stage2_update",
                **update
            })
            
    except Exception as e:
        await websocket_manager.send_error(client_id, f"Pipeline Stage 2 error: {str(e)}")

async def handle_system_config(client_id: str, data: Dict[str, Any]):
    """Handle system configuration requests"""
    try:
        request_type = data.get("request")
        
        if request_type == "update_config":
            result = await system_config.update_config(
                database_type=data.get("database_type"),
                operation_mode=data.get("operation_mode"),
                api_keys=data.get("api_keys", {}),
                llm_config=data.get("llm_config", {})
            )
            
        elif request_type == "get_api_keys":
            result = await system_config.get_api_keys()
            
        elif request_type == "save_api_key":
            result = await system_config.save_api_key(data.get("key_data", {}))
            
        elif request_type == "delete_api_key":
            result = await system_config.delete_api_key(data.get("key_id"))
            
        elif request_type == "set_active_api_key":
            result = await system_config.set_active_api_key(data.get("key_id"))
            
        else:
            result = await system_config.update_config(
                database_type=data.get("database_type"),
                operation_mode=data.get("operation_mode"),
                api_keys=data.get("api_keys", {}),
                llm_config=data.get("llm_config", {})
            )
        
        await websocket_manager.send_message(client_id, {
            "type": "config_updated",
            "result": result
        })
        
    except Exception as e:
        await websocket_manager.send_error(client_id, f"Config error: {str(e)}")

async def handle_get_status(client_id: str, data: Dict[str, Any]):
    """Handle status requests"""
    try:
        status = await system_config.get_system_status()
        
        await websocket_manager.send_message(client_id, {
            "type": "system_status",
            "status": status
        })
        
    except Exception as e:
        await websocket_manager.send_error(client_id, f"Status error: {str(e)}")

async def handle_check_document_updates(client_id: str, data: Dict[str, Any]):
    """Handle document update check requests"""
    try:
        result = await system_config.check_document_updates()
        
        await websocket_manager.send_message(client_id, {
            "type": "document_updates_checked",
            "result": result
        })
        
    except Exception as e:
        await websocket_manager.send_error(client_id, f"Document update check error: {str(e)}")

async def handle_get_search_history(client_id: str, data: Dict[str, Any]):
    """Handle search history requests"""
    try:
        result = await system_config.get_search_history()
        
        await websocket_manager.send_message(client_id, {
            "type": "search_history",
            "result": result
        })
        
    except Exception as e:
        await websocket_manager.send_error(client_id, f"Search history error: {str(e)}")

async def handle_get_saved_searches(client_id: str, data: Dict[str, Any]):
    """Handle saved searches requests"""
    try:
        result = await system_config.get_saved_searches()
        
        await websocket_manager.send_message(client_id, {
            "type": "saved_searches",
            "result": result
        })
        
    except Exception as e:
        await websocket_manager.send_error(client_id, f"Saved searches error: {str(e)}")

async def handle_advanced_search(client_id: str, data: Dict[str, Any]):
    """Handle advanced search with facets"""
    try:
        result = await document_search.search_with_facets(
            query=data.get("query", ""),
            facets=data.get("facets", {}),
            date_range=data.get("date_range"),
            sort_by=data.get("sort_by", "relevance")
        )
        
        await websocket_manager.send_message(client_id, {
            "type": "advanced_search_results",
            "result": result
        })
        
    except Exception as e:
        await websocket_manager.send_error(client_id, f"Advanced search error: {str(e)}")

async def handle_process_local_files(client_id: str, data: Dict[str, Any]):
    """Handle local file processing requests"""
    try:
        # Send initial status
        await websocket_manager.send_message(client_id, {
            "type": "local_files_status",
            "status": "starting",
            "message": "Starting local file processing..."
        })
        
        # Start file processing
        async for update in document_discovery.process_local_files(
            files_data=data.get("files", []),
            directory_path=data.get("directory_path")
        ):
            await websocket_manager.send_message(client_id, {
                "type": "local_files_update",
                **update
            })
            
    except Exception as e:
        await websocket_manager.send_error(client_id, f"Local file processing error: {str(e)}")

# REST API endpoints for basic operations
@app.get("/")
async def root():
    return {
        "message": "Cisco IOS RAG System Backend",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "document_discovery": "active",
            "document_search": "active",
            "ai_agent": "active",
            "pipeline_manager": "active",
            "system_config": "active"
        }
    }

@app.get("/api/documents")
async def get_documents():
    """Get list of discovered documents"""
    return await document_discovery.get_documents()

@app.get("/api/local-files")
async def get_local_files():
    """Get list of processed local files"""
    return await document_discovery.get_local_files()

@app.get("/api/system/status")
async def get_system_status():
    """Get current system status"""
    return await system_config.get_system_status()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
