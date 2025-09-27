import dotenv from "dotenv";

// Load test environment variables
dotenv.config({ path: ".env.test" });

// Set test environment
process.env.NODE_ENV = "test";

// Mock Supabase for testing
jest.mock("@/config", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        order: jest.fn(() => ({
          range: jest.fn(() =>
            Promise.resolve({ data: [], error: null, count: 0 })
          ),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: {}, error: null })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: {}, error: null })),
          })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
  config: {
    jwt: {
      secret: "test-secret",
      expiresIn: "1h",
    },
    supabase: {
      url: "https://test.supabase.co",
      anonKey: "test-anon-key",
      serviceRoleKey: "test-service-key",
    },
    openai: {
      apiKey: "test-openai-key",
    },
    socket: {
      origin: "http://localhost:3000",
    },
    port: 4000,
    nodeEnv: "test",
  },
}));

// Global test timeout
jest.setTimeout(10000);
