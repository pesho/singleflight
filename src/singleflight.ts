export type KeyType = string | number | symbol;
export type Fn<T> = () => Promise<T>;
export type ArgFn<T, Args extends unknown[]> = (...args: Args) => Promise<T>;

class Singleflight {
    private doing = new Map<KeyType, Promise<unknown>>();

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
    async do<T>(key: KeyType, fn: Fn<T>): Promise<T> {
        if (this.doing.has(key)) {
            return this.doing.get(key) as Promise<T>;
        }
        // Wrap plain values from JavaScript callers (e.g. NaN, which doesn't equal itself), so
        // the ownership check below always compares promises
        const promise = Promise.resolve(fn());
        this.doing.set(key, promise);
        let result: T;
        try {
            result = await promise;
        } finally {
            // fn may have started another call for this key that replaced our entry
            if (this.doing.get(key) === promise) {
                this.doing.delete(key);
            }
        }
        return result;
    }

    /**
     * Generates a key for a function call based on the function name and its arguments.
     * Arguments are serialized with JSON.stringify, so they should be JSON-safe: strings,
     * finite numbers, booleans, null, and arrays or plain objects of those. Other values can
     * map to the same key as a different value (NaN and Infinity become null; Map, Set and
     * many class instances become {}) or throw (BigInt, circular structures).
     * @param fn The function to generate a key for
     * @param args The arguments passed to the function
     * @returns A string representation of the function call
     */
    static makeKey<T, Args extends unknown[]>(fn: ArgFn<T, Args>, ...args: Args) {
        return `${fn.name}(${args.map((arg) => JSON.stringify(arg)).join(",")})`;
    }

    /**
     * Executes a function and ensures only one execution is in-flight at a time, for a given
     * combination of function name and argument values.
     * The key is derived from `fn.name`, so different functions with the same name share
     * results. Anonymous and bound functions are rejected, since their names are not unique.
     * Arguments should be JSON-safe; see {@link Singleflight.makeKey}.
     * @param fn The function to be executed
     * @param args The arguments to be passed to the function
     * @returns A promise that resolves with the result of the function execution
     * @throws TypeError if `fn` is anonymous or bound
     * @throws Any error that occurs during the function execution
     */
    async doAuto<T, Args extends unknown[]>(fn: ArgFn<T, Args>, ...args: Args) {
        if (!fn.name || fn.name.startsWith("bound ")) {
            throw new TypeError("doAuto needs a named, unbound function");
        }
        const key = Singleflight.makeKey(fn, ...args);
        return await this.do(key, async () => {
            return await fn(...args);
        });
    }
}

export { Singleflight };
