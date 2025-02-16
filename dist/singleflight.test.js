"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = require("node:test");
const singleflight_1 = require("./singleflight");
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
(0, node_test_1.test)("ensure Singleflight.do works", { concurrency: true }, async () => {
    let count = 0;
    async function slowIncrement() {
        await delay(100);
        return ++count;
    }
    const sf = new singleflight_1.Singleflight();
    const p1 = sf.do("key", slowIncrement);
    const p2 = sf.do("key", slowIncrement);
    const p3 = sf.do("key", slowIncrement);
    strict_1.default.strictEqual(await p1, 1);
    strict_1.default.strictEqual(await p2, 1);
    strict_1.default.strictEqual(await p3, 1);
    strict_1.default.strictEqual(count, 1);
});
(0, node_test_1.test)("ensure Singleflight.makeKey works", { concurrency: true }, async () => {
    async function slowAdd(a, b) {
        return a + b;
    }
    const key = singleflight_1.Singleflight.makeKey(slowAdd, "1", 2);
    strict_1.default.strictEqual(key, 'slowAdd("1",2)');
});
(0, node_test_1.test)("ensure Singleflight.doAuto works", { concurrency: true }, async () => {
    let count = 0;
    async function slowFn(a, b) {
        await delay(100);
        ++count;
        return a + b + count;
    }
    const sf = new singleflight_1.Singleflight();
    const p1 = sf.doAuto(slowFn, "1", 2);
    const p2 = sf.doAuto(slowFn, "1", 2);
    const p3 = sf.doAuto(slowFn, "1", 2);
    strict_1.default.strictEqual(await p1, "121");
    strict_1.default.strictEqual(await p2, "121");
    strict_1.default.strictEqual(await p3, "121");
    strict_1.default.strictEqual(count, 1);
});
