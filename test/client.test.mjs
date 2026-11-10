// Smoke test for the browser half: the ModuleLoader factory must expose a Cordis
// plugin that registers exactly the sidebar panel and its main page.
import test from 'node:test';
import assert from 'node:assert/strict';

test('client registers the Reel Studio sidebar panel and main page', async () => {
  const registrations = [];
  let plugin;
  globalThis.window = {
    __ModuleLoader__: {
      load(definition) {
        assert.equal(definition.id, 'dsh-reel-studio');
        plugin = definition.factory((id) => {
          assert.equal(id, 'react');
          return {createElement: () => null};
        });
      },
    },
  };
  await import('../lib/client.js');

  assert.equal(typeof plugin.apply, 'function');
  assert.deepEqual(plugin.inject, ['slots']);

  plugin.apply({
    get: (key) => (key === 'locale' ? {getLocale: () => ({active: 'zh'})} : undefined),
    slots: {
      inject: (_key, callback) => callback(),
      register: (options) => {
        registrations.push(options);
        return () => {};
      },
    },
  });

  assert.equal(registrations.length, 2);
  const panel = registrations.find((item) => item.name === 'sidebar.panellist');
  const main = registrations.find((item) => item.name === 'main');
  assert.ok(panel, 'sidebar.panellist is registered');
  assert.ok(main, 'main is registered');
  assert.equal(panel.id, 'dsh-reel');
  assert.equal(main.key, 'dsh-reel');
  assert.equal(panel.order, 30);
  assert.equal(panel.label(), '插件介绍宣传台');
});
