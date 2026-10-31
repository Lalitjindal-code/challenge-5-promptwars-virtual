/**
 * Planora AI — Server & Serverless Runtime HTTP Contracts
 *
 * Provides strongly-typed request and response abstractions for Vercel
 * serverless edge/node handlers and internal HTTP utilities, eliminating `any`.
 */

export interface ApiRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  url?: string;
  body?: unknown;
  socket?: {
    remoteAddress?: string;
  };
}

export interface ApiResponse {
  statusCode?: number;
  setHeader(name: string, value: string | number | readonly string[]): void;
  getHeader?(name: string): string | number | string[] | undefined;
  end(chunk?: string | Uint8Array | unknown): void;
  write?(chunk: string | Uint8Array | unknown): boolean;
}

