import assert from 'node:assert/strict';
import test from 'node:test';
import { canSendMessage } from '../../src/lib/message-rules';

test('blocks private messages between members of the same restricted level', () => {
  assert.equal(canSendMessage('MIN', 'MIN'), false);
  assert.equal(canSendMessage('MIX', 'MIX'), false);
});

test('allows private messages across the remaining level pairs', () => {
  assert.equal(canSendMessage('MIN', 'MIX'), true);
  assert.equal(canSendMessage('MIX', 'MIN'), true);
  assert.equal(canSendMessage('MASTER', 'MIN'), true);
  assert.equal(canSendMessage('CEO', 'CEO'), true);
});
