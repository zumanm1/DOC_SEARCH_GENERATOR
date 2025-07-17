import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  Download,
  ExternalLink,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DocumentViewerProps {
  document: {
    id: string;
    title: string;
    url: string;
    source: string;
    type: string;
    size?: string;
    summary?: string;
  };
  trigger?: React.ReactNode;
  onDownload?: (document: any) => void;
}

interface DocumentContent {
  type: "html" | "pdf" | "text" | "error";
  content: string;
  error?: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  trigger,
  onDownload,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<DocumentContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");

  const fetchDocumentContent = async () => {
    setIsLoading(true);
    setContent(null);

    try {
      // Check if content is already cached in localStorage
      const cachedContent = localStorage.getItem(`doc_content_${document.id}`);
      if (cachedContent) {
        setContent(JSON.parse(cachedContent));
        setIsLoading(false);
        return;
      }

      // Determine content type based on URL or document type
      const isHtml =
        document.url.includes(".html") ||
        document.type.toLowerCase() === "html" ||
        !document.url.includes(".pdf");

      if (isHtml) {
        // For HTML content, try to fetch it
        try {
          const response = await fetch(document.url, {
            mode: "cors",
            headers: {
              Accept:
                "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            },
          });

          if (response.ok) {
            const htmlContent = await response.text();
            const documentContent: DocumentContent = {
              type: "html",
              content: htmlContent,
            };

            // Cache the content
            localStorage.setItem(
              `doc_content_${document.id}`,
              JSON.stringify(documentContent),
            );
            setContent(documentContent);
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        } catch (fetchError) {
          // If direct fetch fails due to CORS, show iframe fallback
          const documentContent: DocumentContent = {
            type: "html",
            content: `<iframe src="${document.url}" width="100%" height="600px" frameborder="0"></iframe>`,
          };
          setContent(documentContent);
        }
      } else {
        // For PDF files, we'll show an embedded PDF viewer
        const documentContent: DocumentContent = {
          type: "pdf",
          content: document.url,
        };
        setContent(documentContent);
      }
    } catch (error) {
      console.error("Error fetching document content:", error);
      setContent({
        type: "error",
        content: "",
        error:
          error instanceof Error ? error.message : "Failed to load document",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (onDownload) {
      onDownload(document);
    } else {
      // Default download behavior
      try {
        const link = document.createElement("a");
        link.href = document.url;
        link.download = document.title;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Download failed:", error);
      }
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm text-muted-foreground">Loading document...</p>
          </div>
        </div>
      );
    }

    if (!content) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-2">
            <FileText className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Click "Load Content" to view the document
            </p>
          </div>
        </div>
      );
    }

    if (content.type === "error") {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {content.error || "Failed to load document content"}
          </AlertDescription>
        </Alert>
      );
    }

    if (content.type === "pdf") {
      return (
        <div className="w-full h-96">
          <iframe
            src={content.content}
            width="100%"
            height="100%"
            className="border rounded"
            title={document.title}
          />
        </div>
      );
    }

    if (content.type === "html") {
      return (
        <div className="w-full h-96 border rounded">
          <div
            dangerouslySetInnerHTML={{ __html: content.content }}
            className="w-full h-full overflow-auto p-4"
          />
        </div>
      );
    }

    return (
      <ScrollArea className="h-96 w-full border rounded p-4">
        <pre className="text-sm whitespace-pre-wrap">{content.content}</pre>
      </ScrollArea>
    );
  };

  useEffect(() => {
    if (isOpen && !content && !isLoading) {
      // Auto-load content when dialog opens
      fetchDocumentContent();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline">
            <FileText className="h-4 w-4 mr-1" />
            View
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold truncate">
                {document.title}
              </DialogTitle>
              <DialogDescription className="mt-1">
                <div className="flex flex-wrap gap-2 items-center">
                  <Badge variant="outline">{document.type}</Badge>
                  <Badge variant="secondary">{document.source}</Badge>
                  {document.size && (
                    <Badge variant="outline">{document.size}</Badge>
                  )}
                </div>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="mt-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  onClick={fetchDocumentContent}
                  disabled={isLoading}
                  size="sm"
                  variant="outline"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 mr-1" />
                  )}
                  {content ? "Reload Content" : "Load Content"}
                </Button>
                <Button onClick={handleDownload} size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button
                  onClick={() => window.open(document.url, "_blank")}
                  size="sm"
                  variant="outline"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Open Original
                </Button>
              </div>
              {renderContent()}
            </div>
          </TabsContent>

          <TabsContent value="details" className="mt-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Document Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Source:</span>
                    <p className="text-muted-foreground">{document.source}</p>
                  </div>
                  <div>
                    <span className="font-medium">Type:</span>
                    <p className="text-muted-foreground">{document.type}</p>
                  </div>
                  {document.size && (
                    <div>
                      <span className="font-medium">Size:</span>
                      <p className="text-muted-foreground">{document.size}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium">URL:</span>
                    <p className="text-muted-foreground break-all">
                      {document.url}
                    </p>
                  </div>
                </div>
              </div>

              {document.summary && (
                <div>
                  <h3 className="font-medium mb-2">Summary</h3>
                  <p className="text-sm text-muted-foreground">
                    {document.summary}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;
