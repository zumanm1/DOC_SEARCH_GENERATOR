import React, { useState } from "react";
import {
  Search,
  Filter,
  Download,
  FileText,
  Clock,
  Tag,
  Award,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import AIAgent from "@/components/AIAgent";
import DocumentViewer from "@/components/DocumentViewer";

interface SearchResult {
  id: string;
  title: string;
  source: string;
  relevanceScore: number;
  documentType: string;
  certificationLevel: string[];
  summary: string;
  localPath: string;
  pageReferences: number[];
  dateAdded: string;
}

const DocumentSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [relevanceThreshold, setRelevanceThreshold] = useState([70]);
  const [selectedCertLevel, setSelectedCertLevel] = useState("all");
  const [selectedDocType, setSelectedDocType] = useState("all");
  const [selectedSoftwareType, setSelectedSoftwareType] = useState("Cisco IOS");
  const [dateRange, setDateRange] = useState("all");
  const [useAIAgent, setUseAIAgent] = useState(false);
  const [aiAgentActive, setAiAgentActive] = useState(false);

  // Mock search results
  const [searchResults, setSearchResults] = useState<SearchResult[]>([
    {
      id: "1",
      title: "BGP Configuration and Troubleshooting Guide - ASR 1000 Series",
      source: "cisco.com",
      relevanceScore: 0.97,
      documentType: "troubleshooting",
      certificationLevel: ["CCNP", "CCIE"],
      summary:
        "Comprehensive guide covering BGP implementation on ASR 1000 series routers, including configuration examples, troubleshooting common issues, and best practices for enterprise deployments.",
      localPath: "/documents/bgp_asr1000_guide.pdf",
      pageReferences: [23, 45, 67, 89],
      dateAdded: "2023-11-15",
    },
    {
      id: "2",
      title: "OSPF Design and Implementation Guide",
      source: "ciscopress.com",
      relevanceScore: 0.85,
      documentType: "configuration",
      certificationLevel: ["CCNA", "CCNP"],
      summary:
        "Detailed guide on OSPF protocol design considerations, implementation strategies, and optimization techniques for various network topologies.",
      localPath: "/documents/ospf_design_guide.pdf",
      pageReferences: [12, 34, 56],
      dateAdded: "2023-10-22",
    },
    {
      id: "3",
      title: "Advanced MPLS Concepts and Configurations",
      source: "ine.com",
      relevanceScore: 0.78,
      documentType: "study",
      certificationLevel: ["CCIE"],
      summary:
        "In-depth exploration of MPLS technologies including MPLS VPN, Traffic Engineering, and QoS implementation strategies for service provider networks.",
      localPath: "/documents/advanced_mpls.pdf",
      pageReferences: [45, 67, 89, 120],
      dateAdded: "2023-09-05",
    },
    {
      id: "4",
      title: "Cisco IOS Security Configuration Guide",
      source: "cisco.com",
      relevanceScore: 0.82,
      documentType: "configuration",
      certificationLevel: ["CCNA Security", "CCNP Security"],
      summary:
        "Complete reference for configuring security features in Cisco IOS including access control lists, firewall services, VPN technologies, and intrusion prevention systems.",
      localPath: "/documents/ios_security_guide.pdf",
      pageReferences: [18, 42, 73, 105],
      dateAdded: "2023-10-30",
    },
    {
      id: "5",
      title: "QoS Implementation Strategies for Converged Networks",
      source: "ciscopress.com",
      relevanceScore: 0.75,
      documentType: "configuration",
      certificationLevel: ["CCNP"],
      summary:
        "Strategies and configurations for implementing Quality of Service in networks carrying voice, video, and data traffic to ensure optimal performance for critical applications.",
      localPath: "/documents/qos_implementation.pdf",
      pageReferences: [27, 53, 81],
      dateAdded: "2023-09-18",
    },
  ]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    if (useAIAgent) {
      setAiAgentActive(true);
    } else {
      setIsSearching(true);
      // Simulate search with mock results
      setTimeout(() => {
        // Generate more relevant mock results based on the search query
        const queryLower = searchQuery.toLowerCase();
        let filteredResults = [];

        // Add BGP-related results if query contains BGP
        if (queryLower.includes("bgp")) {
          filteredResults.push({
            id: "search-bgp-1",
            title:
              "BGP Configuration and Troubleshooting Guide - ASR 1000 Series",
            source: "cisco.com",
            relevanceScore: 0.97,
            documentType: "troubleshooting",
            certificationLevel: ["CCNP", "CCIE"],
            summary:
              "Comprehensive guide covering BGP implementation on ASR 1000 series routers, including configuration examples, troubleshooting common issues, and best practices for enterprise deployments.",
            localPath: "/documents/bgp_asr1000_guide.pdf",
            pageReferences: [23, 45, 67, 89],
            dateAdded: "2023-11-15",
          });
          filteredResults.push({
            id: "search-bgp-2",
            title: "BGP Route Reflectors and Confederations Design Guide",
            source: "ciscopress.com",
            relevanceScore: 0.89,
            documentType: "configuration",
            certificationLevel: ["CCNP", "CCIE"],
            summary:
              "Detailed design guide for implementing BGP route reflectors and confederations in large-scale networks to optimize routing and improve scalability.",
            localPath: "/documents/bgp_design_guide.pdf",
            pageReferences: [12, 34, 56, 78],
            dateAdded: "2023-10-05",
          });
        }

        // Add OSPF-related results if query contains OSPF
        if (queryLower.includes("ospf")) {
          filteredResults.push({
            id: "search-ospf-1",
            title: "OSPF Design and Implementation Guide",
            source: "ciscopress.com",
            relevanceScore: 0.85,
            documentType: "configuration",
            certificationLevel: ["CCNA", "CCNP"],
            summary:
              "Detailed guide on OSPF protocol design considerations, implementation strategies, and optimization techniques for various network topologies.",
            localPath: "/documents/ospf_design_guide.pdf",
            pageReferences: [12, 34, 56],
            dateAdded: "2023-10-22",
          });
        }

        // If no specific protocol matches, use generic results or filter existing ones
        if (filteredResults.length === 0) {
          filteredResults = searchResults.filter(
            (result) =>
              result.title.toLowerCase().includes(queryLower) ||
              result.summary.toLowerCase().includes(queryLower),
          );

          // If still no matches, show all results as fallback
          if (filteredResults.length === 0) {
            console.log(
              "No specific matches found, showing all available results",
            );
            filteredResults = searchResults;
          }
        }

        setSearchResults(filteredResults);
        setIsSearching(false);
      }, 1500);
    }
  };

  const handleAIAgentResults = (results: any[]) => {
    // Convert AI agent results to search results format
    const convertedResults = results.map((result, index) => ({
      id: result.id || `ai-${index}`,
      title: result.title,
      source: result.source,
      relevanceScore: result.relevance,
      documentType: result.type?.toLowerCase() || "configuration",
      certificationLevel: [
        selectedCertLevel === "all" ? "CCNA" : selectedCertLevel.toUpperCase(),
      ],
      summary: result.summary,
      localPath: result.url,
      pageReferences: [1, 2, 3],
      dateAdded: new Date().toISOString().split("T")[0],
    }));

    setSearchResults(convertedResults);
    setAiAgentActive(false);
  };

  const handleRelevanceChange = (value: number[]) => {
    setRelevanceThreshold(value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getRelevanceBadgeColor = (score: number) => {
    if (score >= 0.9) return "bg-green-500";
    if (score >= 0.7) return "bg-yellow-500";
    return "bg-gray-500";
  };

  return (
    <div className="w-full h-full p-6 bg-background">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Document Search</h1>
        <p className="text-muted-foreground">
          Search through Cisco documentation using natural language queries
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Search and Filters Panel */}
        <div className="w-full lg:w-1/3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search Query</CardTitle>
              <CardDescription>Enter a natural language query</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., troubleshoot OSPF adjacency issues ASR 1000"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSearch}
                    disabled={isSearching || aiAgentActive}
                  >
                    {isSearching || aiAgentActive ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        {useAIAgent ? "AI Searching" : "Searching"}
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Search
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="use-ai-agent"
                    checked={useAIAgent}
                    onChange={(e) => setUseAIAgent(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="use-ai-agent" className="text-sm font-medium">
                    Use AI Agent for enhanced search
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Refine your search results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Certification Level
                </label>
                <Select
                  value={selectedCertLevel}
                  onValueChange={setSelectedCertLevel}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="CCNA">CCNA</SelectItem>
                    <SelectItem value="CCNP">CCNP</SelectItem>
                    <SelectItem value="CCIE">CCIE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Document Type</label>
                <Select
                  value={selectedDocType}
                  onValueChange={setSelectedDocType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="configuration">
                      Configuration Guide
                    </SelectItem>
                    <SelectItem value="troubleshooting">
                      Troubleshooting
                    </SelectItem>
                    <SelectItem value="study">Study Material</SelectItem>
                    <SelectItem value="reference">Command Reference</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Software Type</label>
                <Select
                  value={selectedSoftwareType}
                  onValueChange={setSelectedSoftwareType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select software type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cisco IOS">Cisco IOS</SelectItem>
                    <SelectItem value="Cisco IOS XE">Cisco IOS XE</SelectItem>
                    <SelectItem value="Cisco IOS XR">Cisco IOS XR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="90days">Last 90 Days</SelectItem>
                    <SelectItem value="1year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">
                    Relevance Threshold
                  </label>
                  <span className="text-sm">{relevanceThreshold[0]}%</span>
                </div>
                <Slider
                  defaultValue={[70]}
                  max={100}
                  step={5}
                  value={relevanceThreshold}
                  onValueChange={handleRelevanceChange}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="w-full lg:w-2/3 space-y-4">
          {useAIAgent && (
            <AIAgent
              query={searchQuery}
              certificationLevel={selectedCertLevel}
              maxDocuments={4}
              onResults={handleAIAgentResults}
              isActive={aiAgentActive}
            />
          )}

          <Card className="h-full">
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
              <CardDescription>
                {searchResults.length > 0
                  ? `Found ${searchResults.length} documents matching your query`
                  : "Enter a search query to find relevant documents"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="mb-4 text-muted-foreground">
                    Searching through documentation...
                  </p>
                  <Progress value={45} className="w-1/2 mb-2" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-lg">{result.title}</h3>
                        <Badge
                          className={getRelevanceBadgeColor(
                            result.relevanceScore,
                          )}
                        >
                          {Math.round(result.relevanceScore * 100)}% Match
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="outline">
                          <FileText className="h-3 w-3 mr-1" />
                          {result.documentType}
                        </Badge>
                        {result.certificationLevel.map((cert) => (
                          <Badge key={cert} variant="secondary">
                            <Award className="h-3 w-3 mr-1" />
                            {cert}
                          </Badge>
                        ))}
                        <Badge variant="outline">
                          <Tag className="h-3 w-3 mr-1" />
                          {result.source}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">
                        {result.summary}
                      </p>

                      <div className="flex justify-between items-center">
                        <div className="text-xs text-muted-foreground">
                          Pages: {result.pageReferences.join(", ")}
                        </div>
                        <div className="flex gap-2">
                          <DocumentViewer
                            document={{
                              id: result.id,
                              title: result.title,
                              url: result.localPath.startsWith("http")
                                ? result.localPath
                                : `https://${result.source}${result.localPath}`,
                              source: result.source,
                              type: result.documentType,
                              summary: result.summary,
                            }}
                            trigger={
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                            }
                          />
                          <Button size="sm">
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No search results to display
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Try searching for a topic like "BGP configuration" or "OSPF
                    troubleshooting"
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DocumentSearch;
