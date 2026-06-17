declare module "@supabase/ssr" {
  type SupabaseError = { message: string } | null;

  type AuthUser = {
    id: string;
    email?: string | null;
    user_metadata?: Record<string, unknown>;
  };

  type AuthSession = {
    user: AuthUser;
  } | null;

  type AuthResponse = Promise<{ data: { user: AuthUser | null; session: AuthSession }; error: SupabaseError }>;
  type BasicAuthResponse = Promise<{ data: unknown; error: SupabaseError }>;
  type QueryResponse<T> = Promise<{ data: T | null; error: SupabaseError }>;

  export type CookieAdapter = {
    get(name: string): string | undefined;
    set(name: string, value: string, options?: unknown): void;
    remove(name: string, options?: unknown): void;
  };

  export type CreateServerClientOptions = {
    cookies: CookieAdapter;
  };

  export interface SupabaseAuthClient {
    signUp(input: { email: string; password: string; options?: { data?: Record<string, unknown> } }): AuthResponse;
    signInWithPassword(input: { email: string; password: string }): AuthResponse;
    signOut(): BasicAuthResponse;
    resetPasswordForEmail(email: string, options?: { redirectTo?: string }): BasicAuthResponse;
    getSession(): Promise<{ data: { session: AuthSession }; error: SupabaseError }>;
    getUser(): Promise<{ data: { user: AuthUser | null }; error: SupabaseError }>;
    onAuthStateChange(callback: (event: string, session: AuthSession) => void): {
      data: { subscription: { unsubscribe(): void } };
    };
  }

  export interface SupabaseQueryBuilder<T = Record<string, unknown>>
    extends PromiseLike<{ data: T[] | null; error: SupabaseError }> {

    select(columns?: string): SupabaseQueryBuilder<T>;

    eq(column: string, value: unknown): SupabaseQueryBuilder<T>;

    maybeSingle(): QueryResponse<T>;

    upsert(
      value: Record<string, unknown> | Record<string, unknown>[],
      options?: { onConflict?: string }
    ): QueryResponse<T>;

    insert(
      value: Record<string, unknown> | Record<string, unknown>[]
    ): QueryResponse<T>;
  }

  export interface SupabaseClientLike {
    auth: SupabaseAuthClient;
    from<T = Record<string, unknown>>(table: string): SupabaseQueryBuilder<T>;
  }

  export function createBrowserClient(supabaseUrl: string, supabaseKey: string): SupabaseClientLike;
  export function createServerClient(supabaseUrl: string, supabaseKey: string, options: CreateServerClientOptions): SupabaseClientLike;
}
