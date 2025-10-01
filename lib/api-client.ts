/**
 * API クライアント
 *
 * 全てのAPI呼び出しで統一されたエラーハンドリング、レスポンス処理を提供
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiClientOptions {
  headers?: Record<string, string>;
  retry?: number;
  retryDelay?: number;
}

class ApiClient {
  private defaultOptions: ApiClientOptions = {
    headers: {
      "Content-Type": "application/json",
    },
    retry: 0,
    retryDelay: 1000,
  };

  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    retryCount: number,
    retryDelay: number
  ): Promise<Response> {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      if (retryCount > 0) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        return this.fetchWithRetry(url, options, retryCount - 1, retryDelay);
      }
      throw error;
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let details: unknown;

      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        }
        if (errorData.details) {
          details = errorData.details;
        }
      } catch {
        // JSON parsing failed, use default error message
      }

      throw new ApiError(response.status, errorMessage, details);
    }

    // 204 No Content の場合は空のオブジェクトを返す
    if (response.status === 204) {
      return {} as T;
    }

    try {
      return await response.json();
    } catch {
      // JSON parsing failed for successful response
      return {} as T;
    }
  }

  async get<T>(url: string, options?: ApiClientOptions): Promise<T> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    const response = await this.fetchWithRetry(
      url,
      {
        method: "GET",
        headers: mergedOptions.headers,
      },
      mergedOptions.retry || 0,
      mergedOptions.retryDelay || 1000
    );
    return this.handleResponse<T>(response);
  }

  async post<T>(
    url: string,
    data?: unknown,
    options?: ApiClientOptions
  ): Promise<T> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    const response = await this.fetchWithRetry(
      url,
      {
        method: "POST",
        headers: mergedOptions.headers,
        body: data ? JSON.stringify(data) : undefined,
      },
      mergedOptions.retry || 0,
      mergedOptions.retryDelay || 1000
    );
    return this.handleResponse<T>(response);
  }

  async put<T>(
    url: string,
    data?: unknown,
    options?: ApiClientOptions
  ): Promise<T> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    const response = await this.fetchWithRetry(
      url,
      {
        method: "PUT",
        headers: mergedOptions.headers,
        body: data ? JSON.stringify(data) : undefined,
      },
      mergedOptions.retry || 0,
      mergedOptions.retryDelay || 1000
    );
    return this.handleResponse<T>(response);
  }

  async delete<T>(url: string, options?: ApiClientOptions): Promise<T> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    const response = await this.fetchWithRetry(
      url,
      {
        method: "DELETE",
        headers: mergedOptions.headers,
      },
      mergedOptions.retry || 0,
      mergedOptions.retryDelay || 1000
    );
    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient();
