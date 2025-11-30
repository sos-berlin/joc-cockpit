# 設定 - インベントリ - 操作 - オブジェクトの削除

オブジェクトの削除には、コントローラとインベントリからの削除が含まれます。これは *Controller* や *Automation* システムフォルダから利用できるワークフローやスケジュールなどのオブジェクトに適用されます。

削除されたオブジェクトは、インベントリのゴミ箱に残ります。

Configuration-&gt;Inventory*ビューでは、単一のオブジェクトの削除とフォルダからのオブジェクトの削除が可能です。[Configuration - Inventory - Operations - Remove Folder](/configuration-inventory-operations-remove-folder) を参照してください。

ナビゲーションパネルのオブジェクトの3つの点のアクションメニューから利用可能な*Remove*操作を使って単一のオブジェクトを削除する場合、以下のようなポップアップウィンドウが表示されます：

<img src="remove-workflow.png" alt="Remove Workflow" width="600" height="140" />

## コントローラーからのオブジェクトの削除

オブジェクトを削除すると、そのオブジェクトがデプロイされているすべてのコントローラから削除されます。

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
    - 関連オブジェクトが以前にデプロイまたはリリースされている場合、共通の削除/取り消しが提供されます。関連オブジェクトの失効は、オブジェクトの関係によって要求される場合、強制されます。
    - これは、以前にデプロイまたはリリースされたドラフト状態のオブジェクトにも同様に適用されます。
  - チェックを外すと、依存関係は考慮されません。関連するオブジェクトが有効で、デプロイ/リリースされているかどうかは、 ユーザが確認する必要があります。コントローラは、オブジェクトが見つからない場合にエラーメッセージを表示します。

## 参照

### コンテキストヘルプ

-[Configuration - Inventory - Operations - Remove Folder](/configuration-inventory-operations-remove-folder)
-[Configuration - Inventory - Workflows](/configuration-inventory-workflows)
-[Daily Plan](/daily-plan)
-[Dependency Matrix](/dependencies-matrix)

###Product Knowledge Base

-[JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)

