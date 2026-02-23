import assert from 'node:assert/strict';
import { buildSearchAnnouncement } from '../../assets/js/utils/searchAnnouncements.js';

assert.equal(
  buildSearchAnnouncement({ language: 'en', resultCount: 3, searchTerm: 'pika' }),
  'Found 3 Pokémon for "pika"'
);

assert.equal(
  buildSearchAnnouncement({ language: 'jp', resultCount: 5, searchTerm: '' }),
  '5匹のポケモンを表示中'
);

console.log('searchAnnouncements.test.js passed');
