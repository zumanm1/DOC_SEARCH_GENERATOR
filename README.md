# Cisco IOS Documentation Discovery & RAG System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.8%2B-blue.svg)](https://www.python.org/downloads/)
[![React](https://img.shields.io/badge/React-18.2%2B-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104%2B-green.svg)](https://fastapi.tiangolo.com/)

A comprehensive Python backend service with React frontend that discovers, indexes, and provides intelligent search across Cisco networking documentation. Leverages Groq's LLM API for natural language processing with complete offline capabilities.

## 🚀 Features

### Core Capabilities
- **Automated Document Discovery**: Intelligent web crawling and document discovery from trusted Cisco sources
- **AI-Powered Search**: LLM-enhanced search using Groq API with natural language query processing
- **Multi-Modal Operation**: Support for both online and offline operation modes
- **Flexible Database Support**: SQLite, PostgreSQL, and Supabase integration
- **Real-Time Communication**: WebSocket-based real-time updates between frontend and backend
- **Local File Processing**: Upload and process local PDF, Excel, CSV, Word, and image files
- **Document Management**: Comprehensive document lifecycle management with deduplication

### Advanced Features
- **RAG System**: Retrieval-Augmented Generation for enhanced document search and analysis
- **AI Agent**: Intelligent document processing and analysis agent
- **Pipeline Management**: Two-stage processing pipeline for document discovery and fine-tuning
- **System Configuration**: Comprehensive configuration management for databases, APIs, and LLM settings
- **Certification Level Filtering**: CCNA through CCIE-level content organization
- **Multi-Source Discovery**: Support for multiple trusted documentation sources

## 🏗️ Architecture Overview

### System Architecture
```
┌─────────────────┐    WebSocket/HTTP    ┌─────────────────┐
│   React Frontend │ ◄─────────────────► │ FastAPI Backend │
│   (Port 5173)    │                     │   (Port 8000)   │
└─────────────────┘                     └─────────────────┘
         │                                        │
         │                                        ├── Document Discovery
         │                                        ├── AI Agent Service
         │                                        ├── Document Search
         │                                        ├── Pipeline Manager
         │                                        ├── System Config
         │                                        └── WebSocket Manager
         │                                        │
         │                               ┌─────────────────┐
         │                               │   External APIs │
         │                               │                 │
         │                               ├── Groq LLM API │
         │                               ├── Ollama (Local)│
         │                               └── Web Sources   │
         │                                        │
         │                               ┌─────────────────┐
         │                               │    Databases    │
         │                               │                 │
         │                               ├── SQLite       │
         │                               ├── PostgreSQL   │
         │                               └── Supabase     │
```

### Frontend Architecture
```
src/
├── components/           # React Components
│   ├── Dashboard.tsx     # Main dashboard interface
│   ├── DocumentDiscovery.tsx  # Document discovery interface
│   ├── DocumentSearch.tsx     # Search interface
│   ├── AIAgent.tsx       # AI agent interface
│   ├── SystemConfiguration.tsx # System config
│   └── ui/              # Reusable UI components (ShadCN)
├── hooks/
│   └── useWebSocket.ts  # WebSocket communication hook
├── lib/
│   ├── groq-client.ts   # Groq API client (now backend-delegated)
│   ├── utils.ts         # Utility functions
│   └── web-search.ts    # Web search utilities
└── types/
    └── supabase.ts      # Database type definitions
```

### Backend Architecture
```
backend/
├── main.py              # FastAPI application entry point
├── services/            # Service layer
│   ├── document_discovery.py  # Document discovery service
│   ├── document_search.py     # Search service
│   ├── ai_agent.py           # AI agent service
│   ├── pipeline_manager.py   # Pipeline management
│   ├── system_config.py      # System configuration
│   └── websocket_manager.py  # WebSocket management
└── data/                # Data storage
    ├── documents/       # Downloaded documents
    └── uploads/         # Uploaded local files
```

## 📋 Prerequisites

### System Requirements
- **Python**: 3.8 or higher
- **Node.js**: 16.0 or higher
- **npm**: 8.0 or higher (or yarn/pnpm)
- **Operating System**: Windows, macOS, or Linux
- **Memory**: Minimum 4GB RAM (8GB recommended)
- **Storage**: At least 2GB free space

### API Keys (Optional but Recommended)
- **Groq API Key**: For enhanced LLM capabilities (get from [Groq Console](https://console.groq.com/))
- **Supabase**: For cloud database (optional, SQLite works offline)

## 🛠️ Installation & Setup

### Quick Start (Recommended)

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd cisco-ios-rag-system
   ```

2. **Backend Setup**
   ```bash
   cd backend
   
   # Create virtual environment
   python -m venv venv
   
   # Activate virtual environment
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Copy environment template
   cp .env.example .env
   
   # Edit .env file with your configuration (optional)
   # nano .env  # or use your preferred editor
   ```

3. **Frontend Setup**
   ```bash
   cd ..  # Back to root directory
   
   # Install dependencies
   npm install
   
   # Or if you prefer yarn:
   # yarn install
   ```

4. **Start the Application**
   
   **Terminal 1 - Backend Server:**
   ```bash
   cd backend
   python main.py
   ```
   
   **Terminal 2 - Frontend Development Server:**
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Frontend: http://localhost:5177
   - Backend API: http://localhost:8007
   - API Documentation: http://localhost:8007/docs

### Detailed Installation

#### Backend Installation

1. **Navigate to Backend Directory**
   ```bash
   cd backend
   ```

2. **Create and Activate Virtual Environment**
   ```bash
   # Create virtual environment
   python -m venv venv
   
   # Activate on Windows
   venv\Scripts\activate
   
   # Activate on macOS/Linux
   source venv/bin/activate
   ```

3. **Install Python Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Configuration**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit the .env file with your preferred settings
   # Most settings have sensible defaults and are optional
   ```

5. **Create Data Directories**
   ```bash
   mkdir -p data/documents data/uploads
   ```

6. **Start Backend Server**
   ```bash
   python main.py
   ```
   
   The backend server will start on `http://localhost:8007`

#### Frontend Installation

1. **Navigate to Root Directory**
   ```bash
   cd ..  # From backend directory
   ```

2. **Install Node.js Dependencies**
   ```bash
   npm install
   
   # Alternative package managers:
   # yarn install
   # pnpm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   
   # Alternative commands:
   # yarn dev
   # pnpm dev
   ```
   
   The frontend will start on `http://localhost:5177`

## 🔧 Configuration

### Backend Configuration (.env)

The backend uses environment variables for configuration. Copy `.env.example` to `.env` and modify as needed:

```env
# Groq API Configuration (Optional - for enhanced AI features)
GROQ_API_KEY=your_groq_api_key_here

# Database Configuration (SQLite is default and requires no setup)
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

### Frontend Configuration

The frontend automatically detects the backend server. No additional configuration is typically needed.

## 🚀 Usage Guide

### Getting Started

1. **Start Both Servers**: Ensure both backend (port 8007) and frontend (port 5177) are running
2. **Open Browser**: Navigate to http://localhost:5177
3. **Dashboard Overview**: The main dashboard provides access to all features

### Core Features

#### 1. Document Discovery
- **Purpose**: Automatically discover and download Cisco documentation
- **How to Use**:
  1. Navigate to "Document Discovery" tab
  2. Enter a topic (e.g., "BGP", "OSPF", "QoS")
  3. Select certification level (CCNA, CCNP, CCIE, or All)
  4. Choose maximum number of documents
  5. Click "Start Discovery"
  6. Monitor real-time progress
  7. Review and download discovered documents

#### 2. Document Search
- **Purpose**: Search through discovered and uploaded documents
- **How to Use**:
  1. Navigate to "Document Search" tab
  2. Enter natural language query
  3. Adjust relevance threshold and filters
  4. Click "Search Documents"
  5. Review search results with relevance scores
  6. Click on documents to view details

#### 3. AI Agent
- **Purpose**: Intelligent document processing and analysis
- **How to Use**:
  1. Navigate to "AI Agent" tab
  2. Enter your query or topic
  3. Select certification level
  4. Click "Run AI Agent"
  5. Monitor the multi-step process
  6. Review AI-refined results

#### 4. Local File Processing
- **Purpose**: Upload and process your own documents
- **Supported Formats**: PDF, Excel (.xlsx, .xls), CSV, Word (.docx, .doc), Text (.txt), Images (.jpg, .png, .gif)
- **How to Use**:
  1. Navigate to "Document Discovery" tab
  2. Click "Upload Local Files"
  3. Select files or drag and drop
  4. Monitor processing progress
  5. Files are automatically indexed for search

#### 5. System Configuration
- **Purpose**: Configure databases, API keys, and system settings
- **How to Use**:
  1. Navigate to "System Configuration" tab
  2. Configure database settings
  3. Add API keys (Groq, Supabase)
  4. Set operation mode (Online/Offline)
  5. Test LLM connections
  6. Save configuration

### Advanced Features

#### Pipeline Management
The system includes a two-stage processing pipeline:
- **Stage 1**: Document Discovery Agent
- **Stage 2**: Fine-Tuning Data Factory

#### WebSocket Communication
Real-time updates are provided through WebSocket connections:
- Progress updates during document discovery
- Search result streaming
- AI agent step-by-step progress
- System status notifications

## 🔌 API Reference

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Root endpoint with system info |
| GET | `/health` | Health check endpoint |
| GET | `/api/documents` | Get discovered documents |
| GET | `/api/local-files` | Get processed local files |
| GET | `/api/system/status` | Get system status |

### WebSocket Endpoint

**Connection**: `ws://localhost:8007/ws/{client_id}`

#### Message Format (Client to Server)
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
- `document_discovery` - Start document discovery
- `process_local_files` - Process uploaded files
- `document_search` - Search documents
- `ai_agent` - Run AI agent
- `download_document` - Download specific document
- `pipeline_stage1` - Run pipeline stage 1
- `pipeline_stage2` - Run pipeline stage 2
- `system_config` - Update system configuration
- `get_status` - Get system status
- `test_llm_connection` - Test LLM connectivity

#### Message Format (Server to Client)
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

## 🗄️ Database Support

### SQLite (Default)
- **Setup**: No additional setup required
- **Location**: `./backend/data/cisco_docs.db`
- **Use Case**: Development, single-user, offline operation

### PostgreSQL
- **Setup**: Install PostgreSQL server
- **Configuration**: Update `POSTGRES_URL` in `.env`
- **Use Case**: Production, multi-user, high performance

### Supabase
- **Setup**: Create Supabase project
- **Configuration**: Update `SUPABASE_URL` and `SUPABASE_KEY` in `.env`
- **Use Case**: Cloud deployment, managed database

## 🤖 LLM Integration

### Groq API (Recommended)
- **Setup**: Get API key from [Groq Console](https://console.groq.com/)
- **Models**: llama-3.3-70b-versatile, mixtral-8x7b-32768
- **Features**: Fast inference, high quality responses
- **Configuration**: Set `GROQ_API_KEY` in `.env`

### Ollama (Local)
- **Setup**: Install Ollama locally
- **Models**: llama2, codellama, mistral
- **Features**: Complete offline operation, privacy
- **Configuration**: Set `OLLAMA_ENDPOINT` in `.env`

## 🔧 Development

#### Development Environment
- **Frontend**: Vite dev server (port 5177)
- **Backend**: FastAPI dev server (port 8007)

### Backend Development

```bash
cd backend

# Install development dependencies
pip install -r requirements.txt

# Run with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Run tests
pytest

# Code formatting
black .
flake8 .
```

### Frontend Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Type checking
npm run type-check
```

### Adding New Features

1. **Backend Services**: Add new services in `backend/services/`
2. **Frontend Components**: Add new components in `src/components/`
3. **WebSocket Actions**: Add new actions in `main.py` and corresponding handlers
4. **Database Models**: Update database schemas as needed

## 🚀 Production Deployment

### Backend Deployment

```bash
# Install production server
pip install gunicorn

# Run with Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8007

# Or use Docker
docker build -t cisco-rag-backend .
docker run -p 8007:8007 cisco-rag-backend
```

### Frontend Deployment

```bash
# Build for production
npm run build

# Serve static files
npm install -g serve
serve -s dist -l 3000

# Or deploy to Vercel, Netlify, etc.
```

### Environment Variables for Production

```env
# Production settings
DEBUG=false
HOST=0.0.0.0
PORT=8007
ALLOWED_ORIGINS=https://yourdomain.com

# Use production database
DATABASE_URL=postgresql://user:password@prod-db:5432/cisco_docs

# Production API keys
GROQ_API_KEY=your_production_groq_key
SUPABASE_URL=https://your-prod-project.supabase.co
SUPABASE_KEY=your_production_supabase_key
```

## 🔍 Troubleshooting

### Common Issues

#### Backend Won't Start
- **Check Python Version**: Ensure Python 3.8+
- **Virtual Environment**: Ensure virtual environment is activated
- **Dependencies**: Run `pip install -r requirements.txt`
- **Port Conflicts**: Check if port 8007 is available

#### Frontend Won't Connect to Backend
- **Backend Running**: Ensure backend is running on port 8007
- **CORS Issues**: Check `ALLOWED_ORIGINS` in backend `.env`
- **WebSocket Connection**: Check browser console for WebSocket errors

#### Document Discovery Not Working
- **Internet Connection**: Ensure stable internet connection
- **API Keys**: Check if Groq API key is valid (optional but recommended)
- **Firewall**: Ensure outbound connections are allowed

#### File Upload Issues
- **File Size**: Check file size limits
- **File Format**: Ensure file format is supported
- **Permissions**: Check write permissions in `backend/data/uploads/`

### Debug Mode

Enable debug mode for detailed logging:

```bash
# Backend debug mode
export DEBUG=true
python main.py

# Frontend debug mode
export NODE_ENV=development
npm run dev
```

### Logs

- **Backend Logs**: Console output when running `python main.py`
- **Frontend Logs**: Browser console (F12 → Console)
- **WebSocket Logs**: Check browser Network tab for WebSocket messages

## 📊 Performance Optimization

### Backend Optimization
- **Database Indexing**: Add indexes for frequently queried fields
- **Caching**: Implement Redis caching for search results
- **Async Processing**: Use background tasks for long-running operations
- **Connection Pooling**: Configure database connection pooling

### Frontend Optimization
- **Code Splitting**: Implement route-based code splitting
- **Lazy Loading**: Lazy load components and images
- **Memoization**: Use React.memo and useMemo for expensive operations
- **Bundle Analysis**: Analyze bundle size with `npm run build --analyze`

## 🔒 Security Considerations

### API Security
- **API Keys**: Store API keys securely, never in frontend code
- **CORS**: Configure CORS properly for production
- **Rate Limiting**: Implement rate limiting for API endpoints
- **Input Validation**: Validate all user inputs

### File Upload Security
- **File Type Validation**: Validate file types and extensions
- **File Size Limits**: Implement file size limits
- **Virus Scanning**: Consider virus scanning for uploaded files
- **Sandboxing**: Process files in isolated environment

## 🤝 Contributing

1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Commit Changes**: `git commit -m 'Add amazing feature'`
4. **Push to Branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines
- Follow PEP 8 for Python code
- Use TypeScript for new frontend code
- Add tests for new features
- Update documentation
- Follow conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Groq**: For providing fast LLM inference API
- **FastAPI**: For the excellent Python web framework
- **React**: For the powerful frontend framework
- **ShadCN/UI**: For beautiful UI components
- **Cisco**: For comprehensive networking documentation

## 📞 Support

For support, please:
1. Check this README for common solutions
2. Search existing GitHub issues
3. Create a new issue with detailed information
4. Include logs and error messages

## 🗺️ Roadmap

### Upcoming Features
- [ ] Advanced document analysis with computer vision
- [ ] Multi-language support
- [ ] Enhanced AI agent capabilities
- [ ] Mobile application
- [ ] Advanced analytics dashboard
- [ ] Integration with more documentation sources
- [ ] Collaborative features
- [ ] Advanced search filters
- [ ] Document version tracking
- [ ] Export capabilities

---

**Built with ❤️ for the Cisco networking community**