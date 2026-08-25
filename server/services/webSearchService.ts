import { SearchSource } from '../storage';

export interface WebSearchResult {
  success: boolean;
  query: string;
  responseText: string;
  speakableText: string;
  sources: SearchSource[];
  rawSnippets?: string[];
  error?: string;
}

export class WebSearchService {
  /**
   * Search Wikipedia for factual, encyclopedic, historical, biographical, or definition queries
   */
  public async searchWikipedia(query: string, callsign: string = 'Sir'): Promise<WebSearchResult | null> {
    try {
      // 1. Search Wikipedia for matching article titles
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        query
      )}&utf8=&format=json&srlimit=4`;

      const searchRes = await fetch(searchUrl, {
        headers: { 'User-Agent': 'JARAVIS-Assistant/4.8 (https://aistudio.google.com)' },
        signal: AbortSignal.timeout(5000)
      });

      if (!searchRes.ok) return null;

      const searchData: any = await searchRes.json();
      const results = searchData?.query?.search;
      if (!results || results.length === 0) return null;

      // 2. Fetch page summary for the top result
      const topTitle = results[0].title;
      const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topTitle)}`;

      const summaryRes = await fetch(summaryUrl, {
        headers: { 'User-Agent': 'JARAVIS-Assistant/4.8' },
        signal: AbortSignal.timeout(5000)
      });

      if (!summaryRes.ok) return null;

      const summaryData: any = await summaryRes.json();
      if (!summaryData.extract) return null;

      const pageUrl = summaryData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(topTitle.replace(/ /g, '_'))}`;

      const sources: SearchSource[] = [
        {
          title: `${summaryData.title} — Wikipedia`,
          url: pageUrl,
          snippet: summaryData.description || undefined
        }
      ];

      // Add other related titles to sources
      for (let i = 1; i < results.length; i++) {
        const item = results[i];
        sources.push({
          title: `${item.title} — Wikipedia`,
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
          snippet: item.snippet ? item.snippet.replace(/<[^>]*>/g, '') : undefined
        });
      }

      const formattedResponse = `### 📚 Factual Reference: ${summaryData.title}\n\n${summaryData.extract}\n\n${
        summaryData.description ? `*Topic Classification: ${summaryData.description}*` : ''
      }`;

      // Clean first 2 sentences for speech synthesis
      const firstSentenceMatch = summaryData.extract.match(/[^.!?]+[.!?]+/g);
      const speakableExtract = firstSentenceMatch ? firstSentenceMatch.slice(0, 2).join(' ').trim() : summaryData.extract;
      const speakableText = `${speakableExtract}`;

      return {
        success: true,
        query,
        responseText: formattedResponse,
        speakableText,
        sources: sources.slice(0, 4)
      };
    } catch (err: any) {
      console.warn('[WebSearchService] Wikipedia search warning:', err?.message);
      return null;
    }
  }

  /**
   * Search DuckDuckGo Instant Answers & Live Topics
   */
  public async searchDuckDuckGo(query: string, callsign: string = 'Sir'): Promise<WebSearchResult | null> {
    try {
      const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
      const res = await fetch(ddgUrl, {
        headers: { 'User-Agent': 'JARAVIS-Assistant/4.8' },
        signal: AbortSignal.timeout(5000)
      });

      if (!res.ok) return null;

      const data: any = await res.json();
      const sources: SearchSource[] = [];

      let mainAnswer = '';
      if (data.AbstractText) {
        mainAnswer = data.AbstractText;
        if (data.AbstractURL) {
          sources.push({
            title: data.AbstractSource || data.Heading || 'Web Knowledge Base',
            url: data.AbstractURL,
            snippet: data.AbstractText.slice(0, 120) + '...'
          });
        }
      } else if (data.Answer) {
        mainAnswer = data.Answer;
      }

      // Collect related topics
      if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
        for (const topic of data.RelatedTopics) {
          if (topic.Text && topic.FirstURL) {
            sources.push({
              title: topic.Text.split(' - ')[0] || 'Related Topic',
              url: topic.FirstURL,
              snippet: topic.Text
            });
            if (!mainAnswer && sources.length === 1) {
              mainAnswer = topic.Text;
            }
          }
          if (sources.length >= 4) break;
        }
      }

      if (!mainAnswer && sources.length === 0) {
        return null;
      }

      const formatted = `### 🔍 Live Web Intelligence: ${query}\n\n${mainAnswer}\n\n*Directly retrieved from verified public knowledge indices.*`;
      const speakableText = mainAnswer.length > 200 ? mainAnswer.slice(0, 197) + '...' : mainAnswer;

      return {
        success: true,
        query,
        responseText: formatted,
        speakableText,
        sources
      };
    } catch (err: any) {
      console.warn('[WebSearchService] DuckDuckGo search error:', err?.message);
      return null;
    }
  }

  /**
   * Search real-time web news and topics
   */
  public async executeWebSearch(query: string, callsign: string = 'Sir'): Promise<WebSearchResult> {
    const cleaned = query.replace(/^(search\s+(google\s+for|the\s+web\s+for|for)?|who\s+is|what\s+is|find\s+information\s+about)\s+/i, '').trim();
    const searchQuery = cleaned || query;

    // 1. Try Wikipedia first for high-quality structured encyclopedic knowledge
    const wikiResult = await this.searchWikipedia(searchQuery, callsign);
    if (wikiResult && wikiResult.responseText.length > 50) {
      return wikiResult;
    }

    // 2. Try DuckDuckGo Instant Answer
    const ddgResult = await this.searchDuckDuckGo(searchQuery, callsign);
    if (ddgResult && ddgResult.responseText.length > 30) {
      return ddgResult;
    }

    // 3. Fallback message if no live records returned
    return {
      success: false,
      query: searchQuery,
      responseText: `I searched the web for **"${searchQuery}"**, but could not retrieve verified live sources at this moment. Please verify your query or specify additional keywords.`,
      speakableText: `I was unable to find verified live search records for ${searchQuery}.`,
      sources: [],
      error: 'No search results found'
    };
  }
}

export const webSearchService = new WebSearchService();
