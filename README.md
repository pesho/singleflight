# @onestone/singleflight

A TypeScript utility that ensures only one execution of a function is in-flight for a given key at a time. If a duplicate call comes in while the original is still processing, the duplicate caller waits for the original to complete and receives the same results.

Inspired by the [singleflight](https://pkg.go.dev/golang.org/x/sync/singleflight) Go package.

## Installation

```bash
npm install @onestone/singleflight
```

## Usage

### Basic Usage

```typescript
import { Singleflight } from '@onestone/singleflight';

const sf = new Singleflight();

// Example function that simulates an expensive operation
async function fetchUserData(userId: string) {
    const result = await sf.do(`fetchUserData:${userId}`, async () => {
        // Your expensive operation here
        // Only one call for the same userId will execute at a time
        return await someExpensiveOperation(userId);
    });
    return result;
}
```

### Automatic Key Generation

```typescript
import { Singleflight } from '@onestone/singleflight';

const sf = new Singleflight();

async function fetchUserProfileImpl(userId: string, includeDetails: boolean) {
    return await someExpensiveOperation(userId, includeDetails);
}

async function fetchUserProfile(userId: string, includeDetails: boolean) {
    // The key is automatically generated based on function name and arguments
    return await sf.doAuto(fetchUserProfileImpl, userId, includeDetails);
}
```

## API

### `do<T>(key: KeyType, fn: Fn<T>): Promise<T>`

Executes and returns the results of the given function, making sure that only one execution is in-flight for a given key at a time.

- `key`: A unique identifier for this function execution (string, number, or symbol)
- `fn`: The async function to be executed

### `doAuto<T, Args extends unknown[]>(fn: ArgFn<T, Args>, ...args: Args)`

Executes a function and ensures only one execution is in-flight at a time, automatically generating a key based on the function name and its arguments.

- `fn`: The async function to be executed
- `args`: The arguments to pass to the function

## Features

- 🔒 Prevents duplicate in-flight requests
- 🚀 TypeScript support with full type safety
- 🎯 Automatic key generation based on function name and arguments
- 💡 Simple and intuitive API
- 🪶 Lightweight with zero dependencies

## License

MIT
