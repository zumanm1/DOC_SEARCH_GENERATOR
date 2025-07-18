# Cisco IOS RAG System - Backend

Python FastAPI backend for the Cisco IOS Documentation Discovery & RAG System.

## Features

- **Document Discovery**: Automated web search and PDF discovery
- **Document Search**: RAG-powered search through Cisco documentation
- **AI Agent**: LLM-powered document processing and analysis
- **Pipeline Management**: Two-stage processing pipeline
- **System Configuration**: Database, API, and LLM configuration
- **WebSocket Communication**: Real-time updates to frontend

## Installation

1. **Clone and setup**:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Environment Configuration**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Run the server**:
```bash
python main.py
```

The server will start on `http://localhost:8000`

## API Endpoints

### REST API
- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /api/documents` - Get discovered documents
- `GET /api/system/status` - Get system status

### WebSocket
- `WS /ws/{client_id}` - WebSocket connection for real-time communication

## WebSocket Message Format

### Client to Server
```json
{
  "action": "document_discovery",
  "data": {
    "topic": "BGP",
    "certification_level": "CCNP",
    "max_documents": 4,
    "sources": ["cisco.com", "ciscopress.com"],
    "use_ai_agent": true
  }
}
```

### Server to Client
```json
{
  "type": "discovery_update",
  "step": "search_sources",
  "progress": 60,
  "message": "Searching trusted sources...",
  "status": "running"
}
```

## Available Actions

- `document_discovery` - Start document discovery process
- `document_search` - Search through documents
- `ai_agent` - Run AI agent for document processing
- `pipeline_stage1` - Run pipeline stage 1 (document discovery)
- `pipeline_stage2` - Run pipeline stage 2 (fine-tuning data factory)
- `system_config` - Update system configuration
- `get_status` - Get current system status

## Services

### DocumentDiscoveryService
Handles automated discovery of Cisco documentation from trusted sources.

### DocumentSearchService
Provides RAG-powered search functionality through the document corpus.

### AIAgentService
LLM-powered agent for intelligent document processing and analysis.

### PipelineManager
Manages the two-stage processing pipeline:
- Stage 1: Document Discovery Agent
- Stage 2: Fine-Tuning Data Factory

### SystemConfigService
Handles system configuration including database, API keys, and LLM settings.

### WebSocketManager
Manages WebSocket connections and real-time communication with frontend.

## Configuration

### Database Support
- SQLite (default)
- PostgreSQL
- Supabase

### LLM Providers
- Groq (cloud API)
- Ollama (local)

### Operation Modes
- Online: Full internet access
- Offline: Local-only operation

## Development

### Running in Development
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Testing
```bash
pytest
```

### Logging
Logs are configured to INFO level by default. Adjust in `main.py`.

## Production Deployment

1. **Install production dependencies**:
```bash
pip install gunicorn
```

2. **Run with Gunicorn**:
```bash
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

3. **Environment Variables**:
Set all required environment variables in production.

## Architecture

The backend follows a service-oriented architecture:

```
main.py (FastAPI app)
├── services/
│   ├── document_discovery.py
│   ├── document_search.py
│   ├── ai_agent.py
│   ├── pipeline_manager.py
│   ├── system_config.py
│   └── websocket_manager.py
└── data/ (storage)
```

## WebSocket Communication Flow

1. Frontend connects to `/ws/{client_id}`
2. Frontend sends action messages
3. Backend routes to appropriate service
4. Service processes and sends real-time updates
5. Frontend receives updates and updates UI

This architecture ensures the frontend remains purely presentational while all processing happens in the Python backend.
