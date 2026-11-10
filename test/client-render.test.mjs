// Optional markup smoke test: renders the panel page with the real React when the
// package dependencies are installed. Skipped in a bare checkout without node_modules.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {join} from 'node:path';

/** Load React from an installed dependency tree, for a checkout without node_modules. */
function loadDeps(dir) {
  const requireFrom = createRequire(join(dir, 'noop.cjs'));
  const React = requireFrom('react');
  const server = requireFrom('react-dom/server');
  return {React, renderToStaticMarkup: server.renderToStaticMarkup};
}

test('the Reel Studio page renders real markup with React', async (t) => {
  let React;
  let renderToStaticMarkup;
  try {
    const depsDir = process.env.DSH_REEL_DEPS;
    if (depsDir) {
      const loaded = loadDeps(depsDir);
      React = loaded.React;
      renderToStaticMarkup = loaded.renderToStaticMarkup;
    } else {
      React = (await import('react')).default ?? (await import('react'));
      const server = await import('react-dom/server');
      renderToStaticMarkup = server.renderToStaticMarkup ?? server.default?.renderToStaticMarkup;
    }
    if (typeof renderToStaticMarkup !== 'function') throw new Error('no renderToStaticMarkup');
  } catch {
    t.skip('react / react-dom are not installed in this checkout');
    return;
  }

  let plugin;
  globalThis.window = {
    __ModuleLoader__: {
      load(definition) {
        plugin = definition.factory((id) => {
          if (id === 'react') return React;
          throw new Error('unexpected module: ' + id);
        });
      },
    },
  };
  await import('../lib/client.js');

  const registrations = [];
  plugin.apply({
    get: (key) => (key === 'locale' ? {getLocale: () => ({active: 'zh'})} : undefined),
    slots: {
      inject: (_key, callback) => callback(),
      register: (options, component) => {
        registrations.push({options, component});
        return () => {};
      },
    },
  });

  const main = registrations.find((item) => item.options.name === 'main');
  assert.ok(main, 'main page is registered');
  const html = renderToStaticMarkup(React.createElement(main.component));
  assert.ok(html.length > 1000, 'page renders a real tree');
  assert.match(html, /插件宣传台/);
  assert.match(html, /reel-page/);
  assert.match(html, /--dsw-alias-bg-base/, 'styles use host theme tokens');
});
