import OpenAI from 'openai';

const openaiApiKey = process.env.OPENAI_API_KEY;

const openai = openaiApiKey ? new OpenAI({
  apiKey: openaiApiKey,
}) : null;

export default openai;