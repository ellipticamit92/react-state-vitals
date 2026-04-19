import { StoreMutatorIdentifier, StateCreator, StoreApi, Mutate } from 'zustand';

type UseBoundStore<S extends StoreApi<unknown>> = {
    (): ExtractState<S>;
    <U>(selector: (state: ExtractState<S>) => U): U;
} & S;
type ExtractState<S> = S extends {
    getState: () => infer T;
} ? T : never;
declare function create<T>(name: string, limitKB?: number): <Mos extends [StoreMutatorIdentifier, unknown][] = []>(initializer: StateCreator<T, [], Mos>) => UseBoundStore<Mutate<StoreApi<T>, Mos>>;
declare function create<T>(): <Mos extends [StoreMutatorIdentifier, unknown][] = []>(initializer: StateCreator<T, [], Mos>) => UseBoundStore<Mutate<StoreApi<T>, Mos>>;
declare function create<T, Mos extends [StoreMutatorIdentifier, unknown][] = []>(initializer: StateCreator<T, [], Mos>): UseBoundStore<Mutate<StoreApi<T>, Mos>>;

type AnyMutators = [StoreMutatorIdentifier, unknown][];
declare function devtools<T, Mps extends AnyMutators = [], Mcs extends AnyMutators = []>(initializer: StateCreator<T, [...Mps, ['zustand/devtools', never]], Mcs>, options?: {
    name?: string;
    [key: string]: unknown;
}): StateCreator<T, Mps, [['zustand/devtools', never], ...Mcs]>;
declare function persist<T, Mps extends AnyMutators = [], Mcs extends AnyMutators = []>(initializer: StateCreator<T, [...Mps, ['zustand/persist', unknown]], Mcs>, options: {
    name: string;
    [key: string]: unknown;
}): StateCreator<T, Mps, [['zustand/persist', unknown], ...Mcs]>;

interface MonitorableStore {
    subscribe: (listener: (state: any) => void) => () => void;
    getState: () => unknown;
}
/**
 * Attaches react-state-vitals monitoring to an existing zustand store hook.
 * Returns the same hook unchanged — fully transparent.
 *
 * @param name   Display name shown in the StateVitals panel
 * @param store  The hook returned by zustand's create()
 * @param limitKB  Warning threshold in KB (default 50)
 */
declare function monitorStore<S extends MonitorableStore>(name: string, store: S, limitKB?: number): S;
/**
 * Remove react-state-vitals monitoring from a store registered via monitorStore().
 */
declare function unmonitorStore(name: string): void;

declare function detectZustand(): Promise<boolean>;
declare function isZustandAvailable(): boolean;

export { create, detectZustand, devtools, isZustandAvailable, monitorStore, persist, unmonitorStore };
