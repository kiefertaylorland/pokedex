import assert from 'node:assert/strict';
import { fuzzyMatchScore } from '../../assets/js/utils/fuzzySearch.js';

assert.equal(fuzzyMatchScore('', 'pikachu'), 0);
assert.equal(fuzzyMatchScore('pikachu', 'pikachu'), 1000);
assert.ok(fuzzyMatchScore('pika', 'pikachu') > fuzzyMatchScore('pkc', 'pikachu'));
assert.equal(fuzzyMatchScore('xyz', 'pikachu'), 0);

console.log('fuzzySearch.test.js passed');
