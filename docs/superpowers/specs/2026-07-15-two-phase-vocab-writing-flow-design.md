# 2フェーズ学習フロー（単語クイズ → 瞬間英作文）設計

## 背景・課題

現状のIELTSアプリは1日10問、各問が「日本語パラグラフ→英語パラグラフ」の瞬間英作文形式で、必須フレーズ5個をすべて使った3〜5文の英作文が求められる。1問あたり体感5分程度かかり、学習を始めるハードルが高い。

## 目標

1日の学習を2フェーズに再構成する:

1. **単語・イディオムフェーズ**: IELTS Band 6.5〜7.0レベルの単語/イディオムを10問、英単語→日本語の意味を選ぶ4択クイズとして出題。ジャンルは問わない。
2. **瞬間英作文フェーズ**: フェーズ1を全問正解した後に解放。フェーズ1で使った単語のうち3〜4語を使い、日本語1文→英語1文の瞬間英作文を出題。

これにより、軽い暗記チェックから入り、学習の立ち上がりの負荷を下げる。

## スコープ外

- 過去の学習履歴・進捗の永続化（リロードでリセットされる現状の方針を踏襲）
- 単語の日をまたいだ重複排除の仕組み化（プロンプト指示のみで運用、DB側チェックは実装しない）
- 既存データの互換表示（既存`daily_exercises`のデータは破棄し、新形式のみで再スタート）

## データモデル (`lib/types.ts`)

```ts
export interface VocabQuestion {
  order: number            // 1-10
  word: string              // 英単語 or イディオム
  choices: string[]         // 日本語の意味 4択（シャッフル済みで保存）
  answerIndex: number       // choices内の正解インデックス
}

export interface SentenceQuestion {
  order: number             // 1-4
  word: string               // 使用する単語/イディオム（vocabのwordと一致させる）
  ja_sentence: string        // 日本語1文
  model_answer: string       // 英語1文の模範解答
  tips?: string              // 補足（ニュアンス説明、任意）
}

export interface DailyContent {
  vocab: VocabQuestion[]
  sentences: SentenceQuestion[]
}
```

既存の`Exercise` / `Tip`インターフェースは削除する。

`lib/schema.sql`はテーブル名・カラム名（`daily_exercises.exercises` JSONB）をそのまま流用し、格納するJSONの中身の形だけを`DailyContent`に変更する。既存行はTRUNCATEして破棄する。

## API (`app/api/exercises/route.ts`, `lib/db.ts`)

POSTのバリデーションを更新する:

- `exercises`配列の`length !== 10`チェックを撤廃
- 代わりに`body`が`{ vocab: VocabQuestion[], sentences: SentenceQuestion[] }`の形であることを検証:
  - `vocab.length === 10`
  - `sentences.length >= 3 && sentences.length <= 4`
  - 各`VocabQuestion`について`choices.length === 4`かつ`0 <= answerIndex < 4`
- `saveExercises` / `getExercisesByDate`の型を`Exercise[]`から`DailyContent`に変更

GET（存在チェック）・認可ロジック（`IELTS_API_SECRET`）は変更なし。

## 生成コマンド (`~/.claude/commands/ielts-daily.md`)

プロンプトを以下の内容に更新する:

- **Vocabulary（10語）**: IELTS Band 6.5〜7.0レベルの単語/イディオムを10個選定（ジャンル不問、同日内で重複なし）。各語について正解の日本語訳＋もっともらしい誤答3つを生成し、`choices`配列内でシャッフルした上で`answerIndex`を記録する。
- **Sentences（3〜4問）**: Vocabularyで選んだ10語のうち3〜4語を選び、各語について日本語1文→その語を自然に使った英語1文（`model_answer`）を生成する。`tips`は任意（ニュアンス補足があれば付与）。
- 出力JSONの構造を`{ date, vocab: [...], sentences: [...] }`に変更する。
- POST先URL・認可ヘッダー・完了メッセージ・既存チェック（`{"exists":true}`時にスキップ）は現状維持。

「毎日異なる語を選ぶ」制約は、既存同様プロンプト内指示のみで運用し、DB側の重複チェック機構は設けない（スコープ外）。

## UIコンポーネント構成とフロー

### `ExerciseSession.tsx`（オーケストレーター、rework）

フェーズ管理のステートマシンとして動作する。

- `phase: 'vocab' | 'writing'`
- vocabフェーズの状態: `roundOrder`（シャッフルされた出題順のインデックス配列）, `currentIndex`, `wrongInRound: Set<number>`（このラウンドで間違えた`order`の集合）, `roundNumber`
- 1問ごとに選択→正誤フィードバック→「次へ」ボタンで次の問題へ進む
- ラウンドの10問目に回答し終えた時点で判定:
  - `wrongInRound.size === 0` → `phase = 'writing'`に遷移
  - 1問でも間違いがあれば、同じ10問を再シャッフルし`roundNumber`をインクリメントして最初からやり直す（間違えた問題だけの抽出ではなく、全10問を再度出題する）
- writingフェーズ: 現状と同じprev/next stepperのロジックを`sentences`配列に対して使用（自己回答テキストエリア・模範解答トグルは現状の挙動を踏襲）

### `VocabQuiz.tsx`（新規）

- 単語の表示＋4択ボタン
- 選択後、正誤を色分け表示（正解=緑、選んだ誤答=赤、他は中立）し、正解の選択肢もハイライト
- 「次へ」ボタンで次の問題またはラウンド判定へ
- 2周目以降は「Round 2」等の小さなバッジを表示し、周回中であることをユーザーに伝える

### `SentenceCard.tsx`（`ExerciseCard.tsx`をリネーム・簡略化）

- 日本語1文セクション、使用単語バッジ1つ（現行の複数フレーズpillから簡略化）
- 自己回答テキストエリア（未保存・現状踏襲）
- 模範解答トグル
- tips（任意、1件のみ）

### `Sidebar.tsx` / `MobileHeader.tsx`

- 進捗表示をフェーズスコープに変更: vocabフェーズ中は「Vocabulary 3/10」、全問正解後は「Writing 1/4」のように表示を切り替える
- vocabフェーズ中は目次からの任意ジャンプを無効化し、線形進行を強制する（ラウンドの整合性を保つため）
- writingフェーズは現状通り目次からのクリックジャンプを許可する

### エッジケース

- vocab/sentencesのいずれかが不足・欠落しているデータは、現状の`notFound()`またはフォールバック表示を踏襲する
- ページリロード時は進捗（フェーズ・ラウンド・回答状態）がリセットされる（永続化しない方針を維持）

## 検証方針

自動テストフレームワークは未導入のため、既存踏襲で以下を実施する:

1. `npm run build`（型チェック・lintエラーがないこと）
2. dev server起動の上、手動またはPlaywright MCPで確認:
   - vocabフェーズ: 4択回答→正誤フィードバック→誤答時に同ラウンドが再シャッフルされて最初からやり直しになること
   - 全問正解でwritingフェーズに遷移すること
   - writingフェーズ: 自己回答入力・模範解答トグル・prev/next導線
   - archiveページ・rootリダイレクトが新形式データで壊れていないこと
3. 生成コマンド（`/ielts-daily`）で実際に1日分のJSONを生成し、新スキーマでAPI POSTが通ることを確認する
