# Cisco IOS RAG System - Backend

Python FastAPI backend for the Cisco IOS Documentation Discovery & RAG System.

## 🚀 Features

### Core Services
- **Document Discovery Service**: Automated web search and PDF discovery from trusted Cisco sources
- **Document Search Service**: RAG-powered search through Cisco documentation corpus
- **AI Agent Service**: LLM-powered document processing and intelligent analysis
- **Pipeline Manager**: Two-stage processing pipeline for document discovery and fine-tuning
- **System Configuration Service**: Database, API, and LLM configuration management
- **WebSocket Manager**: Real-time communication with frontend clients

### Advanced Capabilities
- **Multi-Source Discovery**: Support for cisco.com, ciscopress.com, and other trusted sources
- **Local File Processing**: Upload and process PDF, Excel, CSV, Word, and image files
- **Intelligent Deduplication**: Advanced document hash-based deduplication
- **Real-Time Progress**: WebSocket-based progress updates for all operations
- **Flexible Database Support**: SQLite, PostgreSQL, and Supabase integration
- **LLM Integration**: Support for both Groq API and local Ollama models

## 📋 Prerequisites

- **Python**: 3.8 or higher
- **pip**: Latest version
- **Virtual Environment**: Recommended for isolation
- **Optional**: PostgreSQL for production database
- **Optional**: Ollama for local LLM inference

## 🛠️ Installation

### Quick Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Create data directories
mkdir -p data/documents data/uploads

# Start the server
python main.py
```

### Detailed Installation

1. **Create Virtual Environment**
   ```bash
   python -m venv venv
   ```

2. **Activate Virtual Environment**
   ```bash
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your preferred settings
   ```

5. **Create Required Directories**
   ```bash
   mkdir -p data/documents
   mkdir -p data/uploads
   ```

## ⚙️ Configuration

### Environment Variables (.env)

```env
# Groq API Configuration (Optional - for enhanced AI features)
GROQ_API_KEY=your_groq_api_key_here

# Database Configuration
DATABASE_URL=sqlite:///./data/cisco_docs.db
POSTGRES_URL=postgresql://user:password@localhost/cisco_docs
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key

# Ollama Configuration (Optional - for local LLM)
OLLAMA_ENDPOINT=http://localhost:11434
OLLAMA_MODEL=llama2

# Server Configuration
HOST=0.0.0.0
PORT=8007
DEBUG=true

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5177,http://localhost:3000

# Storage Configuration
MAX_STORAGE_GB=10
DOCUMENT_RETENTION_DAYS=90
```

### Database Setup

#### SQLite (Default)
- **No setup required** - Database file created automatically
- **Location**: `./data/cisco_docs.db`
- **Best for**: Development, single-user scenarios

#### PostgreSQL
```bash
# Install PostgreSQL
# Ubuntu/Debian:
sudo apt-get install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb cisco_docs

# Create user
sudo -u postgres createuser --interactive

# Update .env with connection string
POSTGRES_URL=postgresql://username:password@localhost/cisco_docs
```

#### Supabase
1. Create project at [supabase.com](https://supabase.com)
2. Get project URL and anon key
3. Update `.env` with Supabase credentials

## 🚀 Running the Server

### Development Mode
```bash
# Standard run
python main.py

# With auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8007

# With debug logging
DEBUG=true python main.py
```

### Production Mode
```bash
# Install production server
pip install gunicorn

# Run with Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8007

# With custom configuration
gunicorn main:app -c gunicorn.conf.py
```

The server will start on `http://localhost:8007`

## 📡 API Endpoints

### REST API

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/` | Root endpoint | System information |
| GET | `/health` | Health check | Service status |
| GET | `/docs` | API documentation | Swagger UI |
| GET | `/redoc` | Alternative API docs | ReDoc UI |
| GET | `/api/documents` | Get discovered documents | Document list |
| GET | `/api/local-files` | Get processed local files | Local file list |
| GET | `/api/system/status` | Get system status | System status |

### WebSocket Endpoint

**Connection**: `ws://localhost:8007/ws/{client_id}`

#### Client to Server Messages

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

#### Available Actions

- **`document_discovery`** - Start document discovery process
- **`process_local_files`** - Process uploaded local files
- **`document_search`** - Search through documents
- **`ai_agent`** - Run AI agent for document processing
- **`download_document`** - Download specific document
- **`pipeline_stage1`** - Run pipeline stage 1 (document discovery)
- **`pipeline_stage2`** - Run pipeline stage 2 (fine-tuning data factory)
- **`system_config`** - Update system configuration
- **`get_status`** - Get current system status
- **`test_llm_connection`** - Test LLM connectivity
- **`check_document_updates`** - Check for document updates
- **`get_search_history`** - Get search history
- **`get_saved_searches`** - Get saved searches
- **`advanced_search`** - Perform advanced search with facets

#### Server to Client Messages

```json
{
  "type": "discovery_update",
  "step": "search_sources",
  "progress": 60,
  "message": "Searching trusted sources...",
  "status": "running",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🏗️ Architecture

### Service Layer Architecture

```
main.py (FastAPI App)
├── WebSocket Handler (/ws/{client_id})
├── REST API Endpoints
└── Services/
    ├── DocumentDiscoveryService
    │   ├── Web search and crawling
    │   ├── Document validation
    │   ├── Local file processing
    │   └── Deduplication
    ├── DocumentSearchService
    │   ├── RAG-powered search
    │   ├── Relevance scoring
    │   ├── Advanced filtering
    │   └── Search history
    ├── AIAgentService
    │   ├── Query generation
    │   ├── Result refinement
    │   ├── Document analysis
    │   └── LLM integration
    ├── PipelineManager
    │   ├── Stage 1: Document Discovery
    │   ├── Stage 2: Fine-tuning Data Factory
    │   └── Pipeline orchestration
    ├── SystemConfigService
    │   ├── Database configuration
    │   ├── API key management
    │   ├── LLM configuration
    │   └── System status
    └── WebSocketManager
        ├── Connection management
        ├── Message routing
        ├── Progress updates
        └── Error handling
```

### Data Flow

```
┌─────────────────┐    WebSocket     ┌─────────────────┐
│   Frontend      │ ◄─────────────► │ WebSocketManager│
│   Client        │                 │                 │
└─────────────────┘                 └─────────────────┘
                                             │
                                             ▼
                                    ┌─────────────────┐
                                    │ Message Router  │
                                    │ (main.py)       │
                                    └─────────────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    ▼                        ▼                        ▼
          ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
          │ Document        │      │ AI Agent        │      │ System Config   │
          │ Discovery       │      │ Service         │      │ Service         │
          └─────────────────┘      └─────────────────┘      └─────────────────┘
                    │                        │                        │
                    ▼                        ▼                        ▼
          ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
          │ Web Sources     │      │ LLM APIs        │      │ Database        │
          │ Local Files     │      │ (Groq/Ollama)   │      │ Configuration   │
          └─────────────────┘      └─────────────────┘      └─────────────────┘
```

## 🔧 Services Documentation

### DocumentDiscoveryService

**Purpose**: Automated discovery and processing of Cisco documentation

**Key Methods**:
- `discover_documents()` - Main discovery process
- `process_local_files()` - Process uploaded files
- `download_document()` - Download specific document
- `get_documents()` - Get discovered documents list

**Supported File Types**:
- PDF (.pdf)
- Excel (.xlsx, .xls)
- CSV (.csv)
- Word (.docx, .doc)
- Text (.txt)
- Images (.jpg, .jpeg, .png, .gif)

**Features**:
- Intelligent web crawling
- Document deduplication
- Text extraction from various formats
- Progress tracking
- Error handling and recovery

### DocumentSearchService

**Purpose**: RAG-powered search through document corpus

**Key Methods**:
- `search_documents()` - Main search function
- `search_with_facets()` - Advanced search with filters
- `get_search_history()` - Retrieve search history

**Features**:
- Natural language query processing
- Relevance scoring
- Faceted search
- Search history tracking
- Result caching

### AIAgentService

**Purpose**: Intelligent document processing and analysis

**Key Methods**:
- `run_agent()` - Main agent process
- `chat()` - LLM chat interface
- `generate_synthetic_data()` - Create training data

**Features**:
- Multi-step processing pipeline
- Query optimization
- Result refinement
- Progress tracking
- Error recovery

### SystemConfigService

**Purpose**: System configuration and management

**Key Methods**:
- `update_config()` - Update system configuration
- `get_system_status()` - Get current system status
- `test_llm_connection()` - Test LLM connectivity
- `manage_api_keys()` - API key management

**Features**:
- Database configuration
- API key management
- LLM provider configuration
- System health monitoring
- Configuration validation

## 🧪 Testing

### Running Tests

```bash
# Install test dependencies (included in requirements.txt)
pip install pytest pytest-asyncio

# Run all tests
pytest

# Run with coverage
pytest --cov=.

# Run specific test file
pytest tests/test_document_discovery.py

# Run with verbose output
pytest -v
```

### Test Structure

```
tests/
├── test_document_discovery.py
├── test_document_search.py
├── test_ai_agent.py
├── test_websocket_manager.py
├── test_system_config.py
└── conftest.py  # Test configuration
```

### Writing Tests

```python
import pytest
from services.document_discovery import DocumentDiscoveryService

@pytest.mark.asyncio
async def test_document_discovery():
    service = DocumentDiscoveryService()
    results = []
    
    async for update in service.discover_documents(
        topic="BGP",
        certification_level="CCNP",
        max_documents=2
    ):
        results.append(update)
    
    assert len(results) > 0
    assert results[-1]["status"] == "completed"
```

## 🔍 Debugging

### Enable Debug Logging

```bash
# Set environment variable
export DEBUG=true
python main.py

# Or inline
DEBUG=true python main.py
```

### Common Debug Scenarios

#### WebSocket Connection Issues
```python
# Add to websocket_manager.py
logger.debug(f"WebSocket message received: {message}")
logger.debug(f"Active connections: {len(self.active_connections)}")
```

#### Document Discovery Issues
```python
# Add to document_discovery.py
logger.debug(f"Search query: {query}")
logger.debug(f"Results found: {len(results)}")
logger.debug(f"Document validation: {doc}")
```

#### LLM Integration Issues
```python
# Add to ai_agent.py
logger.debug(f"LLM request: {messages}")
logger.debug(f"LLM response: {response}")
```

### Log Levels

- **DEBUG**: Detailed information for debugging
- **INFO**: General information about system operation
- **WARNING**: Warning messages for potential issues
- **ERROR**: Error messages for failures
- **CRITICAL**: Critical errors that may cause system failure

## 📊 Performance Optimization

### Database Optimization

```python
# Add database indexes
CREATE INDEX idx_documents_title ON documents(title);
CREATE INDEX idx_documents_source ON documents(source);
CREATE INDEX idx_documents_relevance ON documents(relevance);
```

### Async Optimization

```python
# Use async/await for I/O operations
async def process_documents(documents):
    tasks = [process_single_document(doc) for doc in documents]
    results = await asyncio.gather(*tasks)
    return results
```

### Memory Optimization

```python
# Use generators for large datasets
async def process_large_dataset():
    async for batch in get_document_batches():
        yield await process_batch(batch)
```

### Caching

```python
# Implement result caching
from functools import lru_cache

@lru_cache(maxsize=100)
def get_cached_search_results(query_hash):
    return search_results
```

## 🔒 Security

### API Key Security
- Store API keys in environment variables
- Never commit API keys to version control
- Use different keys for development and production
- Implement key rotation policies

### Input Validation
```python
from pydantic import BaseModel, validator

class DocumentRequest(BaseModel):
    topic: str
    max_documents: int = 4
    
    @validator('topic')
    def topic_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Topic cannot be empty')
        return v
    
    @validator('max_documents')
    def max_documents_limit(cls, v):
        if v > 20:
            raise ValueError('Maximum 20 documents allowed')
        return v
```

### File Upload Security
```python
# Validate file types
ALLOWED_EXTENSIONS = {'.pdf', '.xlsx', '.csv', '.txt'}

def validate_file_type(filename):
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"File type {ext} not allowed")
```

## 🚀 Production Deployment

### Docker Deployment

```dockerfile
# Dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8007

CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8007"]
```

```bash
# Build and run
docker build -t cisco-rag-backend .
docker run -p 8007:8007 -e GROQ_API_KEY=your_key cisco-rag-backend
```

### Environment Configuration

```env
# Production .env
DEBUG=false
HOST=0.0.0.0
PORT=8007

# Production database
DATABASE_URL=postgresql://user:password@prod-db:5432/cisco_docs

# Production API keys
GROQ_API_KEY=prod_groq_key
SUPABASE_URL=https://prod-project.supabase.co
SUPABASE_KEY=prod_supabase_key

# Security
ALLOWED_ORIGINS=https://yourdomain.com
MAX_STORAGE_GB=50
```

### Health Checks

```python
# Add to main.py
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "services": {
            "database": await check_database_health(),
            "llm": await check_llm_health(),
            "storage": await check_storage_health()
        }
    }
```

## 🤝 Contributing

### Development Setup

```bash
# Fork and clone repository
git clone https://github.com/yourusername/cisco-rag-backend.git
cd cisco-rag-backend/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install development dependencies
pip install -r requirements.txt
pip install black flake8 isort pytest-cov

# Install pre-commit hooks
pre-commit install
```

### Code Style

```bash
# Format code
black .

# Sort imports
isort .

# Lint code
flake8 .

# Type checking
mypy .
```

### Commit Guidelines

- Use conventional commit messages
- Add tests for new features
- Update documentation
- Ensure all tests pass

```bash
# Example commit messages
git commit -m "feat: add document deduplication service"
git commit -m "fix: resolve websocket connection timeout"
git commit -m "docs: update API documentation"
```

## 📞 Support

For backend-specific issues:

1. **Check Logs**: Review console output for error messages
2. **Verify Configuration**: Ensure `.env` file is properly configured
3. **Test Endpoints**: Use `/health` endpoint to verify service status
4. **Check Dependencies**: Ensure all requirements are installed
5. **Database Connection**: Verify database connectivity

### Common Issues

- **Port 8007 in use**: Change PORT in `.env` or kill existing process
- **Module not found**: Ensure virtual environment is activated
- **Database connection failed**: Check database configuration
- **API key invalid**: Verify API keys in `.env` file

---

**Backend Server Status**: ✅ Ready for Production

</initial_code>