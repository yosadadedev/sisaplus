// Global Deno type declarations for Edge Functions
declare global {
  const Deno: {
    env: {
      get(key: string): string | undefined;
    };
    args: string[];
    exit(code?: number): never;
  };
}

// Web API types for Deno environment
declare class Request {
  constructor(input: string | Request, init?: RequestInit);
  readonly method: string;
  readonly url: string;
  readonly headers: Headers;
  readonly body: ReadableStream<Uint8Array> | null;
  json(): Promise<any>;
  text(): Promise<string>;
  clone(): Request;
}

declare class Response {
  constructor(body?: BodyInit | null, init?: ResponseInit);
  readonly status: number;
  readonly statusText: string;
  readonly headers: Headers;
  readonly body: ReadableStream<Uint8Array> | null;
  json(): Promise<any>;
  text(): Promise<string>;
  clone(): Response;
  static json(data: any, init?: ResponseInit): Response;
}

declare class Headers {
  constructor(init?: HeadersInit);
  append(name: string, value: string): void;
  delete(name: string): void;
  get(name: string): string | null;
  has(name: string): boolean;
  set(name: string, value: string): void;
  forEach(callback: (value: string, key: string, parent: Headers) => void): void;
}

type HeadersInit = string[][] | Record<string, string> | Headers;
type BodyInit = Blob | BufferSource | FormData | URLSearchParams | ReadableStream<Uint8Array> | string;
type RequestInit = {
  method?: string;
  headers?: HeadersInit;
  body?: BodyInit | null;
  mode?: RequestMode;
  credentials?: RequestCredentials;
  cache?: RequestCache;
  redirect?: RequestRedirect;
  referrer?: string;
  referrerPolicy?: ReferrerPolicy;
  integrity?: string;
  keepalive?: boolean;
  signal?: AbortSignal | null;
};
type ResponseInit = {
  status?: number;
  statusText?: string;
  headers?: HeadersInit;
};
type RequestMode = "cors" | "no-cors" | "same-origin";
type RequestCredentials = "omit" | "same-origin" | "include";
type RequestCache = "default" | "no-store" | "reload" | "no-cache" | "force-cache" | "only-if-cached";
type RequestRedirect = "follow" | "error" | "manual";
type ReferrerPolicy = "" | "no-referrer" | "no-referrer-when-downgrade" | "same-origin" | "origin" | "strict-origin" | "origin-when-cross-origin" | "strict-origin-when-cross-origin" | "unsafe-url";

declare class AbortSignal {
  readonly aborted: boolean;
  addEventListener(type: "abort", listener: () => void): void;
  removeEventListener(type: "abort", listener: () => void): void;
}

// Module declarations for Deno URL imports
declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(handler: (request: Request) => Response | Promise<Response>, options?: { port?: number }): void;
}

declare module "https://esm.sh/@supabase/supabase-js@2" {
  export function createClient(url: string, key: string): any;
  export * from "@supabase/supabase-js";
}

declare module "../_shared/cors.ts" {
  export const corsHeaders: Record<string, string>;
}

export {};