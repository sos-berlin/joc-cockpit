# モニターサービス

モニターサービスは、JS7製品の健全性を報告したり、ワークフロー実行中の問題を報告するために使用されます。モニターサービスはJOCコックピットの*モニター* 画面に表示されます：

- JS7 製品の可用性をチェックし、[モニター - コントローラーモニター](/monitor-availability-controller) と[モニター - エージェントモニター](/monitor-availability-agent) ビューに表示します。
- JS7 製品の操作中に発生した警告やエラーについて、接続されたコントローラとエージェントをチェックします。結果は[モニター - システム通知](/monitor-notifications-system) ビューに表示します。
- 接続されているコントローラからのワークフロー実行結果とジョブ実行結果をチェックし、[モニター - オーダー通知](/monitor-notifications-order) ビューに通知を表示します。

また、ワークフロー実行中に発生したエラーや警告は GUI の *モニター* 画面に表示され、[JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications) から転送することができます。JS7 製品の非同期性により、このタスクはバックグラウンドサービスで実行されます。

モニターサービスは、JOC コックピットの起動時に自動的に開始されます。ダッシュボード画面で、アクティブな JOCコックピット インスタンスの枠から *サービス再起動 - モニターサービス* メニューから再起動できます。

<img src="dashboard-restart-monitor-service.png" alt="Restart Monitor Service" width="750" height="280" />

## 参照

### コンテキストヘルプ

- [モニター - エージェントモニター](/monitor-availability-agent)
- [モニター - コントローラーモニター](/monitor-availability-controller)
- [モニター - オーダー通知](/monitor-notifications-order)
- [モニター - システム通知](/monitor-notifications-system)

###Product Knowledge Base

- [JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor)
- [JS7 - Monitor Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor+Service)
- [JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications)

