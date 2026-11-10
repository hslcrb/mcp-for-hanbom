import test from "node:test";import assert from "node:assert/strict";import {parseFeed} from "../worker.mjs";
test("RSS Korean item",()=>{const d=parseFeed('<rss><channel><title>공지</title><item><title>A &amp; B</title><link>https://hanbom-h.goesw.kr/test</link><description><![CDATA[<b>내용</b>]]></description></item></channel></rss>');assert.equal(d.count,1);assert.equal(d.items[0].title,"A & B");assert.equal(d.items[0].summary,"내용");});
test("non rss rejected",()=>assert.throws(()=>parseFeed("<html></html>"),/INVALID_RSS/));
test("unsafe links removed",()=>assert.equal(parseFeed('<rss><item><title>x</title><link>https://evil.example</link></item></rss>').items[0].url,null));
