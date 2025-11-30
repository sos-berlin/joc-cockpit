# 設定 - 在庫 - 操作 - オブジェクトの呼び出し

オブジェクトの呼び出しは、例えば[Daily Plan](/daily-plan) で使用するために、オブジェクトを非アクティブにします。 これは、*Automation* システムフォルダから利用可能なスケジュールやカレンダーなどのオブジェクトに適用されます。

Configuration-&gt;Inventory*]ビューでは、単一のオブジェクトのリコールとフォルダからのオブジェクトのリコールが可能です（[Configuration - Inventory - Operations - Recall Folder](/configuration-inventory-operations-recall-folder) を参照）。

ナビゲーション・パネルのオブジェクトの3つの点のアクション・メニューから利用可能な*Recall*操作から単一のオブジェクトを呼び出す場合、以下のようなポップアップ・ウィンドウが表示されます：

<img src="recall-schedule.png" alt="Recall Schedule" width="600" height="300" />

## 実行計画の更新

スケジュールやカレンダーなどのオブジェクトの呼び出しは[Daily Plan](/daily-plan) に影響します。 

関連するスケジュールが参照するワークフローの既存のオーダーは、コントローラから呼び出され、実行計画から削除されます。

## 依存関係を含む

インベントリオブジェクトは依存関係によって関連付けられます（[Dependency Matrix](/dependencies-matrix) を参照）。例えば、ワークフローはジョブリソースとリソースロックを参照し、スケジュールはカレンダーと1つ以上のワークフローを参照します。

オブジェクトを呼び出す際には、例えば、一貫性が考慮されます：

- スケジュールが作成され、新しく作成されたカレンダーを参照している場合、スケジュールのリリースはカレンダーのリリースも含みます。スケジュールが作成され、新しく作成されたカレンダーを参照する場合、スケジュールのリリースはカレンダーのリリースも含みます。
- スケジュールが作成され、新しく作成されたカレンダーを参照する場合、スケジュールをリリースすることは、スケジュールによって参照されるワークフローのドラフトをデプロイすることを含みます。これには、スケジュールによって参照されるワークフローを取り消したり、削除したりすることも含まれます。

ユーザーは以下のオプションから一貫性のある展開をコントロールします：

- **依存関係**を含める
  - をチェックすると、参照するオブジェクトと参照されるオブジェクトの両方が含まれます。
    - 関連オブジェクトがデプロイ済み/リリース済みステータスにある場合、共通の呼び出しが提供されます。オブジェクトのリレーションシップによって必要であれば、強制されます。
    - 関連オブジェクトがドラフト状態の場合、共通呼び出しはオプションです。ユーザーは、共通呼び出しのために関連オブジェクトを選択することができます。
  - チェックを外した場合、依存関係は考慮されません。関連オブジェクトが有効で、デプロイ/リリースされているかどうかは、 ユーザが確認する必要があります。一貫性のないデプロイによってオブジェクトが見つからない場合、コントローラはエラーメッセージを表示します。

## 参照

### コンテキストヘルプ

-[Configuration - Inventory - Operations - Recall Folder](/configuration-inventory-operations-recall-folder)
-[Configuration - Inventory - Workflows](/configuration-inventory-workflows)
-[Daily Plan](/daily-plan)
-[Dependency Matrix](/dependencies-matrix)

###Product Knowledge Base

-[JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)

