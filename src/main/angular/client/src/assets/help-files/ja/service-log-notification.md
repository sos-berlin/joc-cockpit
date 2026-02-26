# ログ通知サービス

[JS7 - Log Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Management) は、JOCコックピットと共に提供され、コントローラー、エージェント、JOCコックピットによって生成されたログの出力と通知をします。

[JS7 - Log Notification Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Notification+Service) は、アクティブなJOCコックピットから提供されます。

## サービス

このサービスは、コントローラーとエージェントのログ出力から警告やエラーを収集し、[JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications) を作成するために使用されます。

- JOCコックピットからの通知は、サービスを使用せずに直接作成されます。
- サービスはRFC5424（syslogプロトコル）に準拠しています。
- JOCコックピットクラスターのフェイルオーバーや切り替えの場合、ログ通知サービスはアクティブなJOCコックピットインスタンスから利用可能になります。

## クライアント

コントローラーとエージェントインスタンスはログ通知サービスのクライアントとして動作します。製品はログ出力から警告やエラーをログ通知サービスに報告するように設定できます。詳細は[JS7 - Log Configuration for use with System Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Configuration+for+use+with+System+Notifications) を参照してください。

ユーザーは、インストール中、または後でLog4j2の設定を調整することで、コントローラーとエージェントのインスタンスごとにログ出力の転送を有効にすることができます。

## ユーザーインターフェース

JOCコックピットは、[モニター - システム通知](/monitor-notifications-system) 画面からシステム通知を提供します。

JOCコックピットは、電子メールやコマンドラインツールなどから通知を転送するための[Notifications- Configuration ](/configuration-notification) 。

## ログ通知サービスの設定

ログ通知サービスの設定については、[設定 - 通知](/settings-log-notification) を参照してください。

## 参照

### コンテキストヘルプ

- [モニター - システム通知](/monitor-notifications-system)
- [通知 - 設定 ](/configuration-notification)
- [設定 - Log Notification](/settings-log-notification)

###Product Knowledge Base

- [JS7 - Log Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Management)
  - [JS7 - Log Configuration for use with System Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Configuration+for+use+with+System+Notifications)
  - [JS7 - Log Notification Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Notification+Service)
- [JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications)

