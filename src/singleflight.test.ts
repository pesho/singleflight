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
    const p1 = sf.do("key", slowIncrement);
    const p2 = sf.do("key", slowIncrement);
    const p3 = sf.do("key", slowIncrement);
    assert.strictEqual(await p1, 1);
    assert.strictEqual(await p2, 1);
    assert.strictEqual(await p3, 1);
    assert.strictEqual(count, 1);
});

test("ensure Singleflight.makeKey works", { concurrency: true }, async () => {
    async function slowAdd(a: string, b: number) {
        return a + b;
    }
    const key = Singleflight.makeKey(slowAdd, "1", 2);
    assert.strictEqual(key, 'slowAdd("1",2)');
});

test("ensure Singleflight.doAuto works", { concurrency: true }, async () => {
    let count = 0;
    async function slowFn(a: string, b: number) {
        await delay(100);
        ++count;
        return a + b + count;
    }
    const sf = new Singleflight();
    const p1 = sf.doAuto(slowFn, "1", 2);
    const p2 = sf.doAuto(slowFn, "1", 2);
    const p3 = sf.doAuto(slowFn, "1", 2);
    assert.strictEqual(await p1, "121");
    assert.strictEqual(await p2, "121");
    assert.strictEqual(await p3, "121");
    assert.strictEqual(count, 1);
});
