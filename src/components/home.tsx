import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import Dashboard from "./Dashboard";
import { AlertCircle, CheckCircle, Globe, HardDrive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Home() {
  const [operationMode, setOperationMode] = useState<"online" | "offline">(
    "online",
  );
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected"
  >("connected");
  const [databaseType, setDatabaseType] = useState<
    "sqlite" | "postgresql" | "supabase"
  >("supabase");

  // Mock function to toggle operation mode
  const handleModeToggle = (checked: boolean) => {
    setOperationMode(checked ? "online" : "offline");
    // In a real implementation, this would trigger database connection changes
  };

  return (
    <div className="min-h-screen p-6 bg-background">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Cisco IOS Document Search & Knowledge Management
        </h1>
        <p className="text-muted-foreground">
          Discover, search, and manage Cisco networking documentation
        </p>
      </header>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="operation-mode"
              checked={operationMode === "online"}
              onCheckedChange={handleModeToggle}
            />
            <Label htmlFor="operation-mode" className="flex items-center">
              {operationMode === "online" ? (
                <Globe className="h-4 w-4 mr-1" />
              ) : (
                <HardDrive className="h-4 w-4 mr-1" />
              )}
              {operationMode === "online" ? "Online Mode" : "Offline Mode"}
            </Label>
          </div>

          <div className="flex items-center">
            <Badge
              variant={
                connectionStatus === "connected" ? "default" : "destructive"
              }
              className="flex items-center"
            >
              {connectionStatus === "connected" ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <AlertCircle className="h-3 w-3 mr-1" />
              )}
              {connectionStatus === "connected" ? "Connected" : "Disconnected"}
            </Badge>
          </div>

          <div>
            <Badge variant="outline" className="bg-secondary">
              Database: {databaseType}
            </Badge>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="discovery" className="w-full">
            <TabsList className="w-full grid grid-cols-3 rounded-none border-b">
              <TabsTrigger value="discovery">Document Discovery</TabsTrigger>
              <TabsTrigger value="search">Document Search</TabsTrigger>
              <TabsTrigger value="config">System Configuration</TabsTrigger>
            </TabsList>
            <TabsContent value="discovery" className="p-0">
              <Dashboard activeTab="discovery" operationMode={operationMode} />
            </TabsContent>
            <TabsContent value="search" className="p-0">
              <Dashboard activeTab="search" operationMode={operationMode} />
            </TabsContent>
            <TabsContent value="config" className="p-0">
              <Dashboard activeTab="config" operationMode={operationMode} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>Cisco IOS Document Search & Knowledge Management System © 2025</p>
      </footer>
    </div>
  );
}
