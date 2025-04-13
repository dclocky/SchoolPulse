import { IStorage } from './database-storage';
import { DatabaseStorage } from './database-storage';

// Export the database storage instance
export const storage = new DatabaseStorage();

// Re-export the IStorage interface
export type { IStorage };