// Unit Test setup
// Load environment variables from .env.test
process.env.NODE_ENV = 'test';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.GROQ_API_KEY = 'mock-groq-key';
process.env.HUGGINGFACE_API_KEY = 'mock-hf-key';

// Mock external APIs for unit tests
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

// Mock HuggingFace API for unit tests
jest.mock('@huggingface/inference', () => ({
  HfInference: jest.fn().mockImplementation(() => ({
    featureExtraction: jest.fn().mockResolvedValue([[0.1, 0.2, 0.3, 0.4]])
  }))
}));

// Mock Groq API for unit tests (uses fetch directly)
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      choices: [{
        message: {
          content: 'Mocked response from Groq'
        }
      }]
    })
  })
) as jest.Mock;
