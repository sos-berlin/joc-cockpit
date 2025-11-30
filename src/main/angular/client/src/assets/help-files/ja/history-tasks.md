# タスク履歴

タスク履歴*ビューは、実行されたワークフローやオーダーから独立して表示されるジョブ の実行履歴をまとめたものです。

タスク履歴*は、[Cleanup Service](/service-cleanup) によって実行されるデータベースのパージの対象となります。

オーダーの履歴については、[Order History](/history-orders) を参照してください。

## ナビゲーションパネル

左側のパネルでは、ジョブの実行のトリガーとなったワークフローやオーダーのタグでフィルタリングすることができます。

- **ワークフロータグ** は[Configuration - Inventory - Workflows](/configuration-inventory-workflows) から割り当てられます。
- **オーダータグ** は[Configuration - Inventory - Schedules](/configuration-inventory-schedules) ビューから割り当てられます。

タグは + と - のアイコンから選択し、検索アイコンで調べることができます。タグの表示は[Settings - JOC Cockpit](/settings-joc) ページから有効にする必要があります。

## 履歴パネル

[Profile - Preferences](/profile-preferences) から特に指定がない場合、最大5000件まで表示されます。

### 求人履歴

- **ジョブ名**は関連するジョブを示します。
- **ワークフローはジョブが実行されたワークフローを示します。
  - ワークフロー名をクリックすると[Workflows](/workflows) ビューに移動します。
  - 鉛筆アイコンをクリックすると[Configuration - Inventory - Workflows](/configuration-inventory-workflows) のビューに移動します。
- **Label**はワークフロー内でのジョブの位置を示します。ユーザーは表示されるジョブに **ラベル** を割り当てます。同じジョブがワークフロー内で複数回発生した場合、異なる **ラベル**で表示されます。
- **履歴ステータス**はジョブの結果を示します。
  - ジョブが完了した場合、*History Status*は*successful*または*failed*のどちらかになります。
  - ジョブが完了していない場合、*履歴ステータス**は*進行中**となります。

### ログ出力へのアクセス

- **ジョブ名**：ジョブ名** をクリックすると、そのジョブのログ出力が[Task Log View](/task-log) から表示されます。
- **Download Icon**: アイコンをクリックするとジョブのログをファイルにダウンロードします。

デフォルトではタスクログの表示は 10MB に制限されています。ユーザーは[Settings - JOC Cockpit](/settings-joc) ページから制限を調整できます。

### タスク履歴の操作

タスクごとのアクションメニューでは、以下の操作が可能です：

- **Add Job to Ignore List** はそのジョブを永久に非表示にします。これは繰り返し実行され、*タスク履歴*に表示されるジョブに対して有効です。
- **Add Workflow to Ignore List（ワークフローを無視リストに追加）**はワークフローのジョ ブを永久的に非表示にします。これは、*タスク履歴*に繰り返し入力されるワークフローに便利です。

無視リスト**はウィンドウ右上の関連ボタンから管理します：

- **Edit Ignore List** は *Ignore List* 内のジョブやワークフローを表示し、個別に *Ignore List* からエントリーを削除することができます。 
- **Enable Ignore List**は、*Ignore List*に追加されたジョブ、または追加されたワークフローに含まれるジョブを非表示にするフィルタリングを有効にします。無視リスト*が有効な場合は、関連するボタンが表示されます。
- **Ignore List**を無効にすると、ジョブやワークフローのフィルタリングが無効になります。この操作はアクティブな*Ignore List*に対して有効です。
- 無視リストをリセット**すると、*無視リスト**からジョブやワークフローが削除され、すべてのジョブが表示されます。

## フィルター

ユーザーはウィンドウの上部にあるフィルターを適用して、ジョブの表示を制限することができます。

- **Successful**、**Failed**、**In Progress**のフィルターボタンは関連する*履歴ステータス*のジョブのみに表示を制限します。
- **日付範囲**フィルターボタンは、ジョブ表示の日付範囲を選択します。
- **Current Controller** チェックボックスは、現在選択されているコントローラにジョブを制限します。

## 参考文献

### コンテキストヘルプ

-[Cleanup Service](/service-cleanup)
-[Configuration - Inventory - Schedules](/configuration-inventory-schedules)
-[Configuration - Inventory - Workflows](/configuration-inventory-workflows)
-[Order History](/history-orders)
-[Profile - Preferences](/profile-preferences)
-[Settings - JOC Cockpit](/settings-joc)
-[Task Log View](/task-log)

###Product Knowledge Base

-[JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History)
-[JS7 - Task History](https://kb.sos-berlin.com/display/JS7/JS7+-+Task+History)

