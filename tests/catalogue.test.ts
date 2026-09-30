import assert from 'node:assert/strict';
import test from 'node:test';
import { restaurants } from '../packages/core/src/index.ts';

test('the demo catalogue has twenty complete restaurants', () => {
  assert.equal(restaurants.length, 20);
  assert.equal(new Set(restaurants.map((restaurant) => restaurant.id)).size, 20);
  for (const restaurant of restaurants) {
    assert.ok(restaurant.name && restaurant.cuisine && restaurant.signatureDish);
  }
});
