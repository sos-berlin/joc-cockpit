# 設定 - インベントリ - 操作 - フォルダの削除

オブジェクトの削除には、コントローラとインベントリからの削除が含まれます。これは、*Controller* および *Automation* システムフォルダから利用可能なワークフローやスケジュールなどのオブジェクトに適用されます。

フォルダの削除には、サブフォルダを再帰的に削除することも含まれます。削除されたオブジェクトは、インベントリのゴミ箱で引き続き使用できます。

Configuration-&gt;Inventory* ビューでは、単一のオブジェクトの削除（[Configuration - Inventory - Operations - Remove Object](/configuration-inventory-operations-remove-object) を参照）、およびフォルダからのオブジェクトの削除が可能です。

ナビゲーション・パネルのフォルダの 3 つの点のアクション・メニューから利用できる *Remove* 操作を使用してフォルダを削除する場合、次のようなポップアップ・ウィンドウが表示されます：

<img src="remove-folder.png" alt="Remove Folder" width="600" height="560" />

## コントローラーからのオブジェクトの削除

オブジェクトを削除すると、そのオブジェクトが配置されているすべてのコントローラから削除されます。

## 実行計画の更新

ワークフローやスケジュールなどのオブジェクトの削除は、[Daily Plan](/daily-plan) に影響します。 

関連するワークフローの既存のオーダーはコントローラーからキャンセルされ、実行計画から削除されます。

## 依存関係を含む

インベントリオブジェクトは依存関係によって関連付けられます（[Dependency Matrix](/dependencies-matrix) を参照）。例えば、ジョブ リソースとリソース ロックを参照するワークフロー、カレンダーと 1 つ以上のワークフローを参照するスケジュールなどです。

オブジェクトを削除する場合、整合性が考慮されます：

- ジョブリソースがワークフローから参照されている場合、ジョブリソースの削除はワークフローの削除を含みます。
- ワークフローが削除された場合、ワークフローを参照するスケジュールはリコールされ、関連するオーダーはキャンセルされ、実行計画から削除されます。

ユーザーは以下のオプションからオブジェクトの一貫した削除をコントロールします：

- **Include Dependencies**
  - をチェックすると、参照するオブジェクトと参照されるオブジェクトの両方が含まれます。
    - 関連オブジェクトが以前にデプロイまたはリリースされている場合、共通の削除/失効が提供されます： *Remove* 操作が実行されたオブジェクトは削除され、関連オブジェクトは失効/リコールされます。オブジェクトの関係によって必要であれば、失効は強制されます。
    - これは、以前にデプロイまたはリリースされたドラフト状態のオブジェクトにも同様に適用されます。
  - チェックを外すと、依存関係は考慮されません。関連するオブジェクトが有効で、デプロイ/リリースされているかどうかは、 ユーザが確認する必要があります。コントローラは、オブジェクトが見つからない場合にエラーメッセージを表示します。

## 参照

### コンテキストヘルプ

-[Configuration - Inventory - Operations - Remove Object](/configuration-inventory-operations-remove-object)
-[Configuration - Inventory - Workflows](/configuration-inventory-workflows)
-[Daily Plan](/daily-plan)
-[Dependency Matrix](/dependencies-matrix)

###Product Knowledge Base

-[JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)

