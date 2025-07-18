import React, { useState, useEffect } from "react";
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
import { useWebSocket } from "../hooks/useWebSocket";

interface DashboardProps {
  isOnline?: boolean;
  databaseType?: "sqlite" | "postgresql" | "supabase";
  activeTab?:
    | "overview"
    | "stage1"
    | "stage2"
    | "features"
    | "search"
    | "config";
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
    outputPhase: 1 | 2 | 3 | 4 | 5;
  };
  coreFeatures: {
    phase1: {
      status: "idle" | "running" | "completed" | "error";
      progress: number;
      currentStep: string;
      substep: number;
    };
    phase2: {
      status: "idle" | "running" | "completed" | "error";
      progress: number;
      currentStep: string;
      substep: number;
    };
    phase3: {
      status: "idle" | "running" | "completed" | "error";
      progress: number;
      currentStep: string;
      substep: number;
    };
    phase4: {
      status: "idle" | "running" | "completed" | "error";
      progress: number;
      currentStep: string;
      substep: number;
    };
  };
}

const Dashboard: React.FC<DashboardProps> = ({
  isOnline = true,
  databaseType = "sqlite",
  activeTab = "overview",
}) => {
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
      outputPhase: 1,
    },
    coreFeatures: {
      phase1: {
        status: "idle",
        progress: 0,
        currentStep: "Ready to start Real-Time Document Quality Assessment",
        substep: 0,
      },
      phase2: {
        status: "idle",
        progress: 0,
        currentStep: "Ready to start Intelligent Synthetic Data Templates",
        substep: 0,
      },
      phase3: {
        status: "idle",
        progress: 0,
        currentStep: "Ready to start Vector Database Quality Metrics",
        substep: 0,
      },
      phase4: {
        status: "idle",
        progress: 0,
        currentStep: "Ready to start Interactive RAG Testing Playground",
        substep: 0,
      },
    },
  });
  const [selectedPdfs, setSelectedPdfs] = useState<string[]>([]);
  const [discoveredPdfs, setDiscoveredPdfs] = useState<string[]>([]);
  const [selectedOutputPhase, setSelectedOutputPhase] = useState<
    1 | 2 | 3 | 4 | 5
  >(1);

  // WebSocket connection for backend communication
  const { isConnected, sendMessage, onMessage } = useWebSocket("dashboard");

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
        documentsFound: 0,
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

  const startStage2 = async (
    pdfFiles: string[],
    outputPhase: 1 | 2 | 3 | 4 | 5 = selectedOutputPhase,
  ) => {
    if (!pdfFiles || pdfFiles.length === 0) return;

    setPipelineStatus((prev) => ({
      ...prev,
      stage2: {
        ...prev.stage2,
        status: "running",
        progress: 0,
        currentStep: `Initializing PHASE ${outputPhase} processing for ${pdfFiles.length} file${pdfFiles.length > 1 ? "s" : ""}...`,
        outputPhase,
      },
    }));

    const phaseSteps = {
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
        "Finalizing basic Chroma vector store...",
      ],
      2: [
        "Initializing Hierarchical Index structure...",
        "Parsing configurations into structured chunks...",
        "Building device memory filters...",
        "Creating feature-area taxonomies...",
        "Implementing version-aware filtering...",
        "Optimizing retrieval precision...",
        "Building foundational index (80-88% accuracy)...",
        "Finalizing hierarchical vector store...",
      ],
      3: [
        "Building Graph RAG knowledge graph...",
        "Creating device-feature relationships...",
        "Mapping error-solution dependencies...",
        "Building version compatibility graph...",
        "Implementing graph-aware retrieval...",
        "Optimizing for dependency nuance...",
        "Achieving low 90s accuracy target...",
        "Finalizing Graph RAG layer...",
      ],
      4: [
        "Initializing Agentic Loop framework...",
        "Building tool execution pipeline...",
        "Creating hypothesis validation system...",
        "Implementing iterative evidence gathering...",
        "Building command execution interface...",
        "Creating validated case repository...",
        "Optimizing for upper 90s accuracy...",
        "Finalizing Agentic Loop system...",
      ],
      5: [
        "Setting up continuous evaluation harness...",
        "Building gold standard test sets...",
        "Implementing regression monitoring...",
        "Creating feedback capture system...",
        "Building automated hardening pipeline...",
        "Implementing accuracy maintenance...",
        "Achieving ≥95% in-scope accuracy...",
        "Finalizing continuous eval system...",
      ],
    };

    const steps = phaseSteps[outputPhase];
    const totalSteps = steps.length * pdfFiles.length; // Account for processing multiple files
    let currentStepIndex = 0;

    // Process each PDF file sequentially
    for (let fileIndex = 0; fileIndex < pdfFiles.length; fileIndex++) {
      const currentFile = pdfFiles[fileIndex];

      for (let i = 0; i < steps.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 2500));
        currentStepIndex++;
        const progress = (currentStepIndex / totalSteps) * 100;

        // Simulate more realistic synthetic data generation
        let syntheticExamples = 0;
        if (i >= 2) {
          // Exponential growth in synthetic examples, multiplied by number of files
          const baseExamples =
            Math.floor(Math.pow(2, i - 1) * 250) +
            Math.floor(Math.random() * 500);
          syntheticExamples = Math.min(
            baseExamples * (fileIndex + 1),
            15000 * pdfFiles.length,
          );
        }

        const currentStep =
          pdfFiles.length > 1
            ? `[File ${fileIndex + 1}/${pdfFiles.length}: ${currentFile}] ${steps[i]}`
            : steps[i];

        setPipelineStatus((prev) => ({
          ...prev,
          stage2: {
            ...prev.stage2,
            progress,
            currentStep,
            syntheticExamples,
            status: currentStepIndex === totalSteps ? "completed" : "running",
          },
        }));
      }
    }

    // Mark the processed documents
    // if (typeof webSearchService.markDocumentAsProcessed === "function") {
    //   pdfFiles.forEach((pdfFile) => {
    //     webSearchService.markDocumentAsProcessed(pdfFile);
    //   });
    // }
  };

  const startCoreFeaturePhase = async (phaseNumber: 1 | 2 | 3 | 4) => {
    const phaseKey =
      `phase${phaseNumber}` as keyof typeof pipelineStatus.coreFeatures;

    const phaseDefinitions = {
      1: {
        title: "Real-Time Document Quality Assessment & Validation",
        steps: [
          "Initializing document quality scoring engine...",
          "Setting up real-time validation pipelines...",
          "Implementing content authenticity checks...",
          "Building quality metrics dashboard...",
          "Finalizing assessment automation...",
        ],
      },
      2: {
        title: "Intelligent Synthetic Data Templates & Customization",
        steps: [
          "Creating adaptive template generation system...",
          "Building domain-specific customization engine...",
          "Implementing intelligent pattern recognition...",
          "Setting up template quality validation...",
          "Finalizing customization interface...",
        ],
      },
      3: {
        title: "Vector Database Quality Metrics & Optimization",
        steps: [
          "Initializing vector quality analysis framework...",
          "Building embedding similarity metrics...",
          "Implementing retrieval accuracy optimization...",
          "Setting up performance monitoring dashboard...",
          "Finalizing optimization automation...",
        ],
      },
      4: {
        title: "Interactive RAG Testing & Validation Playground",
        steps: [
          "Creating interactive testing environment...",
          "Building validation scenario generator...",
          "Implementing real-time accuracy feedback...",
          "Setting up A/B testing framework...",
          "Finalizing playground interface...",
        ],
      },
    };

    const currentPhase = phaseDefinitions[phaseNumber];

    setPipelineStatus((prev) => ({
      ...prev,
      coreFeatures: {
        ...prev.coreFeatures,
        [phaseKey]: {
          ...prev.coreFeatures[phaseKey],
          status: "running",
          progress: 0,
          currentStep: currentPhase.steps[0],
          substep: 1,
        },
      },
    }));

    // Execute each substep
    for (let i = 0; i < currentPhase.steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const progress = ((i + 1) / currentPhase.steps.length) * 100;

      setPipelineStatus((prev) => ({
        ...prev,
        coreFeatures: {
          ...prev.coreFeatures,
          [phaseKey]: {
            ...prev.coreFeatures[phaseKey],
            progress,
            currentStep: currentPhase.steps[i],
            substep: i + 1,
            status:
              i === currentPhase.steps.length - 1 ? "completed" : "running",
          },
        },
      }));
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
        outputPhase: 1,
      },
      coreFeatures: {
        phase1: {
          status: "idle",
          progress: 0,
          currentStep: "Ready to start Real-Time Document Quality Assessment",
          substep: 0,
        },
        phase2: {
          status: "idle",
          progress: 0,
          currentStep: "Ready to start Intelligent Synthetic Data Templates",
          substep: 0,
        },
        phase3: {
          status: "idle",
          progress: 0,
          currentStep: "Ready to start Vector Database Quality Metrics",
          substep: 0,
        },
        phase4: {
          status: "idle",
          progress: 0,
          currentStep: "Ready to start Interactive RAG Testing Playground",
          substep: 0,
        },
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
              value as
                | "overview"
                | "stage1"
                | "stage2"
                | "features"
                | "search"
                | "config",
            )
          }
          className="h-full flex flex-col"
        >
          <TabsList className="grid grid-cols-6 w-full max-w-5xl mx-auto">
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
            <TabsTrigger value="features" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Core Features
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
                            className={`p-2 rounded-full ${pipelineStatus.stage2.status === "completed" ? "bg-green-100" : "bg-gray-100"}`}
                          >
                            <Zap
                              className={`h-4 w-4 ${pipelineStatus.stage2.status === "completed" ? "text-green-600" : "text-gray-400"}`}
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
                        selectedPdfs.length > 0 &&
                        startStage2(selectedPdfs, selectedOutputPhase)
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
                        ? `Restart Stage 2 (Phase ${selectedOutputPhase}) - ${selectedPdfs.length} file${selectedPdfs.length > 1 ? "s" : ""}`
                        : `Start Stage 2 (Phase ${selectedOutputPhase}) - ${selectedPdfs.length} file${selectedPdfs.length > 1 ? "s" : ""}`}
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

              {/* Output Phase Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>RAG Output Phase Selection</CardTitle>
                  <CardDescription>
                    Choose the output phase for your RAG system. Each phase
                    builds upon the previous to achieve higher accuracy.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        {
                          phase: 1 as const,
                          title:
                            "PHASE 1: Multi-Stage Synthetic Knowledge Amplification",
                          description:
                            "Current solution - Generate synthetic Q/A, error patterns, and minimal config exemplars to bootstrap domain coverage.",
                          accuracy: "Basic RAG",
                          color: "blue",
                        },
                        {
                          phase: 2 as const,
                          title:
                            "PHASE 2: Foundational Hierarchical Index + Memory Filters",
                          description:
                            "Parse configs/docs into structured chunks and filter retrieval by live device context; reach ~80–88% quickly.",
                          accuracy: "80-88%",
                          color: "green",
                        },
                        {
                          phase: 3 as const,
                          title: "PHASE 3: Graph RAG Layer",
                          description:
                            "Link devices, features, errors, and bugs; graph-expand + constrain retrieval for nuanced dependency/version issues; low 90s accuracy.",
                          accuracy: "Low 90s%",
                          color: "purple",
                        },
                        {
                          phase: 4 as const,
                          title: "PHASE 4: Agentic Loop",
                          description:
                            "Plan/act/check tool calls to gather missing evidence and validate recommendations; close hard troubleshooting cases; push upper 90s.",
                          accuracy: "Upper 90s%",
                          color: "orange",
                        },
                        {
                          phase: 5 as const,
                          title: "PHASE 5: Continuous Eval/Hardening",
                          description:
                            "Gold-set monitoring, feedback capture, parser/graph regression fixes; maintain ≥95% in-scope accuracy over time.",
                          accuracy: "≥95%",
                          color: "red",
                        },
                      ].map((phaseInfo) => (
                        <div
                          key={phaseInfo.phase}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedOutputPhase === phaseInfo.phase
                              ? phaseInfo.color === "blue"
                                ? "border-blue-500 bg-blue-50"
                                : phaseInfo.color === "green"
                                  ? "border-green-500 bg-green-50"
                                  : phaseInfo.color === "purple"
                                    ? "border-purple-500 bg-purple-50"
                                    : phaseInfo.color === "orange"
                                      ? "border-orange-500 bg-orange-50"
                                      : "border-red-500 bg-red-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() =>
                            setSelectedOutputPhase(phaseInfo.phase)
                          }
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span
                                  className={`text-sm font-bold px-2 py-1 rounded ${
                                    phaseInfo.color === "blue"
                                      ? "bg-blue-100 text-blue-800"
                                      : phaseInfo.color === "green"
                                        ? "bg-green-100 text-green-800"
                                        : phaseInfo.color === "purple"
                                          ? "bg-purple-100 text-purple-800"
                                          : phaseInfo.color === "orange"
                                            ? "bg-orange-100 text-orange-800"
                                            : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {phaseInfo.accuracy}
                                </span>
                                {selectedOutputPhase === phaseInfo.phase && (
                                  <CheckCircle
                                    className={`h-4 w-4 ${
                                      phaseInfo.color === "blue"
                                        ? "text-blue-500"
                                        : phaseInfo.color === "green"
                                          ? "text-green-500"
                                          : phaseInfo.color === "purple"
                                            ? "text-purple-500"
                                            : phaseInfo.color === "orange"
                                              ? "text-orange-500"
                                              : "text-red-500"
                                    }`}
                                  />
                                )}
                              </div>
                              <h4 className="font-semibold text-sm mb-1">
                                {phaseInfo.title}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {phaseInfo.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedOutputPhase > 1 && (
                      <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-sm text-amber-800 font-medium">
                          Phase {selectedOutputPhase} Selected: Advanced RAG
                          Architecture
                        </p>
                        <p className="text-xs text-amber-600 mt-1">
                          This phase includes all previous phase capabilities
                          plus advanced features for higher accuracy.
                        </p>
                      </div>
                    )}
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
                            processing → {selectedPdfs.length} output
                            {selectedPdfs.length > 1 ? "s" : ""} will be
                            generated
                          </p>
                          <p className="text-xs text-purple-600 mt-1">
                            Each PDF will be processed sequentially to generate
                            separate vector databases with synthetic data
                          </p>
                          {selectedPdfs.length > 1 && (
                            <div className="mt-2 p-2 bg-white rounded border">
                              <p className="text-xs text-purple-700 font-medium">
                                Multi-Output Generation:
                              </p>
                              <ul className="text-xs text-purple-600 mt-1 space-y-1">
                                {selectedPdfs.map((pdf, index) => (
                                  <li key={index}>
                                    • Output {index + 1}: {pdf} → Vector DB{" "}
                                    {index + 1}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Core Features Enhancement Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Core RAG Enhancement Features</CardTitle>
                  <CardDescription>
                    Four advanced features to maximize RAG output quality and
                    performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Phase 1: Real-Time Document Quality Assessment */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          Phase 1: Real-Time Document Quality Assessment
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="text-sm">
                            <strong>Substeps:</strong>
                            <ol className="list-decimal list-inside mt-2 space-y-1 text-xs text-muted-foreground">
                              <li>
                                Initialize document quality scoring engine
                              </li>
                              <li>Set up real-time validation pipelines</li>
                              <li>Implement content authenticity checks</li>
                              <li>Build quality metrics dashboard</li>
                              <li>Finalize assessment automation</li>
                            </ol>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress:</span>
                              <span>
                                {Math.round(
                                  pipelineStatus.coreFeatures.phase1.progress,
                                )}
                                %
                              </span>
                            </div>
                            <Progress
                              value={
                                pipelineStatus.coreFeatures.phase1.progress
                              }
                              className="h-2"
                            />
                            <p className="text-xs text-muted-foreground">
                              {pipelineStatus.coreFeatures.phase1.currentStep}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Phase 2: Intelligent Synthetic Data Templates */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bot className="h-5 w-5 text-blue-600" />
                          Phase 2: Intelligent Synthetic Data Templates
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="text-sm">
                            <strong>Substeps:</strong>
                            <ol className="list-decimal list-inside mt-2 space-y-1 text-xs text-muted-foreground">
                              <li>
                                Create adaptive template generation system
                              </li>
                              <li>
                                Build domain-specific customization engine
                              </li>
                              <li>Implement intelligent pattern recognition</li>
                              <li>Set up template quality validation</li>
                              <li>Finalize customization interface</li>
                            </ol>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress:</span>
                              <span>
                                {Math.round(
                                  pipelineStatus.coreFeatures.phase2.progress,
                                )}
                                %
                              </span>
                            </div>
                            <Progress
                              value={
                                pipelineStatus.coreFeatures.phase2.progress
                              }
                              className="h-2"
                            />
                            <p className="text-xs text-muted-foreground">
                              {pipelineStatus.coreFeatures.phase2.currentStep}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Phase 3: Vector Database Quality Metrics */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Database className="h-5 w-5 text-purple-600" />
                          Phase 3: Vector Database Quality Metrics
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="text-sm">
                            <strong>Substeps:</strong>
                            <ol className="list-decimal list-inside mt-2 space-y-1 text-xs text-muted-foreground">
                              <li>
                                Initialize vector quality analysis framework
                              </li>
                              <li>Build embedding similarity metrics</li>
                              <li>Implement retrieval accuracy optimization</li>
                              <li>Set up performance monitoring dashboard</li>
                              <li>Finalize optimization automation</li>
                            </ol>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress:</span>
                              <span>
                                {Math.round(
                                  pipelineStatus.coreFeatures.phase3.progress,
                                )}
                                %
                              </span>
                            </div>
                            <Progress
                              value={
                                pipelineStatus.coreFeatures.phase3.progress
                              }
                              className="h-2"
                            />
                            <p className="text-xs text-muted-foreground">
                              {pipelineStatus.coreFeatures.phase3.currentStep}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Phase 4: Interactive RAG Testing Playground */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="h-5 w-5 text-orange-600" />
                          Phase 4: Interactive RAG Testing Playground
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="text-sm">
                            <strong>Substeps:</strong>
                            <ol className="list-decimal list-inside mt-2 space-y-1 text-xs text-muted-foreground">
                              <li>Create interactive testing environment</li>
                              <li>Build validation scenario generator</li>
                              <li>Implement real-time accuracy feedback</li>
                              <li>Set up A/B testing framework</li>
                              <li>Finalize playground interface</li>
                            </ol>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress:</span>
                              <span>
                                {Math.round(
                                  pipelineStatus.coreFeatures.phase4.progress,
                                )}
                                %
                              </span>
                            </div>
                            <Progress
                              value={
                                pipelineStatus.coreFeatures.phase4.progress
                              }
                              className="h-2"
                            />
                            <p className="text-xs text-muted-foreground">
                              {pipelineStatus.coreFeatures.phase4.currentStep}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Core Features Summary */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                    <h4 className="font-semibold text-lg mb-2">
                      Enhanced RAG Pipeline Status
                    </h4>
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div className="space-y-1">
                        <div
                          className={`text-2xl font-bold ${
                            pipelineStatus.coreFeatures.phase1.status ===
                            "completed"
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          {pipelineStatus.coreFeatures.phase1.status ===
                          "completed"
                            ? "✓"
                            : "1"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Quality Assessment
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div
                          className={`text-2xl font-bold ${
                            pipelineStatus.coreFeatures.phase2.status ===
                            "completed"
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          {pipelineStatus.coreFeatures.phase2.status ===
                          "completed"
                            ? "✓"
                            : "2"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Synthetic Templates
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div
                          className={`text-2xl font-bold ${
                            pipelineStatus.coreFeatures.phase3.status ===
                            "completed"
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          {pipelineStatus.coreFeatures.phase3.status ===
                          "completed"
                            ? "✓"
                            : "3"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Vector Optimization
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div
                          className={`text-2xl font-bold ${
                            pipelineStatus.coreFeatures.phase4.status ===
                            "completed"
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          {pipelineStatus.coreFeatures.phase4.status ===
                          "completed"
                            ? "✓"
                            : "4"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Testing Playground
                        </div>
                      </div>
                    </div>

                    {/* Overall Progress */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Overall Enhancement Progress</span>
                        <span>
                          {
                            [
                              pipelineStatus.coreFeatures.phase1.status ===
                                "completed",
                              pipelineStatus.coreFeatures.phase2.status ===
                                "completed",
                              pipelineStatus.coreFeatures.phase3.status ===
                                "completed",
                              pipelineStatus.coreFeatures.phase4.status ===
                                "completed",
                            ].filter(Boolean).length
                          }
                          /4 Phases Complete
                        </span>
                      </div>
                      <Progress
                        value={
                          [
                            pipelineStatus.coreFeatures.phase1.status ===
                              "completed",
                            pipelineStatus.coreFeatures.phase2.status ===
                              "completed",
                            pipelineStatus.coreFeatures.phase3.status ===
                              "completed",
                            pipelineStatus.coreFeatures.phase4.status ===
                              "completed",
                          ].filter(Boolean).length * 25
                        }
                        className="h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Final Output Structure */}
              {pipelineStatus.stage2.status === "completed" && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>
                    V0 Factory Pipeline Completed Successfully!
                  </AlertTitle>
                  <AlertDescription>
                    Your {selectedPdfs.length} high-density Chroma vector
                    database{selectedPdfs.length > 1 ? "s are" : " is"} ready
                    for expert-level RAG systems. The final output contains:
                    <div className="mt-3 space-y-2">
                      <div className="bg-white p-3 rounded border">
                        <div className="font-semibold text-sm mb-1">
                          📊 Vector Database Statistics (Per Output):
                        </div>
                        <ul className="text-sm space-y-1">
                          <li>
                            • Real PDF chunks: ~
                            {Math.floor(Math.random() * 500 + 200)} entries each
                          </li>
                          <li>
                            • Synthetic error patterns: ~
                            {Math.floor(
                              (pipelineStatus.stage2.syntheticExamples * 0.4) /
                                selectedPdfs.length,
                            )}{" "}
                            entries each
                          </li>
                          <li>
                            • Synthetic best practices: ~
                            {Math.floor(
                              (pipelineStatus.stage2.syntheticExamples * 0.6) /
                                selectedPdfs.length,
                            )}{" "}
                            entries each
                          </li>
                          <li>
                            • Total embeddings: ~
                            {Math.floor(
                              (pipelineStatus.stage2.syntheticExamples +
                                Math.floor(Math.random() * 500 + 200)) /
                                selectedPdfs.length,
                            )}{" "}
                            vectors per database
                          </li>
                          <li className="font-medium text-green-600">
                            • {selectedPdfs.length} separate vector database
                            {selectedPdfs.length > 1 ? "s" : ""} generated
                          </li>
                        </ul>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <div className="font-semibold text-sm mb-1">
                          🎯 Ready for Integration:
                        </div>
                        <ul className="text-sm space-y-1">
                          <li>
                            • {selectedPdfs.length} Chroma vector store
                            {selectedPdfs.length > 1 ? "s" : ""} with Ollama
                            embeddings
                          </li>
                          <li>• Metadata-rich entries for precise retrieval</li>
                          <li>
                            • Expert-level synthetic scenarios for fine-tuning
                          </li>
                          <li>
                            • Each database specialized for its source document
                          </li>
                        </ul>
                      </div>
                      {selectedPdfs.length > 1 && (
                        <div className="bg-green-50 p-3 rounded border border-green-200 mt-3">
                          <div className="text-sm font-semibold mb-1 text-green-800">
                            🎯 Multi-Output Summary:
                          </div>
                          <ul className="text-sm space-y-1 text-green-700">
                            {selectedPdfs.map((pdf, index) => (
                              <li key={index}>
                                • Output {index + 1}: {pdf} → Specialized Phase{" "}
                                {pipelineStatus.stage2.outputPhase} vector
                                database
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
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
                      <CardTitle>
                        Configure Phase {selectedOutputPhase} Parameters
                      </CardTitle>
                      <CardDescription>
                        Configure Phase {selectedOutputPhase} parameters for
                        transforming {selectedPdfs.length} PDF
                        {selectedPdfs.length > 1 ? "s" : ""} into a{" "}
                        {selectedOutputPhase === 1
                          ? "basic"
                          : selectedOutputPhase === 2
                            ? "hierarchical"
                            : selectedOutputPhase === 3
                              ? "graph-enhanced"
                              : selectedOutputPhase === 4
                                ? "agentic"
                                : "continuously-evaluated"}{" "}
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
                            <strong>
                              Phase {selectedOutputPhase} Process:
                            </strong>{" "}
                            {selectedOutputPhase === 1
                              ? "Extract text from seed PDFs → Generate synthetic data → Create basic embeddings → Output standard vector database"
                              : selectedOutputPhase === 2
                                ? "Parse configs into structured chunks → Build hierarchical index → Implement memory filters → Achieve 80-88% accuracy"
                                : selectedOutputPhase === 3
                                  ? "Build knowledge graph → Map relationships → Implement graph-aware retrieval → Target low 90s accuracy"
                                  : selectedOutputPhase === 4
                                    ? "Create agentic framework → Build tool execution → Implement validation loops → Push upper 90s accuracy"
                                    : "Setup continuous evaluation → Build gold standards → Implement monitoring → Maintain ≥95% accuracy"}
                          </p>
                        </div>
                        <Button
                          onClick={() =>
                            startStage2(selectedPdfs, selectedOutputPhase)
                          }
                          disabled={pipelineStatus.stage2.status === "running"}
                          className="w-full flex items-center gap-2"
                        >
                          {pipelineStatus.stage2.status === "running" ? (
                            <Clock className="h-4 w-4 animate-spin" />
                          ) : (
                            <Factory className="h-4 w-4" />
                          )}
                          {pipelineStatus.stage2.status === "running"
                            ? `Phase ${selectedOutputPhase} Processing ${selectedPdfs.length} file${selectedPdfs.length > 1 ? "s" : ""}...`
                            : `Start Phase ${selectedOutputPhase} Transformation (${selectedPdfs.length} output${selectedPdfs.length > 1 ? "s" : ""})`}
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
                        Phase {pipelineStatus.stage2.outputPhase} transformation
                        of {selectedPdfs.length} seed PDF
                        {selectedPdfs.length > 1 ? "s" : ""} into
                        {pipelineStatus.stage2.outputPhase === 1
                          ? "basic"
                          : pipelineStatus.stage2.outputPhase === 2
                            ? "hierarchical"
                            : pipelineStatus.stage2.outputPhase === 3
                              ? "graph-enhanced"
                              : pipelineStatus.stage2.outputPhase === 4
                                ? "agentic"
                                : "continuously-evaluated"}{" "}
                        vector database
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
                    <AlertTitle>
                      Phase {pipelineStatus.stage2.outputPhase} Transformation
                      Complete!
                    </AlertTitle>
                    <AlertDescription>
                      <div className="space-y-2">
                        <p>
                          Your {selectedPdfs.length} seed PDF
                          {selectedPdfs.length > 1 ? "s have" : " has"} been
                          transformed into {selectedPdfs.length} separate Phase{" "}
                          {pipelineStatus.stage2.outputPhase} vector database
                          {selectedPdfs.length > 1 ? "s" : ""}
                          with{" "}
                          {pipelineStatus.stage2.syntheticExamples.toLocaleString()}{" "}
                          total{" "}
                          {pipelineStatus.stage2.outputPhase === 1
                            ? "synthetic entries"
                            : pipelineStatus.stage2.outputPhase === 2
                              ? "structured chunks with memory filters"
                              : pipelineStatus.stage2.outputPhase === 3
                                ? "graph-enhanced relationships"
                                : pipelineStatus.stage2.outputPhase === 4
                                  ? "agentic validation entries"
                                  : "continuously-evaluated entries"}{" "}
                          plus original PDF chunks.
                        </p>
                        <div className="bg-white p-3 rounded border mt-3">
                          <div className="text-sm font-semibold mb-1">
                            Phase {pipelineStatus.stage2.outputPhase} Output
                            {selectedPdfs.length > 1 ? "s" : ""}
                            Ready:
                          </div>
                          <ul className="text-sm space-y-1">
                            <li>
                              ✅ {selectedPdfs.length}{" "}
                              {pipelineStatus.stage2.outputPhase === 1
                                ? "Basic Chroma vector database"
                                : pipelineStatus.stage2.outputPhase === 2
                                  ? "Hierarchical index with memory filters"
                                  : pipelineStatus.stage2.outputPhase === 3
                                    ? "Graph RAG with relationship mapping"
                                    : pipelineStatus.stage2.outputPhase === 4
                                      ? "Agentic loop with tool execution"
                                      : "Continuous evaluation harness"}
                              {selectedPdfs.length > 1 ? "s" : ""}
                            </li>
                            <li>
                              ✅{" "}
                              {pipelineStatus.stage2.outputPhase === 1
                                ? "Real PDF chunks with metadata"
                                : pipelineStatus.stage2.outputPhase === 2
                                  ? "Structured config chunks (80-88% accuracy)"
                                  : pipelineStatus.stage2.outputPhase === 3
                                    ? "Graph-aware retrieval (low 90s accuracy)"
                                    : pipelineStatus.stage2.outputPhase === 4
                                      ? "Validated evidence gathering (upper 90s)"
                                      : "Gold standard monitoring (≥95% accuracy)"}{" "}
                              per database
                            </li>
                            <li>
                              ✅{" "}
                              {pipelineStatus.stage2.outputPhase === 1
                                ? "Synthetic error patterns and best practices"
                                : pipelineStatus.stage2.outputPhase === 2
                                  ? "Device context filtering"
                                  : pipelineStatus.stage2.outputPhase === 3
                                    ? "Dependency and version awareness"
                                    : pipelineStatus.stage2.outputPhase === 4
                                      ? "Iterative hypothesis validation"
                                      : "Regression control and feedback"}{" "}
                              for each output
                            </li>
                            <li>
                              ✅ {selectedPdfs.length} database
                              {selectedPdfs.length > 1 ? "s" : ""} ready for{" "}
                              {pipelineStatus.stage2.outputPhase === 1
                                ? "basic"
                                : pipelineStatus.stage2.outputPhase === 2
                                  ? "precision-focused"
                                  : pipelineStatus.stage2.outputPhase === 3
                                    ? "nuanced dependency-aware"
                                    : pipelineStatus.stage2.outputPhase === 4
                                      ? "expert-level validated"
                                      : "production-grade maintained"}{" "}
                              RAG system integration
                            </li>
                          </ul>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>

            <TabsContent value="features" className="h-full p-6">
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
                  <h2 className="text-2xl font-bold mb-2">
                    Core RAG Enhancement Features
                  </h2>
                  <p className="text-muted-foreground mb-2">
                    <strong>Goal:</strong> Implement four advanced features to
                    maximize RAG output quality and performance
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Process:</strong> Each feature is implemented in a
                    separate phase with 5 substeps for comprehensive enhancement
                  </p>
                </div>

                {/* Detailed Phase Implementation */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Phase 1 Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Phase 1: Real-Time Document Quality Assessment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm">
                          <strong>Substeps:</strong>
                          <ol className="list-decimal list-inside mt-2 space-y-1 text-xs text-muted-foreground">
                            <li>Initialize document quality scoring engine</li>
                            <li>Set up real-time validation pipelines</li>
                            <li>Implement content authenticity checks</li>
                            <li>Build quality metrics dashboard</li>
                            <li>Finalize assessment automation</li>
                          </ol>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress:</span>
                            <span>
                              {Math.round(
                                pipelineStatus.coreFeatures.phase1.progress,
                              )}
                              %
                            </span>
                          </div>
                          <Progress
                            value={pipelineStatus.coreFeatures.phase1.progress}
                            className="h-2"
                          />
                          <p className="text-xs text-muted-foreground">
                            {pipelineStatus.coreFeatures.phase1.currentStep}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Phase 2 Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-blue-600" />
                        Phase 2: Intelligent Synthetic Data Templates
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm">
                          <strong>Substeps:</strong>
                          <ol className="list-decimal list-inside mt-2 space-y-1 text-xs text-muted-foreground">
                            <li>Create adaptive template generation system</li>
                            <li>Build domain-specific customization engine</li>
                            <li>Implement intelligent pattern recognition</li>
                            <li>Set up template quality validation</li>
                            <li>Finalize customization interface</li>
                          </ol>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress:</span>
                            <span>
                              {Math.round(
                                pipelineStatus.coreFeatures.phase2.progress,
                              )}
                              %
                            </span>
                          </div>
                          <Progress
                            value={pipelineStatus.coreFeatures.phase2.progress}
                            className="h-2"
                          />
                          <p className="text-xs text-muted-foreground">
                            {pipelineStatus.coreFeatures.phase2.currentStep}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Phase 3 Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-purple-600" />
                        Phase 3: Vector Database Quality Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm">
                          <strong>Substeps:</strong>
                          <ol className="list-decimal list-inside mt-2 space-y-1 text-xs text-muted-foreground">
                            <li>
                              Initialize vector quality analysis framework
                            </li>
                            <li>Build embedding similarity metrics</li>
                            <li>Implement retrieval accuracy optimization</li>
                            <li>Set up performance monitoring dashboard</li>
                            <li>Finalize optimization automation</li>
                          </ol>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress:</span>
                            <span>
                              {Math.round(
                                pipelineStatus.coreFeatures.phase3.progress,
                              )}
                              %
                            </span>
                          </div>
                          <Progress
                            value={pipelineStatus.coreFeatures.phase3.progress}
                            className="h-2"
                          />
                          <p className="text-xs text-muted-foreground">
                            {pipelineStatus.coreFeatures.phase3.currentStep}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Phase 4 Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-orange-600" />
                        Phase 4: Interactive RAG Testing Playground
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm">
                          <strong>Substeps:</strong>
                          <ol className="list-decimal list-inside mt-2 space-y-1 text-xs text-muted-foreground">
                            <li>Create interactive testing environment</li>
                            <li>Build validation scenario generator</li>
                            <li>Implement real-time accuracy feedback</li>
                            <li>Set up A/B testing framework</li>
                            <li>Finalize playground interface</li>
                          </ol>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress:</span>
                            <span>
                              {Math.round(
                                pipelineStatus.coreFeatures.phase4.progress,
                              )}
                              %
                            </span>
                          </div>
                          <Progress
                            value={pipelineStatus.coreFeatures.phase4.progress}
                            className="h-2"
                          />
                          <p className="text-xs text-muted-foreground">
                            {pipelineStatus.coreFeatures.phase4.currentStep}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Phase Control Panel */}
                <Card>
                  <CardHeader>
                    <CardTitle>Feature Enhancement Control Panel</CardTitle>
                    <CardDescription>
                      Execute each phase individually or run all phases
                      sequentially
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {[1, 2, 3, 4].map((phaseNum) => {
                        const phaseKey =
                          `phase${phaseNum}` as keyof typeof pipelineStatus.coreFeatures;
                        const phase = pipelineStatus.coreFeatures[phaseKey];
                        return (
                          <Button
                            key={phaseNum}
                            onClick={() =>
                              startCoreFeaturePhase(phaseNum as 1 | 2 | 3 | 4)
                            }
                            disabled={phase.status === "running"}
                            variant={
                              phase.status === "completed"
                                ? "default"
                                : "outline"
                            }
                            className="flex flex-col items-center gap-2 h-auto py-4"
                          >
                            {phase.status === "running" ? (
                              <Clock className="h-6 w-6 animate-spin" />
                            ) : phase.status === "completed" ? (
                              <CheckCircle className="h-6 w-6" />
                            ) : (
                              <span className="text-2xl font-bold">
                                {phaseNum}
                              </span>
                            )}
                            <div className="text-center">
                              <div className="text-sm font-medium">
                                Phase {phaseNum}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {phase.status === "running"
                                  ? `${phase.substep}/5`
                                  : phase.status === "completed"
                                    ? "Complete"
                                    : "Ready"}
                              </div>
                            </div>
                          </Button>
                        );
                      })}
                    </div>

                    {/* Run All Phases Button */}
                    <div className="flex justify-center">
                      <Button
                        onClick={async () => {
                          for (let i = 1; i <= 4; i++) {
                            await startCoreFeaturePhase(i as 1 | 2 | 3 | 4);
                            // Small delay between phases
                            await new Promise((resolve) =>
                              setTimeout(resolve, 1000),
                            );
                          }
                        }}
                        disabled={Object.values(
                          pipelineStatus.coreFeatures,
                        ).some((phase) => phase.status === "running")}
                        className="flex items-center gap-2 px-8"
                        size="lg"
                      >
                        <Zap className="h-5 w-5" />
                        Run All Enhancement Phases
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Completion Status */}
                {Object.values(pipelineStatus.coreFeatures).every(
                  (phase) => phase.status === "completed",
                ) && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>
                      All Core Features Implemented Successfully!
                    </AlertTitle>
                    <AlertDescription>
                      <div className="space-y-2">
                        <p>
                          Your RAG system has been enhanced with all four core
                          features:
                        </p>
                        <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                          <li>
                            ✅ Real-Time Document Quality Assessment &
                            Validation
                          </li>
                          <li>
                            ✅ Intelligent Synthetic Data Templates &
                            Customization
                          </li>
                          <li>
                            ✅ Vector Database Quality Metrics & Optimization
                          </li>
                          <li>
                            ✅ Interactive RAG Testing & Validation Playground
                          </li>
                        </ul>
                        <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
                          <p className="text-sm text-green-800 font-medium">
                            🎯 Enhanced RAG System Ready: Your pipeline now
                            includes advanced quality assessment, intelligent
                            synthetic data generation, optimized vector
                            operations, and comprehensive testing capabilities.
                          </p>
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
