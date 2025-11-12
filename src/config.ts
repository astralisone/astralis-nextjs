// Configuration values for the client
// These values can be overridden by environment variables

interface Config {
  apiUrl: string;
}

const config: Config = {
  apiUrl: process.env.NODE_ENV === 'test'
    ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    : (process.env.NEXT_PUBLIC_API_URL || ''),
};

export default config; 