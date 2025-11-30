# 設定 - キオスク

JOCコックピットは[JS7 - Kiosk Mode](https://kb.sos-berlin.com/display/JS7/JS7+-+Kiosk+Mode) で操作できます。

- 無人操作
- あらかじめ設定された期間、各ページを表示します、
- ジョブの完了など、新しいイベントが発生した場合のページの更新。

設定*ページは、メニューバーの ![wheel icon](assets/images/wheel.png) アイコンからアクセスできます。

## キオスク設定

### 設定： *kiosk_role*, Default： *キオスク

キオスク・モードでの操作に使用するアカウントに割り当てられるロールの名前を指定します：

- ロールはユーザーが作成する必要があります。
- ロールには読み取り専用権限を含める必要があります。
- ロールは、アカウントが割り当てられた唯一のものです。

### 設定 *view_dashboard_duration*, Default： *20*

ダッシュボードを表示する時間を秒単位で指定します。

ユーザーは、キオスク・モードに使用するアカウントのダッシュボード・レイアウトを変更できます。

- 値 0 を指定すると、ビューは表示されません。
- 値 &gt;10 は、希望する期間を指定します。

### 設定 *view_monitor\_order\_notification *, Default： *15*

[Monitor - Order Notifications](/monitor-notifications-order) ビューを表示する時間を秒単位で指定します。

- 値0を指定すると、ビューは表示されません。
- 値 &gt;10 を指定すると、希望する期間が表示されます。

### 設定： *view_monitor appendix*, Default： *15*

[Monitor - System Notifications](/monitor-notifications-system) ビューを表示する時間を秒単位で指定します。

- 値0を指定すると、ビューは表示されません。
- 値 &gt;10 を指定すると、希望する期間が表示されます。

### 設定： *view_history\_tasks_duration*, Default： *30*

[Task History](/history-tasks) ビューを表示する時間を秒単位で指定します。

- 値0は、ビューを表示しないことを指定します。
- 値 &gt;10 を指定すると、希望する期間が表示されます。

### 設定： *view_history_orders_duration*, Default： *0*

[Order History](/history-orders) ビューを表示する期間を秒単位で指定します。

値0は、ビューを表示しないことを指定します。
値 &gt;10 を指定すると、希望する期間が表示されます。

## 参考文献

### コンテキストヘルプ

-[Monitor - Order Notifications](/monitor-notifications-order)
-[Monitor - System Notifications](/monitor-notifications-system)
-[Order History](/history-orders)
-[Task History](/history-tasks)
-[Settings](/settings)

###Product Knowledge Base

-[JS7 - Kiosk Mode](https://kb.sos-berlin.com/display/JS7/JS7+-+Kiosk+Mode)
-[JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)

