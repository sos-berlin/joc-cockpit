# 清掃サービス

クリーンアップサービスは、[JS7 - Database](https://kb.sos-berlin.com/display/JS7/JS7+-+Database) の古いレコードを削除します。

これには以下のソースからのデータが含まれます：

-[Order History](/history-orders)
-[Task History](/history-tasks)
-[File Transfer History](/history-file-transfers)
-[Daily Plan](/daily-plan)
-[Audit Log](/audit-log)

その日に実行された各ジョブに対して*タスク履歴*のエントリーが作成され、同様に*オーダー履歴*のエントリーが作成されます。毎日のジョブの数によって、これは膨大な数になります。

- ユーザーは適用されるログ保持ポリシー、すなわち法的要件やコンプライアンス要件によってジョブ実行履歴とログを保持しなければならない期間を考慮する必要があります。
- データベースは無限に増やすことはできません。高性能な DBMS を使用すれば、*タスク履歴* テーブルに 1 億レコードを持つことができるかもしれません。しかし、これはパフォーマンスに悪影響を及ぼす傾向があり、必要ないかもしれません。データベースのパージは、円滑な運用のための合理的な手段です。インデックスの再作成など、データベース保守のための追加措置はユーザーの責任です。

クリーンアップ・サービスはその設定に基づいて開始され、アクティブな JOC コックピット・インスタンスの矩形からダッシュボード・ビューで *Run Service - Cleanup Service* 操作を提供して開始できます。

<img src="dashboard-run-cleanup-service.png" alt="Run Cleanup Service" width="750" height="280" />

## クリーンアップサービスの設定

クリーンアップサービスの設定の詳細については、[Settings - Cleanup](/settings-cleanup) を参照してください。

## 参考文献

### コンテキストヘルプ

-[Audit Log](/audit-log)
-[Daily Plan](/daily-plan)
-[File Transfer History](/history-file-transfers)
-[Order History](/history-orders)
-[Task History](/history-tasks)
-[Settings - Cleanup](/settings-cleanup)

###Product Knowledge Base

-[JS7 - Cleanup Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Cleanup+Service)
-[JS7 - Database](https://kb.sos-berlin.com/display/JS7/JS7+-+Database)

