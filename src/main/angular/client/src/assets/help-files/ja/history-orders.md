# オーダー履歴

オーダー履歴*ビューは、オーダーの実行履歴を表示します。これには、関連するオーダーをトリガーとしたワークフローで使用されたジョブの実行履歴も含まれます。

オーダー履歴*は、[Cleanup Service](/service-cleanup) によって実行されるデータベースのパージの対象となります。

タスクの履歴については、[Task History](/history-tasks) を参照してください。

## ナビゲーションパネル

左側のパネルでは、ワークフローとオーダーからタグをフィルタリングできます。

- **ワークフロータグ**は[Configuration - Inventory - Workflows](/configuration-inventory-workflows) 。
- **オーダータグ**は[Configuration - Inventory - Schedules](/configuration-inventory-schedules) 。

タグは + と - のアイコンから選択し、クイック検索アイコンで検索することができます。タグの表示は[Settings - JOC Cockpit](/settings-joc) ページから有効にする必要があります。

## 履歴パネル

[Profile - Preferences](/profile-preferences) から特に指定がない場合、最大5000件まで表示されます。

### オーダー履歴

- **オーダーID**はオーダーに割り当てられた一意の識別子です。矢印アイコンをクリックすると、オーダーの変数とオーダーによって渡されたジョブが表示されます。 
- **ワークフロー**は、オーダーによって渡されたワークフローを示します。
  - ワークフロー名をクリックすると、[Workflows](/workflows) ビューに移動します。
  - 鉛筆アイコンをクリックすると、[Configuration - Inventory - Workflows](/configuration-inventory-workflows) のビューに移動します。
- **ラベル**は、ワークフローにおけるオーダーの最新位置を示します。ユーザーはワークフロー指示書にラベルを割り当てることができます。
- **履歴ステータス(History Status)**は、オーダーの最新の結果を示します。
  - オーダーが完了した場合、*履歴ステータス**は*成功*または*失敗*となります。
  - オーダーが完了していない場合、*履歴ステータス*は*進行中*となります。
- **オーダー状態**は、オーダーの最新の状態を示します。[Order States](/order-states) を参照してください。
  - オーダーが完了している場合、*Order State*は*successful*または*failed*になります。
  - オーダーが完了していない場合、*Order State*は*processing*となります。

### ログ出力へのアクセス

- **オーダーID**：[Order Log View](/order-log)ログには、ワークフローで実行されたジョブの出力が含まれます。
- **アイコンをクリックすると、オーダーのログをファイルにダウンロードします。

デフォルトでは、オーダーログの表示は 10MB に制限されています。ユーザーは[Settings - JOC Cockpit](/settings-joc) ページから制限を調整できます。

### タスク履歴の操作

タスクごとにアクションメニューがあり、以下の操作が可能です：

- **ワークフローを無視リストに追加**」は、ワークフローのオーダーを恒久的に非表示 にします。これは、*オーダー履歴*に入力される周期的なワークフローに便利です。

無視リスト］はウィンドウ右上の関連ボタンから管理します：

- **無視リストの編集**は、*無視リスト*内のジョブやワークフローを表示し、*無視リスト*から個別にエントリーを削除することができます。 
- **Enable Ignore List**は、*Ignore List*に追加されたジョブ、または追加されたワークフローに含まれるジョブを非表示にするフィルタリングを有効にします。無視リスト*が有効な場合は、関連するボタンが表示されます。
- **Ignore List**を無効にすると、ジョブやワークフローのフィルタリングが無効になります。この操作はアクティブな*Ignore List*に対して有効です。
- 無視リストをリセット**すると、*無視リスト**からジョブやワークフローが削除され、すべてのジョブが表示されます。

## フィルター

オーダーの表示を制限するために、ユーザーはウィンドウ上部のフィルターを適用することができます。

- **成功**, **失敗**, **進行中** フィルターボタンは、関連する*履歴ステータス*を持つオーダーに表示を制限します。
- **日付範囲]フィルターボタンは、オーダーを表示する日付範囲を選択します。
- **現在のコントローラー**チェックボックスは、現在選択されているコントローラーにオーダーを制限します。

## 参照

### コンテキストヘルプ

-[Cleanup Service](/service-cleanup)
-[Configuration - Inventory - Workflows](/configuration-inventory-workflows)
-[Configuration - Inventory - Schedules](/configuration-inventory-schedules)
-[Order Log View](/order-log)
-[Order States](/order-states)
-[Profile - Preferences](/profile-preferences)
-[Settings - JOC Cockpit](/settings-joc)
-[Task History](/history-tasks)
-[Workflows](/workflows)

###Product Knowledge Base

-[JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History)
-[JS7 - Task History](https://kb.sos-berlin.com/display/JS7/JS7+-+Task+History)

