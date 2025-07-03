const COHERE_API_KEY = 'jPlcuanX2iJkwY6LDP2tRTQgCVp3zT9jb6VVt4Uz';
const COHERE_API_URL = 'https://api.cohere.ai/v1/classify';
const COHERE_GENERATE_URL = 'https://api.cohere.ai/v1/generate';

interface CohereClassification {
  input: string;
  prediction: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  confidence: number;
}

export interface SentimentResult {
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  confidence: number;
  summary?: string;
}

export const analyzeNewsSentiment = async (headlines: string[]): Promise<SentimentResult> => {
  try {
    if (!headlines || headlines.length === 0) {
      console.error('No headlines provided for analysis');
      return {
        sentiment: 'Neutral',
        confidence: 0,
        summary: 'No news headlines available for analysis.'
      };
    }

    // Join headlines into a single string for analysis
    const textToAnalyze = headlines.join('\n');
    console.log('Analyzing text:', textToAnalyze.substring(0, 100) + '...');
    
    // First, try to use the generate endpoint for sentiment analysis
    const prompt = `Analyze the sentiment of the following financial news headlines and classify it as POSITIVE, NEUTRAL, or NEGATIVE. 
    Respond with only one word: POSITIVE, NEUTRAL, or NEGATIVE.\n\nHeadlines:\n${textToAnalyze}`;
    
    console.log('Sending request to Cohere Generate API...');
    
    const response = await fetch(COHERE_GENERATE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COHERE_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        model: 'command',
        prompt: prompt,
        max_tokens: 10,
        temperature: 0.3,
        k: 0,
        p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop_sequences: ['\n'],
        return_likelihoods: 'NONE'
      }),
    });

    const responseText = await response.text();
    console.log('Cohere API response status:', response.status);
    console.log('Cohere API response:', responseText);

    if (!response.ok) {
      console.warn('Cohere API error, falling back to keyword analysis');
      return await analyzeWithFallback(textToAnalyze);
    }

    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Parsed response data:', data);
      
      if (!data.generations || !Array.isArray(data.generations) || data.generations.length === 0) {
        throw new Error('No generations in response');
      }
      
      const sentimentText = data.generations[0].text.trim().toUpperCase();
      console.log('Extracted sentiment text:', sentimentText);
      
      // Generate a summary based on the sentiment
      const summary = await generateSentimentSummary(textToAnalyze, sentimentText);
      
      return {
        sentiment: formatSentiment(sentimentText),
        confidence: 0.8, // Default confidence for generate endpoint
        summary
      };
      
    } catch (e) {
      console.error('Error processing Cohere response, using fallback:', e);
      return await analyzeWithFallback(textToAnalyze);
    }
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    // Return neutral as fallback
    return {
      sentiment: 'Neutral',
      confidence: 0,
      summary: 'Unable to analyze sentiment at this time.'
    };
  }
};

// Helper function to analyze with fallback method
const analyzeWithFallback = async (text: string): Promise<SentimentResult> => {
  console.warn('Using fallback sentiment analysis');
  const sentiment = await analyzeSentimentFallback(text);
  const summary = await generateSentimentSummary(text, sentiment.toUpperCase());
  return {
    sentiment: sentiment,
    confidence: 0.7, // Medium confidence for fallback
    summary: summary
  };
};

const generateSentimentSummary = async (text: string, sentiment: string): Promise<string> => {
  try {
    const prompt = `Analyze the following financial news and provide a brief (1-2 sentence) summary of the ${sentiment.toLowerCase()} sentiment for an investor. Focus on key points that would be relevant for investment decisions.\n\nNews:\n${text}\n\nSummary:`;
    
    const requestBody = {
      model: 'command',
      prompt: prompt,
      max_tokens: 100,
      temperature: 0.3,
      k: 0,
      p: 0.75,
      frequency_penalty: 0,
      presence_penalty: 0,
    };

    console.log('Sending summary request to Cohere API');
    
    const response = await fetch(COHERE_GENERATE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COHERE_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log('Cohere generate API response status:', response.status);
    console.log('Cohere generate API response:', responseText);

    if (!response.ok) {
      throw new Error(`Failed to generate summary (${response.status}): ${response.statusText}\n${responseText}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Parsed generate response:', data);
    } catch (e) {
      console.error('Failed to parse generate response as JSON:', e);
      return `The sentiment appears to be ${sentiment.toLowerCase()}.`;
    }

    if (!data.generations || !Array.isArray(data.generations) || data.generations.length === 0) {
      console.error('Unexpected generate response format:', data);
      return `The sentiment appears to be ${sentiment.toLowerCase()}.`;
    }

    return data.generations[0].text.trim();
  } catch (error) {
    console.error('Error generating summary:', error);
    return `The sentiment appears to be ${sentiment.toLowerCase()}.`;
  }
};

// Fallback sentiment analysis using simple keyword matching
const analyzeSentimentFallback = async (text: string): Promise<'Positive' | 'Neutral' | 'Negative'> => {
  const positiveWords = ['up', 'rise', 'high', 'gain', 'profit', 'growth', 'surge', 'rally'];
  const negativeWords = ['down', 'fall', 'low', 'loss', 'drop', 'decline', 'plummet', 'slump'];
  
  const lowerText = text.toLowerCase();
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'Positive';
  if (negativeCount > positiveCount) return 'Negative';
  return 'Neutral';
};

const formatSentiment = (sentiment: string): 'Positive' | 'Neutral' | 'Negative' => {
  if (!sentiment) return 'Neutral';
  
  const lowerSentiment = sentiment.toLowerCase();
  if (lowerSentiment.includes('pos')) return 'Positive';
  if (lowerSentiment.includes('neg')) return 'Negative';
  return 'Neutral';
};
