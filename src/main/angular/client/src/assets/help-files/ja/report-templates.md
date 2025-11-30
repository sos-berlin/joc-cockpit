# レポートのテンプレート

## レポートテンプレート失敗した実行回数が最も多い/少ないワークフロー上位n個

このレポートテンプレートは、失敗したワークフローの実行回数をカウントします：

- 例えば、オーダーがキャンセルされた場合や、[JS7 - Finish Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Finish+Instruction) が使用された場合などです。
- ワークフローの実行は、ジョブが失敗したからといって失敗したとはみなされません。例えば、[JS7 - Retry Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Retry+Instruction) が使用された場合、そのジョブの再試行は成功します。その代わりに、オーダーの履歴ステータスが考慮されます。

## レポートテンプレート失敗した回数が最も多い/少ない上位n個のジョブ

このレポートテンプレートは、失敗したジョブの実行回数を数えます。

- シェルジョブの実行はジョブの終了コードと、オプションで stderr チャンネルへの出力に基づいて失敗したとみなされます。
- JVM ジョブの実行は、例外を保持できるジョブの結果に基づいて失敗したとみなされます。

## レポートテンプレートジョブの並列実行数が最も多い/少ない上位 n エージェント

レポートテンプレートは、エージェントによるジョブの並列実行をカウントします。以下の場合、Job1 は Job2 と並列であるとみなされます。

- ジョブ2が開始した後、ジョブ2が終了する前にジョブ1が開始した場合。
- ジョブ1がジョブ2の開始後、ジョブ2が終了する前に終了した場合。

## レポートテンプレート：クリティカリティの高いジョブのうち、実行に失敗した回数が最も多い/少ない上位 n 個のジョブ

このレポートテンプレートは、クリティカルなジョブの失敗をカウントします。クリティカリティはジョブ属性です。

カウントはレポートテンプレートと同様に行われます：Top n Jobs with highest/lowest number of failed executions.

## Report Template: Top n Workflow with highest/lowest number of failed executions for cancelled Orders ## レポートテンプレート: キャンセルされたオーダーで、最も実行に失敗した回数が多い/少ないワークフロー上位 n 件。

このレポートテンプレートは、キャンセルされたオーダーによるワークフローの実行失敗をカウント します。

キャンセル*操作は、ユーザーの操作によってオーダーに適用されます。

## レポートテンプレート実行時間の必要性が最も高い/低いワークフロー上位n件

レポートテンプレートでは、成功したワークフローの実行時間が考慮されます。失敗したワークフローは考慮されません。

## レポートテンプレート実行時間の必要性が最も高い／低い上位 n 個のジョブ

レポートテンプレートは成功したジョブの実行時間を考慮します。失敗したジョブは考慮されません。

## レポートテンプレートジョブの実行回数が最も多い/少ない上位 n 期間

レポートテンプレートはレポート期間をステップに分割します。ステップの期間は[JS7 - Reports - Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports+-+Configuration) の *Step Duration* 設定によって決定されます。 次のステップの開始はレポート構成の "Step Overlap" 設定によって決定されます。

例 

- ステップの期間5m
- ステップの重なり: 2m
  - 00:00-00:05
  - 00:02-00:07
  - 00:04-00:09

実行中のジョブ数はステップごとにカウントされます。

## レポートテンプレートワークフローの実行回数が最も多い/少ない上位n期間

レポートテンプレートでは、*レポート期間*をステップに分割します。ステップの期間は[JS7 - Reports - Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports+-+Configuration) の *ステップ期間* 設定によって決定されます。 次のステップの開始はレポート構成の *ステップ重複* 設定によって決定されます。

実行中のオーダーの数はステップごとにカウントされます。

## レポートテンプレート実行回数が最も多い/少ない上位n件のジョブ

このレポートテンプレートでは、正常に完了したジョブがカウントされます。失敗したジョブは考慮されません。

失敗の原因については、レポートテンプレートを参照してください：Top n Jobs with highest/lowest number of failed executions を参照してください。

## Report Template：成功した実行回数が最も多い/少ないワークフロー上位 n 個

レポートテンプレートは、正常に完了したワークフローをカウントします。失敗したワークフローは考慮されません。

ワークフロー失敗の理由については、※レポートテンプレート をご参照ください：失敗したワークフローの数が最も多い/少ないワークフロー上位 n 件* を参照してください。

## 参考

### コンテキストヘルプ

-[Configuration - Inventory - Reports](/configuration-inventory-reports)
-[Reports](/reports)
-[Report - Creation](/report-creation)
-[Report - Run History](/report-run-history)

###Product Knowledge Base

- レポート
  -[JS7 - Reports - Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports+-+Configuration)
  -[JS7 - Reports - Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports+-+Templates)
- ワークフロー指示書
  -[JS7 - Finish Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Finish+Instruction)
  -[JS7 - Retry Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Retry+Instruction)

