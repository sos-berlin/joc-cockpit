# モニター - システム通知

JS7製品からの通知を表示します。

- システム通知には、[Settings](/settings) ページセクション[Settings - Log Notification](/settings-log-notification) から *Log Notification Service* を設定する必要があります。設定された場合、JOC Cockpit は JOC Cockpit に登録されたコントローラとエージェントから警告とエラーを受信する syslog サービスとして動作します。
- このビューにNotificationを表示するだけでなく、メールやコマンドラインからサードパーティのSystem Monitor製品などに転送することもできます。詳細は[Configuration - Notification ](/configuration-notification) を参照してください。

[Cleanup Service](/service-cleanup)デフォルトでは、通知は1日以上経過すると削除されます。

## 通知の表示

通知は以下の情報項目から表示されます：

- **JOCコックピットID**は、JOCコックピット・インスタンスの一意の識別子を指定します。 
  - **プレフィックス**は通常、GUIアクセスを提供するJOCコックピット・インスタンスの場合は*joc*です。
  - **インストール時にJOC Cockpitインスタンスに割り当てられた番号です。
- **JOC*、*CONTROLLER*、*AGENT*のいずれかです。
- **ソース**は 
  - **LogNotification**は、メッセージが syslog インタフェースから受信されたことを示します。
  - **Deployment**は、現在の JOC Cockpit インスタンスでの配置操作を示します。
- **Notifier** は次のいずれかです。
  - CONTROLLER *Category* が指定されている場合、**<*Controller-ID*>** コントローラの一意の識別子を示します。
  - AGENT *Category* が指定されている場合、**<*Agent-Name*>(<*Director-Agent*>)** はエージェント名を示します。
  - **<*Java-class*>** は、通知を発生させた Java クラスの名前を示します。
- **Type**は、以下のいずれかです。
  - JS7製品のログで警告を示す**WARNING**。
  - **ERROR** は、JS7 製品のログにエラーがあることを示します。
- **Message**はエラーメッセージまたは警告を示します。
- **Exception**は、Notificationを発生させた例外を示します。
- **Created** は、Notification が発生した日付を示します。

警告またはエラーは、このビューでNotificationを表示したり、メールでNotificationを転送したりするなど、関連する設定に応じて複数のNotificationを発生させることができます。 

Notificationに設定された各チャンネルには、個別のエントリが表示されます。メールまたはコマンドラインからのNotificationのエントリは、関連するチャネルの成功/失敗の詳細を表示する*矢印ダウン*アイコンを提供します。

## 通知に関する操作

各警告およびエラー通知に対して、3ドットのアクションメニューが提供され、以下の操作が可能です：

- **承認** はユーザーが通知を認識し、対処することを指定します。この操作により、ポップアップウィンドウが表示され、通知の処理に関するコメントを指定できます。<br/><br/>既定では、確認済みの通知は表示されません。Acknowledged*フィルターボタンを選択することで、表示させることができます。

## フィルター

ページ上部には、個別または組み合わせて適用できるフィルターボタンが多数用意されています。

以下のボタンは通知元をフィルタリングします：

- **すべてのJS7製品からの通知を表示します。
- **システム
- **JOC**は通知の表示を*失敗*オーダーに制限します。 
- **コントローラー**は、警告が発生したオーダーに通知の表示を制限します。
- **エージェント**は、最初に失敗し、ワークフローを正常に進めることで回復したオーダーに通知の表示を制限します。

以下のボタンで通知の種類を絞り込むことができます：

- **タイプ* ERROR の通知を表示します。
- **警告** は、*Type* 警告の通知を表示します。
- **Acknowledged**は、関連する操作から以前に承認された通知に表示を制限します。

##参照

### コンテキストヘルプ

-[Cleanup Service](/service-cleanup)
-[Configuration - Notification ](/configuration-notification)
-[Settings](/settings)
-[Settings - Log Notification](/settings-log-notification)
-[Monitor - Order Notifications](/monitor-notifications-order)
-[Workflows](/workflows)

###Product Knowledge Base

-[JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor)
-[JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications)

