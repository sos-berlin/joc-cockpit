# 実行計画サービス

[JS7 - Daily Plan Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan+Service) は、[Daily Plan](/daily-plan) のオーダーを作成し、コントローラに送信するために使用されます。このサービスはバックグラウンドで実行され、毎日、数日先のオーダーの計画と提出を行います。

実行計画サービスは、既存の[JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules) を実行し、指定された開始時間のオーダーを生成します。これは、オーダーの開始時刻を1回だけ指定するスケジュールと、周期的な開始時刻を指定するスケジュールの両方に適用されます。個々のオーダーは、サイクルの各開始時間ごとに作成されます。次のステップで、これらのオーダーは関連するコントローラに送信されます。

同様の機能は、ユーザーが操作する実行計画ビューでも利用できます。ただし、実行計画サービスはこのタスクを自動的に実行します。

日計 画サービスはその設定に基づいて開始され、ダッシュボードビューでアクティブな JOC コックピットインスタンスの矩形から *実行サービス - 日計 画サービス* 操作を提供して開始できます。日計 画サービスは1日に何回実行しても問題ありません。

<img src="dashboard-run-daily-plan-service.png" alt="Run Daily Plan Service" width="750" height="280" />

## 実行計画サービス設定

実行計画サービスの設定については、[Settings - Daily Plan](/settings-daily-plan) をご覧ください。

## 参考文献

### コンテキストヘルプ

-[Daily Plan](/daily-plan)
-[Settings - Daily Plan](/settings-daily-plan)

###Product Knowledge Base

-[JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)
-[JS7 - Daily Plan Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan+Service)
-[JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules)

