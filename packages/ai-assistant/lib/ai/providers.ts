import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { openai } from '@ai-sdk/openai';
import { fireworks } from '@ai-sdk/fireworks';

// Environment check utility
const isTestEnvironment = process.env.NODE_ENV === 'test';

// Define test models (used only in test environment)
const testModel = {
  async request() {
    return { text: 'This is a test response from the model.' };
  },
};

// Configure providers based on environment
const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model-small': testModel,
        'chat-model-large': testModel,
        'chat-model-reasoning': testModel,
        'title-model': testModel,
        'artifact-model': testModel,
      },
    })
  : customProvider({
      languageModels: {
        'chat-model-small': openai('gpt-4o-mini'),
        'chat-model-large': openai('gpt-4o'),
        'chat-model-reasoning': wrapLanguageModel({
          model: fireworks('accounts/fireworks/models/deepseek-r1'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': openai('gpt-4-turbo'),
        'artifact-model': openai('gpt-4o-mini'),
      },
      imageModels: {
        'small-model': openai.image('dall-e-2'),
        'large-model': openai.image('dall-e-3'),
      },
    });

export { myProvider };
export default myProvider;
