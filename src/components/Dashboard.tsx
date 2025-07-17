import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  Database,
  Wifi,
  WifiOff,
  FileText,
  Bot,
  Zap,
  Download,
  Settings,
  Search,
  Factory,
  ArrowRight,
  CheckCircle,
  Clock,
} from "lucide-react";
import DocumentDiscovery from "./DocumentDiscovery";
import DocumentSearch from "./DocumentSearch";
import SystemConfiguration from "./SystemConfiguration";

interface DashboardProps {
  isOnline?: boolean;
  databaseType?: "sqlite" | "postgresql" | "supabase";
  activeTab?: "overview" | "stage1" | "stage2" | "search" | "config";
}

interface PipelineStatus {
  stage1: {
    status: "idle" | "running" | "completed" | "error";
    progress: number;
    documentsFound: number;
    currentStep: string;
  };
  stage2: {
    status: "idle" | "running" | "completed" | "error";
    progress: number;
    syntheticExamples: number;
    currentStep: string;
  };
}

const Dashboard = ({
  isOnline = true,
  databaseType = "sqlite",
  activeTab = "overview",
}: DashboardProps) => {
  const [currentTab, setCurrentTab] = useState(activeTab);
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>({
    stage1: {
      status: "idle",
      progress: 0,
      documentsFound: 0,
      currentStep: "Ready to start document discovery",
    },
    stage2: {
      status: "idle",
      progress: 0,
      syntheticExamples: 0,
      currentStep: "Waiting for Stage 1 completion",
    },
  });
  const [selectedPdfs, setSelectedPdfs] = useState<string[]>([]);
  const [discoveredPdfs, setDiscoveredPdfs] = useState<string[]>([]);

  // Map database types to display names
  const databaseLabels = {
    sqlite: "SQLite",
    postgresql: "PostgreSQL",
    supabase: "Supabase",
  };

  const startStage1 = async () => {
    setPipelineStatus((prev) => ({
      ...prev,
      stage1: {
        ...prev.stage1,
        status: "running",
        progress: 0,
        currentStep: "Initializing document discovery...",
      },
    }));

    // Simulate Stage 1 progress
    const steps = [
      "Searching for Cisco documentation...",
      "Validating PDF links...",
      "Downloading documents...",
      "Organizing files...",
      "Discovery completed",
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const progress = ((i + 1) / steps.length) * 100;
      const documentsFound = Math.floor(Math.random() * 5) + 3;

      setPipelineStatus((prev) => ({
        ...prev,
        stage1: {
          ...prev.stage1,
          progress,
          currentStep: steps[i],
          documentsFound:
            i === steps.length - 1
              ? documentsFound
              : prev.stage1.documentsFound,
          status: i === steps.length - 1 ? "completed" : "running",
        },
      }));

      if (i === steps.length - 1) {
        const mockPdfs = [
          "BGP_Configuration_Guide.pdf",
          "OSPF_Implementation_Best_Practices.pdf",
          "ASR_1000_Troubleshooting_Guide.pdf",
          "CCNP_Enterprise_Core_Study_Guide.pdf",
        ];
        setDiscoveredPdfs(mockPdfs.slice(0, documentsFound));
      }
    }
  };

  const startStage2 = async (pdfFiles: string[]) => {
    if (!pdfFiles || pdfFiles.length === 0) return;

    setPipelineStatus((prev) => ({
      ...prev,
      stage2: {
        ...prev.stage2,
        status: "running",
        progress: 0,
        currentStep: "Initializing GPU-accelerated processing...",
      },
    }));

    const steps = [
      "Checking GPU availability (Ollama/Groq)...",
      "Extracting text from seed PDF...",
      "Generating synthetic error patterns (GPU)...",
      "Creating best practices library (GPU)...",
      "Generating troubleshooting scenarios (GPU)...",
      "Building configuration examples (GPU)...",
      "Combining real + synthetic data...",
      "Creating high-density embeddings (GPU)...",
      "Optimizing for 93%+ RAG accuracy...",
      "Finalizing Chroma vector store...",
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 2500));
      const progress = ((i + 1) / steps.length) * 100;

      // Simulate more realistic synthetic data generation
      let syntheticExamples = 0;
      if (i >= 2) {
        // Exponential growth in synthetic examples
        syntheticExamples =
          Math.floor(Math.pow(2, i - 1) * 250) +
          Math.floor(Math.random() * 500);
        syntheticExamples = Math.min(syntheticExamples, 15000); // Cap at 15k for realism
      }

      setPipelineStatus((prev) => ({
        ...prev,
        stage2: {
          ...prev.stage2,
          progress,
          currentStep: steps[i],
          syntheticExamples,
          status: i === steps.length - 1 ? "completed" : "running",
        },
      }));
    }

    // Mark the processed documents
    if (typeof webSearchService.markDocumentAsProcessed === "function") {
      pdfFiles.forEach((pdfFile) => {
        webSearchService.markDocumentAsProcessed(pdfFile);
      });
    }
  };

  const resetPipeline = () => {
    setPipelineStatus({
      stage1: {
        status: "idle",
        progress: 0,
        documentsFound: 0,
        currentStep: "Ready to start document discovery",
      },
      stage2: {
        status: "idle",
        progress: 0,
        syntheticExamples: 0,
        currentStep: "Waiting for Stage 1 completion",
      },
    });
    setSelectedPdfs([]);
    setDiscoveredPdfs([]);
  };

  return (
    <div className="flex flex-col h-full w-full bg-background p-4 space-y-4">
      {/* Status Bar */}
      <div className="flex justify-between items-center bg-muted p-2 rounded-md">
        <div className="flex items-center space-x-2">
          <span className="font-medium">Status:</span>
          <div className="flex items-center">
            {isOnline ? (
              <>
                <Wifi className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-amber-500 mr-1" />
                <span className="text-amber-500">Offline</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="font-medium">Database:</span>
          <div className="flex items-center">
            <Database className="h-4 w-4 mr-1" />
            <span>{databaseLabels[databaseType]}</span>
          </div>
        </div>

        {!isOnline && databaseType === "supabase" && (
          <Badge variant="outline" className="flex items-center bg-amber-100">
            <AlertCircle className="h-3 w-3 mr-1" />
            <span>Using local PostgreSQL mirror</span>
          </Badge>
        )}
      </div>

      {/* Main Content */}
      <Card className="flex-1">
        <Tabs
          defaultValue={currentTab}
          onValueChange={(value) =>
            setCurrentTab(
              value as "overview" | "stage1" | "stage2" | "search" | "config",
            )
          }
          className="h-full flex flex-col"
        >
          <TabsList className="grid grid-cols-5 w-full max-w-4xl mx-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="stage1" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Document Discovery Agent
            </TabsTrigger>
            <TabsTrigger value="stage2" className="flex items-center gap-2">
              <Factory className="h-4 w-4" />
              Fine-Tuning Data Factory
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Config
            </TabsTrigger>
          </TabsList>

          <CardContent className="flex-1 p-0 pt-4">
            <TabsContent value="overview" className="h-full p-6 space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">
                  Cisco RAG Data Pipeline System
                </h1>
                <p className="text-muted-foreground text-lg">
                  A complete, two-stage pipeline for generating high-quality
                  datasets to power and fine-tune RAG systems specializing in
                  Cisco technologies
                </p>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 font-medium">
                    Core Philosophy:{" "}
                    <span className="font-normal">
                      First <strong>gather</strong> broad raw materials, then{" "}
                      <strong>process</strong> them to create deep, high-value
                      datasets
                    </span>
                  </p>
                </div>
              </div>

              {/* Pipeline Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="relative">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Search className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle>Stage 1: Document Discovery Agent</CardTitle>
                        <CardDescription>
                          Information Gathering - Build Local Repository
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      <strong>Goal:</strong> Build a local repository of
                      relevant, high-quality Cisco technical documents.
                      <br />
                      <strong>Process:</strong> Provide high-level topics (e.g.,
                      "BGP," "OSPF"). The agent autonomously searches, validates
                      PDF links, and downloads them into a local folder.
                      <br />
                      <strong>Output:</strong> Curated collection of PDF files
                      ready as "seeds" for Stage 2.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Status:</span>
                        <Badge
                          variant={
                            pipelineStatus.stage1.status === "completed"
                              ? "default"
                              : pipelineStatus.stage1.status === "running"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {pipelineStatus.stage1.status === "idle"
                            ? "Ready"
                            : pipelineStatus.stage1.status === "running"
                              ? "Running"
                              : pipelineStatus.stage1.status === "completed"
                                ? "Completed"
                                : "Error"}
                        </Badge>
                      </div>
                      <Progress
                        value={pipelineStatus.stage1.progress}
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground">
                        {pipelineStatus.stage1.currentStep}
                      </p>
                      {pipelineStatus.stage1.documentsFound > 0 && (
                        <p className="text-xs font-medium text-green-600">
                          {pipelineStatus.stage1.documentsFound} documents
                          discovered
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="relative">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Factory className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle>Stage 2: Fine-Tuning Data Factory</CardTitle>
                        <CardDescription>
                          Value-Add Generation - GPU-Accelerated Processing
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      <strong>Goal:</strong> Take a single, authoritative PDF
                      from Stage 1 and generate a massive, GPU-accelerated
                      synthetic dataset.
                      <br />
                      <strong>Process:</strong> Select a "seed" PDF, generate
                      thousands of synthetic error patterns and best practices,
                      combine with real text.
                      <br />
                      <strong>Output:</strong> Final, high-density Chroma vector
                      database ready for RAG system use.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Status:</span>
                        <Badge
                          variant={
                            pipelineStatus.stage2.status === "completed"
                              ? "default"
                              : pipelineStatus.stage2.status === "running"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {pipelineStatus.stage2.status === "idle"
                            ? "Waiting"
                            : pipelineStatus.stage2.status === "running"
                              ? "Running"
                              : pipelineStatus.stage2.status === "completed"
                                ? "Completed"
                                : "Error"}
                        </Badge>
                      </div>
                      <Progress
                        value={pipelineStatus.stage2.progress}
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground">
                        {pipelineStatus.stage2.currentStep}
                      </p>
                      {pipelineStatus.stage2.syntheticExamples > 0 && (
                        <p className="text-xs font-medium text-purple-600">
                          {pipelineStatus.stage2.syntheticExamples} synthetic
                          examples generated
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* V0 Factory Workflow */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    V0 Factory Workflow: From PDF to Vector Store
                  </CardTitle>
                  <CardDescription>
                    The complete pipeline process - Sequential workflow where
                    Stage 1 feeds Stage 2
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Stage 1 Flow */}
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-blue-700 mb-2">
                        Stage 1: Document Discovery (Information Gathering)
                      </h4>
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col items-center space-y-1">
                          <div
                            className={`p-2 rounded-full ${pipelineStatus.stage1.status === "completed" ? "bg-green-100" : "bg-gray-100"}`}
                          >
                            <Search
                              className={`h-4 w-4 ${pipelineStatus.stage1.status === "completed" ? "text-green-600" : "text-gray-400"}`}
                            />
                          </div>
                          <span className="text-xs">Discover</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col items-center space-y-1">
                          <div
                            className={`p-2 rounded-full ${discoveredPdfs.length > 0 ? "bg-blue-100" : "bg-gray-100"}`}
                          >
                            <Download
                              className={`h-4 w-4 ${discoveredPdfs.length > 0 ? "text-blue-600" : "text-gray-400"}`}
                            />
                          </div>
                          <span className="text-xs">Download</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col items-center space-y-1">
                          <div
                            className={`p-2 rounded-full ${discoveredPdfs.length > 0 ? "bg-blue-100" : "bg-gray-100"}`}
                          >
                            <FileText
                              className={`h-4 w-4 ${discoveredPdfs.length > 0 ? "text-blue-600" : "text-gray-400"}`}
                            />
                          </div>
                          <span className="text-xs">Repository</span>
                        </div>
                      </div>
                    </div>

                    {/* Stage 2 Flow */}
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-purple-700 mb-2">
                        Stage 2: Fine-Tuning Data Factory (Value-Add Generation)
                      </h4>
                      <div className="grid grid-cols-6 gap-2 items-center">
                        <div className="flex flex-col items-center space-y-1">
                          <div
                            className={`p-2 rounded-full ${selectedPdfs.length > 0 ? "bg-purple-100" : "bg-gray-100"}`}
                          >
                            <FileText
                              className={`h-4 w-4 ${selectedPdfs.length > 0 ? "text-purple-600" : "text-gray-400"}`}
                            />
                          </div>
                          <span className="text-xs text-center">Seed PDF</span>
                        </div>
                        <ArrowRight className="h-3 w-3 text-muted-foreground mx-auto" />
                        <div className="flex flex-col items-center space-y-1">
                          <div
                            className={`p-2 rounded-full ${pipelineStatus.stage2.progress > 20 ? "bg-purple-100" : "bg-gray-100"}`}
                          >
                            <Bot
                              className={`h-4 w-4 ${pipelineStatus.stage2.progress > 20 ? "text-purple-600" : "text-gray-400"}`}
                            />
                          </div>
                          <span className="text-xs text-center">
                            Extract & Chunk
                          </span>
                        </div>
                        <ArrowRight className="h-3 w-3 text-muted-foreground mx-auto" />
                        <div className="flex flex-col items-center space-y-1">
                          <div
                            className={`p-2 rounded-full ${pipelineStatus.stage2.progress > 40 ? "bg-purple-100" : "bg-gray-100"}`}
                          >
                            <Factory
                              className={`h-4 w-4 ${pipelineStatus.stage2.progress > 40 ? "text-purple-600" : "text-gray-400"}`}
                            />
                          </div>
                          <span className="text-xs text-center">
                            Synthetic Gen
                          </span>
                        </div>
                        <ArrowRight className="h-3 w-3 text-muted-foreground mx-auto" />
                        <div className="flex flex-col items-center space-y-1">
                          <div
                            className={`p-2 rounded-full ${pipelineStatus.stage2.progress > 60 ? "bg-purple-100" : "bg-gray-100"}`}
                          >
                            <Zap
                              className={`h-4 w-4 ${pipelineStatus.stage2.progress > 60 ? "text-purple-600" : "text-gray-400"}`}
                            />
                          </div>
                          <span className="text-xs text-center">
                            GPU Ollama
                          </span>
                        </div>
                        <ArrowRight className="h-3 w-3 text-muted-foreground mx-auto" />
                        <div className="flex flex-col items-center space-y-1">
                          <div
                            className={`p-2 rounded-full ${pipelineStatus.stage2.status === "completed" ? "bg-green-100" : "bg-gray-100"}`}
                          >
                            <Database
                              className={`h-4 w-4 ${pipelineStatus.stage2.status === "completed" ? "text-green-600" : "text-gray-400"}`}
                            />
                          </div>
                          <span className="text-xs text-center">Chroma DB</span>
                        </div>
                      </div>
                    </div>

                    {/* Output Examples */}
                    {pipelineStatus.stage2.status === "completed" && (
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h5 className="font-semibold text-green-800 mb-2">
                          Final Vector Store Contains:
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                          <div className="bg-white p-2 rounded border">
                            <div className="font-medium text-blue-600">
                              Real PDF Chunks
                            </div>
                            <div className="text-gray-600">
                              Original authoritative content from seed PDF with
                              metadata
                            </div>
                          </div>
                          <div className="bg-white p-2 rounded border">
                            <div className="font-medium text-red-600">
                              Synthetic Error Patterns
                            </div>
                            <div className="text-gray-600">
                              GPU-generated troubleshooting scenarios and common
                              configuration mistakes
                            </div>
                          </div>
                          <div className="bg-white p-2 rounded border">
                            <div className="font-medium text-green-600">
                              Synthetic Best Practices
                            </div>
                            <div className="text-gray-600">
                              AI-generated expert recommendations and optimal
                              configurations
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Start the pipeline or manage your data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <Button
                      onClick={startStage1}
                      disabled={pipelineStatus.stage1.status === "running"}
                      className="flex items-center gap-2"
                    >
                      {pipelineStatus.stage1.status === "running" ? (
                        <Clock className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                      {pipelineStatus.stage1.status === "completed"
                        ? "Restart Stage 1"
                        : "Start Stage 1"}
                    </Button>

                    <Button
                      onClick={() =>
                        selectedPdfs.length > 0 && startStage2(selectedPdfs)
                      }
                      disabled={
                        pipelineStatus.stage1.status !== "completed" ||
                        selectedPdfs.length === 0 ||
                        pipelineStatus.stage2.status === "running"
                      }
                      variant="secondary"
                      className="flex items-center gap-2"
                    >
                      {pipelineStatus.stage2.status === "running" ? (
                        <Clock className="h-4 w-4 animate-spin" />
                      ) : (
                        <Factory className="h-4 w-4" />
                      )}
                      {pipelineStatus.stage2.status === "completed"
                        ? "Restart Stage 2"
                        : "Start Stage 2"}
                    </Button>

                    <Button
                      onClick={resetPipeline}
                      variant="outline"
                      disabled={
                        pipelineStatus.stage1.status === "running" ||
                        pipelineStatus.stage2.status === "running"
                      }
                    >
                      Reset Pipeline
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Seed PDF Selection */}
              {discoveredPdfs.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Select Seed PDFs for V0 Factory Processing
                    </CardTitle>
                    <CardDescription>
                      Choose one or more PDFs from Stage 1 to transform into a
                      high-density vector database. These "seed" documents will
                      be combined with thousands of synthetic entries.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center mb-3">
                        <div className="text-sm text-muted-foreground">
                          <strong>Pipeline Philosophy:</strong> Multiple PDFs →
                          Thousands of entries (Real chunks + Synthetic data)
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedPdfs(discoveredPdfs)}
                          >
                            Select All
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedPdfs([])}
                          >
                            Clear All
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {discoveredPdfs.map((pdf, index) => (
                          <div
                            key={index}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              selectedPdfs.includes(pdf)
                                ? "border-purple-500 bg-purple-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => {
                              if (selectedPdfs.includes(pdf)) {
                                setSelectedPdfs(
                                  selectedPdfs.filter((p) => p !== pdf),
                                );
                              } else {
                                setSelectedPdfs([...selectedPdfs, pdf]);
                              }
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-red-500" />
                              <div className="flex-1">
                                <span className="text-sm font-medium block">
                                  {pdf}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  Ready for V0 Factory processing
                                </span>
                              </div>
                              {selectedPdfs.includes(pdf) && (
                                <div className="flex items-center gap-1">
                                  <CheckCircle className="h-4 w-4 text-purple-500" />
                                  <span className="text-xs text-purple-600 font-medium">
                                    Selected
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {selectedPdfs.length > 0 && (
                        <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <p className="text-sm text-purple-800 font-medium">
                            {selectedPdfs.length} PDF
                            {selectedPdfs.length > 1 ? "s" : ""} selected for
                            processing
                          </p>
                          <p className="text-xs text-purple-600 mt-1">
                            Each PDF will be processed sequentially to generate
                            synthetic data
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Final Output Structure */}
              {pipelineStatus.stage2.status === "completed" && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>
                    V0 Factory Pipeline Completed Successfully!
                  </AlertTitle>
                  <AlertDescription>
                    Your high-density Chroma vector database is ready for
                    expert-level RAG systems. The final output contains:
                    <div className="mt-3 space-y-2">
                      <div className="bg-white p-3 rounded border">
                        <div className="font-semibold text-sm mb-1">
                          📊 Vector Database Statistics:
                        </div>
                        <ul className="text-sm space-y-1">
                          <li>
                            • Real PDF chunks: ~
                            {Math.floor(Math.random() * 500 + 200)} entries
                          </li>
                          <li>
                            • Synthetic error patterns: ~
                            {Math.floor(
                              pipelineStatus.stage2.syntheticExamples * 0.4,
                            )}{" "}
                            entries
                          </li>
                          <li>
                            • Synthetic best practices: ~
                            {Math.floor(
                              pipelineStatus.stage2.syntheticExamples * 0.6,
                            )}{" "}
                            entries
                          </li>
                          <li>
                            • Total embeddings: ~
                            {pipelineStatus.stage2.syntheticExamples +
                              Math.floor(Math.random() * 500 + 200)}{" "}
                            vectors
                          </li>
                        </ul>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <div className="font-semibold text-sm mb-1">
                          🎯 Ready for Integration:
                        </div>
                        <ul className="text-sm space-y-1">
                          <li>• Chroma vector store with Ollama embeddings</li>
                          <li>• Metadata-rich entries for precise retrieval</li>
                          <li>
                            • Expert-level synthetic scenarios for fine-tuning
                          </li>
                        </ul>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="stage1" className="h-full">
              <div className="p-6 space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    Stage 1: Document Discovery Agent (Information Gathering)
                  </h3>
                  <p className="text-sm text-blue-700">
                    <strong>Goal:</strong> Build a local repository of relevant,
                    high-quality Cisco technical documents
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    <strong>Process:</strong> Provide high-level topics → Agent
                    searches web → Validates PDF links → Downloads to local
                    folder
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    <strong>Output:</strong> Curated collection of PDF files
                    ready as "seeds" for Stage 2
                  </p>
                </div>
                <DocumentDiscovery isOnline={isOnline} />
              </div>
            </TabsContent>

            <TabsContent value="stage2" className="h-full p-6">
              <div className="space-y-6">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h2 className="text-2xl font-bold mb-2 text-purple-800">
                    Stage 2: Fine-Tuning Data Factory (Value-Add Generation)
                  </h2>
                  <p className="text-purple-700 mb-2">
                    <strong>Goal:</strong> Take a single, authoritative PDF from
                    Stage 1 and generate a massive, GPU-accelerated synthetic
                    dataset
                  </p>
                  <p className="text-purple-700 mb-1">
                    <strong>Process:</strong> Select seed PDF → Extract text →
                    Generate thousands of synthetic examples → Combine with real
                    text → GPU-enabled Ollama embeddings → Chroma vector store
                  </p>
                  <p className="text-purple-700">
                    <strong>Output:</strong> Final, high-density Chroma vector
                    database ready for RAG system use
                  </p>
                </div>

                {pipelineStatus.stage1.status !== "completed" && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Stage 1 Required</AlertTitle>
                    <AlertDescription>
                      Please complete Stage 1 (Document Discovery) before
                      proceeding with Stage 2.
                    </AlertDescription>
                  </Alert>
                )}

                {discoveredPdfs.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Available Seed PDFs from Stage 1</CardTitle>
                      <CardDescription>
                        Select one or more PDFs to transform using the V0
                        Factory workflow. These documents will be the foundation
                        for generating thousands of synthetic entries.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm text-muted-foreground">
                            {selectedPdfs.length} of {discoveredPdfs.length}{" "}
                            PDFs selected
                          </span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedPdfs(discoveredPdfs)}
                            >
                              Select All
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedPdfs([])}
                            >
                              Clear All
                            </Button>
                          </div>
                        </div>
                        {discoveredPdfs.map((pdf, index) => (
                          <div
                            key={index}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              selectedPdfs.includes(pdf)
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => {
                              if (selectedPdfs.includes(pdf)) {
                                setSelectedPdfs(
                                  selectedPdfs.filter((p) => p !== pdf),
                                );
                              } else {
                                setSelectedPdfs([...selectedPdfs, pdf]);
                              }
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-red-500" />
                                <div>
                                  <span className="font-medium">{pdf}</span>
                                  <p className="text-sm text-muted-foreground">
                                    Ready for V0 Factory transformation
                                  </p>
                                </div>
                              </div>
                              {selectedPdfs.includes(pdf) && (
                                <CheckCircle className="h-5 w-5 text-blue-500" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedPdfs.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>V0 Factory Configuration</CardTitle>
                      <CardDescription>
                        Configure the synthetic generation parameters for
                        transforming {selectedPdfs.length} PDF
                        {selectedPdfs.length > 1 ? "s" : ""} into a high-density
                        vector database
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">
                            Synthetic Generation Target
                          </label>
                          <select className="w-full mt-1 p-2 border rounded-md">
                            <option value="1000">
                              1,000 synthetic entries
                            </option>
                            <option value="5000">
                              5,000 synthetic entries (Recommended)
                            </option>
                            <option value="10000">
                              10,000 synthetic entries
                            </option>
                            <option value="25000">
                              25,000 synthetic entries (High-Density)
                            </option>
                          </select>
                          <p className="text-xs text-muted-foreground mt-1">
                            Combined with real PDF chunks for maximum dataset
                            richness
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">
                            Synthetic Data Types (V0 Templates)
                          </label>
                          <div className="mt-1 space-y-1">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                defaultChecked
                                className="rounded"
                              />
                              <span className="text-sm">
                                Error Patterns (Plausible but incorrect configs)
                              </span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                defaultChecked
                                className="rounded"
                              />
                              <span className="text-sm">
                                Best Practices (Expert recommendations)
                              </span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                defaultChecked
                                className="rounded"
                              />
                              <span className="text-sm">
                                Command Variations (Syntax alternatives)
                              </span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                defaultChecked
                                className="rounded"
                              />
                              <span className="text-sm">
                                Troubleshooting Scenarios
                              </span>
                            </label>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Each type generates hundreds of variations based on
                            the seed PDF content
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                          <p className="text-sm text-yellow-800">
                            <strong>Factory Process:</strong> Extract text from
                            {selectedPdfs.length} seed PDF
                            {selectedPdfs.length > 1 ? "s" : ""} → Generate
                            thousands of synthetic error patterns and best
                            practices → Combine real + synthetic data → Create
                            GPU-accelerated Ollama embeddings → Output final
                            Chroma vector database ready for RAG systems.
                          </p>
                        </div>
                        <Button
                          onClick={() => startStage2(selectedPdfs)}
                          disabled={pipelineStatus.stage2.status === "running"}
                          className="w-full flex items-center gap-2"
                        >
                          {pipelineStatus.stage2.status === "running" ? (
                            <Clock className="h-4 w-4 animate-spin" />
                          ) : (
                            <Factory className="h-4 w-4" />
                          )}
                          {pipelineStatus.stage2.status === "running"
                            ? "Factory Processing..."
                            : "Start Factory Transformation"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {pipelineStatus.stage2.status === "running" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Factory Processing Progress</CardTitle>
                      <CardDescription>
                        GPU-accelerated transformation of {selectedPdfs.length}{" "}
                        seed PDF{selectedPdfs.length > 1 ? "s" : ""} into
                        high-density vector database
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                          <span>{pipelineStatus.stage2.currentStep}</span>
                          <span>
                            {Math.round(pipelineStatus.stage2.progress)}%
                          </span>
                        </div>
                        <Progress
                          value={pipelineStatus.stage2.progress}
                          className="h-3"
                        />
                        {pipelineStatus.stage2.syntheticExamples > 0 && (
                          <div className="space-y-1">
                            <p className="text-sm text-purple-600 font-medium">
                              Generated{" "}
                              {pipelineStatus.stage2.syntheticExamples.toLocaleString()}{" "}
                              synthetic entries
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Combining with real PDF chunks for maximum dataset
                              richness
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {pipelineStatus.stage2.status === "completed" && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Factory Transformation Complete!</AlertTitle>
                    <AlertDescription>
                      <div className="space-y-2">
                        <p>
                          Your {selectedPdfs.length} seed PDF
                          {selectedPdfs.length > 1 ? "s have" : " has"} been
                          transformed into a high-density vector database with{" "}
                          {pipelineStatus.stage2.syntheticExamples.toLocaleString()}{" "}
                          GPU-generated synthetic entries plus original PDF
                          chunks.
                        </p>
                        <div className="bg-white p-3 rounded border mt-3">
                          <div className="text-sm font-semibold mb-1">
                            Final Output Ready:
                          </div>
                          <ul className="text-sm space-y-1">
                            <li>
                              ✅ Chroma vector database with Ollama embeddings
                            </li>
                            <li>
                              ✅ Real PDF chunks with metadata and page
                              references
                            </li>
                            <li>
                              ✅ Synthetic error patterns and best practices
                            </li>
                            <li>
                              ✅ Ready for expert-level RAG system integration
                            </li>
                          </ul>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>

            <TabsContent value="search" className="h-full">
              <DocumentSearch isOnline={isOnline} />
            </TabsContent>

            <TabsContent value="config" className="h-full">
              <SystemConfiguration
                isOnline={isOnline}
                currentDatabaseType={databaseType}
              />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Dashboard;
