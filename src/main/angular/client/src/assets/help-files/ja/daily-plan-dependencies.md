# 実行計画の依存関係

ワークフローの依存関係は、全日および特定の実行計画日に強制できます：

- ワークフロー1は月～金で実行。
- ワークフロー 2 は月～日に実行され、前回のワークフロー 1 の実行に依存します。
- 週末はワークフロー 1 は開始しません。ワークフロー 2 が週末に開始できるように、依存関係は *Schedulable Notice Boards* を使用して実行計画にマッピングされます： ワークフロー 1 のオーダーが発表されない場合、依存関係は無視されます。

## カレンダー

カレンダーウィジェットでは、依存関係が表示される実行計画の日付を選択できます。

- **薄赤色**：薄赤色**: オーダーを追加できない、終了した過去のプランの日付です。
- **緑色**：緑色**: オーダーを追加することができる、過去と未来のプランの日付です。

プラン日付の操作には以下が含まれます：

- **プランを開く**：プランを開く**: 新しいオーダーが追加された場合、自動的にプランが開きます。閉じたプランを再度開くことができます。
- **プランを閉じる**：オープンプランがクローズされ、オーダーを追加できなくなります。これは、過去のプランの日付に対して自動的に行われます。[Settings - Daily Plan](/settings-daily-plan) ページから関連設定を調整できます。ユーザーはオープンプランを早めにクローズして、それ以上オーダーが追加されないようにすることができます。

## 依存関係の表示

以下のオブジェクトが表示されます：

- **掲示ワークフロー**：お知らせを投稿するワークフローが左側に表示されます。
- **お知らせ**：お知らせ**：中央にはお知らせを作成する掲示板名が表示されます。
- **受信ワークフロー**：右側にはお知らせを受信・消費するワークフローが表示されます。

以下の関係が表示されます：

- **投稿ワークフロー**：受信ワークフロー**：1 つ以上の受信ワークフロー**が期待/消費する 1 つ以上の通知を作成します。
- **受信ワークフロー**：受信ワークフロー**：同一または異なる**投稿ワークフロー**からの1つ以上の通知を期待/消費します。

依存関係の履行状況は線で表示されます：

- **青字の線青色**の線： **ポスティングワークフロー**のオーダーが開始され、Noticeが作成される将来の時点のために、Noticeがアナウンスされています。
- **緑色の線**：依存関係は未解決で、Noticeはポストされましたが、まだすべての*受信ワークフロー*で処理されていません。
  - 緑色の**受信ワークフロー**：受信ワークフロー*のオーダーは開始されましたが、通知をチェックするワークフロー指示には進んでいません。
  - **受信ワークフローが青色**で表示されます：受信ワークフロー*のオーダーは、日中の遅い時点で開始されるスケジュールです。
- **グレーのライン**：依存関係が解消され、通知がポストされ、*受信ワークフロー*によって消費されま した。

## フィルター

フィルターにより、ワークフローや依存関係の表示を制限することができます：

- **通知済み**：つまり、オーダーはスケジュールされているが、まだ開始されておらず、通知も投稿されていないワークフローを表示します。通知が投稿されると、その通知は削除されます。
- **通知あり**：お知らせが投稿され、処理可能なワークフローが表示されます。ワークフローに「お知らせ」が消費されると、「お知らせ」は削除され、表示されなくなります。

両方のフィルターボタンが有効な場合、告知され投稿された「通知」は含まれますが、解決された依存関係や消費され存在しなくなった「通知」は除外されます。

両方のフィルターボタンが非アクティブの場合、すべてのワークフローと依存関係が表示されます。

## 参照

### コンテキストヘルプ

-[Configuration - Inventory - Notice Boards](/configuration-inventory-notice-boards)
-[Daily Plan](/daily-plan)
-[Resources - Notice Boards](/resources-notice-boards)
-[Settings - Daily Plan](/settings-daily-plan)

###Product Knowledge Base

-[JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)
-[JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards)
  -[JS7 - Global Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Global+Notice+Boards)
  -[JS7 - Schedulable Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedulable+Notice+Boards)
- [JS7 - Workflow Instructions - Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Dependencies)  
  -[JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction)
  -[JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction)
  -[JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction)

