"""
Pipeline Manager Service - Handles Stage 1 and Stage 2 processing
"""

import asyncio
import logging
from typing import Dict, List, Any, AsyncGenerator
from datetime import datetime
import json

logger = logging.getLogger(__name__)

class PipelineManager:
    def __init__(self):
        self.stage1_status = {
            "status": "idle",
            "progress": 0,
            "documents_found": 0,
            "current_step": "Ready to start document discovery"
        }
        self.stage2_status = {
            "status": "idle",
            "progress": 0,
            "synthetic_examples": 0,
            "current_step": "Waiting for Stage 1 completion",
            "output_phase": 1
        }
    
    async def run_stage1(self, topic: str, config: Dict[str, Any] = None) -> AsyncGenerator[Dict[str, Any], None]:
        """Run Stage 1: Document Discovery Agent"""
        
        if config is None:
            config = {}
        
        self.stage1_status["status"] = "running"
        self.stage1_status["progress"] = 0
        
        steps = [
            "Initializing document discovery...",
            "Searching for Cisco documentation...",
            "Validating PDF links...",
            "Downloading documents...",
            "Organizing files...",
            "Discovery completed"
        ]
        
        discovered_pdfs = []
        
        for i, step in enumerate(steps):
            await asyncio.sleep(2)  # Simulate processing time
            
            progress = ((i + 1) / len(steps)) * 100
            documents_found = 0
            
            if i == len(steps) - 1:  # Last step
                # Generate mock discovered PDFs
                documents_found = 4
                discovered_pdfs = [
                    "BGP_Configuration_Guide.pdf",
                    "OSPF_Implementation_Best_Practices.pdf",
                    "ASR_1000_Troubleshooting_Guide.pdf",
                    "CCNP_Enterprise_Core_Study_Guide.pdf"
                ]
                self.stage1_status["status"] = "completed"
            else:
                self.stage1_status["status"] = "running"
            
            self.stage1_status.update({
                "progress": progress,
                "current_step": step,
                "documents_found": documents_found
            })
            
            yield {
                "stage": 1,
                "status": self.stage1_status["status"],
                "progress": progress,
                "current_step": step,
                "documents_found": documents_found,
                "discovered_pdfs": discovered_pdfs if i == len(steps) - 1 else []
            }
    
    async def run_stage2(self, pdf_files: List[str], output_phase: int = 1, 
                        config: Dict[str, Any] = None) -> AsyncGenerator[Dict[str, Any], None]:
        """Run Stage 2: Fine-Tuning Data Factory"""
        
        if config is None:
            config = {}
        
        if not pdf_files:
            raise ValueError("No PDF files provided for Stage 2")
        
        self.stage2_status.update({
            "status": "running",
            "progress": 0,
            "output_phase": output_phase,
            "current_step": f"Initializing PHASE {output_phase} processing for {len(pdf_files)} file{'s' if len(pdf_files) > 1 else ''}..."
        })
        
        # Define phase-specific steps
        phase_steps = {
            1: [
                "Checking GPU availability (Ollama/Groq)...",
                "Extracting text from seed PDF...",
                "Generating synthetic error patterns (GPU)...",
                "Creating best practices library (GPU)...",
                "Generating troubleshooting scenarios (GPU)...",
                "Building configuration examples (GPU)...",
                "Combining real + synthetic data...",
                "Creating high-density embeddings (GPU)...",
                "Optimizing for basic RAG accuracy...",
                "Finalizing basic Chroma vector store..."
            ],
            2: [
                "Initializing Hierarchical Index structure...",
                "Parsing configurations into structured chunks...",
                "Building device memory filters...",
                "Creating feature-area taxonomies...",
                "Implementing version-aware filtering...",
                "Optimizing retrieval precision...",
                "Building foundational index (80-88% accuracy)...",
                "Finalizing hierarchical vector store..."
            ],
            3: [
                "Building Graph RAG knowledge graph...",
                "Creating device-feature relationships...",
                "Mapping error-solution dependencies...",
                "Building version compatibility graph...",
                "Implementing graph-aware retrieval...",
                "Optimizing for dependency nuance...",
                "Achieving low 90s accuracy target...",
                "Finalizing Graph RAG layer..."
            ],
            4: [
                "Initializing Agentic Loop framework...",
                "Building tool execution pipeline...",
                "Creating hypothesis validation system...",
                "Implementing iterative evidence gathering...",
                "Building command execution interface...",
                "Creating validated case repository...",
                "Optimizing for upper 90s accuracy...",
                "Finalizing Agentic Loop system..."
            ],
            5: [
                "Setting up continuous evaluation harness...",
                "Building gold standard test sets...",
                "Implementing regression monitoring...",
                "Creating feedback capture system...",
                "Building automated hardening pipeline...",
                "Implementing accuracy maintenance...",
                "Achieving ≥95% in-scope accuracy...",
                "Finalizing continuous eval system..."
            ]
        }
        
        steps = phase_steps.get(output_phase, phase_steps[1])
        total_steps = len(steps) * len(pdf_files)
        current_step_index = 0
        
        # Process each PDF file sequentially
        for file_index, pdf_file in enumerate(pdf_files):
            for step_index, step in enumerate(steps):
                await asyncio.sleep(2.5)  # Simulate processing time
                
                current_step_index += 1
                progress = (current_step_index / total_steps) * 100
                
                # Simulate synthetic data generation
                synthetic_examples = 0
                if step_index >= 2:  # After initial steps
                    base_examples = int((2 ** step_index) * 250) + (hash(pdf_file) % 500)
                    synthetic_examples = min(base_examples * (file_index + 1), 15000 * len(pdf_files))
                
                current_step = step
                if len(pdf_files) > 1:
                    current_step = f"[File {file_index + 1}/{len(pdf_files)}: {pdf_file}] {step}"
                
                status = "completed" if current_step_index == total_steps else "running"
                
                self.stage2_status.update({
                    "status": status,
                    "progress": progress,
                    "current_step": current_step,
                    "synthetic_examples": synthetic_examples
                })
                
                yield {
                    "stage": 2,
                    "status": status,
                    "progress": progress,
                    "current_step": current_step,
                    "synthetic_examples": synthetic_examples,
                    "output_phase": output_phase,
                    "processed_files": file_index + 1 if step_index == len(steps) - 1 else file_index,
                    "total_files": len(pdf_files)
                }
        
        # Mark as completed
        self.stage2_status["status"] = "completed"
    
    async def get_pipeline_status(self) -> Dict[str, Any]:
        """Get current pipeline status"""
        return {
            "stage1": self.stage1_status.copy(),
            "stage2": self.stage2_status.copy(),
            "timestamp": datetime.now().isoformat()
        }
    
    async def reset_pipeline(self):
        """Reset pipeline to initial state"""
        self.stage1_status = {
            "status": "idle",
            "progress": 0,
            "documents_found": 0,
            "current_step": "Ready to start document discovery"
        }
        self.stage2_status = {
            "status": "idle",
            "progress": 0,
            "synthetic_examples": 0,
            "current_step": "Waiting for Stage 1 completion",
            "output_phase": 1
        }
        
        logger.info("Pipeline reset to initial state")
