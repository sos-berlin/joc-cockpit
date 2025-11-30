# 設定 - ログ通知サービス

[Log Notification Service](/service-log-notification) は、コントローラやエージェントなどの JS7 製品から警告やエラーを受信する syslog サーバを実装しています。このサービスは、例えば電子メールで通知を送るように設定することができます。

通知は[Monitor - System Notifications](/monitor-notifications-system) ページから表示されます。

設定* ページは、メニューバーの ![wheel icon](assets/images/wheel.png) アイコンからアクセスできます。

以下の設定がログ通知サービスに適用されます。変更は直ちに有効になります。

## ログ通知サービスの設定

### 設定 *log_server_active*, Default： *false*。

JOC Cockpitでログ通知サービスを起動するように指定します。

### 設定： *log_server_port*、デフォルト： *4245*

ログ通知サービスがリッスンするUDPポートを指定します。

### 設定： *log_server_max_messages_per_second*、デフォルト： *1000*

ログ通知サービスが処理する1秒あたりの最大メッセージ数を指定します。

## 参照

### コンテキストヘルプ

-[Log Notification Service](/service-log-notification)
-[Monitor - System Notifications](/monitor-notifications-system)
-[Settings](/settings)

###Product Knowledge Base

-[JS7 - Log Notification Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Notification+Service)
-[JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)

