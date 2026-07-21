# IELTS Writing Quest

黒猫コーチ「ナイチー」と進める IELTS Writing 学習アプリです。AI添削は使わず、語彙クイズ、瞬間英作文、解説、できなかった問題の復習リストに絞っています。

## 方針

- 本番は Cloudflare Workers + D1
- Next.js の Workers デプロイは OpenNext Cloudflare
- Auth.js + D1 Adapter でセッション、OAuthアカウント、ユーザーをD1に保存
- Supabase、Prisma、PostgreSQL、Vercel本番依存は使わない
- Cloudflare Free Plan 前提。R2、Workers AI、Hyperdrive、Vectorize、Analytics Engine は使わない

## ローカル確認

```bash
npm install
cp .dev.vars.example .dev.vars
npm run db:migrate:local
npm run dev
```

`.dev.vars` にはローカル確認用の値を入れてください。

```dotenv
AUTH_SECRET="openssl rand -base64 32 などで作った値"
AUTH_GOOGLE_ID="Google OAuth client id"
AUTH_GOOGLE_SECRET="Google OAuth client secret"
IELTS_API_SECRET="課題投入API用のBearer secret"
```

## ログイン方式

ログイン方式は Google OAuth です。学習アプリとして多くのユーザーが使いやすい一方で、Google Cloud Console の同意画面、テストユーザー、redirect URI の完全一致で詰まりやすいので、下記のURLをそのまま登録してください。

Cloudflare Access は社内・個人用の保護ゲートには便利ですが、アプリ内のユーザー、セッション、復習データをD1で管理する今回の構成では Auth.js OAuth の方が自然です。

## Google OAuth 設定

Google Cloud Console で OAuth クライアントを作成します。

- 種類: ウェブ アプリケーション
- 承認済みのリダイレクト URI: `https://ielts-writing-app.tomo9634.workers.dev/api/auth/callback/google`
- 承認済みの JavaScript 生成元: `https://ielts-writing-app.tomo9634.workers.dev`

`redirect_uri_mismatch` が出る場合は、ドメイン、パス、末尾スラッシュまで完全一致しているか確認してください。OAuth同意画面がテスト中なら、自分のGoogleアカウントをテストユーザーに追加します。

## Cloudflare Secrets

Secretsは `wrangler.jsonc` に書きません。

```bash
npm exec wrangler secret put AUTH_SECRET
npm exec wrangler secret put AUTH_GOOGLE_ID
npm exec wrangler secret put AUTH_GOOGLE_SECRET
```

課題投入APIを使う場合:

```bash
npm exec wrangler secret put IELTS_API_SECRET
```

## D1

`wrangler.jsonc` は指定の参考プロジェクトに合わせて、以下のD1を参照しています。

- database_name: `ielts-writing`
- database_id: `b212ff67-5061-437e-9270-72f33d4b8603`
- binding: `DB`

ローカル:

```bash
npm run db:migrate:local
```

本番リモート:

```bash
npm run db:deploy
```

本番リモートのmigration適用とWorker deployは、ローカルUI確認後に実行してください。

## Scripts

```bash
npm run lint
npm run typecheck
npm run build
npm run cf:build
npm run deploy
```

`deploy` は `db:deploy` のあと `opennextjs-cloudflare deploy` を実行します。

## Cloudflare Builds

Cloudflare Dashboard の Workers Builds でGitHubリポジトリを接続します。

- Build command: `npm run cf:build`
- Deploy command: `npm run deploy`
- Non-production branch deploy command: `npm run upload`
- Root directory: `/`

非本番ブランチの自動ビルドが不要なら無効化します。

## CI

GitHub Actions では最低限だけ実行します。

- install
- lint
- typecheck
- Cloudflare build

Cloudflareへの実デプロイはDashboard側に任せ、Actionsでは不要なジョブを増やしません。

## 確認項目

- `/` が未ログイン時に `/login` へ遷移する
- `/login` が200を返す
- `/dashboard` が未ログイン時に `/login` へリダイレクトする
- Googleログインボタンから認証画面へ進める
- ログイン後にdashboardが表示される
- 問題で「解説を見る」が使える
- できなかった問題を追加できる
- 「できるようになった」で復習リストから外せる
- スマホ幅で文字とボタンがはみ出さない
