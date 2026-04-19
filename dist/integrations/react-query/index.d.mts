declare function detectReactQuery(): Promise<boolean>;
interface MinimalQuery {
    queryKey: unknown;
    state: {
        data: unknown;
        status: string;
        fetchStatus?: string;
        dataUpdatedAt?: number;
    };
    observers: unknown[];
    isStale: () => boolean;
}
interface MinimalQueryClient {
    getQueryCache: () => {
        getAll: () => MinimalQuery[];
        subscribe: (listener: (event: unknown) => void) => () => void;
    };
}
/**
 * Attach react-state-vitals monitoring to a TanStack QueryClient.
 * Subscribes to the QueryCache event bus — reactive, no polling.
 *
 * @param client   The QueryClient instance
 * @param name     Label shown in the panel (default: 'ReactQuery')
 * @param limitKB  Warning threshold in KB (default: 1024)
 * @returns        Unsubscribe function
 */
declare function monitorQueryClient(client: MinimalQueryClient, name?: string, limitKB?: number): () => void;

export { detectReactQuery, monitorQueryClient };
