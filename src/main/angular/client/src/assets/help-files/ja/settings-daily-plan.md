# 設定 - 実行計画

以下の設定は[Daily Plan](/daily-plan) に適用されます. 変更は即座に有効になります.

設定*ページはメニューバーの ![wheel icon](assets/images/wheel.png) アイコンからアクセスできます。

## 実行計画設定

### 設定： *time_zone*, デフォルト： *UTC

[Daily Plan Service](/service-daily-plan) 、実行計画の期間の開始時刻に適用されるタイムゾーンを指定します。

### 設定： *period_begin*、デフォルト： *00:00*

指定されたタイムゾーンにおける24時間の実行計画期間の開始を指定します。

### 設定 *start_time*, デフォルト： *期間の30分前

指定されたタイムゾーンで日次実行計画を実行する開始時刻を指定します。この設定を行わないと、*period_begin* 設定で指定された時点の 30 分前に日次計画が実行されます。この設定では、23:00:00 などの時間値を指定できます。

### 設定 *days_ahead\_plan*、デフォルト： *7*

オーダーを生成し、*planned*ステータスで利用可能にする日数を指定します。0*値は、オーダーを生成しないことを示し、この機能を無効にします。

### 設定： *days_ahead_submit*、デフォルト： *3*

計画*された*オーダーがコントローラに送信され、*submitted*状態で利用可能になる日数を指定します。0*値はオーダーを送信しないことを示し、この機能を無効にします。

### 設定 *submit_orders_individually*, Default： *false*。

実行計画サービスでは、デフォルトで1つのトランザクションからオーダーが送信され、オーダーの送信に失敗するとロールバックされます。この設定を有効にすると、オーダーは個別に送信され、他のオーダーの送信に失敗した場合にも独立して送信されます。実行計画サービスでは、オーダーを個別に送信するためにより多くの時間を要します。

### 設定 *age_of_plans\_to_be_closed\_automatically*, Default： *1*

実行計画がクローズされ、元の日付の[Resources - Notice Boards](/resources-notice-boards) の依存関係を解決するオーダーを追加できなくなる日数を指定します。

### 設定： *Projection_month_ahead*、デフォルト： *6*

将来のオーダー執行を示す[Daily Plan - Projections](/daily-plan-projections) を計算する月数を指定します。

##参照

### コンテキストヘルプ

-[Daily Plan](/daily-plan)
-[Daily Plan - Projections](/daily-plan-projections)
-[Daily Plan Service](/service-daily-plan)
-[Resources - Notice Boards](/resources-notice-boards)
-[Settings](/settings)

###Product Knowledge Base

-[JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)

