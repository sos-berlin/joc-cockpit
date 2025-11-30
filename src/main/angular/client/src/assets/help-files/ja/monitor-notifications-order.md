# モニター - オーダー通知

ワークフローから発生した通知を表示します。

通知は[Configuration - Notification](/configuration-notification) ページから設定することができ、オーダーの実行やジョブの実行が成功、警告、エラーの場合に発生します。

- notify_on_failure_gui*はこのビューで通知を表示するかどうかを指定します。
- このビューに通知を表示するだけでなく、メールやコマンドラインからサードパーティの System Monitor 製品などに転送することもできます。詳細については、[Configuration - Notification ](/configuration-notification) を参照してください。

[Cleanup Service](/service-cleanup)デフォルトでは、通知は 1 日以上経過すると削除されます。

## 通知の表示

通知は以下の情報項目から表示されます：

- **ワークフロー**はワークフロー名を指定します。 
  - ワークフロー名をクリックすると[Workflows](/workflows) ビューに移動します。
  - ワークフロー名の左側にある鉛筆アイコンをクリックすると、[Configuration - Inventory - Workflows](/configuration-inventory-workflows) ビューに移動します。
- **オーダー ID**は、オーダーの一意な識別子を指定します。
- **ジョブ**は、警告またはエラーがジョブに起因する場合に表示されます。
- **タイプ**は以下のいずれかです。
  - **SUCCESS** は、オーダーが正常に実行されたことを示します。
  - **WARNING(警告)** オーダーのフローには影響しませんが、関連するNotificationが発生します。
  - **ERROR**はジョブまたは他のワークフロー指示によって発生します。この通知は、*Try/Catch*または*Retry命令*によってワークフローがエラー処理を適用し、オーダーがワークフロー内で処理されることとは無関係にトリガーされます。
  - **RECOVERED**は、以前*失敗*したオーダーが回復し、ワークフローで正常に処理されたことを示します。
- **リターンコード**は、通知を発生させたシェルジョブの終了コードまたはJVMジョブのリターンコードを示します。
- **メッセージ**は、エラーメッセージまたは警告を示します。
- **Created** は、Notification が発生した日付を示します。

警告またはエラーは、このビューでNotificationを表示したり、メールでNotificationを転送したりするなど、関連する設定に応じて複数のNotificationを発生させることができます。 

Notificationに設定された各チャンネルには、個別のエントリが表示されます。メールまたはコマンドラインからのNotificationのエントリは、関連するチャネルの成功/失敗の詳細を表示する*矢印ダウン*アイコンを提供します。

## 通知に関する操作

各警告およびエラー通知に対して、3ドットのアクションメニューで以下の操作が可能です：

- (**確認**) ユーザーが通知を認識し、対策を講じることを指定します。この操作により、ポップアップウィンドウが表示され、通知の処理に関するコメントを指定できます。<br/><br/>既定では、確認済みの通知は表示されません。Acknowledged*フィルターボタンを選択することで、表示させることができます。

## フィルター

ページ上部には、個別または組み合わせて適用できるフィルターボタンがあります：

- Successful(**成功)**は、オーダーが成立した場合の通知に限定します。
- **失敗**は、失敗*したオーダーに関する通知に限定します。
- **Warning(警告)**は、警告が発生したオーダーに関する通知に限定します。
- **Recovered(回復)] 最初に失敗し、ワークフローが正常に進行して回復したオーダーに限定して 通知を表示します。
- **確認済み**」は、関連する操作から確認済みの通知に表示を限定します。

##参照

### コンテキストヘルプ

-[Cleanup Service](/service-cleanup)
-[Configuration - Inventory - Workflows](/configuration-inventory-workflows)
-[Configuration - Notification](/configuration-notification)
-[Monitor - System Notifications](/monitor-notifications-system)
-[Workflows](/workflows)

###Product Knowledge Base

-[JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor)
-[JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications)

