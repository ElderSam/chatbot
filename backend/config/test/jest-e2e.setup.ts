// E2E Test setup
process.env.NODE_ENV = 'test';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.GROQ_API_KEY = 'mock-groq-key-e2e';
process.env.HUGGINGFACE_API_KEY = 'mock-hf-key-e2e';

// Mock external dependencies for E2E tests
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    keys: jest.fn().mockResolvedValue([]),
    del: jest.fn().mockResolvedValue(1),
    quit: jest.fn().mockResolvedValue('OK'),
    on: jest.fn(),
    disconnect: jest.fn().mockResolvedValue('OK'),
  }));
});

// Mock HuggingFace API completely
jest.mock('@huggingface/inference', () => ({
  HfInference: jest.fn().mockImplementation(() => ({
    featureExtraction: jest.fn().mockResolvedValue([[0.1, 0.2, 0.3, 0.4]])
  }))
}));

// Mock Groq API for E2E tests (uses fetch directly)
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      choices: [{
        message: {
          content: 'Mocked E2E response from Groq'
        }
      }]
    })
  })
) as jest.Mock;

// Mock context loader to avoid external HTTP calls
jest.mock('./src/agents/knowledge-agent/context-loader', () => ({
  loadDynamicContext: jest.fn().mockResolvedValue([
    {
      title: 'Test Article',
      url: 'https://test.com/article',
      text: 'This is a test article content for E2E testing',
    }
  ]),
  setRedisCacheService: jest.fn().mockImplementation(() => {
    // Mock implementation - does nothing but prevents the error
  })
}));
