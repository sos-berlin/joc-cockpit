# 設定 - インベントリ - 操作 - フォルダの取り消し

オブジェクトの失効には、Controller からオブジェクトを削除することと、インベントリでオブジェクトをドラフトステータスに保つことが含まれます。これは *Controller* システムフォルダから利用可能なワークフローやジョブリソースなどのオブジェクトに適用されます。

Configuration-&gt;Inventory* ビューでは、1 つのオブジェクトの取り消し（[Configuration - Inventory - Operations - Revoke Object](/configuration-inventory-operations-revoke-object) を参照）と、フォルダからのオブジェクトの取り消しができます。

ナビゲーションパネルのフォルダの 3 つの点のアクションメニューから利用可能な *Revoke* 操作を使用してフォルダからオブジェクトを取り消すと、次のようなポップアップウィンドウが表示されます：

<img src="revoke-folder.png" alt="Revoke Folder" width="600" height="580" />

## コントローラーからのオブジェクトの失効

この入力フィールドには、オブジェクトを破棄するコントローラを1つ以上指定します。

デフォルトでは、現在選択されているコントローラが表示されます。

## 実行計画の更新

ワークフローやジョブリソースなどのオブジェクトの失効は[Daily Plan](/daily-plan) に影響します。 

関連するワークフローの既存のオーダーはコントローラーから呼び出され、実行計画から削除されます。

## サブフォルダーを含む

Handle recursively** オプションを使用すると、サブフォルダのオブジェクトを再帰的に取り消すことができます。

## 依存関係を含む

インベントリオブジェクトは依存関係によって関連付けられます。[Dependency Matrix](/dependencies-matrix) を参照してください。例えば、ワークフローはジョブリソースとリソースロックを参照し、スケジュールはカレンダーと1つ以上のワークフローを参照します。

オブジェクトを失効させる場合、整合性が考慮されます：

- ジョブリソースがワークフローから参照されている場合、ジョブリソースの失効はワークフローの失効も含みます。
- ワークフローが失効した場合、ワークフローを参照しているスケジュールはリコールされ、関連するオーダーはリコールされ、実行計画から削除されます。

ユーザーは、以下のオプションからオブジェクトの一貫した失効を制御します：

- **Include Dependencies**
  - をチェックすると、参照するオブジェクトと参照されるオブジェクトの両方が含まれます。
    - 関連するオブジェクトが以前にデプロイまたはリリースされている場合、共通の失効が提供されます。オブジェクトの関係で必要であれば、強制されます。
    - これは、以前にデプロイまたはリリースされたドラフト状態のオブジェクトにも同様に適用されます。
  - チェックを外すと、依存関係は考慮されません。関連するオブジェクトが有効で、デプロイ/リリースされているかどうかは、 ユーザが確認する必要があります。コントローラは、オブジェクトが見つからない場合にエラーメッセージを表示します。

## 参照

### コンテキストヘルプ

-[Configuration - Inventory - Operations - Revoke Object](/configuration-inventory-operations-revoke-object)
-[Configuration - Inventory - Workflows](/configuration-inventory-workflows)
-[Daily Plan](/daily-plan)
-[Dependency Matrix](/dependencies-matrix)

###Product Knowledge Base

-[JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)

