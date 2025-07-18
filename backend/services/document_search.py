"""
Document Search Service - Migrated from frontend DocumentSearch.tsx
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import json

logger = logging.getLogger(__name__)

class DocumentSearchService:
    def __init__(self):
        # Mock search results database
        self.search_results = [
            {
                "id": "1",
                "title": "BGP Configuration and Troubleshooting Guide - ASR 1000 Series",
                "source": "cisco.com",
                "relevanceScore": 0.97,
                "documentType": "troubleshooting",
                "certificationLevel": ["CCNP", "CCIE"],
                "summary": "Comprehensive guide covering BGP implementation on ASR 1000 series routers, including configuration examples, troubleshooting common issues, and best practices for enterprise deployments.",
                "localPath": "/documents/bgp_asr1000_guide.pdf",
                "pageReferences": [23, 45, 67, 89],
                "dateAdded": "2023-11-15",
                "softwareType": "Cisco IOS"
            },
            {
                "id": "2",
                "title": "OSPF Design and Implementation Guide",
                "source": "ciscopress.com",
                "relevanceScore": 0.85,
                "documentType": "configuration",
                "certificationLevel": ["CCNA", "CCNP"],
                "summary": "Detailed guide on OSPF protocol design considerations, implementation strategies, and optimization techniques for various network topologies.",
                "localPath": "/documents/ospf_design_guide.pdf",
                "pageReferences": [12, 34, 56],
                "dateAdded": "2023-10-22",
                "softwareType": "Cisco IOS"
            },
            {
                "id": "3",
                "title": "Advanced MPLS Concepts and Configurations",
                "source": "ine.com",
                "relevanceScore": 0.78,
                "documentType": "study",
                "certificationLevel": ["CCIE"],
                "summary": "In-depth exploration of MPLS technologies including MPLS VPN, Traffic Engineering, and QoS implementation strategies for service provider networks.",
                "localPath": "/documents/advanced_mpls.pdf",
                "pageReferences": [45, 67, 89, 120],
                "dateAdded": "2023-09-05",
                "softwareType": "Cisco IOS XR"
            },
            {
                "id": "4",
                "title": "Cisco ASA Firewall Configuration Guide",
                "source": "cisco.com",
                "relevanceScore": 0.92,
                "documentType": "configuration",
                "certificationLevel": ["CCNA Security", "CCNP Security"],
                "summary": "Complete guide for ASA firewall configuration including security policies, VPN setup, and advanced threat protection features.",
                "localPath": "/documents/asa_firewall_guide.pdf",
                "pageReferences": [15, 28, 42, 67],
                "dateAdded": "2023-12-01",
                "softwareType": "Cisco ASA"
            }
        ]
    
    async def search_documents(self, query: str, relevance_threshold: int = 70,
                             cert_level: str = "all", doc_type: str = "all",
                             software_type: str = "Cisco IOS", date_range: str = "all",
                             use_ai_agent: bool = False) -> List[Dict[str, Any]]:
        """Search documents based on query and filters"""
        
        # Simulate search delay
        await asyncio.sleep(1.5)
        
        # Filter results based on criteria
        filtered_results = self._filter_results(
            query, relevance_threshold, cert_level, doc_type, software_type, date_range
        )
        
        # Calculate relevance scores based on query
        scored_results = self._calculate_relevance(filtered_results, query)
        
        # Sort by relevance score
        sorted_results = sorted(scored_results, key=lambda x: x["relevanceScore"], reverse=True)
        
        return sorted_results
    
    def _filter_results(self, query: str, relevance_threshold: int, cert_level: str,
                       doc_type: str, software_type: str, date_range: str) -> List[Dict[str, Any]]:
        """Filter search results based on criteria"""
        filtered = []
        
        for result in self.search_results:
            # Relevance threshold filter
            if result["relevanceScore"] * 100 < relevance_threshold:
                continue
            
            # Certification level filter
            if cert_level != "all":
                if cert_level.upper() not in [cert.upper() for cert in result["certificationLevel"]]:
                    continue
            
            # Document type filter
            if doc_type != "all":
                if result["documentType"] != doc_type:
                    continue
            
            # Software type filter (partial match)
            if software_type != "all":
                if software_type.lower() not in result["softwareType"].lower():
                    continue
            
            # Date range filter (simplified)
            if date_range != "all":
                # In production, implement proper date filtering
                pass
            
            filtered.append(result.copy())
        
        return filtered
    
    def _calculate_relevance(self, results: List[Dict[str, Any]], query: str) -> List[Dict[str, Any]]:
        """Calculate relevance scores based on query"""
        query_words = query.lower().split()
        
        for result in results:
            # Calculate relevance based on title and summary matches
            title_words = result["title"].lower().split()
            summary_words = result["summary"].lower().split()
            
            title_matches = sum(1 for word in query_words if any(word in title_word for title_word in title_words))
            summary_matches = sum(1 for word in query_words if any(word in summary_word for summary_word in summary_words))
            
            # Boost score based on matches
            base_score = result["relevanceScore"]
            title_boost = (title_matches / len(query_words)) * 0.3
            summary_boost = (summary_matches / len(query_words)) * 0.1
            
            result["relevanceScore"] = min(base_score + title_boost + summary_boost, 1.0)
        
        return results
    
    async def get_document_content(self, document_id: str) -> Dict[str, Any]:
        """Get content of a specific document"""
        # Find document
        doc = next((d for d in self.search_results if d["id"] == document_id), None)
        if not doc:
            raise ValueError(f"Document {document_id} not found")
        
        # Simulate content retrieval
        await asyncio.sleep(0.5)
        
        # Return document with content
        return {
            **doc,
            "content": f"This is the content of {doc['title']}. In a real implementation, this would contain the actual document text.",
            "contentType": "text/plain",
            "retrievedAt": datetime.now().isoformat()
        }
    
    async def download_document(self, document_id: str) -> Dict[str, Any]:
        """Download a specific document"""
        doc = next((d for d in self.search_results if d["id"] == document_id), None)
        if not doc:
            raise ValueError(f"Document {document_id} not found")
        
        # Simulate download
        await asyncio.sleep(2)
        
        return {
            "id": document_id,
            "status": "downloaded",
            "downloadPath": doc["localPath"],
            "downloadedAt": datetime.now().isoformat()
        }
    
    async def get_search_suggestions(self, partial_query: str) -> List[str]:
        """Get search suggestions based on partial query"""
        suggestions = [
            "BGP configuration",
            "OSPF troubleshooting",
            "MPLS VPN setup",
            "ASA firewall rules",
            "QoS implementation",
            "EIGRP optimization",
            "VLAN configuration",
            "Spanning tree protocol",
            "Cisco IOS XE configuration",
            "Network security best practices",
            "Wireless controller setup",
            "Voice over IP configuration",
            "Data center switching",
            "Service provider routing"
        ]
        
        # Filter suggestions based on partial query
        if partial_query:
            filtered = [s for s in suggestions if partial_query.lower() in s.lower()]
            return filtered[:5]
        
        return suggestions[:5]
    
    async def search_with_facets(self, query: str, facets: Dict[str, List[str]] = None,
                                date_range: Dict[str, str] = None, sort_by: str = "relevance") -> Dict[str, Any]:
        """Advanced search with faceted navigation"""
        
        # Perform base search
        base_results = await self.search_documents(query)
        
        # Apply facet filters
        if facets:
            filtered_results = []
            for result in base_results:
                include_result = True
                
                # Check certification level facet
                if "certification_levels" in facets and facets["certification_levels"]:
                    if not any(cert in result["certificationLevel"] for cert in facets["certification_levels"]):
                        include_result = False
                
                # Check technology category facet
                if "technology_categories" in facets and facets["technology_categories"]:
                    # Simulate technology categorization based on title/summary
                    doc_categories = self._extract_technology_categories(result)
                    if not any(cat in doc_categories for cat in facets["technology_categories"]):
                        include_result = False
                
                # Check document type facet
                if "document_types" in facets and facets["document_types"]:
                    if result["documentType"] not in facets["document_types"]:
                        include_result = False
                
                if include_result:
                    filtered_results.append(result)
            
            base_results = filtered_results
        
        # Apply date range filter
        if date_range:
            # In production, implement proper date filtering
            pass
        
        # Apply sorting
        if sort_by == "relevance":
            base_results.sort(key=lambda x: x["relevanceScore"], reverse=True)
        elif sort_by == "date":
            base_results.sort(key=lambda x: x["dateAdded"], reverse=True)
        elif sort_by == "title":
            base_results.sort(key=lambda x: x["title"])
        
        # Generate facet counts
        facet_counts = self._generate_facet_counts(base_results)
        
        return {
            "results": base_results,
            "facet_counts": facet_counts,
            "total_results": len(base_results),
            "query": query,
            "applied_facets": facets or {},
            "sort_by": sort_by
        }
    
    def _extract_technology_categories(self, document: Dict[str, Any]) -> List[str]:
        """Extract technology categories from document"""
        categories = []
        title_lower = document["title"].lower()
        summary_lower = document["summary"].lower()
        
        category_keywords = {
            "Routing": ["bgp", "ospf", "eigrp", "rip", "routing", "route"],
            "Switching": ["vlan", "stp", "spanning", "switch", "switching"],
            "Security": ["asa", "firewall", "acl", "security", "vpn"],
            "Wireless": ["wireless", "wifi", "wlan", "access point", "controller"],
            "Voice": ["voice", "voip", "cucm", "unity", "telephony"],
            "Data Center": ["nexus", "data center", "datacenter", "fabric"],
            "Service Provider": ["mpls", "service provider", "carrier", "isp"]
        }
        
        for category, keywords in category_keywords.items():
            if any(keyword in title_lower or keyword in summary_lower for keyword in keywords):
                categories.append(category)
        
        return categories if categories else ["General"]
    
    def _generate_facet_counts(self, results: List[Dict[str, Any]]) -> Dict[str, Dict[str, int]]:
        """Generate facet counts for search results"""
        facet_counts = {
            "certification_levels": {},
            "technology_categories": {},
            "document_types": {},
            "sources": {}
        }
        
        for result in results:
            # Count certification levels
            for cert in result["certificationLevel"]:
                facet_counts["certification_levels"][cert] = facet_counts["certification_levels"].get(cert, 0) + 1
            
            # Count technology categories
            categories = self._extract_technology_categories(result)
            for category in categories:
                facet_counts["technology_categories"][category] = facet_counts["technology_categories"].get(category, 0) + 1
            
            # Count document types
            doc_type = result["documentType"]
            facet_counts["document_types"][doc_type] = facet_counts["document_types"].get(doc_type, 0) + 1
            
            # Count sources
            source = result["source"]
            facet_counts["sources"][source] = facet_counts["sources"].get(source, 0) + 1
        
        return facet_counts
