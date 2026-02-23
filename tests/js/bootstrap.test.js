import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../../assets/js/pokedexApp.js', import.meta.url), 'utf8');

assert.ok(source.includes('export function bootPokedexApp'));
assert.ok(source.includes('export async function createPokedexApp'));
assert.ok(source.includes('export class PokedexApp'));

console.log('bootstrap.test.js passed');
