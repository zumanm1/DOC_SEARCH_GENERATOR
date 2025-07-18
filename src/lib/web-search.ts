/**
 * Web Search Service - Frontend Client
 *
 * This is a client-side wrapper for the backend web search service.
 * All actual web scraping and document discovery has been moved to the backend.
 */

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

interface DocumentResult {
  id: string;
  title: string;
  url: string;
  source: string;
  type: string;
  size?: string;
  relevance: number;
  summary: string;
  downloadStatus: "pending" | "downloading" | "completed" | "failed";
  downloadProgress?: number;
}

class WebSearchService {
  // This service now acts as a client to the backend web search service
  // All actual web scraping and document discovery happens in the backend

  async searchWeb(
    query: string,
    maxResults: number = 10,
  ): Promise<SearchResult[]> {
    console.warn(
      "WebSearchService.searchWeb is now handled by the backend via WebSocket",
    );
    // In a real implementation, this would call the backend API via WebSocket
    return [];
  }

  async convertToDocuments(
    searchResults: SearchResult[],
    query: string,
  ): Promise<DocumentResult[]> {
    console.warn(
      "WebSearchService.convertToDocuments is now handled by the backend via WebSocket",
    );
    // In a real implementation, this would call the backend API via WebSocket
    return [];
  }

  async downloadDocument(document: DocumentResult): Promise<boolean> {
    console.warn(
      "WebSearchService.downloadDocument is now handled by the backend via WebSocket",
    );
    // In a real implementation, this would call the backend API via WebSocket
    return false;
  }

  getDownloadedDocuments(): any[] {
    console.warn(
      "WebSearchService.getDownloadedDocuments is now handled by the backend via WebSocket",
    );
    // In a real implementation, this would call the backend API via WebSocket
    return [];
  }

  getDownloadedDocument(documentId: string): any | null {
    console.warn(
      "WebSearchService.getDownloadedDocument is now handled by the backend via WebSocket",
    );
    // In a real implementation, this would call the backend API via WebSocket
    return null;
  }

  clearDownloadedDocuments(): void {
    console.warn(
      "WebSearchService.clearDownloadedDocuments is now handled by the backend via WebSocket",
    );
    // In a real implementation, this would call the backend API via WebSocket
  }

  getUnprocessedDocuments(): any[] {
    console.warn(
      "WebSearchService.getUnprocessedDocuments is now handled by the backend via WebSocket",
    );
    // In a real implementation, this would call the backend API via WebSocket
    return [];
  }

  markDocumentAsProcessed(documentId: string): void {
    console.warn(
      "WebSearchService.markDocumentAsProcessed is now handled by the backend via WebSocket",
    );
    // In a real implementation, this would call the backend API via WebSocket
  }
}

export const webSearchService = new WebSearchService();
export default webSearchService;
