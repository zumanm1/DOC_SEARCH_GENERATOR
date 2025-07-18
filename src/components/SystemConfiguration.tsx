import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  Bot,
  Database,
  Download,
  Edit,
  FileText,
  Globe,
  HardDrive,
  Plus,
  RefreshCw,
  Search,
  Server,
  Settings,
  Trash2,
  Wifi,
  WifiOff,
  Cpu,
  MemoryStick,
  Zap,
  Monitor,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useWebSocket } from "@/hooks/useWebSocket";

interface SystemConfigurationProps {
  onSave?: (config: any) => void;
  initialConfig?: any;
}

const SystemConfiguration = ({
  onSave = () => {},
  initialConfig = {},
}: SystemConfigurationProps) => {
  const [activeTab, setActiveTab] = useState("database");
  const [operationMode, setOperationMode] = useState(
    initialConfig.operationMode || "online",
  );
  const [databaseType, setDatabaseType] = useState(
    initialConfig.databaseType || "sqlite",
  );
  const [replicationStatus, setReplicationStatus] = useState({
    lastSync: "2023-10-15 14:30:22",
    syncPercentage: 92,
    status: "active",
  });
  const [llmProvider, setLlmProvider] = useState(
    initialConfig.llmProvider || "groq",
  );
  const [groqApiKeys, setGroqApiKeys] = useState(
    initialConfig.groqApiKeys || [],
  );

  // Use WebSocket to get saved API keys
  const { sendMessage, onMessage, isConnected } = useWebSocket(
    `system-config-${Date.now()}`,
  );

  // Load saved API keys on component mount
  React.useEffect(() => {
    if (isConnected) {
      sendMessage({
        action: "system_config",
        data: {
          request: "get_api_keys",
        },
      });
    }
  }, [isConnected, sendMessage]);

  // Get system resources from backend
  React.useEffect(() => {
    if (isConnected) {
      // Initial request for system resources
      sendMessage({
        action: "get_status",
        data: {},
      });

      // Set up interval to request updates
      const interval = setInterval(() => {
        sendMessage({
          action: "get_status",
          data: {},
        });
      }, 5000);

      // Handle system status updates
      const removeStatusListener = onMessage("system_status", (data) => {
        if (data.status && data.status.resources) {
          setSystemResources(data.status.resources);
        }
      });

      // Handle API keys updates
      const removeApiKeysListener = onMessage("config_updated", (data) => {
        if (
          data.result &&
          data.result.config &&
          data.result.config.llm_config &&
          data.result.config.llm_config.groq_keys
        ) {
          setGroqApiKeys(data.result.config.llm_config.groq_keys);
        }
      });

      return () => {
        clearInterval(interval);
        removeStatusListener();
        removeApiKeysListener();
      };
    }
  }, [isConnected, sendMessage, onMessage]);

  const [ollamaConfig, setOllamaConfig] = useState(
    initialConfig.ollamaConfig || {
      endpoint: "http://localhost:11434",
      model: "llama2",
      script:
        "#!/bin/bash\necho 'Ollama configuration script'\n# Add your custom Ollama setup here",
    },
  );
  const [editingKey, setEditingKey] = useState(null);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyValue, setNewKeyValue] = useState("");
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [testingInProgress, setTestingInProgress] = useState(false);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [systemResources, setSystemResources] = useState({
    cpu: { usage: 45, temperature: 62 },
    ram: { used: 6.2, total: 16, percentage: 38.75 },
    gpu: { usage: 78, temperature: 71, model: "NVIDIA RTX 4080" },
    vram: { used: 8.5, total: 12, percentage: 70.8 },
  });
  const [systemStatus, setSystemStatus] = useState({
    backend_connectivity: "healthy",
    database_status: "connected",
    api_availability: "online",
    active_tasks: [],
    error_logs: [],
    performance_metrics: {
      search_avg_time: 1.2,
      discovery_success_rate: 94.5,
      document_processing_rate: 15.3,
    },
  });
  const [documentVersions, setDocumentVersions] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);

  const testQuestions = [
    "What is the capital city of France?",
    "What is 2 + 2?",
    "Name one planet in our solar system.",
    "What color do you get when you mix red and blue?",
  ];

  const testLLMConnection = async () => {
    setTestingInProgress(true);
    setTestResults([]);
    setCurrentTestIndex(0);

    // Send test request to backend via WebSocket
    sendMessage({
      action: "test_llm_connection",
      data: {
        provider: llmProvider,
        questions: testQuestions,
      },
    });
  };

  // Handle WebSocket responses for LLM testing
  React.useEffect(() => {
    const removeTestResultsListener = onMessage("llm_test_results", (data) => {
      if (data.results) {
        setTestResults(data.results);
        setTestingInProgress(false);
      }
    });

    const removeTestProgressListener = onMessage(
      "llm_test_progress",
      (data) => {
        if (data.current_index !== undefined) {
          setCurrentTestIndex(data.current_index);
        }
      },
    );

    return () => {
      removeTestResultsListener();
      removeTestProgressListener();
    };
  }, [onMessage]);

  return (
    <div className="w-full h-full p-6 bg-background">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            System Configuration
          </h2>
          <p className="text-muted-foreground">
            Configure database connections, operation mode, and system settings.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {operationMode === "online" ? (
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
            >
              <Wifi className="h-3 w-3" /> Online Mode
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1"
            >
              <WifiOff className="h-3 w-3" /> Offline Mode
            </Badge>
          )}
        </div>
      </div>

      <Tabs
        defaultValue="database"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-7 w-full max-w-6xl mb-6">
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" /> Database
          </TabsTrigger>
          <TabsTrigger value="operation" className="flex items-center gap-2">
            <Settings className="h-4 w-4" /> Operation Mode
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Globe className="h-4 w-4" /> API Configuration
          </TabsTrigger>
          <TabsTrigger value="llm" className="flex items-center gap-2">
            <Bot className="h-4 w-4" /> LLM/AI Agents
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" /> Real-time Monitoring
          </TabsTrigger>
          <TabsTrigger value="versions" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Document Versions
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" /> Advanced Search
          </TabsTrigger>
        </TabsList>

        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Connection</CardTitle>
              <CardDescription>
                Configure your database connection settings. Choose between
                SQLite, PostgreSQL, or Supabase.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="database-type">Database Type</Label>
                <Select value={databaseType} onValueChange={setDatabaseType}>
                  <SelectTrigger id="database-type">
                    <SelectValue placeholder="Select database type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sqlite">SQLite (Local)</SelectItem>
                    <SelectItem value="postgresql">PostgreSQL</SelectItem>
                    <SelectItem value="supabase">Supabase</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {databaseType === "sqlite" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sqlite-path">Database File Path</Label>
                    <Input
                      id="sqlite-path"
                      placeholder="/path/to/database.db"
                      defaultValue="./data/cisco_docs.db"
                    />
                  </div>
                </div>
              )}

              {databaseType === "postgresql" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pg-host">Host</Label>
                    <Input
                      id="pg-host"
                      placeholder="localhost"
                      defaultValue="localhost"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pg-port">Port</Label>
                      <Input
                        id="pg-port"
                        placeholder="5432"
                        defaultValue="5432"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pg-database">Database</Label>
                      <Input
                        id="pg-database"
                        placeholder="cisco_docs"
                        defaultValue="cisco_docs"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pg-user">Username</Label>
                      <Input
                        id="pg-user"
                        placeholder="postgres"
                        defaultValue="postgres"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pg-password">Password</Label>
                      <Input
                        id="pg-password"
                        type="password"
                        placeholder="********"
                      />
                    </div>
                  </div>
                </div>
              )}

              {databaseType === "supabase" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="supabase-url">Supabase URL</Label>
                    <Input
                      id="supabase-url"
                      placeholder="https://xxxxx.supabase.co"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supabase-key">Supabase Anon Key</Label>
                    <Input id="supabase-key" placeholder="your-anon-key" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="local-mirror">
                      Local PostgreSQL Mirror (for offline mode)
                    </Label>
                    <Input
                      id="local-mirror"
                      placeholder="postgresql://user:password@localhost/cisco_docs_mirror"
                    />
                  </div>

                  <div className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">
                          Replication Status
                        </span>
                      </div>
                      <Badge
                        variant={
                          replicationStatus.status === "active"
                            ? "outline"
                            : "destructive"
                        }
                        className="text-xs"
                      >
                        {replicationStatus.status === "active"
                          ? "Active"
                          : "Error"}
                      </Badge>
                    </div>
                    <Progress
                      value={replicationStatus.syncPercentage}
                      className="h-2"
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-muted-foreground">
                        Last sync: {replicationStatus.lastSync}
                      </span>
                      <span className="text-xs font-medium">
                        {replicationStatus.syncPercentage}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Test Connection</Button>
              <Button>Save Configuration</Button>
            </CardFooter>
          </Card>

          {databaseType === "supabase" && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Replication Configuration</AlertTitle>
              <AlertDescription>
                Supabase to local PostgreSQL replication ensures 100% offline
                capability. Make sure your local PostgreSQL instance is properly
                configured to receive replication streams.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="operation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Operation Mode</CardTitle>
              <CardDescription>
                Configure how the system operates in online and offline
                environments.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="operation-mode">Operation Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose between online and offline operation modes.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Label
                    htmlFor="operation-mode"
                    className={
                      operationMode === "offline" ? "text-muted-foreground" : ""
                    }
                  >
                    Online
                  </Label>
                  <Switch
                    id="operation-mode"
                    checked={operationMode === "offline"}
                    onCheckedChange={(checked) =>
                      setOperationMode(checked ? "offline" : "online")
                    }
                  />
                  <Label
                    htmlFor="operation-mode"
                    className={
                      operationMode === "online" ? "text-muted-foreground" : ""
                    }
                  >
                    Offline
                  </Label>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="text-sm font-medium">Storage Management</h3>
                <div className="space-y-2">
                  <Label htmlFor="max-storage">Maximum Storage (GB)</Label>
                  <Input
                    id="max-storage"
                    type="number"
                    placeholder="10"
                    defaultValue="10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-pdfs">Maximum PDFs per Search</Label>
                  <Input
                    id="max-pdfs"
                    type="number"
                    placeholder="4"
                    defaultValue="4"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retention-days">
                    Document Retention (days)
                  </Label>
                  <Input
                    id="retention-days"
                    type="number"
                    placeholder="90"
                    defaultValue="90"
                  />
                </div>
              </div>

              <div className="pt-4">
                <div className="flex items-center space-x-2">
                  <Switch id="auto-sync" defaultChecked />
                  <Label htmlFor="auto-sync">
                    Automatically sync when online
                  </Label>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Settings</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                Current system resource usage and status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* CPU and RAM Monitoring */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3 p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">CPU Usage</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Usage
                        </span>
                        <span className="text-sm font-medium">
                          {Math.round(systemResources.cpu.usage)}%
                        </span>
                      </div>
                      <Progress
                        value={systemResources.cpu.usage}
                        className={`h-2 ${systemResources.cpu.usage > 80 ? "bg-red-100" : systemResources.cpu.usage > 60 ? "bg-yellow-100" : "bg-green-100"}`}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Temperature
                        </span>
                        <span className="text-sm font-medium">
                          {Math.round(systemResources.cpu.temperature)}°C
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <MemoryStick className="h-5 w-5 text-green-500" />
                      <span className="font-medium">RAM Usage</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Memory
                        </span>
                        <span className="text-sm font-medium">
                          {systemResources.ram.used.toFixed(1)} GB /{" "}
                          {systemResources.ram.total} GB
                        </span>
                      </div>
                      <Progress
                        value={systemResources.ram.percentage}
                        className={`h-2 ${systemResources.ram.percentage > 85 ? "bg-red-100" : systemResources.ram.percentage > 70 ? "bg-yellow-100" : "bg-green-100"}`}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Usage
                        </span>
                        <span className="text-sm font-medium">
                          {Math.round(systemResources.ram.percentage)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* GPU and VRAM Monitoring */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3 p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-purple-500" />
                      <span className="font-medium">GPU Usage</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Model
                        </span>
                        <span className="text-xs font-medium text-purple-600">
                          {systemResources.gpu.model}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Usage
                        </span>
                        <span className="text-sm font-medium">
                          {Math.round(systemResources.gpu.usage)}%
                        </span>
                      </div>
                      <Progress
                        value={systemResources.gpu.usage}
                        className={`h-2 ${systemResources.gpu.usage > 90 ? "bg-red-100" : systemResources.gpu.usage > 75 ? "bg-yellow-100" : "bg-green-100"}`}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Temperature
                        </span>
                        <span className="text-sm font-medium">
                          {Math.round(systemResources.gpu.temperature)}°C
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-5 w-5 text-orange-500" />
                      <span className="font-medium">VRAM Usage</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Memory
                        </span>
                        <span className="text-sm font-medium">
                          {systemResources.vram.used.toFixed(1)} GB /{" "}
                          {systemResources.vram.total} GB
                        </span>
                      </div>
                      <Progress
                        value={systemResources.vram.percentage}
                        className={`h-2 ${systemResources.vram.percentage > 90 ? "bg-red-100" : systemResources.vram.percentage > 75 ? "bg-yellow-100" : "bg-green-100"}`}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Usage
                        </span>
                        <span className="text-sm font-medium">
                          {Math.round(systemResources.vram.percentage)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Storage and System Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Disk Usage</Label>
                      <span className="text-sm font-medium">
                        3.2 GB / 10 GB
                      </span>
                    </div>
                    <Progress value={32} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>System Load</Label>
                      <span className="text-sm font-medium">
                        {(
                          (systemResources.cpu.usage +
                            systemResources.ram.percentage +
                            systemResources.gpu.usage) /
                          3
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        (systemResources.cpu.usage +
                          systemResources.ram.percentage +
                          systemResources.gpu.usage) /
                        3
                      }
                      className="h-2"
                    />
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">API Status:</span>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      Online
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Documents:</span>
                    <span className="text-sm font-medium">128</span>
                  </div>
                </div>

                {/* Resource Alerts */}
                {(systemResources.cpu.usage > 85 ||
                  systemResources.ram.percentage > 90 ||
                  systemResources.gpu.usage > 95 ||
                  systemResources.vram.percentage > 95) && (
                  <div className="mt-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>High Resource Usage Detected</AlertTitle>
                      <AlertDescription>
                        {systemResources.cpu.usage > 85 &&
                          "CPU usage is high. "}
                        {systemResources.ram.percentage > 90 &&
                          "RAM usage is critical. "}
                        {systemResources.gpu.usage > 95 &&
                          "GPU usage is at maximum. "}
                        {systemResources.vram.percentage > 95 &&
                          "VRAM usage is critical. "}
                        Consider closing unnecessary applications or upgrading
                        hardware.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>
                Configure API settings for Groq LLM integration and other
                services.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Groq LLM API</h3>
                <div className="space-y-2">
                  <Label htmlFor="groq-api-key">API Key</Label>
                  <Input
                    id="groq-api-key"
                    type="password"
                    placeholder="Enter your Groq API key (gsk_...)"
                    onChange={(e) => {
                      // API key updates are now handled by the backend via WebSocket
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Get your API key from{" "}
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      console.groq.com/keys
                    </a>
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="groq-model">Default Model</Label>
                  <Select defaultValue="llama-3.3-70b-versatile">
                    <SelectTrigger id="groq-model">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Production Models */}
                      <SelectItem value="distil-whisper-large-v3-en">
                        distil-whisper-large-v3-en
                      </SelectItem>
                      <SelectItem value="gemma2-9b-it">gemma2-9b-it</SelectItem>
                      <SelectItem value="llama-3.1-8b-instant">
                        llama-3.1-8b-instant
                      </SelectItem>
                      <SelectItem value="llama-3.3-70b-versatile">
                        llama-3.3-70b-versatile
                      </SelectItem>
                      <SelectItem value="meta-llama/llama-guard-4-12b">
                        meta-llama/llama-guard-4-12b
                      </SelectItem>
                      <SelectItem value="whisper-large-v3">
                        whisper-large-v3
                      </SelectItem>
                      <SelectItem value="whisper-large-v3-turbo">
                        whisper-large-v3-turbo
                      </SelectItem>
                      {/* Preview Models */}
                      <SelectItem value="deepseek-r1-distill-llama-70b">
                        deepseek-r1-distill-llama-70b
                      </SelectItem>
                      <SelectItem value="meta-llama/llama-4-maverick-17b-128e-instruct">
                        meta-llama/llama-4-maverick-17b-128e-instruct
                      </SelectItem>
                      <SelectItem value="meta-llama/llama-4-scout-17b-16e-instruct">
                        meta-llama/llama-4-scout-17b-16e-instruct
                      </SelectItem>
                      <SelectItem value="meta-llama/llama-prompt-guard-2-22m">
                        meta-llama/llama-prompt-guard-2-22m
                      </SelectItem>
                      <SelectItem value="meta-llama/llama-prompt-guard-2-86m">
                        meta-llama/llama-prompt-guard-2-86m
                      </SelectItem>
                      <SelectItem value="mistral-saba-24b">
                        mistral-saba-24b
                      </SelectItem>
                      <SelectItem value="moonshotai/kimi-k2-instruct">
                        moonshotai/kimi-k2-instruct
                      </SelectItem>
                      <SelectItem value="playai-tts">playai-tts</SelectItem>
                      <SelectItem value="playai-tts-arabic">
                        playai-tts-arabic
                      </SelectItem>
                      <SelectItem value="qwen/qwen3-32b">
                        qwen/qwen3-32b
                      </SelectItem>
                      {/* Preview Systems */}
                      <SelectItem value="compound-beta">
                        compound-beta
                      </SelectItem>
                      <SelectItem value="compound-beta-mini">
                        compound-beta-mini
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="text-sm font-medium">Rate Limiting</h3>
                <div className="space-y-2">
                  <Label htmlFor="max-requests">Max Requests per Minute</Label>
                  <Input
                    id="max-requests"
                    type="number"
                    placeholder="60"
                    defaultValue="60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeout">Request Timeout (seconds)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    placeholder="30"
                    defaultValue="30"
                  />
                </div>
              </div>

              <div className="pt-4">
                <div className="flex items-center space-x-2">
                  <Switch id="cache-responses" defaultChecked />
                  <Label htmlFor="cache-responses">Cache API responses</Label>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Test API Connection</Button>
              <Button>Save API Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="llm" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>LLM/AI Agent Configuration</CardTitle>
              <CardDescription>
                Configure your AI/LLM providers for intelligent document search
                and analysis. Choose between Groq and Ollama.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="llm-provider">LLM Provider</Label>
                <Select value={llmProvider} onValueChange={setLlmProvider}>
                  <SelectTrigger id="llm-provider">
                    <SelectValue placeholder="Select LLM provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="groq">Groq (Cloud API)</SelectItem>
                    <SelectItem value="ollama">Ollama (Local)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {llmProvider === "groq" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Groq API Keys</h3>
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingKey("new");
                        setNewKeyName("");
                        setNewKeyValue("");
                      }}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Add Key
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {groqApiKeys.map((apiKey) => (
                      <div
                        key={apiKey.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {apiKey.name}
                            </span>
                            {apiKey.active && (
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 border-green-200"
                              >
                                Active
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground font-mono">
                            {apiKey.key.substring(0, 8)}...
                            {apiKey.key.slice(-4)}
                          </span>
                          {apiKey.createdAt && (
                            <span className="text-xs text-muted-foreground block">
                              Added:{" "}
                              {new Date(apiKey.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {!apiKey.active && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                sendMessage({
                                  action: "system_config",
                                  data: {
                                    request: "set_active_api_key",
                                    key_id: apiKey.id,
                                  },
                                });
                              }}
                              title="Set as active"
                            >
                              <Bot className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingKey(apiKey.id);
                              setNewKeyName(apiKey.name);
                              setNewKeyValue(apiKey.key);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              sendMessage({
                                action: "system_config",
                                data: {
                                  request: "delete_api_key",
                                  key_id: apiKey.id,
                                },
                              });
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {editingKey && (
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <h4 className="text-sm font-medium mb-3">
                        {editingKey === "new"
                          ? "Add New API Key"
                          : "Edit API Key"}
                      </h4>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="key-name">Key Name</Label>
                          <Input
                            id="key-name"
                            placeholder="e.g., Primary Key, Backup Key"
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="key-value">API Key</Label>
                          <Input
                            id="key-value"
                            type="password"
                            placeholder="gsk_..."
                            value={newKeyValue}
                            onChange={(e) => {
                              setNewKeyValue(e.target.value);
                              // API key updates are now handled by the backend via WebSocket
                            }}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              // Save API key via WebSocket
                              sendMessage({
                                action: "system_config",
                                data: {
                                  request: "save_api_key",
                                  key_data: {
                                    id:
                                      editingKey === "new"
                                        ? undefined
                                        : editingKey,
                                    name: newKeyName,
                                    key: newKeyValue,
                                    active:
                                      editingKey === "new"
                                        ? true
                                        : groqApiKeys.find(
                                            (k) => k.id === editingKey,
                                          )?.active || false,
                                  },
                                },
                              });

                              setEditingKey(null);
                              setNewKeyName("");
                              setNewKeyValue("");
                            }}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingKey(null);
                              setNewKeyName("");
                              setNewKeyValue("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 pt-4">
                    <h3 className="text-sm font-medium">Groq Settings</h3>
                    <div className="space-y-2">
                      <Label htmlFor="groq-model">Default Model</Label>
                      <Select defaultValue="llama-3.3-70b-versatile">
                        <SelectTrigger id="groq-model">
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Production Models */}
                          <SelectItem value="distil-whisper-large-v3-en">
                            distil-whisper-large-v3-en
                          </SelectItem>
                          <SelectItem value="gemma2-9b-it">
                            gemma2-9b-it
                          </SelectItem>
                          <SelectItem value="llama-3.1-8b-instant">
                            llama-3.1-8b-instant
                          </SelectItem>
                          <SelectItem value="llama-3.3-70b-versatile">
                            llama-3.3-70b-versatile
                          </SelectItem>
                          <SelectItem value="meta-llama/llama-guard-4-12b">
                            meta-llama/llama-guard-4-12b
                          </SelectItem>
                          <SelectItem value="whisper-large-v3">
                            whisper-large-v3
                          </SelectItem>
                          <SelectItem value="whisper-large-v3-turbo">
                            whisper-large-v3-turbo
                          </SelectItem>
                          {/* Preview Models */}
                          <SelectItem value="deepseek-r1-distill-llama-70b">
                            deepseek-r1-distill-llama-70b
                          </SelectItem>
                          <SelectItem value="meta-llama/llama-4-maverick-17b-128e-instruct">
                            meta-llama/llama-4-maverick-17b-128e-instruct
                          </SelectItem>
                          <SelectItem value="meta-llama/llama-4-scout-17b-16e-instruct">
                            meta-llama/llama-4-scout-17b-16e-instruct
                          </SelectItem>
                          <SelectItem value="meta-llama/llama-prompt-guard-2-22m">
                            meta-llama/llama-prompt-guard-2-22m
                          </SelectItem>
                          <SelectItem value="meta-llama/llama-prompt-guard-2-86m">
                            meta-llama/llama-prompt-guard-2-86m
                          </SelectItem>
                          <SelectItem value="mistral-saba-24b">
                            mistral-saba-24b
                          </SelectItem>
                          <SelectItem value="moonshotai/kimi-k2-instruct">
                            moonshotai/kimi-k2-instruct
                          </SelectItem>
                          <SelectItem value="playai-tts">playai-tts</SelectItem>
                          <SelectItem value="playai-tts-arabic">
                            playai-tts-arabic
                          </SelectItem>
                          <SelectItem value="qwen/qwen3-32b">
                            qwen/qwen3-32b
                          </SelectItem>
                          {/* Preview Systems */}
                          <SelectItem value="compound-beta">
                            compound-beta
                          </SelectItem>
                          <SelectItem value="compound-beta-mini">
                            compound-beta-mini
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="groq-max-tokens">Max Tokens</Label>
                      <Input
                        id="groq-max-tokens"
                        type="number"
                        placeholder="4096"
                        defaultValue="4096"
                      />
                    </div>
                  </div>
                </div>
              )}

              {llmProvider === "ollama" && (
                <div className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">
                      Ollama Configuration
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="ollama-endpoint">Ollama Endpoint</Label>
                      <Input
                        id="ollama-endpoint"
                        placeholder="http://localhost:11434"
                        value={ollamaConfig.endpoint}
                        onChange={(e) =>
                          setOllamaConfig({
                            ...ollamaConfig,
                            endpoint: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ollama-model">Model</Label>
                      <Select
                        value={ollamaConfig.model}
                        onValueChange={(value) =>
                          setOllamaConfig({ ...ollamaConfig, model: value })
                        }
                      >
                        <SelectTrigger id="ollama-model">
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="llama2">Llama 2</SelectItem>
                          <SelectItem value="codellama">Code Llama</SelectItem>
                          <SelectItem value="mistral">Mistral</SelectItem>
                          <SelectItem value="neural-chat">
                            Neural Chat
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">Setup Script</h3>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const randomScript = `#!/bin/bash
# Ollama Setup Script - Generated ${new Date().toISOString()}
echo "Setting up Ollama environment..."

# Pull the selected model
ollama pull ${ollamaConfig.model}

# Set environment variables
export OLLAMA_HOST="${ollamaConfig.endpoint}"
export OLLAMA_MODELS="/usr/share/ollama/.ollama/models"

# Start Ollama service
echo "Starting Ollama service..."
ollama serve &

# Wait for service to be ready
sleep 5

# Test the connection
echo "Testing Ollama connection..."
curl -X POST ${ollamaConfig.endpoint}/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "${ollamaConfig.model}",
    "prompt": "Hello, this is a test.",
    "stream": false
  }'

echo "Ollama setup complete!"`;
                          setOllamaConfig({
                            ...ollamaConfig,
                            script: randomScript,
                          });
                        }}
                      >
                        Generate Script
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ollama-script">
                        Configuration Script
                      </Label>
                      <textarea
                        id="ollama-script"
                        className="w-full h-32 p-3 text-xs font-mono border rounded-md bg-muted/50"
                        value={ollamaConfig.script}
                        onChange={(e) =>
                          setOllamaConfig({
                            ...ollamaConfig,
                            script: e.target.value,
                          })
                        }
                        placeholder="Enter your Ollama setup script..."
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <div className="flex items-center space-x-2">
                  <Switch id="auto-failover" defaultChecked />
                  <Label htmlFor="auto-failover">
                    Enable automatic failover between providers
                  </Label>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    Test {llmProvider === "groq" ? "Groq" : "Ollama"} Connection
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      Test {llmProvider === "groq" ? "Groq" : "Ollama"} LLM
                      Connection
                    </DialogTitle>
                    <DialogDescription>
                      This will test your{" "}
                      {llmProvider === "groq" ? "Groq API" : "Ollama"}{" "}
                      connection by asking 4 predefined questions to ensure the
                      LLM infrastructure is working correctly.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    {!testingInProgress && testResults.length === 0 && (
                      <div className="text-center py-8">
                        <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Click the button below to start testing your{" "}
                          {llmProvider === "groq" ? "Groq" : "Ollama"}{" "}
                          connection.
                        </p>
                      </div>
                    )}

                    {testingInProgress && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span className="text-sm font-medium">
                            Testing question {currentTestIndex + 1} of{" "}
                            {testQuestions.length}...
                          </span>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-sm font-medium mb-2">
                            Current Question:
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {testQuestions[currentTestIndex]}
                          </p>
                        </div>
                        <Progress
                          value={
                            (currentTestIndex / testQuestions.length) * 100
                          }
                          className="h-2"
                        />
                      </div>
                    )}

                    {testResults.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium">Test Results</h3>
                          <Badge
                            variant={
                              testResults.every((r) => r.status === "success")
                                ? "outline"
                                : "destructive"
                            }
                            className={
                              testResults.every((r) => r.status === "success")
                                ? "bg-green-50 text-green-700 border-green-200"
                                : ""
                            }
                          >
                            {
                              testResults.filter((r) => r.status === "success")
                                .length
                            }{" "}
                            / {testResults.length} Passed
                          </Badge>
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {testResults.map((result, index) => (
                            <div key={index} className="p-4 border rounded-lg">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <p className="text-sm font-medium mb-1">
                                    Q{index + 1}: {result.question}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {result.timestamp}
                                  </p>
                                </div>
                                <Badge
                                  variant={
                                    result.status === "success"
                                      ? "outline"
                                      : "destructive"
                                  }
                                  className={
                                    result.status === "success"
                                      ? "bg-green-50 text-green-700 border-green-200"
                                      : ""
                                  }
                                >
                                  {result.status === "success" ? "✓" : "✗"}
                                </Badge>
                              </div>
                              <div className="p-3 bg-muted/50 rounded text-sm">
                                <strong>Response:</strong> {result.response}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <DialogFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setTestResults([]);
                        setCurrentTestIndex(0);
                      }}
                      disabled={testingInProgress}
                    >
                      Clear Results
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        onClick={testLLMConnection}
                        disabled={testingInProgress}
                        className="flex items-center gap-2"
                      >
                        {testingInProgress ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                        {testingInProgress ? "Testing..." : "Start Test"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setTestDialogOpen(false)}
                        disabled={testingInProgress}
                      >
                        Close
                      </Button>
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button
                onClick={() => {
                  const config = {
                    llmProvider,
                    groqApiKeys,
                    ollamaConfig,
                  };
                  onSave(config);
                }}
              >
                Save LLM Configuration
              </Button>
            </CardFooter>
          </Card>

          <Alert>
            <Bot className="h-4 w-4" />
            <AlertTitle>LLM Provider Transition</AlertTitle>
            <AlertDescription>
              The system supports seamless switching between Groq and Ollama.
              Groq provides cloud-based inference with API keys, while Ollama
              runs locally for complete privacy. Enable auto-failover to
              automatically switch providers if one becomes unavailable.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Status Dashboard</CardTitle>
              <CardDescription>
                Comprehensive monitoring of system health, active tasks, and
                performance metrics.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* System Health Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Server className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Backend Connectivity</span>
                  </div>
                  <Badge
                    variant={
                      systemStatus.backend_connectivity === "healthy"
                        ? "outline"
                        : "destructive"
                    }
                    className={
                      systemStatus.backend_connectivity === "healthy"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : ""
                    }
                  >
                    {systemStatus.backend_connectivity === "healthy"
                      ? "Healthy"
                      : "Issues Detected"}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    WebSocket: {isConnected ? "Connected" : "Disconnected"}
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Database Status</span>
                  </div>
                  <Badge
                    variant={
                      systemStatus.database_status === "connected"
                        ? "outline"
                        : "destructive"
                    }
                    className={
                      systemStatus.database_status === "connected"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : ""
                    }
                  >
                    {systemStatus.database_status === "connected"
                      ? "Connected"
                      : "Disconnected"}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    Type: {databaseType.toUpperCase()}
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-5 w-5 text-purple-500" />
                    <span className="font-medium">API Availability</span>
                  </div>
                  <Badge
                    variant={
                      systemStatus.api_availability === "online"
                        ? "outline"
                        : "destructive"
                    }
                    className={
                      systemStatus.api_availability === "online"
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : ""
                    }
                  >
                    {systemStatus.api_availability === "online"
                      ? "Online"
                      : "Offline"}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    Groq API:{" "}
                    {groqApiKeys.length > 0 ? "Configured" : "Not configured"}
                  </p>
                </div>
              </div>

              {/* Active Tasks */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Active Tasks</h3>
                {systemStatus.active_tasks.length === 0 ? (
                  <div className="p-4 border rounded-lg text-center text-muted-foreground">
                    No active tasks running
                  </div>
                ) : (
                  <div className="space-y-2">
                    {systemStatus.active_tasks.map((task, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{task.name}</span>
                          <Badge variant="secondary">{task.status}</Badge>
                        </div>
                        <Progress value={task.progress} className="h-2 mb-1" />
                        <p className="text-xs text-muted-foreground">
                          {task.details}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Performance Metrics */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Performance Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Search className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">
                        Search Performance
                      </span>
                    </div>
                    <div className="text-2xl font-bold">
                      {systemStatus.performance_metrics.search_avg_time}s
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Average response time
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Download className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">
                        Discovery Success
                      </span>
                    </div>
                    <div className="text-2xl font-bold">
                      {systemStatus.performance_metrics.discovery_success_rate}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Success rate
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">
                        Processing Rate
                      </span>
                    </div>
                    <div className="text-2xl font-bold">
                      {
                        systemStatus.performance_metrics
                          .document_processing_rate
                      }
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Documents/hour
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Logs */}
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Recent Error Logs
                </h3>
                {systemStatus.error_logs.length === 0 ? (
                  <div className="p-4 border rounded-lg text-center text-muted-foreground">
                    No recent errors
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {systemStatus.error_logs.map((error, index) => (
                      <div
                        key={index}
                        className="p-3 border rounded-lg bg-red-50 border-red-200"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-red-800">
                            {error.type}
                          </span>
                          <span className="text-xs text-red-600">
                            {error.timestamp}
                          </span>
                        </div>
                        <p className="text-sm text-red-700">{error.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="versions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Version Control & Deduplication</CardTitle>
              <CardDescription>
                Manage document versions, track changes, and prevent duplicate
                content storage.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Version Control Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Version Control Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="auto-update-check">
                      Automatic Update Detection
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Switch id="auto-update-check" defaultChecked />
                      <Label htmlFor="auto-update-check" className="text-sm">
                        Enable automatic checking for document updates
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="update-frequency">
                      Update Check Frequency
                    </Label>
                    <Select defaultValue="daily">
                      <SelectTrigger id="update-frequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Every Hour</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deduplication">Smart Deduplication</Label>
                    <div className="flex items-center space-x-2">
                      <Switch id="deduplication" defaultChecked />
                      <Label htmlFor="deduplication" className="text-sm">
                        Prevent storing identical content
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="version-retention">Version Retention</Label>
                    <Select defaultValue="5">
                      <SelectTrigger id="version-retention">
                        <SelectValue placeholder="Select retention" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">Keep 3 versions</SelectItem>
                        <SelectItem value="5">Keep 5 versions</SelectItem>
                        <SelectItem value="10">Keep 10 versions</SelectItem>
                        <SelectItem value="unlimited">
                          Keep all versions
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Document Versions List */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">Document Versions</h3>
                  <Button
                    size="sm"
                    onClick={() => {
                      // Trigger version check via WebSocket
                      sendMessage({
                        action: "check_document_updates",
                        data: {},
                      });
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Check for Updates
                  </Button>
                </div>

                {documentVersions.length === 0 ? (
                  <div className="p-4 border rounded-lg text-center text-muted-foreground">
                    No document versions tracked yet
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {documentVersions.map((doc, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{doc.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {doc.source}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                doc.status === "updated"
                                  ? "default"
                                  : doc.status === "outdated"
                                    ? "destructive"
                                    : "outline"
                              }
                            >
                              {doc.status === "updated"
                                ? "Latest"
                                : doc.status === "outdated"
                                  ? "Update Available"
                                  : "Current"}
                            </Badge>
                            {doc.hasUpdate && (
                              <Button size="sm" variant="outline">
                                Update
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                          <div>Version: {doc.version}</div>
                          <div>Size: {doc.size}</div>
                          <div>Modified: {doc.lastModified}</div>
                          <div>Hash: {doc.contentHash?.substring(0, 8)}...</div>
                        </div>

                        {doc.changeLog && (
                          <div className="mt-2 p-2 bg-muted rounded text-xs">
                            <strong>Changes:</strong> {doc.changeLog}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Search Configuration</CardTitle>
              <CardDescription>
                Configure advanced search filters, faceted navigation, and
                search history management.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search Filter Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Search Filter Configuration
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label>Certification Level Filters</Label>
                    <div className="space-y-2">
                      {[
                        "CCNA",
                        "CCNP",
                        "CCIE",
                        "CCNA Security",
                        "CCNP Security",
                        "CCIE Security",
                      ].map((cert) => (
                        <div key={cert} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`cert-${cert}`}
                            defaultChecked
                            className="rounded"
                          />
                          <Label htmlFor={`cert-${cert}`} className="text-sm">
                            {cert}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Technology Category Filters</Label>
                    <div className="space-y-2">
                      {[
                        "Routing",
                        "Switching",
                        "Security",
                        "Wireless",
                        "Voice",
                        "Data Center",
                        "Service Provider",
                        "Collaboration",
                      ].map((tech) => (
                        <div key={tech} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`tech-${tech}`}
                            defaultChecked
                            className="rounded"
                          />
                          <Label htmlFor={`tech-${tech}`} className="text-sm">
                            {tech}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Document Type Filters</Label>
                    <div className="space-y-2">
                      {[
                        "Configuration Guides",
                        "Troubleshooting",
                        "Best Practices",
                        "Command Reference",
                        "Installation Guides",
                        "Release Notes",
                      ].map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`type-${type}`}
                            defaultChecked
                            className="rounded"
                          />
                          <Label htmlFor={`type-${type}`} className="text-sm">
                            {type}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Advanced Options</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="auto-complete" defaultChecked />
                        <Label htmlFor="auto-complete" className="text-sm">
                          Enable auto-complete suggestions
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="search-history" defaultChecked />
                        <Label htmlFor="search-history" className="text-sm">
                          Save search history
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="faceted-nav" defaultChecked />
                        <Label htmlFor="faceted-nav" className="text-sm">
                          Enable faceted navigation
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search History */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">Search History</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSearchHistory([])}
                  >
                    Clear History
                  </Button>
                </div>

                {searchHistory.length === 0 ? (
                  <div className="p-4 border rounded-lg text-center text-muted-foreground">
                    No search history available
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {searchHistory.map((search, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 border rounded"
                      >
                        <div>
                          <span className="font-medium">{search.query}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {search.timestamp}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {search.results} results
                          </Badge>
                          <Button size="sm" variant="ghost">
                            <Search className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Saved Searches */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">Saved Searches</h3>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Save Current Search
                  </Button>
                </div>

                {savedSearches.length === 0 ? (
                  <div className="p-4 border rounded-lg text-center text-muted-foreground">
                    No saved searches
                  </div>
                ) : (
                  <div className="space-y-2">
                    {savedSearches.map((search, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 border rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium">{search.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {search.query}
                          </p>
                          <div className="flex gap-1 mt-1">
                            {search.filters.map((filter, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="text-xs"
                              >
                                {filter}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Search className="h-3 w-3 mr-1" />
                            Run
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemConfiguration;
