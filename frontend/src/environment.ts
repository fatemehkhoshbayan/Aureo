export const environment = {
  /**
   * Backend origin (no trailing slash).
   * - Docker Compose / local backend: `http://localhost:8000`
   * - Docker Compose via nginx: `/api`
   * - Vercel + Render: `https://YOUR-SERVICE.onrender.com`
   */
  apiBase: 'http://localhost:8000',
};
