export const DEFAULT_CHAT_MODEL: string = 'chat-model-small';

interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model-small',
    name: 'Small model',
    description: 'Small model for fast, lightweight agriculture tasks',
  },
  {
    id: 'chat-model-large',
    name: 'Large model',
    description: 'Large model for complex agricultural and crop management tasks',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Reasoning model',
    description: 'Uses advanced reasoning for agriculture planning and optimization',
  },
];

// Language models used for AI completion
export const aiLanguageModels = {
  'chat-model-small': 'gpt-4o-mini',
  'chat-model-large': 'gpt-4o',
  'chat-model-reasoning': 'gpt-4-turbo',
};

export default aiLanguageModels;
