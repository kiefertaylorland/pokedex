import assert from 'node:assert/strict';
import { sortByName, sortByNumberAsc, sortByNumberDesc, sortByStatTotal, totalStats } from '../../assets/js/utils/sorters.js';

const sample = [
  { id: 25, name_en: 'Pikachu', name_jp: 'ピカチュウ', stats: { hp: 35, attack: 55 } },
  { id: 1, name_en: 'Bulbasaur', name_jp: 'フシギダネ', stats: { hp: 45, attack: 49 } },
  { id: 4, name_en: 'Charmander', name_jp: 'ヒトカゲ', stats: { hp: 39, attack: 52 } }
];

assert.deepEqual(sortByNumberAsc([...sample]).map(p => p.id), [1, 4, 25]);
assert.deepEqual(sortByNumberDesc([...sample]).map(p => p.id), [25, 4, 1]);
assert.equal(sortByName([...sample], 'en', true)[0].name_en, 'Bulbasaur');
assert.equal(totalStats(sample[0]), 90);
assert.equal(sortByStatTotal([...sample])[0].id, 1);

console.log('sorters.test.js passed');
