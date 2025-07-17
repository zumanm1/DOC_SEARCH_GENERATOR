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
} from "lucide-react";
import { groqClient } from "@/lib/groq-client";
import { webSearchService } from "@/lib/web-search";
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

    // Check if either Ollama or Groq is available
    const isOllamaAvailable = await groqClient.checkOllamaAvailability();
    const isGroqConfigured = groqClient.isConfigured();

    if (!isOllamaAvailable && !isGroqConfigured) {
      setError(
        "Neither Ollama nor Groq are available. Please configure at least one LLM provider in System Configuration.",
      );
      return;
    }

    // Set preference for Ollama (GPU acceleration)
    groqClient.setPreferOllama(true);

    setIsRunning(true);
    setError(null);
    setResults([]);

    try {
      // Step 1: Initialize
      setCurrentStep("Initializing AI Agent...");
      updateStep("init", { status: "running", progress: 50 });
      await new Promise((resolve) => setTimeout(resolve, 500));
      updateStep("init", { status: "completed", progress: 100 });
      setOverallProgress(20);
      onProgress({ step: "Initialized", percentage: 20 });

      // Step 2: Generate search queries (with enhanced diversity)
      setCurrentStep("Generating optimized search queries with AI...");
      updateStep("generate", { status: "running", progress: 30 });

      const searchQueries = await groqClient.generateSearchQueries(
        query,
        certificationLevel,
      );
      updateStep("generate", {
        status: "completed",
        progress: 100,
        details: `Generated ${searchQueries.length} diverse queries`,
      });
      setOverallProgress(40);
      onProgress({ step: "Generated enhanced search queries", percentage: 40 });

      // Step 3: Search web sources (avoiding duplicates)
      setCurrentStep("Searching web sources for new documents...");
      updateStep("search", { status: "running", progress: 20 });

      const allSearchResults = [];
      for (let i = 0; i < searchQueries.length; i++) {
        const searchResults = await webSearchService.searchWeb(
          searchQueries[i],
          8, // Increased to find more documents
        );
        allSearchResults.push(...searchResults);
        updateStep("search", {
          status: "running",
          progress: ((i + 1) / searchQueries.length) * 100,
          details: `Searched ${i + 1}/${searchQueries.length} queries - Found ${allSearchResults.length} total`,
        });
      }

      // Remove duplicates and filter out already downloaded documents
      const uniqueResults = allSearchResults.filter((result, index, self) => {
        const isDuplicate =
          self.findIndex((r) => r.url === result.url) !== index;
        return !isDuplicate;
      });

      updateStep("search", {
        status: "completed",
        progress: 100,
        details: `Found ${uniqueResults.length} unique new documents`,
      });
      setOverallProgress(60);
      onProgress({ step: "Found new unique documents", percentage: 60 });

      // Step 4: Refine with AI (enhanced for RAG accuracy)
      setCurrentStep("Refining results with AI for optimal RAG training...");
      updateStep("refine", { status: "running", progress: 30 });

      const documents = await webSearchService.convertToDocuments(
        uniqueResults,
        query,
      );
      const refinedResults = await groqClient.refineSearchResults(
        query,
        documents,
      );
      const topResults = refinedResults.slice(
        0,
        Math.min(maxDocuments * 2, 12),
      ); // Get more high-quality results

      updateStep("refine", {
        status: "completed",
        progress: 100,
        details: `Refined to ${topResults.length} high-quality documents for RAG training`,
      });
      setOverallProgress(80);
      onProgress({ step: "Optimized for RAG accuracy", percentage: 80 });

      // Step 5: Prepare downloads (filter out duplicates)
      setCurrentStep("Preparing new documents for download...");
      updateStep("download", { status: "running", progress: 50 });

      // Filter out already downloaded documents
      const newResults = [];
      for (const result of topResults) {
        const isAlreadyDownloaded = webSearchService.isDocumentAlreadyDownloaded
          ? await webSearchService.isDocumentAlreadyDownloaded(result)
          : false;
        if (!isAlreadyDownloaded) {
          newResults.push({
            ...result,
            downloadStatus: "pending",
            isNew: true,
          });
        }
      }

      updateStep("download", {
        status: "completed",
        progress: 100,
        details: `${newResults.length} new documents ready (${topResults.length - newResults.length} already exist)`,
      });
      setOverallProgress(100);
      onProgress({ step: "Ready for Stage 2 processing", percentage: 100 });

      setResults(newResults);
      onResults(newResults);
      setCurrentStep(
        `AI Agent completed: ${newResults.length} new documents found for enhanced RAG training`,
      );
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
    } finally {
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

      // Simulate download progress
      const progressInterval = setInterval(() => {
        setResults((prev) =>
          prev.map((doc) => {
            if (
              doc.id === document.id &&
              doc.downloadStatus === "downloading"
            ) {
              const newProgress = Math.min(
                (doc.downloadProgress || 0) + 10,
                90,
              );
              return { ...doc, downloadProgress: newProgress };
            }
            return doc;
          }),
        );
      }, 200);

      const success = await webSearchService.downloadDocument(document);
      clearInterval(progressInterval);

      setResults((prev) =>
        prev.map((doc) =>
          doc.id === document.id
            ? {
                ...doc,
                downloadStatus: success ? "completed" : "failed",
                downloadProgress: success ? 100 : 0,
              }
            : doc,
        ),
      );
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

  useEffect(() => {
    if (isActive && query && !isRunning) {
      runAgent();
    }
  }, [isActive, query]);

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
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
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
              disabled={isRunning || !query.trim()}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {isRunning ? "Running..." : "Start AI Agent"}
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
