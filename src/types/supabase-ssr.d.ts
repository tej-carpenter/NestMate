declare module "@supabase/ssr" {
  type AuthResponse = Promise<{ error: { message: string } | null }>;

  export type CookieAdapter = {
    get(name: string): string | undefined;
    set(name: string, value: string, options?: unknown): void;
    remove(name: string, options?: unknown): void;
  };

  export type CreateServerClientOptions = {
    cookies: CookieAdapter;
  };

  export interface SupabaseAuthClient {
    signInWithOtp(input: { phone: string } | { email: string }): AuthResponse;
    verifyOtp(input: { phone: string; token: string; type: "sms" } | { email: string; token: string; type: "email" }): AuthResponse;
  }

  export interface SupabaseClientLike {
    auth: SupabaseAuthClient;
  }

  export function createBrowserClient(supabaseUrl: string, supabaseKey: string): SupabaseClientLike;
  export function createServerClient(supabaseUrl: string, supabaseKey: string, options: CreateServerClientOptions): SupabaseClientLike;
}