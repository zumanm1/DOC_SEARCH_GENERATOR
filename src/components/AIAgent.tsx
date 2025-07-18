import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Bot,
  Search,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
} from "lucide-react";
import { useWebSocket } from "@/hooks/useWebSocket";
import DocumentViewer from "@/components/DocumentViewer";

interface AIAgentProps {
  query: string;
  certificationLevel?: string;
  maxDocuments?: number;
  onResults?: (results: any[]) => void;
  onProgress?: (progress: { step: string; percentage: number }) => void;
  isActive?: boolean;
}

interface AgentStep {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  details?: string;
}

const AIAgent: React.FC<AIAgentProps> = ({
  query,
  certificationLevel = "all",
  maxDocuments = 4,
  onResults = () => {},
  onProgress = () => {},
  isActive = false,
}) => {
  const [steps, setSteps] = useState<AgentStep[]>([
    { id: "init", name: "Initialize AI Agent", status: "pending", progress: 0 },
    {
      id: "generate",
      name: "Generate Search Queries",
      status: "pending",
      progress: 0,
    },
    {
      id: "search",
      name: "Search Web Sources",
      status: "pending",
      progress: 0,
    },
    {
      id: "refine",
      name: "Refine Results with AI",
      status: "pending",
      progress: 0,
    },
    {
      id: "download",
      name: "Prepare Downloads",
      status: "pending",
      progress: 0,
    },
  ]);

  const [overallProgress, setOverallProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    sendMessage,
    onMessage,
    isConnected,
    connect,
    error: wsError,
  } = useWebSocket(`ai-agent-${Date.now()}`);

  const updateStep = (stepId: string, updates: Partial<AgentStep>) => {
    setSteps((prev) =>
      prev.map((step) => (step.id === stepId ? { ...step, ...updates } : step)),
    );
  };

  const runAgent = async () => {
    if (!query.trim()) {
      setError("Please provide a search query");
      return;
    }

    if (!isConnected) {
      setError(
        "Backend server not available. Please ensure the Python backend is running on localhost:8000",
      );
      return;
    }

    setIsRunning(true);
    setError(null);
    setResults([]);

    try {
      // Initialize steps
      setCurrentStep("Initializing AI Agent...");
      updateStep("init", { status: "running", progress: 50 });

      // Send request to backend via WebSocket
      sendMessage({
        action: "ai_agent",
        data: {
          query,
          certification_level: certificationLevel,
          max_documents: maxDocuments,
        },
      });

      // Complete initialization step
      updateStep("init", { status: "completed", progress: 100 });
      setOverallProgress(20);
      onProgress({ step: "Initialized", percentage: 20 });
    } catch (error) {
      console.error("AI Agent error:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );

      // Mark current step as failed
      const currentStepId = steps.find((s) => s.status === "running")?.id;
      if (currentStepId) {
        updateStep(currentStepId, { status: "failed", details: "Step failed" });
      }
      setIsRunning(false);
    }
  };

  const downloadDocument = async (document: any) => {
    try {
      setResults((prev) =>
        prev.map((doc) =>
          doc.id === document.id
            ? { ...doc, downloadStatus: "downloading", downloadProgress: 0 }
            : doc,
        ),
      );

      // Send download request to backend via WebSocket
      sendMessage({
        action: "download_document",
        data: {
          document_id: document.id,
          document: document,
        },
      });

      // Progress updates will come from the backend via WebSocket
    } catch (error) {
      console.error("Download error:", error);
      setResults((prev) =>
        prev.map((doc) =>
          doc.id === document.id
            ? { ...doc, downloadStatus: "failed", downloadProgress: 0 }
            : doc,
        ),
      );
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "running":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return (
          <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
        );
    }
  };

  // Handle WebSocket messages
  useEffect(() => {
    // Handle AI agent updates
    const removeAIAgentListener = onMessage("ai_agent_update", (data) => {
      setSteps(data.steps || steps);
      setOverallProgress(data.overallProgress || overallProgress);
      setCurrentStep(data.currentStep || currentStep);

      if (data.results) {
        setResults(data.results);
        onResults(data.results);
      }

      if (data.status === "completed" || data.status === "error") {
        setIsRunning(false);
        if (data.error) {
          setError(data.error);
        }
      }
    });

    // Handle document download updates
    const removeDownloadListener = onMessage(
      "document_download_update",
      (data) => {
        if (data.document_id && data.status) {
          setResults((prev) =>
            prev.map((doc) =>
              doc.id === data.document_id
                ? {
                    ...doc,
                    downloadStatus: data.status,
                    downloadProgress: data.progress || doc.downloadProgress,
                  }
                : doc,
            ),
          );
        }
      },
    );

    // Start agent if active
    if (isActive && query && !isRunning) {
      runAgent();
    }

    // Cleanup listeners
    return () => {
      removeAIAgentListener();
      removeDownloadListener();
    };
  }, [isActive, query, isRunning, onMessage]);

  return (
    <div className="w-full space-y-4 bg-background">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Agent Status
          </CardTitle>
          <CardDescription>
            Intelligent document discovery using AI-powered web search and
            refinement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(error || wsError) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error || wsError}</AlertDescription>
            </Alert>
          )}

          {!isConnected && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Backend Connection Required</AlertTitle>
              <AlertDescription className="space-y-2">
                <div>
                  The Python backend server is not running or not accessible.
                </div>
                <div className="text-xs text-muted-foreground">
                  To use the AI Agent, please:
                  <br />
                  1. Navigate to the backend/ directory
                  <br />
                  2. Install dependencies: pip install -r requirements.txt
                  <br />
                  3. Start the server: python main.py
                  <br />
                  4. Ensure it's running on localhost:8000
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={connect}
                  className="mt-2"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry Connection
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{currentStep || "Ready to start"}</span>
              <span>{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>

          <div className="space-y-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className="flex items-center justify-between p-2 rounded border"
              >
                <div className="flex items-center gap-2">
                  {getStepIcon(step.status)}
                  <span className="text-sm font-medium">{step.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {step.details && (
                    <span className="text-xs text-muted-foreground">
                      {step.details}
                    </span>
                  )}
                  <Badge
                    variant={
                      step.status === "completed"
                        ? "default"
                        : step.status === "failed"
                          ? "destructive"
                          : "secondary"
                    }
                    className="text-xs"
                  >
                    {step.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={runAgent}
              disabled={isRunning || !query.trim() || !isConnected}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {isRunning
                ? "Running..."
                : !isConnected
                  ? "Backend Required"
                  : "Start AI Agent"}
            </Button>

            {results.length > 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  setSteps((prev) =>
                    prev.map((step) => ({
                      ...step,
                      status: "pending",
                      progress: 0,
                    })),
                  );
                  setOverallProgress(0);
                  setCurrentStep("");
                  setResults([]);
                  setError(null);
                }}
                disabled={isRunning}
              >
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>AI Agent Results</CardTitle>
            <CardDescription>
              {results.length} documents found and refined by AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{doc.title}</h3>
                    <Badge className="bg-blue-500">
                      {Math.round(doc.relevance * 100)}% Match
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">
                    {doc.summary}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Badge variant="outline">{doc.type}</Badge>
                      <Badge variant="secondary">{doc.source}</Badge>
                      {doc.size && <Badge variant="outline">{doc.size}</Badge>}
                    </div>

                    <div className="flex items-center gap-2">
                      {doc.downloadStatus === "downloading" && (
                        <div className="flex items-center gap-2">
                          <Progress
                            value={doc.downloadProgress || 0}
                            className="w-16 h-2"
                          />
                          <span className="text-xs">
                            {doc.downloadProgress || 0}%
                          </span>
                        </div>
                      )}

                      <DocumentViewer
                        document={{
                          id: doc.id,
                          title: doc.title,
                          url: doc.url,
                          source: doc.source,
                          type: doc.type,
                          size: doc.size,
                          summary: doc.summary,
                        }}
                        trigger={
                          <Button size="sm" variant="outline">
                            <FileText className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        }
                        onDownload={() => downloadDocument(doc)}
                      />

                      <Button
                        size="sm"
                        onClick={() => downloadDocument(doc)}
                        disabled={
                          doc.downloadStatus === "downloading" ||
                          doc.downloadStatus === "completed"
                        }
                        className="flex items-center gap-1"
                      >
                        {doc.downloadStatus === "downloading" ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : doc.downloadStatus === "completed" ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <Download className="h-3 w-3" />
                        )}
                        {doc.downloadStatus === "completed"
                          ? "Downloaded"
                          : "Download"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIAgent;
