# PM Agent 詳細仕様書

## 1. データモデル定義

### 1.1 Project (プロジェクト)
各取引の基本単位。HubSpotの `Deal` オブジェクトに対応します。
- `id`: HubSpot Deal ID
- `name`: プロジェクト名
- `health`: 状態 ('On Track' | 'At Risk' | 'Delayed')
- `nextMilestone`: 次の重要な期限。現在は HubSpot の `closedate` を参照。
- `owner`: 担当者 ID
- `emails`: 関連するコミュニケーション履歴
- `activityLog`: AIのインサイトや手動アクションの履歴

### 1.2 Alert (アラート)
AI解析やルールベースで生成される通知。
- `type`: リスクの種類 ('Risk' | 'Opportunity' | 'Stalled' | 'Blocker')
- `severity`: 重要度 ('High' | 'Medium' | 'Low')
- `message`: 具体的な通知内容
- `suggestedAction`: 推奨される次のアクション

## 2. AI解析プロセス

### 2.1 Gemini連携詳細 (server.js)
`Gemini 1.5 Flash` を使用し、以下のプロンプト戦略で解析を行います：
1. 最新の3通のメール内容、プロジェクト名、期限を送信。
2. 顧客のトーンを0-100でスコアリング。
3. 期限と文脈に基づき、`atRisk` (リスクの有無) を判定。
4. 簡潔な1文の要約を生成。

### 2.2 解析アルゴリズム (analysisEngine.ts)
AIの結果とルールベースのロジックを統合します：
- **致命的リスク (High)**: 期限超過 かつ AIが「ネガティブ感情（スコア<40）」を検出した場合。
- **中程度リスク (Medium)**: 期限超過のみ、または7日間以上の活動停止。
- **軽微なリスク (Low)**: 期限が3日以内に迫っている場合。

## 3. 外部システム連携

### 3.1 HubSpot API Proxy
CORS制限や秘密鍵の隠蔽のため、フロントエンドからではなくNode.jsサーバー経由で通信します。
- `GET /api/hubspot/deals`: 取引情報の一覧取得。
- `GET /api/hubspot/deals/:id/communications`: 取引にアソシエーション（関連付け）されているメール、通話記録等の取得。

## 4. コンポーネント設計

- **AgentInterface**: メインコンテナ。データのフェッチ管理、フィルタリング、表示モードの切り替えを担当。
- **CriticalSummary**: フィルター機能付きの上部統計パネル。各健康状態をクリックすることで一覧を絞り込み可能。
- **ProjectCard / ProjectTable**: プロジェクトの詳細情報を表示。
- **ProjectTimeline**: 特定プロジェクトの活動履歴を詳細表示するスライドパネル。
- **AlertStream**: 複数プロジェクトを横断した最新のアラート通知エリア。

## 5. 本番導入時の考慮事項
- **APIレート制限**: HubSpot APIの呼び出し制限に対するキャッシング戦略。
- **セキュリティ**: `.env` による API キーの厳重な管理。
- **拡張性**: メール以外の Slack 連携やタスク管理ツールへの対応。
