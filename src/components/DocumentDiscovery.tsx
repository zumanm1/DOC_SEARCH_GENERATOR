import React, { useState } from "react";
import {
  Search,
  Download,
  FileText,
  Filter,
  RefreshCw,
  X,
  Upload,
  FolderOpen,
  File,
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
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [uploadStatus, setUploadStatus] = useState<{ [key: string]: string }>(
    {},
  );
  const [directoryPath, setDirectoryPath] = useState("");
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);

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

            // Add mock discovered documents
            const mockDiscoveredDocs = [
              {
                id: "discovered-1",
                title: "BGP Configuration Guide - Discovered",
                source: "cisco.com",
                type: "PDF",
                size: "2.4 MB",
                relevance: 0.95,
                downloadStatus: "completed" as const,
                downloadProgress: 100,
                url: "https://cisco.com/bgp-guide.pdf",
                summary:
                  "Comprehensive BGP configuration guide discovered through web search.",
              },
              {
                id: "discovered-2",
                title: "OSPF Implementation Guide - Discovered",
                source: "ciscopress.com",
                type: "PDF",
                size: "1.8 MB",
                relevance: 0.87,
                downloadStatus: "completed" as const,
                downloadProgress: 100,
                url: "https://ciscopress.com/ospf-guide.pdf",
                summary:
                  "OSPF implementation best practices discovered through web search.",
              },
            ];
            setAiResults(mockDiscoveredDocs);
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const supportedTypes = [
      "application/pdf",
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/jpeg",
      "image/png",
      "image/gif",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const validFiles = files.filter(
      (file) =>
        supportedTypes.includes(file.type) ||
        file.name.toLowerCase().endsWith(".pdf") ||
        file.name.toLowerCase().endsWith(".csv") ||
        file.name.toLowerCase().endsWith(".xlsx") ||
        file.name.toLowerCase().endsWith(".xls") ||
        file.name.toLowerCase().endsWith(".doc") ||
        file.name.toLowerCase().endsWith(".docx") ||
        file.name.toLowerCase().endsWith(".txt"),
    );

    setUploadedFiles((prev) => [...prev, ...validFiles]);

    // Initialize progress and status for new files
    validFiles.forEach((file) => {
      setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));
      setUploadStatus((prev) => ({ ...prev, [file.name]: "pending" }));
    });
  };

  const handleProcessFiles = async () => {
    if (uploadedFiles.length === 0 && !directoryPath) {
      return;
    }

    setIsProcessingFiles(true);
    setActiveTab("results");

    try {
      // Process uploaded files
      for (const file of uploadedFiles) {
        setUploadStatus((prev) => ({ ...prev, [file.name]: "processing" }));

        // Simulate file processing
        for (let progress = 0; progress <= 100; progress += 10) {
          setUploadProgress((prev) => ({ ...prev, [file.name]: progress }));
          await new Promise((resolve) => setTimeout(resolve, 200));
        }

        setUploadStatus((prev) => ({ ...prev, [file.name]: "completed" }));

        // Add to discovered documents
        const processedDoc = {
          id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: file.name,
          source: "local-upload",
          type: file.type.includes("pdf")
            ? "PDF"
            : file.type.includes("csv")
              ? "CSV"
              : file.type.includes("excel") ||
                  file.name.includes(".xlsx") ||
                  file.name.includes(".xls")
                ? "Excel"
                : file.type.includes("image")
                  ? "Image"
                  : file.type.includes("word") || file.name.includes(".doc")
                    ? "Word"
                    : "Document",
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          relevance: 1.0,
          downloadStatus: "completed" as const,
          downloadProgress: 100,
          url: URL.createObjectURL(file),
          summary: `Local file: ${file.name} (${file.type || "Unknown type"})`,
          isLocalFile: true,
          fileObject: file,
        };

        setAiResults((prev) => [...prev, processedDoc]);
      }

      // Process directory if specified
      if (directoryPath) {
        // Note: Directory processing would require backend support
        // For now, we'll show a message about this feature
        console.log(
          "Directory processing would be handled by backend:",
          directoryPath,
        );
      }
    } catch (error) {
      console.error("Error processing files:", error);
    } finally {
      setIsProcessingFiles(false);
    }
  };

  const removeUploadedFile = (fileName: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.name !== fileName));
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
    setUploadStatus((prev) => {
      const newStatus = { ...prev };
      delete newStatus[fileName];
      return newStatus;
    });
  };

  return (
    <div className="bg-background w-full p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Web Discovery
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Local Files
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

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Local File Upload</CardTitle>
              <CardDescription>
                Upload local files (PDF, CSV, Excel, Images, Word documents) for
                processing and indexing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload Section */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file-upload">Select Files</Label>
                  <div className="mt-2">
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      accept=".pdf,.csv,.xlsx,.xls,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                      onChange={handleFileUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supported formats: PDF, CSV, Excel (.xlsx, .xls), Word
                    (.doc, .docx), Text (.txt), Images (.jpg, .png, .gif)
                  </p>
                </div>

                <Separator />

                {/* Directory Path Section */}
                <div>
                  <Label htmlFor="directory-path">
                    Or Specify Directory Path
                  </Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="directory-path"
                      placeholder="e.g., /path/to/documents or C:\\Documents\\PDFs"
                      value={directoryPath}
                      onChange={(e) => setDirectoryPath(e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm">
                      <FolderOpen className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Backend will scan the directory for supported file types
                  </p>
                </div>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Uploaded Files ({uploadedFiles.length})</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUploadedFiles([]);
                        setUploadProgress({});
                        setUploadStatus({});
                      }}
                    >
                      Clear All
                    </Button>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <File className="h-5 w-5 text-blue-500" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / (1024 * 1024)).toFixed(1)} MB •{" "}
                              {file.type || "Unknown type"}
                            </p>
                            {uploadStatus[file.name] === "processing" && (
                              <div className="mt-1">
                                <Progress
                                  value={uploadProgress[file.name]}
                                  className="h-1"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {uploadStatus[file.name] === "completed" && (
                            <Badge
                              variant="default"
                              className="bg-green-100 text-green-800"
                            >
                              Processed
                            </Badge>
                          )}
                          {uploadStatus[file.name] === "processing" && (
                            <Badge variant="secondary">Processing...</Badge>
                          )}
                          {uploadStatus[file.name] === "pending" && (
                            <Badge variant="outline">Pending</Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeUploadedFile(file.name)}
                            disabled={uploadStatus[file.name] === "processing"}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setUploadedFiles([]);
                  setUploadProgress({});
                  setUploadStatus({});
                  setDirectoryPath("");
                }}
                disabled={isProcessingFiles}
              >
                Reset
              </Button>
              <Button
                onClick={handleProcessFiles}
                disabled={
                  (uploadedFiles.length === 0 && !directoryPath) ||
                  isProcessingFiles
                }
              >
                {isProcessingFiles ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Processing Files...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Process Files ({uploadedFiles.length})
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Processing Progress */}
          {isProcessingFiles && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Processing Local Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="truncate">{file.name}</span>
                        <span>{uploadProgress[file.name] || 0}%</span>
                      </div>
                      <Progress
                        value={uploadProgress[file.name] || 0}
                        className="h-2"
                      />
                      <div className="text-xs text-muted-foreground">
                        Status: {uploadStatus[file.name] || "pending"}
                      </div>
                    </div>
                  ))}
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
