export type KeyType = string | number | symbol;
export type Fn<T> = () => Promise<T>;
export type ArgFn<T, Args extends unknown[]> = (...args: Args) => Promise<T>;
declare class Singleflight {
    private doing;
    /**
     * Executes and returns the results of the given function, making sure that
     * only one execution is in-flight for a given key at a time.
     * If a duplicate comes in, the duplicate caller waits for the original
     * to complete and receives the same results.
     * @param key The unique identifier for this function execution
     * @param fn The function to be executed
     * @returns A promise that resolves with the result of the function execution
     * @throws Any error that occurs during the function execution
     */
    do<T>(key: KeyType, fn: Fn<T>): Promise<T>;
    /**
     * Generates a unique key for a function call based on the function name and its arguments.
     * @param fn The function to generate a key for
     * @param args The arguments passed to the function
     * @returns A string representation of the function call
     */
    static makeKey<T, Args extends unknown[]>(fn: ArgFn<T, Args>, ...args: Args): string;
    /**
     * Executes a function and ensures only one execution is in-flight at a time, for a given
     * combination of function name and argument values.
     * @param fn The function to be executed
     * @param args The arguments to be passed to the function
     * @returns A promise that resolves with the result of the function execution
     * @throws Any error that occurs during the function execution
     */
    doAuto<T, Args extends unknown[]>(fn: ArgFn<T, Args>, ...args: Args): Promise<T>;
}
export { Singleflight };
