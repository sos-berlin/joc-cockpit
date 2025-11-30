# ログ通知サービス

[JS7 - Log Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Management) は、JOC Cockpitと共に提供され、Controller、Agent、JOC Cockpitインスタンスによって作成されたログの出力と通知の発信を監視します。

アクティブなJOC Cockpitインスタンスから[JS7 - Log Notification Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Notification+Service) ：

## サービス

このサービスは、Controller &amp; Agentインスタンスのログ出力から警告やエラーを収集し、[JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications) を作成するために使用されます。

- JOC Cockpit通知は、サービスを使用せずに直接作成されます。
- サービスはRFC5424（別名syslogプロトコル）に準拠しています。
- JOC Cockpitのフェイルオーバーや切り替えの場合、ログ通知サービスはアクティブなJOC Cockpitインスタンスから利用可能になります。

## クライアント

JS7コントローラ＆エージェントインスタンスはログ通知サービスのクライアントとして動作します。製品はログ出力から警告やエラーをログ通知サービスに報告するように設定できます。詳細は[JS7 - Log Configuration for use with System Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Configuration+for+use+with+System+Notifications) を参照してください。

ユーザーは、インストール中、または後でLog4j2の設定を調整することで、Controller &amp; Agentのインスタンスごとにログ出力の転送を有効にすることができます。

## ユーザーインターフェース

JOCコックピットは、[Monitor - System Notifications](/monitor-notifications-system) のビューからシステム通知を提供します。

JOCコックピットは、電子メールやコマンドラインツールなどから通知を転送するための[Notifications- Configuration ](/configuration-notification) 。

## ログ通知サービスの設定

ログ通知サービスの設定については、[Settings - Log Notification](/settings-log-notification) を参照してください。

## 参考文献

### コンテキストヘルプ

-[Monitor - System Notifications](/monitor-notifications-system)
-[Notification - Configuration ](/configuration-notification)
-[Settings - Log Notification](/settings-log-notification)

###Product Knowledge Base

-[JS7 - Log Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Management)
  -[JS7 - Log Configuration for use with System Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Configuration+for+use+with+System+Notifications)
  -[JS7 - Log Notification Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Notification+Service)
-[JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications)

