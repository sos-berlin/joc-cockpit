# ♪依存マトリックス

JS7 インベントリオブジェクトは依存関係によって関連付けられます。例えば、ワークフローはジョブリソースとリソースロックを参照し、スケジュールはカレンダーと1つ以上のワークフローを参照します。

オブジェクトをデプロイするとき、例えば、整合性が考慮されます：

- ジョブリソースが作成され、新しく作成されたワークフローによって参照される場合、ワークフローのデプロイはジョブリソースのデプロイを含みます。
- 例えば、ジョブリソースが作成され、新しく作成されたワークフローによって参照される場合、ワークフローのデプロイにはジョブリソースのデプロイも含まれます。ジョブリソースがデプロイされたワークフローによって参照され、破棄または削除される場合、ワークフローも破棄または削除されなければなりません。

詳細は[JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies) を参照してください。

インベントリオブジェクトの依存関係マトリックスは以下のようになります：

| Area |Object Type | Incoming References	 |     | Outgoing References |      |       |       |       |       |
| ----- | ----- | ----- | ----- |
| コントローラ
| ワークフロー｜スケジュール｜ワークフロー｜ジョブ・リソース｜掲示板｜リソース・ロック｜ジョブ・テンプレート｜スクリプト・インクルード｜｜ワークフロー｜スケジュール｜ワークフロー｜ジョブ・リソース｜掲示板｜リソース・ロック｜ジョブ・テンプレート｜スクリプト・インクルード
| ファイルオーダーソース｜ワークフロー｜ジョブリソース｜ワークフロー
| ジョブリソース｜ワークフロー｜通知ボード｜リソースロック｜スクリプトインクルード
| お知らせボード｜ワークフロー｜ジョブテンプレート｜スクリプトインクルード
| ワークフロー｜リソースロック｜スクリプトのインクルード
| 自動化
| スケジュール｜ワークフロー｜カレンダー
| カレンダー、スケジュール
| ジョブテンプレート ワークフロー
| スクリプトインクルードワークフロー

## 参考文献

### コンテキストヘルプ

-[Configuration - Inventory - Operations - Deploy Folder](/configuration-inventory-operations-deploy-folder)
-[Configuration - Inventory - Operations - Deploy Object](/configuration-inventory-operations-deploy-object)

###Product Knowledge Base

-[JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)

