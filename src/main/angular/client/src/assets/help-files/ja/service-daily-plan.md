# Dailyplanサービス

[JS7 - Daily Plan Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan+Service) は、[実行計画](/daily-plan) のオーダーを作成し、コントローラーに送信するために使用されます。このサービスはバックグラウンドで実行され、日次で数日先のオーダーの計画と提出を行います。

Dailyplanサービスは、既存の[JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules) を実行し、指定された開始時間のオーダーを生成します。これは、オーダーの開始時刻を1回だけ指定するスケジュールと、周期的な開始時刻を指定するスケジュールの両方に適用されます。個々のオーダーは、サイクルの各開始時間ごとに作成されます。次のステップで、これらのオーダーは関連するコントローラーに送信されます。

同様の機能は、ユーザーが操作する実行計画ビューでも利用できます。ただし、Dailyplanサービスはこのタスクを自動的に実行します。

 Dailyplanサービスはその設定に基づいて開始され、ダッシュボード画面のアクティブな JOCコックピットのメニューの *デイリープランサービス* から開始できます。デイリープランサービスは1日に何回実行しても問題ありません。

<img src="dashboard-run-daily-plan-service.png" alt="Run Daily Plan Service" width="750" height="280" />

## Dailyplanサービス設定

Dailyplanサービスの設定については、[設定 - Daily Plan](/settings-daily-plan) をご覧ください。

## 参照

### コンテキストヘルプ

- [実行計画](/daily-plan)
- [設定 - Daily Plan](/settings-daily-plan)

###Product Knowledge Base

- [JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)
- [JS7 - Daily Plan Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan+Service)
- [JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules)

