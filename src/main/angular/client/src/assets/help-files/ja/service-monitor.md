# モニターサービス

モニターサービスは、JS7製品の健全性を報告したり、ワークフロー実行中の問題を報告するために使用されます。Monitor ServiceはJOC Cockpitの*Monitor*サブビューに入力されます：

- JS7 製品の可用性をチェックし、[Monitor - Controller Availability](/monitor-availability-controller) と[Monitor - Agent Availability](/monitor-availability-agent) のサブビューに報告します。
- 製品の操作中に発生した警告やエラーについて、接続されたコントローラとエージェントをチェックします。結果は[Monitor - System Notifications](/monitor-notifications-system) サブビューに追加されます。
- 接続されたコントローラからのワークフロー実行結果とジョブ実行結果をチェックし、[Monitor - Order Notifications](/monitor-notifications-order) ビューに通知を追加します。

その結果、ワークフロー実行中に発生したエラーや警告は GUI の *Monitor* サブビューに表示され、[JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications) から転送することができます。JS7 製品の非同期性により、このタスクはバックグラウンドサービスで実行されます。

モニターサービスは、JOC コックピットの起動時に自動的に開始されます。ダッシュボード・ビューで、アクティブな JOC Cockpit インスタンスの矩形から *Restart Service - Monitor Service* 操作を提供して再起動できます。

<img src="dashboard-restart-monitor-service.png" alt="Restart Monitor Service" width="750" height="280" />

## 参考文献

### コンテキストヘルプ

-[Monitor - Agent Availability](/monitor-availability-agent)
-[Monitor - Controller Availability](/monitor-availability-controller)
-[Monitor - Order Notifications](/monitor-notifications-order)
-[Monitor - System Notifications](/monitor-notifications-system)

###Product Knowledge Base

-[JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor)
-[JS7 - Monitor Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor+Service)
-[JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications)

