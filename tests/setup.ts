import { config } from 'dotenv';
config({ path: '.env.test' });

import { afterEach, vi } from 'vitest';
afterEach(() => {
  vi.restoreAllMocks();
});
