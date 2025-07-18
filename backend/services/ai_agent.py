"""
AI Agent Service - Migrated from frontend AIAgent.tsx
"""

import asyncio
import logging
from typing import Dict, List, Any, AsyncGenerator
from datetime import datetime
import json
import hashlib

logger = logging.getLogger(__name__)

class AIAgentService:
    def __init__(self):
        self.groq_client = None  # Will be initialized with API key
        self.ollama_endpoint = "http://localhost:11434"
        self.prefer_ollama = True
        self.discovered_documents = []
        self.document_hashes = set()
    
    async def run_agent(self, query: str, certification_level: str = "all",
                       max_documents: int = 4) -> AsyncGenerator[Dict[str, Any], None]:
        """Run the AI agent process"""
        
        steps = [
            {"id": "init", "name": "Initialize AI Agent", "status": "pending", "progress": 0},
            {"id": "generate", "name": "Generate Search Queries", "status": "pending", "progress": 0},
            {"id": "search", "name": "Search Web Sources", "status": "pending", "progress": 0},
            {"id": "refine", "name": "Refine Results with AI", "status": "pending", "progress": 0},
            {"id": "download", "name": "Prepare Downloads", "status": "pending", "progress": 0}
        ]
        
        overall_progress = 0
        current_step = ""
        results = []
        
        try:
            # Step 1: Initialize
            current_step = "Initializing AI Agent..."
            steps[0]["status"] = "running"
            steps[0]["progress"] = 50
            
            yield {
                "steps": steps,
                "overallProgress": 20,
                "currentStep": current_step,
                "results": results,
                "status": "running"
            }
            
            await asyncio.sleep(0.5)
            
            steps[0]["status"] = "completed"
            steps[0]["progress"] = 100
            
            # Step 2: Generate search queries
            current_step = "Generating optimized search queries with AI..."
            steps[1]["status"] = "running"
            steps[1]["progress"] = 30
            
            yield {
                "steps": steps,
                "overallProgress": 40,
                "currentStep": current_step,
                "results": results,
                "status": "running"
            }
            
            search_queries = await self._generate_search_queries(query, certification_level)
            
            steps[1]["status"] = "completed"
            steps[1]["progress"] = 100
            steps[1]["details"] = f"Generated {len(search_queries)} diverse queries"
            
            # Step 3: Search web sources
            current_step = "Searching web sources for new documents..."
            steps[2]["status"] = "running"
            steps[2]["progress"] = 20
            
            yield {
                "steps": steps,
                "overallProgress": 60,
                "currentStep": current_step,
                "results": results,
                "status": "running"
            }
            
            all_search_results = []
            for i, search_query in enumerate(search_queries):
                query_results = await self._search_web(search_query)
                all_search_results.extend(query_results)
                
                progress = ((i + 1) / len(search_queries)) * 100
                steps[2]["progress"] = progress
                steps[2]["details"] = f"Searched {i + 1}/{len(search_queries)} queries - Found {len(all_search_results)} total"
                
                yield {
                    "steps": steps,
                    "overallProgress": 60,
                    "currentStep": current_step,
                    "results": results,
                    "status": "running"
                }
            
            # Remove duplicates
            unique_results = self._remove_duplicates(all_search_results)
            
            steps[2]["status"] = "completed"
            steps[2]["progress"] = 100
            steps[2]["details"] = f"Found {len(unique_results)} unique new documents"
            
            # Step 4: Refine with AI
            current_step = "Refining results with AI for optimal RAG training..."
            steps[3]["status"] = "running"
            steps[3]["progress"] = 30
            
            yield {
                "steps": steps,
                "overallProgress": 80,
                "currentStep": current_step,
                "results": results,
                "status": "running"
            }
            
            refined_results = await self._refine_search_results(query, unique_results)
            top_results = refined_results[:min(max_documents * 2, 12)]
            
            steps[3]["status"] = "completed"
            steps[3]["progress"] = 100
            steps[3]["details"] = f"Refined to {len(top_results)} high-quality documents for RAG training"
            
            # Step 5: Prepare downloads
            current_step = "Preparing new documents for download..."
            steps[4]["status"] = "running"
            steps[4]["progress"] = 50
            
            yield {
                "steps": steps,
                "overallProgress": 90,
                "currentStep": current_step,
                "results": results,
                "status": "running"
            }
            
            # Filter out already downloaded documents
            new_results = []
            for result in top_results:
                result["downloadStatus"] = "pending"
                result["isNew"] = True
                new_results.append(result)
            
            steps[4]["status"] = "completed"
            steps[4]["progress"] = 100
            steps[4]["details"] = f"{len(new_results)} new documents ready"
            
            results = new_results
            current_step = f"AI Agent completed: {len(new_results)} new documents found for enhanced RAG training"
            
            # Save discovered documents for later use
            self.discovered_documents = new_results
            
            # Final result
            yield {
                "steps": steps,
                "overallProgress": 100,
                "currentStep": current_step,
                "results": results,
                "status": "completed"
            }
            
        except Exception as e:
            logger.error(f"AI Agent error: {str(e)}")
            
            # Mark current step as failed
            current_step_obj = next((s for s in steps if s["status"] == "running"), None)
            if current_step_obj:
                current_step_obj["status"] = "failed"
                current_step_obj["details"] = "Step failed"
            
            yield {
                "steps": steps,
                "overallProgress": overall_progress,
                "currentStep": f"Error: {str(e)}",
                "results": results,
                "status": "error",
                "error": str(e)
            }
    
    async def _generate_search_queries(self, topic: str, cert_level: str) -> List[str]:
        """Generate diverse search queries using AI"""
        # Simulate AI query generation
        await asyncio.sleep(1)
        
        base_queries = [
            f"{topic} cisco configuration guide",
            f"{topic} cisco troubleshooting best practices",
            f"{topic} cisco implementation examples",
            f"{topic} cisco security considerations",
            f"{topic} cisco performance optimization"
        ]
        
        if cert_level != "all":
            cert_queries = [
                f"{topic} {cert_level} study guide",
                f"{topic} {cert_level} lab exercises",
                f"{topic} {cert_level} exam preparation"
            ]
            base_queries.extend(cert_queries)
        
        return base_queries[:8]
    
    async def _search_web(self, query: str) -> List[Dict[str, Any]]:
        """Search web for documents"""
        # Simulate web search
        await asyncio.sleep(0.5)
        
        # Generate mock results
        mock_results = [
            {
                "id": f"ai_{hash(query) % 1000}",
                "title": f"{query.title()} - Comprehensive Guide",
                "url": f"https://cisco.com/{query.replace(' ', '-').lower()}-guide.pdf",
                "source": "cisco.com",
                "type": "PDF",
                "size": "2.5 MB",
                "relevance": 0.85 + (hash(query) % 15) / 100,
                "summary": f"Detailed guide covering {query} implementation and best practices."
            },
            {
                "id": f"ai_{hash(query + 'alt') % 1000}",
                "title": f"{query.title()} - Troubleshooting Manual",
                "url": f"https://ciscopress.com/{query.replace(' ', '-').lower()}-troubleshooting.pdf",
                "source": "ciscopress.com",
                "type": "PDF",
                "size": "1.8 MB",
                "relevance": 0.78 + (hash(query) % 20) / 100,
                "summary": f"Common issues and solutions for {query} configurations."
            }
        ]
        
        return mock_results
    
    def _remove_duplicates(self, results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove duplicate documents"""
        seen_urls = set()
        unique_results = []
        
        for result in results:
            if result["url"] not in seen_urls:
                seen_urls.add(result["url"])
                unique_results.append(result)
        
        return unique_results
    
    async def _refine_search_results(self, query: str, results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Refine search results using AI"""
        # Simulate AI refinement
        await asyncio.sleep(1)
        
        # Sort by relevance and boost scores
        for result in results:
            result["relevance"] = max(result["relevance"], 0.8)  # Boost for refined results
        
        return sorted(results, key=lambda x: x["relevance"], reverse=True)
    
    async def download_document(self, document_id: str, document: Dict[str, Any] = None) -> Dict[str, Any]:
        """Download a specific document"""
        # Find document if not provided
        if not document:
            doc = next((d for d in self.discovered_documents if d["id"] == document_id), None)
            if not doc:
                raise ValueError(f"Document {document_id} not found")
        else:
            doc = document
            
        # Check if document already exists
        doc_hash = self._generate_document_hash(doc)
        if doc_hash in self.document_hashes:
            logger.info(f"Document already exists: {doc['title']}")
            doc["downloadStatus"] = "completed"
            doc["downloadProgress"] = 100
            doc["downloaded_at"] = datetime.now().isoformat()
            return doc
            
        # Simulate download process
        doc["downloadStatus"] = "downloading"
        doc["downloadProgress"] = 0
        
        try:
            # In production, actually download the document
            # For now, simulate the download process
            for progress in range(0, 101, 10):
                await asyncio.sleep(0.2)
                doc["downloadProgress"] = progress
                # This would be a good place to send progress updates via WebSocket
            
            # Save document info
            doc["downloadStatus"] = "completed"
            doc["downloadProgress"] = 100
            doc["downloaded_at"] = datetime.now().isoformat()
            doc["local_path"] = f"./data/documents/{document_id}.pdf"  # Mock local path
            
            # Add document hash to prevent duplicates
            self.document_hashes.add(doc_hash)
            
            return doc
            
        except Exception as e:
            logger.error(f"Download failed for {doc['title']}: {str(e)}")
            doc["downloadStatus"] = "failed"
            doc["download_error"] = str(e)
            return doc
            
    def _generate_document_hash(self, document: Dict[str, Any]) -> str:
        """Generate a unique hash for document to prevent duplicates"""
        hash_string = f"{document['url']}_{document['title']}_{document['source']}"
        return hashlib.md5(hash_string.encode()).hexdigest()[:16]
        
    async def chat(self, messages: List[Dict[str, str]], model: str = "llama-3.3-70b-versatile") -> str:
        """Chat with LLM (Groq or Ollama)"""
        # Simulate LLM API call
        await asyncio.sleep(1.5)
        
        # Mock response based on the last user message
        user_message = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")
        
        if "configuration" in user_message.lower():
            return "To configure this feature, you'll need to follow these steps: 1) Access the settings menu, 2) Select the appropriate option, 3) Enter the required parameters."
        elif "troubleshoot" in user_message.lower():
            return "When troubleshooting this issue, first check the connection status, then verify the configuration parameters, and finally restart the service if needed."
        else:
            return f"I understand your question about '{user_message}'. This is a simulated response from the backend LLM service."
            
    async def generate_synthetic_data(self, seed_content: str, topic: str, data_type: str, count: int = 10) -> List[str]:
        """Generate synthetic training data"""
        # Simulate data generation
        await asyncio.sleep(2)
        
        # Mock synthetic data
        prefix = {
            "error-patterns": "Common error: ",
            "best-practices": "Best practice: ",
            "troubleshooting": "Troubleshooting step: ",
            "configurations": "Configuration example: "
        }.get(data_type, "")
        
        return [f"{prefix}{topic} example #{i+1} - This is synthetic training data generated for {data_type}." for i in range(count)]
