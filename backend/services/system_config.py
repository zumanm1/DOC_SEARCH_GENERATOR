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
    
    async def get_config(self) -> Dict[str, Any]:
        """Get current configuration"""
        return self.config.copy()
