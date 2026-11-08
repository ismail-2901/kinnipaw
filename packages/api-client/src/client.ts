import type { ApiResponse, Meta } from '@kinnipaw/contracts';

export class ApiClientError extends Error {
  public readonly code: string;
  public readonly requestId: string;
  public readonly details?: unknown;

  constructor(message: string, code: string, requestId: string, details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.requestId = requestId;
    this.details = details;
  }
}

export interface ApiClientConfig {
  baseUrl: string;
  getAuthToken?: () => Promise<string | null> | string | null;
}

export class KinnipawApiClient {
  private baseUrl: string;
  private getAuthToken?: () => Promise<string | null> | string | null;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.getAuthToken = config.getAuthToken;
  }

  public async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T; meta: Meta }> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const headers = new Headers(options.headers || {});

    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    if (this.getAuthToken) {
      const token = await this.getAuthToken();
      if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const body = (await response.json()) as ApiResponse<T>;

    if (body.error) {
      throw new ApiClientError(
        body.error.message,
        body.error.code,
        body.meta?.requestId || 'unknown',
        body.error.details
      );
    }

    return {
      data: body.data as T,
      meta: body.meta,
    };
  }

  public async get<T>(endpoint: string, options?: RequestInit): Promise<{ data: T; meta: Meta }> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<{ data: T; meta: Meta }> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
  }
}
