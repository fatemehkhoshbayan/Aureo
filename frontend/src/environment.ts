export const environment = {
  /**
   * Backend origin (no trailing slash).
   * - Docker Compose: `/api` (nginx proxies to the backend container)
   * - `ng serve` without proxy: `http://localhost:8000`
   * - Vercel + Render: `https://YOUR-SERVICE.onrender.com`
   */
  apiBase: 'https://aureo-y70j.onrender.com',
};
