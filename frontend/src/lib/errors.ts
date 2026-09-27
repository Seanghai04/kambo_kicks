import axios from 'axios';

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'Cannot reach the server. Start Docker or the backend on port 5000.';
    }
    const data = error.response.data as { message?: string; errors?: Record<string, string[]> };
    if (data.errors?.email?.[0]) return data.errors.email[0];
    if (data.message) return data.message;
    if (error.response.status === 422) return 'Wrong email or password';
  }
  return fallback;
}
