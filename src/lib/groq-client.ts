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
    try {
      const response = await fetch(`${this.ollamaEndpoint}/api/tags`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.ok;
    } catch (error) {
      console.log("Ollama not available, will use Groq as fallback");
      return false;
    }
  }

  async chatWithOllama(
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
    model: string = "llama2",
  ): Promise<string> {
    try {
      const prompt = messages
        .map((m) => `${m.role}: ${m.content}`)
        .join("\n\n");

      const response = await fetch(`${this.ollamaEndpoint}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response || "";
    } catch (error) {
      console.error("Ollama API error:", error);
      throw error;
    }
  }

  async chat(
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
    model: string = "llama-3.3-70b-versatile",
  ) {
    // Try Ollama first if preferred and available
    if (this.preferOllama) {
      try {
        const isOllamaAvailable = await this.checkOllamaAvailability();
        if (isOllamaAvailable) {
          console.log("Using Ollama for GPU-accelerated processing");
          return await this.chatWithOllama(messages, "llama2");
        }
      } catch (error) {
        console.log("Ollama failed, falling back to Groq:", error.message);
      }
    }

    // Fallback to Groq
    if (!this.client) {
      throw new Error(
        "Neither Ollama nor Groq are available. Please configure at least one LLM provider.",
      );
    }

    try {
      console.log("Using Groq as LLM provider");
      const completion = await this.client.chat.completions.create({
        messages,
        model,
        temperature: 0.7,
        max_tokens: 4096,
      });

      return completion.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("Groq API error:", error);
      throw error;
    }
  }

  async generateSearchQueries(
    topic: string,
    certLevel: string = "all",
  ): Promise<string[]> {
    const systemPrompt = `You are an expert at generating search queries for Cisco networking documentation. Generate 5-8 specific, diverse search queries that would help find comprehensive documentation for the given topic and certification level. Focus on different aspects: configuration, troubleshooting, best practices, security, and advanced implementations.`;

    const userPrompt = `Topic: ${topic}\nCertification Level: ${certLevel}\n\nGenerate diverse search queries that would find comprehensive Cisco documentation covering:\n1. Basic configuration\n2. Advanced configuration\n3. Troubleshooting\n4. Best practices\n5. Security considerations\n6. Implementation examples\n7. Common issues\n8. Performance optimization\n\nReturn only the queries, one per line, without numbering or bullets.`;

    try {
      const response = await this.chat([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ]);

      const queries = response
        .split("\n")
        .filter((query) => query.trim().length > 0)
        .slice(0, 8);

      // Ensure we have at least some basic queries
      if (queries.length < 3) {
        queries.push(
          `${topic} cisco configuration guide`,
          `${topic} cisco troubleshooting`,
          `${topic} cisco best practices`,
          `${topic} cisco implementation examples`,
          `${topic} cisco security configuration`,
        );
      }

      return queries;
    } catch (error) {
      console.error("Error generating search queries:", error);
      return [
        `${topic} cisco configuration`,
        `${topic} cisco troubleshooting`,
        `${topic} cisco best practices`,
        `${topic} cisco implementation`,
        `${topic} cisco security`,
      ];
    }
  }

  async refineSearchResults(query: string, results: any[]): Promise<any[]> {
    if (results.length === 0) return results;

    const systemPrompt = `You are an expert at evaluating Cisco networking documentation relevance for RAG system training. Given a search query and a list of documents, rank them by relevance, technical depth, and potential for generating high-quality synthetic training data. Prioritize documents that are:
1. Highly relevant to the query
2. Technically comprehensive
3. Contain configuration examples
4. Include troubleshooting information
5. Have best practices content
6. Are from authoritative sources (cisco.com, ciscopress.com)

Filter out generic or low-quality documents.`;

    const userPrompt = `Query: ${query}\n\nDocuments:\n${results.map((doc, i) => `${i + 1}. ${doc.title} - ${doc.summary || doc.snippet || ""} (Source: ${doc.source})`).join("\n")}\n\nReturn the document numbers (1, 2, 3, etc.) of the most relevant and high-quality documents for RAG training, ordered by relevance and technical value. Focus on documents that would generate the best synthetic training data. Return only numbers separated by commas.`;

    try {
      const response = await this.chat([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ]);

      const indices = response
        .split(",")
        .map((n) => parseInt(n.trim()) - 1)
        .filter((i) => !isNaN(i) && i >= 0 && i < results.length);

      const refinedResults = indices.map((i) => ({
        ...results[i],
        relevance: Math.max(results[i].relevance || 0, 0.8), // Boost relevance for refined results
      }));

      return refinedResults;
    } catch (error) {
      console.error("Error refining search results:", error);
      // Return top results sorted by relevance as fallback
      return results
        .sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
        .slice(0, Math.min(6, results.length));
    }
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
    const systemPrompts = {
      "error-patterns": `You are an expert Cisco network engineer. Generate realistic but incorrect network configurations and common mistakes that engineers make. Each example should be plausible but contain subtle errors that would cause network issues.`,
      "best-practices": `You are a senior Cisco network architect. Generate expert-level best practices, optimal configurations, and professional recommendations based on industry standards and real-world experience.`,
      troubleshooting: `You are a Cisco network troubleshooting expert. Generate realistic network problems, symptoms, diagnostic steps, and solutions that engineers encounter in production environments.`,
      configurations: `You are a Cisco configuration expert. Generate various configuration examples, command variations, and implementation approaches for different network scenarios.`,
    };

    const userPrompt = `Based on this seed content about ${topic}:\n\n${seedContent.substring(0, 2000)}...\n\nGenerate ${count} diverse ${dataType.replace("-", " ")} examples. Each example should be:\n1. Technically accurate (for best practices) or realistically flawed (for error patterns)\n2. Specific to ${topic}\n3. Practical and applicable\n4. Varied in complexity and scenario\n\nFormat each example as a separate paragraph starting with "Example N:" where N is the number.`;

    try {
      const response = await this.chat([
        { role: "system", content: systemPrompts[dataType] },
        { role: "user", content: userPrompt },
      ]);

      return response
        .split(/Example \d+:/)
        .filter((example) => example.trim().length > 50)
        .map((example) => example.trim())
        .slice(0, count);
    } catch (error) {
      console.error(`Error generating synthetic ${dataType}:`, error);
      return [];
    }
  }

  isConfigured(): boolean {
    return this.client !== null && this.apiKey !== null;
  }
}

export const groqClient = new GroqClient();
export default groqClient;
