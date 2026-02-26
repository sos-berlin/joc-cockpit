# クリーンアップサービス

クリーンアップサービスは、[JS7 - Database](https://kb.sos-berlin.com/display/JS7/JS7+-+Database) の古いレコードを削除します。

これには以下のソースからのデータが含まれます：

-[オーダー履歴](/history-orders)
-[タスク履歴](/history-tasks)
-[ファイル転送履歴](/history-file-transfers)
-[実行計画](/daily-plan)
-[操作ログ](/audit-log)

その日に実行された各ジョブに対して*タスク履歴*のエントリーが作成され、同様に*オーダー履歴*のエントリーが作成されます。毎日のジョブの数によって、これは膨大な数になります。

- ユーザーは適用されるログ保持ポリシー、すなわち法的要件やコンプライアンス要件によってジョブ実行履歴とログを保持しなければならない期間を考慮する必要があります。
- データベースは無限に増やすことはできません。高性能な DBMS を使用すれば、*タスク履歴* テーブルに 1 億レコードを持つことができるかもしれません。しかし、これはパフォーマンスに悪影響を及ぼす傾向があり、必要ないかもしれません。データベースのパージは、円滑な運用のための合理的な手段です。インデックスの再作成など、データベース保守のための追加措置はユーザーの責任です。

クリーンアップサービスはその設定に基づいて開始され、アクティブな JOC コックピット・インスタンスのメニューからダッシュボード・ビューで *サービス実行 - クリーンアップサービス* から開始できます。

<img src="dashboard-run-cleanup-service.png" alt="Run Cleanup Service" width="750" height="280" />

## クリーンアップサービスの設定

クリーンアップサービスの設定の詳細については、[設定 - Cleanup](/settings-cleanup) を参照してください。

## 参照

### コンテキストヘルプ

- [操作ログ](/audit-log)
- [実行計画](/daily-plan)
- [ファイル転送履歴](/history-file-transfers)
- [オーダー履歴](/history-orders)
- [タスク履歴](/history-tasks)
- [設定 - Cleanup](/settings-cleanup)

###Product Knowledge Base

- [JS7 - Cleanup Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Cleanup+Service)
- [JS7 - Database](https://kb.sos-berlin.com/display/JS7/JS7+-+Database)

