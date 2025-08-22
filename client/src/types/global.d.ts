/**
 * Global type declarations
 */

interface Window {
  Clerk?: {
    session?: {
      getToken: () => Promise<string | null>;
    };
  };
}