"""
System Configuration Service - Migrated from frontend SystemConfiguration.tsx
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import json
import os

logger = logging.getLogger(__name__)

class SystemConfigService:
    def __init__(self):
        self.config = {
            "database_type": "sqlite",
            "operation_mode": "online",
            "api_keys": {},
            "llm_config": {
                "provider": "groq",
                "groq_keys": [],
                "ollama_config": {
                    "endpoint": "http://localhost:11434",
                    "model": "llama2"
                }
            }
        }
        self.system_resources = {
            "cpu": {"usage": 45, "temperature": 62},
            "ram": {"used": 6.2, "total": 16, "percentage": 38.75},
            "gpu": {"usage": 78, "temperature": 71, "model": "NVIDIA RTX 4080"},
            "vram": {"used": 8.5, "total": 12, "percentage": 70.8}
        }
    
    async def update_config(self, database_type: str = None, operation_mode: str = None,
                          api_keys: Dict[str, str] = None, llm_config: Dict[str, Any] = None) -> Dict[str, Any]:
        """Update system configuration"""
        
        if database_type:
            self.config["database_type"] = database_type
            await self._configure_database(database_type)
        
        if operation_mode:
            self.config["operation_mode"] = operation_mode
            await self._configure_operation_mode(operation_mode)
        
        if api_keys:
            self.config["api_keys"].update(api_keys)
            await self._configure_api_keys(api_keys)
        
        if llm_config:
            self.config["llm_config"].update(llm_config)
            await self._configure_llm(llm_config)
        
        # Save configuration
        await self._save_config()
        
        return {
            "status": "success",
            "message": "Configuration updated successfully",
            "config": self.config,
            "timestamp": datetime.now().isoformat()
        }
    
    async def _configure_database(self, db_type: str):
        """Configure database connection"""
        logger.info(f"Configuring database: {db_type}")
        
        if db_type == "sqlite":
            # Configure SQLite
            self.config["database_config"] = {
                "type": "sqlite",
                "path": "./data/cisco_docs.db"
            }
        elif db_type == "postgresql":
            # Configure PostgreSQL
            self.config["database_config"] = {
                "type": "postgresql",
                "host": "localhost",
                "port": 5432,
                "database": "cisco_docs",
                "username": "postgres"
            }
        elif db_type == "supabase":
            # Configure Supabase
            self.config["database_config"] = {
                "type": "supabase",
                "url": os.getenv("SUPABASE_URL", ""),
                "key": os.getenv("SUPABASE_KEY", ""),
                "local_mirror": "postgresql://user:password@localhost/cisco_docs_mirror"
            }
    
    async def _configure_operation_mode(self, mode: str):
        """Configure operation mode (online/offline)"""
        logger.info(f"Configuring operation mode: {mode}")
        
        if mode == "offline":
            # Setup offline capabilities
            self.config["offline_config"] = {
                "max_storage_gb": 10,
                "max_pdfs_per_search": 4,
                "retention_days": 90,
                "auto_sync": True
            }
    
    async def _configure_api_keys(self, api_keys: Dict[str, str]):
        """Configure API keys"""
        logger.info("Configuring API keys")
        
        # Store API keys securely (in production, use proper encryption)
        for key_name, key_value in api_keys.items():
            self.config["api_keys"][key_name] = key_value
            
    async def save_api_key(self, key_data: Dict[str, Any]) -> Dict[str, Any]:
        """Save or update a Groq API key"""
        if not self.config["llm_config"].get("groq_keys"):
            self.config["llm_config"]["groq_keys"] = []
            
        # Generate ID if new key
        if not key_data.get("id"):
            import uuid
            key_data["id"] = str(uuid.uuid4())
            key_data["createdAt"] = datetime.now().isoformat()
            
        # If setting as active, deactivate all others
        if key_data.get("active"):
            for key in self.config["llm_config"]["groq_keys"]:
                key["active"] = False
                
        # Check if key exists and update it
        key_exists = False
        for i, key in enumerate(self.config["llm_config"]["groq_keys"]):
            if key.get("id") == key_data.get("id"):
                self.config["llm_config"]["groq_keys"][i] = key_data
                key_exists = True
                break
                
        # Add new key if it doesn't exist
        if not key_exists:
            self.config["llm_config"]["groq_keys"].append(key_data)
            
        # Save configuration
        await self._save_config()
        
        return {
            "status": "success",
            "message": "API key saved successfully",
            "keys": self.config["llm_config"]["groq_keys"]
        }
        
    async def delete_api_key(self, key_id: str) -> Dict[str, Any]:
        """Delete a Groq API key"""
        if not self.config["llm_config"].get("groq_keys"):
            return {"status": "error", "message": "No API keys found"}
            
        # Remove key with matching ID
        self.config["llm_config"]["groq_keys"] = [
            key for key in self.config["llm_config"]["groq_keys"]
            if key.get("id") != key_id
        ]
        
        # Save configuration
        await self._save_config()
        
        return {
            "status": "success",
            "message": "API key deleted successfully",
            "keys": self.config["llm_config"]["groq_keys"]
        }
        
    async def set_active_api_key(self, key_id: str) -> Dict[str, Any]:
        """Set a Groq API key as active"""
        if not self.config["llm_config"].get("groq_keys"):
            return {"status": "error", "message": "No API keys found"}
            
        # Set active status
        key_found = False
        for key in self.config["llm_config"]["groq_keys"]:
            if key.get("id") == key_id:
                key["active"] = True
                key_found = True
            else:
                key["active"] = False
                
        if not key_found:
            return {"status": "error", "message": "API key not found"}
            
        # Save configuration
        await self._save_config()
        
        return {
            "status": "success",
            "message": "API key set as active",
            "keys": self.config["llm_config"]["groq_keys"]
        }
        
    async def get_api_keys(self) -> Dict[str, Any]:
        """Get all Groq API keys"""
        return {
            "status": "success",
            "keys": self.config["llm_config"].get("groq_keys", [])
        }
    
    async def _configure_llm(self, llm_config: Dict[str, Any]):
        """Configure LLM settings"""
        logger.info(f"Configuring LLM: {llm_config}")
        
        if "provider" in llm_config:
            self.config["llm_config"]["provider"] = llm_config["provider"]
        
        if "groq_keys" in llm_config:
            self.config["llm_config"]["groq_keys"] = llm_config["groq_keys"]
        
        if "ollama_config" in llm_config:
            self.config["llm_config"]["ollama_config"].update(llm_config["ollama_config"])
    
    async def _save_config(self):
        """Save configuration to file"""
        try:
            os.makedirs("./data", exist_ok=True)
            with open("./data/config.json", "w") as f:
                json.dump(self.config, f, indent=2)
            logger.info("Configuration saved successfully")
        except Exception as e:
            logger.error(f"Error saving configuration: {str(e)}")
    
    async def get_system_status(self) -> Dict[str, Any]:
        """Get current system status"""
        # Simulate resource monitoring
        await self._update_system_resources()
        
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "config": self.config,
            "resources": self.system_resources,
            "services": {
                "document_discovery": "active",
                "document_search": "active",
                "ai_agent": "active",
                "pipeline_manager": "active",
                "database": "connected" if self.config["database_type"] else "disconnected"
            },
            "storage": {
                "used_gb": 3.2,
                "total_gb": 10,
                "percentage": 32
            },
            "documents": {
                "total": 128,
                "indexed": 125,
                "pending": 3
            },
            "monitoring": {
                "backend_connectivity": "healthy",
                "database_status": "connected",
                "api_availability": "online",
                "active_tasks": [],
                "error_logs": [],
                "performance_metrics": {
                    "search_avg_time": 1.2,
                    "discovery_success_rate": 94.5,
                    "document_processing_rate": 15.3
                }
            }
        }
    
    async def _update_system_resources(self):
        """Update system resource monitoring"""
        import random
        
        # Simulate realistic resource fluctuations
        self.system_resources["cpu"]["usage"] = max(10, min(95, 
            self.system_resources["cpu"]["usage"] + random.uniform(-5, 5)))
        
        self.system_resources["ram"]["percentage"] = max(15, min(90, 
            self.system_resources["ram"]["percentage"] + random.uniform(-2, 2)))
        
        self.system_resources["gpu"]["usage"] = max(5, min(100, 
            self.system_resources["gpu"]["usage"] + random.uniform(-10, 10)))
        
        self.system_resources["vram"]["percentage"] = max(10, min(95, 
            self.system_resources["vram"]["percentage"] + random.uniform(-3, 3)))
    
    async def test_llm_connection(self, provider: str = "groq") -> Dict[str, Any]:
        """Test LLM connection"""
        test_questions = [
            "What is the capital city of France?",
            "What is 2 + 2?",
            "Name one planet in our solar system.",
            "What color do you get when you mix red and blue?"
        ]
        
        results = []
        
        for i, question in enumerate(test_questions):
            try:
                # Simulate LLM API call
                await asyncio.sleep(1.5)
                
                # Mock responses
                responses = {
                    "What is the capital city of France?": "The capital city of France is Paris.",
                    "What is 2 + 2?": "2 + 2 equals 4.",
                    "Name one planet in our solar system.": "Earth is a planet in our solar system.",
                    "What color do you get when you mix red and blue?": "When you mix red and blue, you get purple."
                }
                
                response = responses.get(question, "I understand your question and I'm processing it.")
                
                results.append({
                    "question": question,
                    "response": response,
                    "status": "success",
                    "timestamp": datetime.now().strftime("%H:%M:%S")
                })
                
            except Exception as e:
                results.append({
                    "question": question,
                    "response": f"Error: {str(e)}",
                    "status": "error",
                    "timestamp": datetime.now().strftime("%H:%M:%S")
                })
        
        return {
            "provider": provider,
            "results": results,
            "success_rate": len([r for r in results if r["status"] == "success"]) / len(results),
            "timestamp": datetime.now().isoformat()
        }
    
    async def check_document_updates(self) -> Dict[str, Any]:
        """Check for document updates from sources"""
        logger.info("Checking for document updates")
        
        # Simulate checking for updates
        await asyncio.sleep(2)
        
        # Mock document versions with updates
        document_versions = [
            {
                "id": "doc_1",
                "title": "BGP Configuration Guide",
                "source": "cisco.com",
                "version": "2.1",
                "size": "2.4 MB",
                "lastModified": "2024-01-15",
                "contentHash": "a1b2c3d4e5f6",
                "status": "current",
                "hasUpdate": False
            },
            {
                "id": "doc_2",
                "title": "OSPF Troubleshooting Manual",
                "source": "ciscopress.com",
                "version": "1.8",
                "size": "1.9 MB",
                "lastModified": "2023-12-20",
                "contentHash": "b2c3d4e5f6g7",
                "status": "outdated",
                "hasUpdate": True,
                "changeLog": "Added new troubleshooting scenarios for OSPF v3"
            },
            {
                "id": "doc_3",
                "title": "ASR 1000 Series Configuration",
                "source": "cisco.com",
                "version": "3.0",
                "size": "3.2 MB",
                "lastModified": "2024-01-20",
                "contentHash": "c3d4e5f6g7h8",
                "status": "updated",
                "hasUpdate": False,
                "changeLog": "Updated for latest IOS XE version"
            }
        ]
        
        return {
            "status": "success",
            "message": "Document update check completed",
            "document_versions": document_versions,
            "updates_available": len([d for d in document_versions if d["hasUpdate"]]),
            "timestamp": datetime.now().isoformat()
        }
    
    async def get_search_history(self) -> Dict[str, Any]:
        """Get search history"""
        # Mock search history
        search_history = [
            {
                "query": "BGP configuration examples",
                "timestamp": "2024-01-20 14:30",
                "results": 12,
                "filters": ["CCNP", "Configuration"]
            },
            {
                "query": "OSPF troubleshooting",
                "timestamp": "2024-01-20 13:15",
                "results": 8,
                "filters": ["CCNA", "Troubleshooting"]
            },
            {
                "query": "ASR 1000 security features",
                "timestamp": "2024-01-20 11:45",
                "results": 15,
                "filters": ["Security", "Best Practices"]
            }
        ]
        
        return {
            "status": "success",
            "search_history": search_history,
            "timestamp": datetime.now().isoformat()
        }
    
    async def get_saved_searches(self) -> Dict[str, Any]:
        """Get saved searches"""
        # Mock saved searches
        saved_searches = [
            {
                "id": "search_1",
                "name": "CCNP Routing Protocols",
                "query": "BGP OSPF EIGRP configuration",
                "filters": ["CCNP", "Routing", "Configuration"],
                "created": "2024-01-15",
                "lastUsed": "2024-01-20"
            },
            {
                "id": "search_2",
                "name": "Security Best Practices",
                "query": "firewall ACL security policies",
                "filters": ["Security", "Best Practices", "CCNA Security"],
                "created": "2024-01-10",
                "lastUsed": "2024-01-18"
            }
        ]
        
        return {
            "status": "success",
            "saved_searches": saved_searches,
            "timestamp": datetime.now().isoformat()
        }
    
    async def add_active_task(self, task: Dict[str, Any]) -> None:
        """Add an active task to monitoring"""
        if "monitoring" not in self.config:
            self.config["monitoring"] = {
                "active_tasks": [],
                "error_logs": []
            }
        
        self.config["monitoring"]["active_tasks"].append({
            "id": task.get("id", str(uuid.uuid4())),
            "name": task.get("name", "Unknown Task"),
            "status": task.get("status", "running"),
            "progress": task.get("progress", 0),
            "details": task.get("details", ""),
            "started_at": datetime.now().isoformat()
        })
    
    async def update_active_task(self, task_id: str, updates: Dict[str, Any]) -> None:
        """Update an active task"""
        if "monitoring" in self.config and "active_tasks" in self.config["monitoring"]:
            for task in self.config["monitoring"]["active_tasks"]:
                if task["id"] == task_id:
                    task.update(updates)
                    task["updated_at"] = datetime.now().isoformat()
                    break
    
    async def remove_active_task(self, task_id: str) -> None:
        """Remove an active task"""
        if "monitoring" in self.config and "active_tasks" in self.config["monitoring"]:
            self.config["monitoring"]["active_tasks"] = [
                task for task in self.config["monitoring"]["active_tasks"]
                if task["id"] != task_id
            ]
    
    async def add_error_log(self, error: Dict[str, Any]) -> None:
        """Add an error to the log"""
        if "monitoring" not in self.config:
            self.config["monitoring"] = {
                "active_tasks": [],
                "error_logs": []
            }
        
        self.config["monitoring"]["error_logs"].append({
            "type": error.get("type", "Unknown Error"),
            "message": error.get("message", ""),
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "severity": error.get("severity", "error")
        })
        
        # Keep only last 50 error logs
        if len(self.config["monitoring"]["error_logs"]) > 50:
            self.config["monitoring"]["error_logs"] = self.config["monitoring"]["error_logs"][-50:]
    
    async def get_config(self) -> Dict[str, Any]:
        """Get current configuration"""
        return self.config.copy()
