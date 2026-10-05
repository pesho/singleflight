import assert from "node:assert/strict";
import { test } from "node:test";
import { Singleflight } from "./singleflight";

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

test("ensure Singleflight.do works", { concurrency: true }, async () => {
    let count = 0;
    async function slowIncrement() {
        await delay(100);
        return ++count;
    }
    const sf = new Singleflight();
    // First test, to make sure there will be one single execution:
    const p1 = sf.do("key", slowIncrement);
    const p2 = sf.do("key", slowIncrement);
    const p3 = sf.do("key", slowIncrement);
    assert.deepStrictEqual(await Promise.all([p1, p2, p3]), [1, 1, 1]);
    assert.strictEqual(count, 1);
    // Second test, to make sure there will be a second execution:
    const p4 = sf.do("key", slowIncrement);
    const p5 = sf.do("key", slowIncrement);
    const p6 = sf.do("key", slowIncrement);
    assert.deepStrictEqual(await Promise.all([p4, p5, p6]), [2, 2, 2]);
    assert.strictEqual(count, 2);
});

test("ensure Singleflight.makeKey works", { concurrency: true }, async () => {
    async function add(a: string, b: number) {
        return a + b;
    }
    const key = Singleflight.makeKey(add, "1", 2);
    assert.strictEqual(key, 'add("1",2)');
});

test("ensure Singleflight.doAuto works", { concurrency: true }, async () => {
    let count = 0;
    async function slowFn(a: string, b: number) {
        await delay(100);
        ++count;
        return a + b + count;
    }
    const sf = new Singleflight();
    // First test, to make sure there will be one single execution:
    const p1 = sf.doAuto(slowFn, "1", 2);
    const p2 = sf.doAuto(slowFn, "1", 2);
    const p3 = sf.doAuto(slowFn, "1", 2);
    assert.deepStrictEqual(await Promise.all([p1, p2, p3]), ["121", "121", "121"]);
    assert.strictEqual(count, 1);
    // Second test, to make sure there will be a second execution:
    const p4 = sf.doAuto(slowFn, "1", 2);
    const p5 = sf.doAuto(slowFn, "1", 2);
    const p6 = sf.doAuto(slowFn, "1", 2);
    assert.deepStrictEqual(await Promise.all([p4, p5, p6]), ["122", "122", "122"]);
    assert.strictEqual(count, 2);
});

test("ensure Singleflight.doAuto rejects anonymous and bound functions", async () => {
    let count = 0;
    async function named(n: number) {
        return ++count + n;
    }
    const sf = new Singleflight();
    await assert.rejects(
        sf.doAuto(async (n: number) => ++count + n, 1),
        TypeError,
    );
    await assert.rejects(sf.doAuto(named.bind(null), 1), TypeError);
    assert.strictEqual(count, 0);
    assert.strictEqual(await sf.doAuto(named, 1), 2);
});

test("ensure Singleflight.do keeps an entry replaced by a re-entrant call", async () => {
    let count = 0;
    const sf = new Singleflight();
    async function inner() {
        await delay(50);
        return "inner";
    }
    async function outer() {
        // Runs before outer's own entry is stored, so it starts separately and finishes first
        const p = sf.do("key", inner);
        await delay(100);
        await p;
        return "outer";
    }
    const p1 = sf.do("key", outer);
    await delay(75); // inner has finished, outer is still in flight
    const p2 = sf.do("key", async () => {
        ++count;
        return "late";
    });
    assert.deepStrictEqual(await Promise.all([p1, p2]), ["outer", "outer"]);
    assert.strictEqual(count, 0);
});

test("ensure Singleflight.do shares falsy results", async () => {
    let count = 0;
    // JavaScript callers can pass a function that returns a plain value
    const zero = (() => {
        ++count;
        return 0;
    }) as unknown as () => Promise<number>;
    const sf = new Singleflight();
    assert.deepStrictEqual(await Promise.all([sf.do("key", zero), sf.do("key", zero)]), [0, 0]);
    assert.strictEqual(count, 1);
});
