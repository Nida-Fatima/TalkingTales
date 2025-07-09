import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface StoryGenerationRequest {
  situation: string;
  language: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  length: 'short' | 'medium' | 'long';
}

export interface GeneratedDialogue {
  character1: {
    name: string;
    role: string;
    avatar: string;
  };
  character2: {
    name: string;
    role: string;
    avatar: string;
  };
  lines: Array<{
    speaker: 'character1' | 'character2';
    text: string;
    translation: string;
  }>;
}

export async function generateCustomStory(request: StoryGenerationRequest): Promise<GeneratedDialogue> {
  const lengthMap = {
    short: '8-10 exchanges',
    medium: '12-15 exchanges',
    long: '18-20 exchanges'
  };

  const difficultyMap = {
    beginner: 'simple vocabulary and basic sentence structures',
    intermediate: 'moderate vocabulary with some complex sentences',
    advanced: 'rich vocabulary and complex grammatical structures'
  };

  const prompt = `Create a realistic German dialogue for the situation: "${request.situation}"

Requirements:
- Language: German with English translations
- Difficulty: ${request.difficulty} level (${difficultyMap[request.difficulty]})
- Length: ${lengthMap[request.length]}
- Create 2 appropriate characters with names, roles, and suitable emoji avatars
- Make the dialogue natural and contextually appropriate
- Include common phrases and expressions for this situation
- Ensure the conversation flows naturally
- Provide accurate English translations for each German sentence

Please respond with a JSON object in this exact format:
{
  "character1": {
    "name": "German name",
    "role": "their role in the situation",
    "avatar": "appropriate emoji"
  },
  "character2": {
    "name": "German name", 
    "role": "their role in the situation",
    "avatar": "appropriate emoji"
  },
  "lines": [
    {
      "speaker": "character1",
      "text": "German text",
      "translation": "English translation"
    },
    {
      "speaker": "character2", 
      "text": "German text",
      "translation": "English translation"
    }
  ]
}

Make sure the JSON is valid and properly formatted.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "anthropic/claude-3-haiku", // Cost-effective and good quality
      messages: [
        {
          role: "system",
          content: "You are a German language teacher creating educational dialogues. Always respond with valid JSON only, no additional text or formatting."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI service');
    }

    // Clean the response to ensure it's valid JSON
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    
    try {
      const parsedResponse = JSON.parse(cleanedResponse);
      return parsedResponse as GeneratedDialogue;
    } catch (parseError) {
      console.error('Failed to parse AI response:', cleanedResponse);
      throw new Error('Invalid response format from AI service');
    }
  } catch (error) {
    console.error('Error generating custom story:', error);
    throw new Error('Failed to generate custom story. Please try again.');
  }
}

export function checkOpenRouterConfig(): boolean {
  return !!import.meta.env.VITE_OPENROUTER_API_KEY;
}