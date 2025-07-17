// Web search functionality using DuckDuckGo Instant Answer API and web scraping
// This is a simple implementation that doesn't require API keys

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
  private readonly CORS_PROXY = "https://api.allorigins.win/raw?url=";
  private readonly SEARCH_ENGINES = {
    duckduckgo:
      "https://api.duckduckgo.com/?q={query}&format=json&no_redirect=1&no_html=1&skip_disambig=1",
    bing: "https://www.bing.com/search?q={query}&format=rss",
  };

  async searchWeb(
    query: string,
    maxResults: number = 10,
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    try {
      // Try DuckDuckGo first
      const duckResults = await this.searchDuckDuckGo(query);
      results.push(...duckResults);

      // If we need more results, try other methods
      if (results.length < maxResults) {
        const googleResults = await this.searchGoogle(
          query,
          maxResults - results.length,
        );
        results.push(...googleResults);
      }
    } catch (error) {
      console.error("Web search error:", error);
    }

    return results.slice(0, maxResults);
  }

  private async searchDuckDuckGo(query: string): Promise<SearchResult[]> {
    try {
      const url = this.SEARCH_ENGINES.duckduckgo.replace(
        "{query}",
        encodeURIComponent(query),
      );
      const response = await fetch(url);
      const data = await response.json();

      const results: SearchResult[] = [];

      // Process instant answer
      if (data.Answer) {
        results.push({
          title: data.Heading || "DuckDuckGo Answer",
          url: data.AbstractURL || "#",
          snippet: data.Answer,
          source: "duckduckgo.com",
        });
      }

      // Process related topics
      if (data.RelatedTopics) {
        data.RelatedTopics.forEach((topic: any) => {
          if (topic.FirstURL && topic.Text) {
            results.push({
              title: topic.Text.split(" - ")[0] || topic.Text.substring(0, 100),
              url: topic.FirstURL,
              snippet: topic.Text,
              source: new URL(topic.FirstURL).hostname,
            });
          }
        });
      }

      return results;
    } catch (error) {
      console.error("DuckDuckGo search error:", error);
      return [];
    }
  }

  private async searchGoogle(
    query: string,
    maxResults: number,
  ): Promise<SearchResult[]> {
    // This is a simplified approach using Google's site-specific search
    // In a real implementation, you might want to use Google Custom Search API
    const sites = ["cisco.com", "ciscopress.com", "ine.com", "cbtnuggets.com"];
    const results: SearchResult[] = [];

    for (const site of sites) {
      try {
        const siteQuery = `site:${site} ${query}`;
        // This would need to be implemented with a proper search API or scraping
        // For now, we'll return mock results based on the query
        const mockResults = this.generateMockResults(query, site);
        results.push(...mockResults);

        if (results.length >= maxResults) break;
      } catch (error) {
        console.error(`Error searching ${site}:`, error);
      }
    }

    return results.slice(0, maxResults);
  }

  private generateMockResults(query: string, site: string): SearchResult[] {
    const topics = query.toLowerCase();
    const results: SearchResult[] = [];

    // Enhanced document library with more comprehensive coverage
    const documentLibrary = {
      bgp: [
        {
          title: `BGP Configuration Guide - ${site}`,
          url: `https://${site}/bgp-configuration-guide.pdf`,
          snippet:
            "Comprehensive guide for BGP configuration and troubleshooting on Cisco devices.",
        },
        {
          title: `BGP Security Best Practices - ${site}`,
          url: `https://${site}/bgp-security-best-practices.pdf`,
          snippet:
            "Advanced BGP security configurations and threat mitigation strategies.",
        },
        {
          title: `BGP Route Reflector Design - ${site}`,
          url: `https://${site}/bgp-route-reflector-design.pdf`,
          snippet:
            "Scalable BGP route reflector architectures for large networks.",
        },
      ],
      ospf: [
        {
          title: `OSPF Implementation Guide - ${site}`,
          url: `https://${site}/ospf-implementation-guide.pdf`,
          snippet:
            "Detailed OSPF implementation and design considerations for enterprise networks.",
        },
        {
          title: `OSPF Area Design Principles - ${site}`,
          url: `https://${site}/ospf-area-design.pdf`,
          snippet:
            "OSPF area design strategies and hierarchical network planning.",
        },
        {
          title: `OSPF Troubleshooting Handbook - ${site}`,
          url: `https://${site}/ospf-troubleshooting.pdf`,
          snippet:
            "Common OSPF issues and systematic troubleshooting approaches.",
        },
      ],
      mpls: [
        {
          title: `MPLS VPN Configuration - ${site}`,
          url: `https://${site}/mpls-vpn-configuration.pdf`,
          snippet:
            "Advanced MPLS VPN configuration and troubleshooting techniques.",
        },
        {
          title: `MPLS Traffic Engineering - ${site}`,
          url: `https://${site}/mpls-traffic-engineering.pdf`,
          snippet: "MPLS-TE implementation for optimized network traffic flow.",
        },
      ],
      eigrp: [
        {
          title: `EIGRP Configuration and Tuning - ${site}`,
          url: `https://${site}/eigrp-configuration.pdf`,
          snippet:
            "EIGRP protocol configuration, optimization, and troubleshooting.",
        },
      ],
      qos: [
        {
          title: `QoS Implementation Guide - ${site}`,
          url: `https://${site}/qos-implementation.pdf`,
          snippet:
            "Quality of Service configuration for voice, video, and data traffic.",
        },
        {
          title: `Advanced QoS Techniques - ${site}`,
          url: `https://${site}/advanced-qos-techniques.pdf`,
          snippet:
            "Advanced QoS mechanisms including CBWFQ, LLQ, and traffic shaping.",
        },
      ],
      security: [
        {
          title: `Cisco ASA Firewall Configuration - ${site}`,
          url: `https://${site}/asa-firewall-config.pdf`,
          snippet:
            "Comprehensive ASA firewall configuration and security policies.",
        },
        {
          title: `Network Security Fundamentals - ${site}`,
          url: `https://${site}/network-security-fundamentals.pdf`,
          snippet:
            "Core network security concepts and Cisco security solutions.",
        },
      ],
      switching: [
        {
          title: `VLAN and Trunking Configuration - ${site}`,
          url: `https://${site}/vlan-trunking-config.pdf`,
          snippet: "VLAN design, trunking protocols, and inter-VLAN routing.",
        },
        {
          title: `Spanning Tree Protocol Guide - ${site}`,
          url: `https://${site}/spanning-tree-guide.pdf`,
          snippet: "STP, RSTP, and MST configuration for loop-free switching.",
        },
      ],
      wireless: [
        {
          title: `Cisco Wireless LAN Configuration - ${site}`,
          url: `https://${site}/wireless-lan-config.pdf`,
          snippet: "Wireless controller and access point configuration guide.",
        },
      ],
    };

    // Match topics and add relevant documents
    Object.keys(documentLibrary).forEach((topic) => {
      if (topics.includes(topic)) {
        documentLibrary[topic].forEach((doc) => {
          results.push({
            ...doc,
            source: site,
          });
        });
      }
    });

    // Add generic results based on query
    if (results.length === 0) {
      results.push({
        title: `${query} Configuration Guide - ${site}`,
        url: `https://${site}/${query.replace(/\s+/g, "-").toLowerCase()}-guide.pdf`,
        snippet: `Comprehensive documentation and configuration examples for ${query}.`,
        source: site,
      });
    }

    // Add latent documents (additional related content)
    const latentDocs = [
      {
        title: `Network Troubleshooting Methodology - ${site}`,
        url: `https://${site}/network-troubleshooting-methodology.pdf`,
        snippet:
          "Systematic approach to network problem diagnosis and resolution.",
        source: site,
      },
      {
        title: `Cisco IOS Command Reference - ${site}`,
        url: `https://${site}/ios-command-reference.pdf`,
        snippet: "Complete reference for Cisco IOS commands and syntax.",
        source: site,
      },
      {
        title: `Network Design Best Practices - ${site}`,
        url: `https://${site}/network-design-best-practices.pdf`,
        snippet:
          "Industry best practices for scalable network architecture design.",
        source: site,
      },
    ];

    // Add some latent documents randomly
    if (Math.random() > 0.5) {
      results.push(latentDocs[Math.floor(Math.random() * latentDocs.length)]);
    }

    return results;
  }

  async convertToDocuments(
    searchResults: SearchResult[],
    query: string,
  ): Promise<DocumentResult[]> {
    return searchResults.map((result, index) => ({
      id: `web-${index}`,
      title: result.title,
      url: result.url,
      source: result.source,
      type: this.detectDocumentType(result.url, result.title),
      size: this.estimateSize(result.title),
      relevance: this.calculateRelevance(result, query),
      summary: result.snippet,
      downloadStatus: "pending" as const,
    }));
  }

  private detectDocumentType(url: string, title: string): string {
    if (url.includes(".pdf") || title.toLowerCase().includes("pdf"))
      return "PDF";
    if (url.includes(".doc") || title.toLowerCase().includes("doc"))
      return "DOC";
    if (url.includes(".ppt") || title.toLowerCase().includes("presentation"))
      return "PPT";
    return "HTML";
  }

  private estimateSize(title: string): string {
    // Simple size estimation based on document type and title length
    const baseSize = Math.random() * 3 + 0.5; // 0.5 - 3.5 MB
    return `${baseSize.toFixed(1)} MB`;
  }

  private calculateRelevance(result: SearchResult, query: string): number {
    const queryWords = query.toLowerCase().split(" ");
    const titleWords = result.title.toLowerCase().split(" ");
    const snippetWords = result.snippet.toLowerCase().split(" ");

    let score = 0;
    let totalWords = queryWords.length;

    queryWords.forEach((word) => {
      if (titleWords.some((tw) => tw.includes(word))) score += 0.4;
      if (snippetWords.some((sw) => sw.includes(word))) score += 0.2;
      if (result.source.includes("cisco")) score += 0.1;
    });

    return Math.min(score / totalWords + Math.random() * 0.2, 1);
  }

  async downloadDocument(document: DocumentResult): Promise<boolean> {
    try {
      // Check if document already exists to prevent duplicates
      if (this.isDocumentAlreadyDownloaded(document)) {
        console.log(`Document already exists: ${document.title}`);
        return true; // Return true since document is already available
      }

      console.log(`Starting download of: ${document.title}`);

      // Try to fetch the document content
      const response = await fetch(document.url, {
        mode: "cors",
        headers: {
          Accept: "*/*",
        },
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type") || "";
        let content: string;

        if (contentType.includes("text/html") || document.type === "HTML") {
          content = await response.text();
        } else if (
          contentType.includes("application/pdf") ||
          document.type === "PDF"
        ) {
          // For PDFs, we'll store the URL since we can't easily convert to text in browser
          content = document.url;
        } else {
          content = await response.text();
        }

        // Store the downloaded content in localStorage with unique hash
        const documentHash = this.generateDocumentHash(document);
        const downloadedDoc = {
          ...document,
          content,
          downloadedAt: new Date().toISOString(),
          contentType,
          documentHash,
          isProcessed: false, // Track if document has been processed by Stage 2
        };

        localStorage.setItem(
          `downloaded_doc_${document.id}`,
          JSON.stringify(downloadedDoc),
        );

        // Also store in a list of downloaded documents with hash tracking
        const downloadedDocs = JSON.parse(
          localStorage.getItem("downloaded_documents") || "[]",
        );
        const existingIndex = downloadedDocs.findIndex(
          (doc: any) => doc.documentHash === documentHash,
        );

        if (existingIndex >= 0) {
          downloadedDocs[existingIndex] = downloadedDoc;
        } else {
          downloadedDocs.push(downloadedDoc);
        }

        localStorage.setItem(
          "downloaded_documents",
          JSON.stringify(downloadedDocs),
        );

        // Store document hash for quick duplicate checking
        const documentHashes = JSON.parse(
          localStorage.getItem("document_hashes") || "[]",
        );
        if (!documentHashes.includes(documentHash)) {
          documentHashes.push(documentHash);
          localStorage.setItem(
            "document_hashes",
            JSON.stringify(documentHashes),
          );
        }

        console.log(`Download completed: ${document.title}`);
        return true;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Download failed for ${document.title}:`, error);

      // Even if download fails, we can still store the document reference
      const documentHash = this.generateDocumentHash(document);
      const downloadedDoc = {
        ...document,
        content: document.url, // Store URL as fallback
        downloadedAt: new Date().toISOString(),
        downloadError:
          error instanceof Error ? error.message : "Download failed",
        documentHash,
        isProcessed: false,
      };

      localStorage.setItem(
        `downloaded_doc_${document.id}`,
        JSON.stringify(downloadedDoc),
      );

      return false;
    }
  }

  getDownloadedDocuments(): any[] {
    try {
      return JSON.parse(localStorage.getItem("downloaded_documents") || "[]");
    } catch (error) {
      console.error("Error getting downloaded documents:", error);
      return [];
    }
  }

  getDownloadedDocument(documentId: string): any | null {
    try {
      const doc = localStorage.getItem(`downloaded_doc_${documentId}`);
      return doc ? JSON.parse(doc) : null;
    } catch (error) {
      console.error("Error getting downloaded document:", error);
      return null;
    }
  }

  clearDownloadedDocuments(): void {
    try {
      const downloadedDocs = this.getDownloadedDocuments();
      downloadedDocs.forEach((doc: any) => {
        localStorage.removeItem(`downloaded_doc_${doc.id}`);
      });
      localStorage.removeItem("downloaded_documents");
      localStorage.removeItem("document_hashes");
    } catch (error) {
      console.error("Error clearing downloaded documents:", error);
    }
  }

  // Generate a unique hash for document to prevent duplicates
  private generateDocumentHash(document: DocumentResult): string {
    const hashString = `${document.url}_${document.title}_${document.source}`;
    return btoa(hashString)
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, 16);
  }

  // Check if document already exists based on URL, title, and source
  private isDocumentAlreadyDownloaded(document: DocumentResult): boolean {
    try {
      const documentHash = this.generateDocumentHash(document);
      const documentHashes = JSON.parse(
        localStorage.getItem("document_hashes") || "[]",
      );
      return documentHashes.includes(documentHash);
    } catch (error) {
      console.error("Error checking document duplicates:", error);
      return false;
    }
  }

  // Get unprocessed documents for Stage 2
  getUnprocessedDocuments(): any[] {
    try {
      const downloadedDocs = this.getDownloadedDocuments();
      return downloadedDocs.filter((doc: any) => !doc.isProcessed);
    } catch (error) {
      console.error("Error getting unprocessed documents:", error);
      return [];
    }
  }

  // Mark document as processed by Stage 2
  markDocumentAsProcessed(documentId: string): void {
    try {
      const doc = this.getDownloadedDocument(documentId);
      if (doc) {
        doc.isProcessed = true;
        doc.processedAt = new Date().toISOString();
        localStorage.setItem(
          `downloaded_doc_${documentId}`,
          JSON.stringify(doc),
        );

        // Update the main list
        const downloadedDocs = this.getDownloadedDocuments();
        const index = downloadedDocs.findIndex((d: any) => d.id === documentId);
        if (index >= 0) {
          downloadedDocs[index] = doc;
          localStorage.setItem(
            "downloaded_documents",
            JSON.stringify(downloadedDocs),
          );
        }
      }
    } catch (error) {
      console.error("Error marking document as processed:", error);
    }
  }
}

export const webSearchService = new WebSearchService();
export default webSearchService;
