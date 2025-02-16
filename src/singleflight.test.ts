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
