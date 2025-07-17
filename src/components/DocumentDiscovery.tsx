import React, { useState } from "react";
import { Search, Download, FileText, Filter, RefreshCw, X } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import AIAgent from "@/components/AIAgent";
import DocumentViewer from "@/components/DocumentViewer";

interface DocumentDiscoveryProps {
  onStartDiscovery?: (params: any) => void;
  isDiscovering?: boolean;
  discoveredDocuments?: Document[];
}

interface Document {
  id: string;
  title: string;
  source: string;
  type: string;
  size: string;
  relevance: number;
  downloadStatus: "pending" | "downloading" | "completed" | "failed";
  downloadProgress?: number;
}

const DocumentDiscovery: React.FC<DocumentDiscoveryProps> = ({
  onStartDiscovery = () => {},
  isDiscovering = false,
  discoveredDocuments = [
    {
      id: "1",
      title: "BGP Configuration Guide for Cisco IOS XR",
      source: "cisco.com",
      type: "PDF",
      size: "2.4 MB",
      relevance: 0.95,
      downloadStatus: "completed",
      downloadProgress: 100,
    },
    {
      id: "2",
      title: "OSPF Implementation Best Practices",
      source: "ciscopress.com",
      type: "PDF",
      size: "1.8 MB",
      relevance: 0.87,
      downloadStatus: "downloading",
      downloadProgress: 65,
    },
    {
      id: "3",
      title: "ASR 1000 Series Troubleshooting Guide",
      source: "cisco.com",
      type: "PDF",
      size: "3.2 MB",
      relevance: 0.92,
      downloadStatus: "pending",
    },
    {
      id: "4",
      title: "CCNP Enterprise Core (350-401) Study Guide",
      source: "cbtnuggets.com",
      type: "PDF",
      size: "5.1 MB",
      relevance: 0.78,
      downloadStatus: "failed",
    },
  ],
}) => {
  const [searchParams, setSearchParams] = useState({
    topic: "",
    certificationLevel: "all",
    maxDocuments: "4",
    sources: ["cisco.com", "ciscopress.com"],
  });

  const [activeTab, setActiveTab] = useState("search");
  const [discoveryProgress, setDiscoveryProgress] = useState({
    status: "idle",
    progress: 0,
    currentStep: "",
    totalSteps: 5,
  });
  const [useAIAgent, setUseAIAgent] = useState(true);
  const [aiAgentActive, setAiAgentActive] = useState(false);
  const [aiResults, setAiResults] = useState<any[]>([]);

  // Mock certification levels
  const certificationLevels = [
    { value: "all", label: "All Levels" },
    { value: "ccna", label: "CCNA" },
    { value: "ccnp", label: "CCNP" },
    { value: "ccie", label: "CCIE" },
  ];

  // Mock trusted sources
  const trustedSources = [
    { id: "cisco", name: "cisco.com" },
    { id: "ciscopress", name: "ciscopress.com" },
    { id: "udemy", name: "udemy.com" },
    { id: "pluralsight", name: "pluralsight.com" },
    { id: "cbtnuggets", name: "cbtnuggets.com" },
    { id: "ine", name: "ine.com" },
    { id: "google", name: "google.com" },
    { id: "google-za", name: "google.co.za" },
    { id: "youtube", name: "youtube.com" },
  ];

  const handleStartDiscovery = () => {
    if (useAIAgent) {
      setAiAgentActive(true);
      setActiveTab("results");
    } else {
      setDiscoveryProgress({
        status: "running",
        progress: 0,
        currentStep: "Initializing discovery...",
        totalSteps: 5,
      });

      // Simulate progress updates
      const interval = setInterval(() => {
        setDiscoveryProgress((prev) => {
          const newProgress = prev.progress + 20;
          let currentStep = prev.currentStep;

          if (newProgress === 20) currentStep = "Generating search queries...";
          else if (newProgress === 40)
            currentStep = "Searching trusted sources...";
          else if (newProgress === 60) currentStep = "Validating documents...";
          else if (newProgress === 80) currentStep = "Downloading documents...";
          else if (newProgress === 100) {
            clearInterval(interval);
            currentStep = "Discovery completed";
          }

          return {
            ...prev,
            progress: newProgress,
            currentStep,
            status: newProgress === 100 ? "completed" : "running",
          };
        });
      }, 1500);

      onStartDiscovery(searchParams);
    }
  };

  const handleAIAgentResults = (results: any[]) => {
    setAiResults(results);
    setAiAgentActive(false);
  };

  const handleSourceToggle = (sourceName: string) => {
    setSearchParams((prev) => {
      if (prev.sources.includes(sourceName)) {
        return {
          ...prev,
          sources: prev.sources.filter((s) => s !== sourceName),
        };
      } else {
        return { ...prev, sources: [...prev.sources, sourceName] };
      }
    });
  };

  const handleReset = () => {
    setDiscoveryProgress({
      status: "idle",
      progress: 0,
      currentStep: "",
      totalSteps: 5,
    });
  };

  return (
    <div className="bg-background w-full p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Configure Search
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Results
            {discoveredDocuments.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {discoveredDocuments.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Discovery Configuration</CardTitle>
              <CardDescription>
                Configure search parameters to discover relevant Cisco
                documentation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="topic">Topic or Technology</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., BGP configuration, OSPF troubleshooting"
                    value={searchParams.topic}
                    onChange={(e) =>
                      setSearchParams({
                        ...searchParams,
                        topic: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="certification">Certification Level</Label>
                    <Select
                      value={searchParams.certificationLevel}
                      onValueChange={(value) =>
                        setSearchParams({
                          ...searchParams,
                          certificationLevel: value,
                        })
                      }
                    >
                      <SelectTrigger id="certification" className="mt-1">
                        <SelectValue placeholder="Select certification level" />
                      </SelectTrigger>
                      <SelectContent>
                        {certificationLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="max-docs">Maximum Documents</Label>
                    <Select
                      value={searchParams.maxDocuments}
                      onValueChange={(value) =>
                        setSearchParams({
                          ...searchParams,
                          maxDocuments: value,
                        })
                      }
                    >
                      <SelectTrigger id="max-docs" className="mt-1">
                        <SelectValue placeholder="Select maximum documents" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 documents</SelectItem>
                        <SelectItem value="4">4 documents (Default)</SelectItem>
                        <SelectItem value="6">6 documents</SelectItem>
                        <SelectItem value="8">8 documents</SelectItem>
                        <SelectItem value="10">10 documents</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Trusted Sources</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {trustedSources.map((source) => (
                      <div
                        key={source.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`source-${source.id}`}
                          checked={searchParams.sources.includes(source.name)}
                          onCheckedChange={() =>
                            handleSourceToggle(source.name)
                          }
                        />
                        <Label
                          htmlFor={`source-${source.id}`}
                          className="text-sm"
                        >
                          {source.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-4 border-t">
                  <Checkbox
                    id="use-ai-agent"
                    checked={useAIAgent}
                    onCheckedChange={setUseAIAgent}
                  />
                  <Label htmlFor="use-ai-agent" className="text-sm font-medium">
                    Use AI Agent for intelligent discovery
                  </Label>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={discoveryProgress.status === "running"}
              >
                Reset
              </Button>
              <Button
                onClick={handleStartDiscovery}
                disabled={
                  !searchParams.topic ||
                  discoveryProgress.status === "running" ||
                  aiAgentActive
                }
              >
                {discoveryProgress.status === "running" || aiAgentActive ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    {useAIAgent ? "AI Discovering..." : "Discovering..."}
                  </>
                ) : (
                  <>{useAIAgent ? "Start AI Discovery" : "Start Discovery"}</>
                )}
              </Button>
            </CardFooter>
          </Card>

          {discoveryProgress.status !== "idle" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Discovery Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{discoveryProgress.currentStep}</span>
                    <span>{Math.round(discoveryProgress.progress)}%</span>
                  </div>
                  <Progress
                    value={discoveryProgress.progress}
                    className="h-2"
                  />
                  <div className="text-xs text-muted-foreground pt-1">
                    Step {Math.ceil(discoveryProgress.progress / 20)} of{" "}
                    {discoveryProgress.totalSteps}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {useAIAgent && (
            <AIAgent
              query={searchParams.topic}
              certificationLevel={searchParams.certificationLevel}
              maxDocuments={parseInt(searchParams.maxDocuments)}
              onResults={handleAIAgentResults}
              isActive={aiAgentActive}
            />
          )}

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Discovered Documents</CardTitle>
                  <CardDescription>
                    {discoveredDocuments.length} documents found based on your
                    search criteria.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" />
                    Download All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Relevance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(aiResults.length > 0 ? aiResults : discoveredDocuments).map(
                    (doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">
                          {doc.title}
                        </TableCell>
                        <TableCell>{doc.source}</TableCell>
                        <TableCell>{doc.type}</TableCell>
                        <TableCell>{doc.size}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={doc.relevance * 100}
                              className="h-2 w-16"
                            />
                            <span className="text-xs">
                              {Math.round(doc.relevance * 100)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {doc.downloadStatus === "pending" && (
                            <Badge variant="outline">Pending</Badge>
                          )}
                          {doc.downloadStatus === "downloading" && (
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                <RefreshCw className="h-3 w-3 animate-spin" />
                                {doc.downloadProgress}%
                              </Badge>
                            </div>
                          )}
                          {doc.downloadStatus === "completed" && (
                            <Badge
                              variant="success"
                              className="bg-green-100 text-green-800 hover:bg-green-100"
                            >
                              Downloaded
                            </Badge>
                          )}
                          {doc.downloadStatus === "failed" && (
                            <Badge variant="destructive">Failed</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <DocumentViewer
                              document={{
                                id: doc.id,
                                title: doc.title,
                                url:
                                  doc.url ||
                                  `https://${doc.source}/${doc.title.toLowerCase().replace(/\s+/g, "-")}`,
                                source: doc.source,
                                type: doc.type,
                                size: doc.size,
                                summary: doc.summary,
                              }}
                              trigger={
                                <Button size="sm" variant="ghost">
                                  <FileText className="h-4 w-4" />
                                </Button>
                              }
                            />
                            {doc.downloadStatus !== "downloading" &&
                              doc.downloadStatus !== "completed" && (
                                <Button size="sm" variant="ghost">
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                            {doc.downloadStatus === "downloading" && (
                              <Button size="sm" variant="ghost">
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentDiscovery;
