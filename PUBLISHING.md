# Publishing to npm & the DSH plugin market

This repo is currently **GitHub-install friendly**, not npm-market ready. Read this before publishing.

## 1. Current state

- `package.json` has `"private": true`.
- The repo includes the full Remotion studio + demo media for development.
- `reel_render` shells out to `scripts/reel.mjs` and needs `studio/` + Chrome.
- The host package has **not been validated in a real DSH profile** yet.

Do **not** publish this exact package to npm yet. Either:

- keep it GitHub-only for now, or
- split it into a small host package (`dsh-reel`) + optional renderer/templates package.

## 2. Make it npm-publishable

Checklist:

1. Remove `"private": true`.
2. Keep `dsh.bundle.patch` and a real `cordis.patch.yml`:
   ```yaml
   - insert:
       - id: dsh-reel
         name: dsh-reel
         config: {}
   ```
3. Trim `files` to what runtime actually needs. If `reel_render` must work after install, ship `lib`, `scripts`, `studio` (or a slim renderer) and declare the Chrome/Remotion requirement in the README.
4. Add:
   - `description`, `license`, `repository`, `homepage`, `keywords` (`dsh-plugin`, `dsh`, `deepseek-harness`, `remotion`, `video`)
   - `engines.node >= 22`
   - `peerDependencies` for `@deepseek-ai/dsh-tools`
5. Dry-run the artifact:
   ```sh
   npm pack --dry-run
   ```
   Check that no secrets, personal data, private screenshots, `node_modules`, or generated `out/` files are included.
6. Test install from a tarball into a scratch profile:
   ```sh
   dsh plugin --profile scratch add ./dsh-reel-0.1.0.tgz
   dsh --profile scratch --dump-config
   ```
7. Publish:
   ```sh
   npm login
   npm publish --access public
   ```

## 3. Make it discoverable

- Make the GitHub repo public.
- Add topics: `dsh-plugin`, `dsh`, `deepseek-harness`, `remotion`, `video`, `plugin`.
- README first paragraph must say **what problem it solves** in one sentence.
- Tag a release with a changelog.

### DSH community indexes

- The community ecosystem graph at **moc-chen.cn** indexes npm + GitHub hourly. It looks for `dsh.bundle` declarations, `dsh` labels/topics, and repo-name/README clues. Once npm + topics are in place, it should be picked up automatically; no manual submission is guaranteed.
- Community lists (awesome-dsh-plugin and similar) accept manual PRs; add a short entry with a clear one-line description.

### DSH built-in market

- The in-app market indexes npm bundles that declare `dsh.bundle`; there is no guaranteed public “submit” form.
- Users can also add a custom index source in **Plugins → Discover**.
- To maximize the chance of being indexed: publish to npm, keep `dsh.bundle` valid, use the `dsh-plugin` topic, and make the README self-contained.

## 4. Before publishing, answer these

- Does the plugin work on a clean profile with no local paths?
- Does it declare all peer dependencies and compatible DSH versions?
- Does it avoid storing secrets or private screenshots?
- Is every claim in the demo verifiable from the target repo?
- Is the license of every screenshot/asset compatible with redistribution?
- Does uninstall/HMR leave no routes, listeners, DOM or timers behind?

## 5. 中文速览

- 当前仓库适合 `github:` 安装，不适合直接 `npm publish`（`private: true`，且包含整个 studio/媒体）。
- 上市场前：拆出轻量 host 包 → 去掉 private → 补 description/license/repository/keywords/engines → `npm pack --dry-run` 检查敏感内容 → scratch profile 验证 → `npm publish --access public`。
- 可发现性：公开仓库 + `dsh-plugin` 等 topics + README 首段写清解决什么问题；moc-chen 生态图按 npm/GitHub 每小时抓取；awesome 列表可提 PR；DSH 内置市场按 npm `dsh.bundle` 索引，没有保证的公开提交入口。
- 不要把带个人路径、私有截图、密钥、`node_modules`、`out/` 的内容发上去。
