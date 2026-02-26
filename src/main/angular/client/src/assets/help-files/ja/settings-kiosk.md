# 設定 - Kiosk

JOCコックピットは[JS7 - Kiosk Mode](https://kb.sos-berlin.com/display/JS7/JS7+-+Kiosk+Mode) で操作できます。

- 無人操作
- あらかじめ設定された時間で各ページを表示します、
- ジョブの完了など、新しいイベントが発生した場合のページを更新します。

*設定* ページは、メニューバーのホイールアイコンからアクセスできます。

## Kiosk設定

### 設定： *kiosk_role*, Default： *kiosk*

Kioskモードでの操作に使用するアカウントに割り当てられるロールの名前を指定します：

- ロールはユーザーが作成する必要があります。
- ロールには読み取り専用権限を含める必要があります。
- ロールは、アカウントが割り当てられた唯一のものです。

### 設定： *view_dashboard_duration*, Default： *20*

ダッシュボードを表示する時間を秒単位で指定します。

ユーザーは、kioskモードに使用するアカウントのダッシュボード・レイアウトを変更できます。

- 値 0 を指定すると、画面は表示されません。
- 値 >10 は、希望する時間を指定します。

### 設定： *view_monitor\_order\_notification *, Default： *15*

[モニター - オーダー通知](/monitor-notifications-order) 画面を表示する時間を秒単位で指定します。

- 値 0を指定すると、画面は表示されません。
- 値 >10 は、希望する時間を指定します。

### 設定： *view_monitor appendix*, Default： *15*

[モニター - システム通知](/monitor-notifications-system) 画面を表示する時間を秒単位で指定します。

- 値 0を指定すると、画面は表示されません。
- 値 >10 は、希望する時間を指定します。

### 設定： *view_history\_tasks_duration*, Default： *30*

[タスク履歴](/history-tasks) 画面を表示する時間を秒単位で指定します。

- 値 0を指定すると、画面は表示されません。
- 値 >10 は、希望する時間を指定します。

### 設定： *view_history_orders_duration*, Default： *0*

[オーダー履歴](/history-orders) 画面を表示する時間を秒単位で指定します。

- 値 0を指定すると、画面は表示されません。
- 値 >10 は、希望する時間を指定します。

## 参照

### コンテキストヘルプ

- [モニター - オーダー通知](/monitor-notifications-order)
- [モニター - システム通知](/monitor-notifications-system)
- [オーダー履歴](/history-orders)
- [タスク履歴](/history-tasks)
- [設定](/settings)

###Product Knowledge Base

- [JS7 - Kiosk Mode](https://kb.sos-berlin.com/display/JS7/JS7+-+Kiosk+Mode)
- [JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)

