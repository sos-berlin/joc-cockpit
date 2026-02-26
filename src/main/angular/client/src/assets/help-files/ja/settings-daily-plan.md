# 設定 - Daily Plan

以下の設定は[実行計画](/daily-plan) に適用されます。変更は即座に有効になります.

*設定* ページはメニューバーのホイールアイコンからアクセスできます。

## 実行計画設定

### 設定： *time_zone*, Default： *UTC*

[Daily Plan サービス](/service-daily-plan) 、実行計画の期間の開始時刻に適用されるタイムゾーンを指定します。日本時間では *Asia/Tokyo* を指定します。

### 設定： *period_begin*, Default： *00:00*

指定されたタイムゾーンにおける24時間の実行計画期間の開始有効時刻を指定します。

### 設定：*start_time*, Default： *period_beginの30分前*

指定されたタイムゾーンで日次実行計画を作成する開始時刻を指定します。この設定を行わないと、*period_begin* 設定で指定された時点の 30 分前に日次計画が実行されます。この設定では、23:00:00 などの時間値を指定できます。

### 設定： *days_ahead_plan*, Default： *7*

オーダーを生成し、*予定* ステータスで利用可能にする日数を指定します。*0* は、オーダーを生成しないことを示し、この機能を無効にします。

### 設定： *days_ahead_submit*, Default： *3*

*予定* された *オーダー* がコントローラに送信され、*登録* 状態で利用可能になる日数を指定します。*0* はオーダーを送信しないことを示し、この機能を無効にします。

### 設定： *submit_orders_individually*, Default： *false*

Daily Planサービスでは、デフォルトで1つのトランザクションからオーダーが送信され、オーダーの送信に失敗するとロールバックされます。この設定を有効にすると、オーダーは個別に送信され、他のオーダーの送信に失敗した場合にも独立して送信されます。 Daily Planサービスでは、オーダーを個別に送信するためにより多くの時間を要します。

### 設定 *age_of_plans_to_be_closed_automatically*, Default： *1*

実行計画がクローズされ、元の日付の[リソース - 通知ボード](/resources-notice-boards) の依存関係を解決するオーダーを追加できなくなる日数を指定します。

### 設定： *Projection_month_ahead*, Default： *6*

将来のオーダー計画を示す[実行計画 - プロジェクション](/daily-plan-projections) を計算する月数を指定します。

##参照

### コンテキストヘルプ

- [実行計画](/daily-plan)
- [実行計画 - プロジェクション](/daily-plan-projections)
- [Daily Plan サービス](/service-daily-plan)
- [リソース - 通知ボード](/resources-notice-boards)
- [設定](/settings)

###Product Knowledge Base

- [JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)

