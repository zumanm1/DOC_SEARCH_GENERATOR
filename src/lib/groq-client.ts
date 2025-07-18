import Groq from "groq-sdk";

class GroqClient {
  private client: Groq | null = null;
  private apiKey: string | null = null;
  private ollamaEndpoint: string = "http://localhost:11434";
  private preferOllama: boolean = true;

  constructor() {
    // Initialize with environment variable if available
    const envKey = import.meta.env.VITE_GROQ_API_KEY;
    if (envKey) {
      this.setApiKey(envKey);
    }

    // Load saved API key from localStorage
    this.loadSavedApiKey();
  }

  private loadSavedApiKey() {
    try {
      const savedKeys = localStorage.getItem("groq_api_keys");
      if (savedKeys) {
        const keys = JSON.parse(savedKeys);
        // Use the first active key
        const activeKey = keys.find((key: any) => key.active) || keys[0];
        if (activeKey && activeKey.key) {
          this.setApiKey(activeKey.key);
        }
      }
    } catch (error) {
      console.error("Error loading saved API key:", error);
    }
  }

  saveApiKey(name: string, key: string, setAsActive: boolean = true) {
    try {
      const savedKeys = JSON.parse(
        localStorage.getItem("groq_api_keys") || "[]",
      );

      // If setting as active, mark all others as inactive
      if (setAsActive) {
        savedKeys.forEach((k: any) => (k.active = false));
      }

      // Check if key already exists
      const existingIndex = savedKeys.findIndex((k: any) => k.key === key);
      if (existingIndex >= 0) {
        savedKeys[existingIndex] = {
          ...savedKeys[existingIndex],
          name,
          key,
          active: setAsActive,
          updatedAt: new Date().toISOString(),
        };
      } else {
        savedKeys.push({
          id: Date.now(),
          name,
          key,
          active: setAsActive,
          createdAt: new Date().toISOString(),
        });
      }

      localStorage.setItem("groq_api_keys", JSON.stringify(savedKeys));

      // Set as current API key if active
      if (setAsActive) {
        this.setApiKey(key);
      }

      return true;
    } catch (error) {
      console.error("Error saving API key:", error);
      return false;
    }
  }

  getSavedApiKeys() {
    try {
      return JSON.parse(localStorage.getItem("groq_api_keys") || "[]");
    } catch (error) {
      console.error("Error getting saved API keys:", error);
      return [];
    }
  }

  deleteSavedApiKey(keyId: number) {
    try {
      const savedKeys = JSON.parse(
        localStorage.getItem("groq_api_keys") || "[]",
      );
      const filteredKeys = savedKeys.filter((k: any) => k.id !== keyId);
      localStorage.setItem("groq_api_keys", JSON.stringify(filteredKeys));

      // If we deleted the active key, set the first remaining key as active
      const deletedKey = savedKeys.find((k: any) => k.id === keyId);
      if (deletedKey && deletedKey.active && filteredKeys.length > 0) {
        filteredKeys[0].active = true;
        localStorage.setItem("groq_api_keys", JSON.stringify(filteredKeys));
        this.setApiKey(filteredKeys[0].key);
      } else if (filteredKeys.length === 0) {
        this.apiKey = null;
        this.client = null;
      }

      return true;
    } catch (error) {
      console.error("Error deleting API key:", error);
      return false;
    }
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    this.client = new Groq({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
    });
  }

  setOllamaEndpoint(endpoint: string) {
    this.ollamaEndpoint = endpoint;
  }

  setPreferOllama(prefer: boolean) {
    this.preferOllama = prefer;
  }

  async checkOllamaAvailability(): Promise<boolean> {
    console.warn(
      "GroqClient.checkOllamaAvailability is now handled by the backend via WebSocket",
    );
    return false;
  }

  async chatWithOllama(
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
    model: string = "llama2",
  ): Promise<string> {
    console.warn(
      "GroqClient.chatWithOllama is now handled by the backend via WebSocket",
    );
    return "This is a stub response. Actual API calls are now made from the backend.";
  }

  async chat(
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
    model: string = "llama-3.3-70b-versatile",
  ) {
    console.warn("GroqClient.chat is now handled by the backend via WebSocket");
    return "This is a stub response. Actual API calls are now made from the backend.";
  }

  async generateSearchQueries(
    topic: string,
    certLevel: string = "all",
  ): Promise<string[]> {
    console.warn(
      "GroqClient.generateSearchQueries is now handled by the backend via WebSocket",
    );
    return [
      `${topic} cisco configuration`,
      `${topic} cisco troubleshooting`,
      `${topic} cisco best practices`,
      `${topic} cisco implementation`,
      `${topic} cisco security`,
    ];
  }

  async refineSearchResults(query: string, results: any[]): Promise<any[]> {
    console.warn(
      "GroqClient.refineSearchResults is now handled by the backend via WebSocket",
    );
    return results;
  }

  async generateSyntheticData(
    seedContent: string,
    topic: string,
    dataType:
      | "error-patterns"
      | "best-practices"
      | "troubleshooting"
      | "configurations",
    count: number = 100,
  ): Promise<string[]> {
    console.warn(
      "GroqClient.generateSyntheticData is now handled by the backend via WebSocket",
    );
    return [];
  }

  isConfigured(): boolean {
    return this.client !== null && this.apiKey !== null;
  }
}

export const groqClient = new GroqClient();
export default groqClient;
