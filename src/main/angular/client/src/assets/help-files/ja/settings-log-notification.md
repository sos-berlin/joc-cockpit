# 設定 - Log Notification

[ログ通知サービス](/service-log-notification) は、コントローラやエージェントなどの JS7 製品から警告やエラーを受信する syslog サーバーを実装しています。このサービスは、例えば電子メールで通知を送るように設定することができます。

通知は[モニター - システム通知](/monitor-notifications-system) ページに表示されます。

*設定* ページは、メニューバーの ホイールアイコンからアクセスできます。

以下の設定がログ通知サービスに適用できます。変更は直ちに有効になります。

## ログ通知サービスの設定

### 設定： *log_server_active*, Default： *false*

JOCコックピットでログ通知サービスを起動するように設定します。

### 設定： *log_server_port*、Default： *4245*

ログ通知サービスがリッスンするUDPポートを指定します。

### 設定： *log_server_max_messages_per_second*、Default： *1000*

ログ通知サービスが処理する1秒あたりの最大メッセージ数を指定します。

## 参照

### コンテキストヘルプ

- [ログ通知サービス](/service-log-notification)
- [モニター - システム通知](/monitor-notifications-system)
- [設定](/settings)

###Product Knowledge Base

- [JS7 - Log Notification Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Notification+Service)
- [JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)

