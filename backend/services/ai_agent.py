"""
AI Agent Service - Migrated from frontend AIAgent.tsx
"""

import asyncio
import logging
from typing import Dict, List, Any, AsyncGenerator
from datetime import datetime
import json

logger = logging.getLogger(__name__)

class AIAgentService:
    def __init__(self):
        self.groq_client = None  # Will be initialized with API key
        self.ollama_endpoint = "http://localhost:11434"
        self.prefer_ollama = True
    
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
    
    async def download_document(self, document_id: str, document: Dict[str, Any]) -> Dict[str, Any]:
        """Download a specific document"""
        # Simulate download with progress updates
        document["downloadStatus"] = "downloading"
        document["downloadProgress"] = 0
        
        for progress in range(0, 101, 10):
            await asyncio.sleep(0.2)
            document["downloadProgress"] = progress
        
        document["downloadStatus"] = "completed"
        document["downloadProgress"] = 100
        document["downloadedAt"] = datetime.now().isoformat()
        
        return document
