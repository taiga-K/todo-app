# AGENTS.MD

## Start

- 電文調。ルートルールのみ。
- 回答は必ず日本語。
- 参照はリポジトリルート相対のみ。例: `cmd/api-server/main.go:80`。絶対パス、`~/` 禁止。
- サブツリー作業前に、対象配下の `AGENTS.md` を読む。
- 独自のシステム、機能、ワークフロー、ツール、統合、自動化を提案・構築する前に、既存の OSS、保守されているライブラリ、無料プラットフォームで十分解決できないか軽く確認する。十分なら既存を優先。有料サービスはユーザーが支出を明示承認しない限り避ける。
- 修正・トラブルシューティング回答には、ソース、テスト、現状または出荷済み挙動、依存先契約の根拠を含める。
- レビュー・回答は高い確信度必須。結論前に所有者、呼び出し元、呼び出し先、類似箇所、テスト、ドキュメント、上流または依存先契約を読む。diff だけで判断しない。
- レビュー時は、変更された関数・モジュール全体、呼び出し元、呼び出し先、兄弟実装、隣接テスト、関連ドキュメント、依存先契約を確認してから `good`、`bad`、`best fix`、`proof sufficient` と言う。
- 依存先に触る作業では、可能な限り依存先のソース、ドキュメント、型を直接読む。記憶、ラッパー、推測に頼らない。
- 外部 API 作業ではライブテスト必須。追加根拠を検索し、公式ドキュメント、ソース、型を優先して現在の証拠を示す。記憶だけで API、デフォルト、エラー、タイミングを断定しない。
- 実行可能ならライブ検証する。秘密情報は出力しない。
- モック、デモ、MVP、localhost、使い捨てを理由に、認証、入力検証、エラー処理、所有境界、実サービス統合、テストなど出荷品質の要件を省略しない。簡略化はユーザーの明示承認と、欠ける保証および本実装への移行条件が明確な場合のみ行う。
- 大きな挙動、プロダクト、セキュリティ、所有権の変更は owner 確認またはレビューを求める。

## Review

- レビューは、PR が「もっとも良い修正か」を必ず問う。単に可能な修正かどうかで終えない。
- verdict 前に証拠マップを作る。変更面、エントリポイント、所有境界、少なくとも 1 つの呼び出し元と呼び出し先、同じ不変条件を共有する兄弟面、既存テスト、現状または出荷済み挙動。欠ける項目があれば結論ではなくギャップとして言う。
- 片側だけの修正には、兄弟面の根拠、兄弟面が影響を受けない説明、または明示的な follow-up が必要。
- finding は、具体的な挙動回帰、変更面の証拠不足、所有境界違反、セキュリティまたは API 契約違反、ドキュメントまたは設定の不一致に絞る。
- ルール上の好みだけで finding を出さない。ユーザー影響、実行時影響、セキュリティ影響、保守運用リスクを示す。

## API / Runtime

- 外部境界から入る入力、API 応答、ファイル内容は検証する。
- runtime branch は自由文字列ではなく、閉じた code、mode、result shape で表現する。
- `0`、空文字、空 object などの意味付き sentinel に依存しない。
- 有効な組み合わせが重要な関数間状態は、並列 nullable field や派生 boolean ではなく、不可能状態を表現できない閉じた result shape にする。
- hot path では、target、owner、外部サービス、認証状態、入力分類など準備済み fact を持ち回る。広い discovery を request-time に繰り返さない。
- request-time discovery の繰り返しを散在 cache で直さない。canonical fact を前段へ移し、準備済み runtime object を再利用し、重複 lookup branch を削除する。
- metadata が process-stable な場合、install、manifest、catalog、生成 path などの変更は restart または明示 owner reload/repair flow に寄せる。
- runtime hot path で freshness polling をしない。現在 snapshot、install record、discovery、lookup table、root scope、resolved path を再利用する。
- process-local cache は lifecycle owner が明確で bounded/single-slot の場合のみ。freshness 例外には owner と test が必要。

## Code

- 複雑な判断は呼び出し前に済ませる。call args と object fields は名前、literal、単純な property read にする。
- 早期 return を優先し、深いネストを避ける。
- 処理は gather -> normalize -> decide -> act に分ける。
- named intermediate は domain meaning または可読性がある場合だけ使う。無意味な一時変数を増やさない。
- 小さく明快なコードを優先する。LOC 増加には所有境界または API の改善という明確な理由が必要。
- refactor は追加した複雑さと同等以上を削除する。non-test LOC が増えたら削るか理由を説明する。
- helper/file は即座に価値を払うこと。call path、概念、重複 logic の削減がない one-off helper は追加しない。
- API は狭く保つ。現在の caller が必要とするものだけ export し、type/helper は原則 local にする。
- 戻り値は最小限の有用な shape にする。caller が使わない flag、metadata、広い result object を返さない。
- field 名を変えるだけの adapter layer を避ける。責務を移すか local に残す。
- lint suppressions は意図と理由がある場合だけ。
- inline comment は、非自明な cross-path/state invariant、lifecycle ordering、ownership boundary、queue/dedupe symmetry、TTL/cache expiry、cleanup/release coupling、session/id adoption、fallback behavior、platform/dependency cap、deterministic ordering、compact encoded state、意図的な caller 差分に置く。
- comment は 1-3 行。なぜ存在するか、守る契約、消すと起きる悪い結果を書く。構文説明、PR 固有の経緯、明らかな mechanics は書かない。

## Tests / Validation

- test は挙動と回帰を証明する。内部 branch すべての網羅や、削除した fallback の保護を目的にしない。
- test は canonical behavior と migration boundary を守る。 obsolete internal の test は更新ではなく削除する。
- 環境変数、global、mock、socket、一時ディレクトリ、module state、timer は cleanup する。
- 小さく狭い test、lint、format、type probe はローカルでよい。広い suite、E2E、live、cross-OS、重い検証は適切な remote/CI proof に寄せる。
- 変更面は handoff 前に証明する。landing 前には issue proof と、scope に応じた broad proof を用意する。
- proof が詰まったら、何が欠け、なぜ欠けるかを明示する。
- docs-only、changelog-only、CI/workflow metadata-only は diff sanity と関連 docs/workflow sanity を確認する。script、config、generated、package、runtime 挙動が変わるなら検証範囲を上げる。
- user-visible な `fix`、`feat`、`perf` には、挙動、surface、関連 issue/PR、人間の報告者または作者の release-note context を PR body、squash message、commit に残す。

## Git / GitHub

- 手動 stash/autostash は明示依頼がない限りしない。
- 予期しない file 削除・rename はしない。blocking なら質問し、無関係なら無視する。
- issue/PR 開始時は working tree を確認する。clean なら fast-forward 更新可。dirty なら pull/rebase 前に知らせる。
- GitHub issue/PR 作成時は、CONTRIBUTING、issue form、PR template、CODEOWNERS を読む。
- PR 作成時は実体のある本文を書く。問題、変更理由、ユーザー影響、証拠を含める。

## Security / Release

- 実電話番号、動画、credential、live config を commit しない。
- lockfile、dependency override、vendor change は security surface としてレビューする。
- dependency patch、override、vendor change は明示承認が必要。
- release、publish、version bump は明示承認が必要。
- secret scanning や advisory は security triage として扱う。

## Cursor Cloud specific instructions

- 構成は npm workspaces のモノレポ。Web(`apps/web`、Vite+TS、:5173)と API(`apps/api`、Go、:8080)の 2 サービス。update script が `npm install` と `go -C apps/api mod download` を実行済み。
- Go: `apps/api/go.mod` は go 1.26.0 要求。VM の system go は古いが `GOTOOLCHAIN=auto` で初回 build 時に go1.26 を自動取得する。手動で go を入れ替えない。
- 問題 DB(`data/questions.db`)は gitignore 済みで未コミット。API 起動前に生成必須。生成後 JSON を変えたら再生成し API を再起動する(実行中は変更監視しない)。リポジトリルートで:
  `go -C apps/api run ./cmd/questiondb -input ../../data/questions.json -output ../../data/questions.db`
- API 起動は `cmd/api/main.go:31` の `config.Load()` が全必須環境変数を起動時検証する(`apps/api/internal/config/config.go`)。`AZURE_OPENAI_ENDPOINT` は Azure ドメイン(`.openai.azure.com`/`.services.ai.azure.com`)の HTTPS 書式必須、`AZURE_OPENAI_API_KEY_FILE` は実在する単一行ファイル、`SQLITE_DATABASE_PATH` は実在する絶対パス。
- Azure 認証情報が無くても起動可能。`azureopenai.NewClient` は起動時にネットワークしない(endpoint を parse するのみ)。実 Azure 呼び出しは request 時。よってダミー値でも `GET /healthz` と `POST /api/question-sets`(DB のみ依存)は完全動作。`POST /api/judgments` と `/api/realtime/*` は実 Azure が必要。
- `/api/*` は `Origin == ALLOWED_ORIGIN`(既定 `http://localhost:5173`)を必須。curl 検証時は `-H "Origin: http://localhost:5173"` を付ける。
- ローカル起動: API は環境変数を設定し `go -C apps/api run ./cmd/api`、Web は `npm run dev:web`。設定雛形は `apps/api/.env.example`、API 契約は `apps/api/README.md`。
- lint/test/build: Web は `npm run build:web`(`tsc --noEmit` 型チェック + `vite build`)。Go は `go -C apps/api vet ./...` と `go -C apps/api test ./...`(現状テストファイルは無い)。