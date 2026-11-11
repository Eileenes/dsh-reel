# Publishing to npm & the DSH plugin market

This repo is **GitHub-install friendly**; `dsh-reel-studio` has been on npm since 2026-11-04 (`0.2.x` line), and `0.5.0` (2026-11-11) ships a self-contained V0.1 film renderer. Read this before publishing again.

## 1. Current state (0.5.0)

- `package.json` has `"private": false`, `version` 0.5.0.
- npm package now ships `lib`, `scripts` (incl. `film.mjs`), `tools/v01-film` (incl. the 27-file `comp-assets/`), `studio/scripts`, `cases` (both v1 + `cases/v01`), the four film-case screenshot sets, the audio bed the film pipeline needs, `studio/src` and `docs/panel` screenshots.
- **V0.1 films render on a clean install since 0.5.0**: `tools/v01-film/render-frames.mjs` drives the local Chrome (no Onetake runtime, which is not redistributable and still not in the tarball), and the 27 comp assets the template boots with ship under `tools/v01-film/comp-assets/` — `scripts/film.mjs` seeds them into `.research/onetake-promo` (or `studio/out/.comp-workdir` when the install dir is read-only). Requirements on the user's machine: Chrome/Chromium + ffmpeg (+ python3 for the sound mix). `puppeteer-core` is a declared dependency.
- The host package loads in a real DSH profile (panel + sidebar verified in the local desktop profile).

## 2. Make it npm-publishable

Checklist:

1. Remove `"private": true`.
2. Keep `dsh.bundle.patch` and a real `cordis.patch.yml`:
   ```yaml
   - insert:
       - id: dsh-reel
         name: dsh-reel-studio
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
   dsh plugin --profile scratch add ./dsh-reel-studio-0.1.0.tgz
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

- There is **no official index** inside DSH: `@deepseek-ai/dsh-plugin-market` only reads the index sources the user configures. The local profile uses `https://dshmarket.com/index.json`.
- The real “market” is third-party maintained. `dsh-reel-studio` is already listed in both big indexes at `0.2.1`:
  - `https://awesome-dsh-plugin.com/index.json` (= `https://dshmarket.com/index.json`), entry `data/plugins/Eileenes__dsh-reel.yml`;
  - `https://cdn.dsh.so/market/index.json` (install-verified / risk-low).
- Both indexes refresh versions automatically (awesome-dsh-plugin runs a daily probe ~02:23 UTC; dsh.so rebuilds on its own). Publishing to npm is therefore enough for the version bump to land — no submit command exists (`dsh plugin` has no market/publish subcommand, the market service is read-only).
- To update the listing copy/description, open a PR against `awesome-dsh-plugin/awesome-dsh-plugin` editing `data/plugins/Eileenes__dsh-reel.yml`; dsh.so has a `/zh/submit/` form that opens an audit issue.
- To maximize the chance of being indexed: publish to npm, keep `dsh.bundle` valid, use the `dsh-plugin` topic, and make the README self-contained.

## 4. Before publishing, answer these

- Does the plugin work on a clean profile with no local paths?
- Does it declare all peer dependencies and compatible DSH versions?
- Does it avoid storing secrets or private screenshots?
- Is every claim in the demo verifiable from the target repo?
- Is the license of every screenshot/asset compatible with redistribution?
- Does uninstall/HMR leave no routes, listeners, DOM or timers behind?

## 5. 中文速览

- 0.4.0 已按精简 `files` 发布（不含 `studio/out`、`.research`、`node_modules`、旧活动素材；只保留模板需要的截图与音频）。
- 0.5.0 起 V0.1 真机片在干净安装上也能出片：渲染器在本仓库（`tools/v01-film/render-frames.mjs`），comp 依赖的 27 个素材在 `tools/v01-film/comp-assets/`，首次运行自动铺到工作目录；只需要机器上有 Chrome/Chromium + ffmpeg（+ python3 做音效混音）。
- 上市场：npm publish 后等第三方索引的每日探针（≤1 天）自动更新版本；描述过时用 awesome-dsh-plugin 的 PR 或 dsh.so 的提交表单改。
- 发布前仍要：`npm pack --dry-run` 检查敏感内容 → scratch profile 验证 → `npm publish --access public`。
- 可发现性：公开仓库 + `dsh-plugin` 等 topics + README 首段写清解决什么问题；moc-chen 生态图按 npm/GitHub 每小时抓取；awesome 列表可提 PR；DSH 内置市场按 npm `dsh.bundle` 索引，没有保证的公开提交入口。
- 不要把带个人路径、私有截图、密钥、`node_modules`、`out/` 的内容发上去。
