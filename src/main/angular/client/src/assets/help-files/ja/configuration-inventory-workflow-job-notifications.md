# コンフィギュレーション - インベントリ - ワークフロー - ジョブ通知

ワークフロー*パネルは一連の指示からワークフローをデザインすることができます。ユーザーは*ツールバー*から*ジョブ指示*をワークフローの位置にドラッグ＆ドロップすることができます。

GUIにはジョブ詳細を指定するためのタブがいくつかあります。5番目のタブは*通知*のために提供されます。

## 通知

### グローバル通知

グローバル通知は[Notifications](/notifications) から設定され、その設定で指定されたすべてのワークフローとジョブに適用されます。

通知は異なるチャンネルを使用することができます：

- [Monitor - Order Notifications](/monitor-notifications-order) ビューと[Monitor - System Notifications](/monitor-notifications-system) ビューで通知を利用可能にします。
- 電子メールによる通知の送信
- シェルコマンドの実行例えば、サードパーティのシステムモニタツールは頻繁にコマンドラインインターフェイスを提供し、ジョブ実行の成功や失敗に関するイベントからシステムモニタにフィードするようにパラメータを設定することができます。

### ジョブ関連の通知

ジョブごとの特定の通知は、以下の設定からグローバル通知を上書きします：

- **Mail on** は電子メールが送信される1つ以上のイベントを指定します。
  - *ERROR*はジョブが失敗した場合に通知をトリガーします。
  - *WARNING*は警告リターンコードを示すジョブが成功した場合に通知をトリガーします。
  - *SUCCESS*は警告の有無に関わらず、ジョブが成功した場合に通知をトリガーします。
- **Mail To**は電子メールの受信者のリストを指定します。コンマまたはセミコロンを使用して、複数の受信者を指定できます。宛先が指定されていない場合、グローバル通知設定に優先して通知は送信されません。
- **Mail Cc** は、カーボンコピーを受け取る電子メール受信者のリストを指定します。カンマまたはセミコロンを使用して、複数の受信者を指定できます。
- **Bcc** は、ブラインドコピーを受信する電子メール受信者のリストを指定します。カンマまたはセミコロンを使用して、複数の受信者を指定できます。

## 参考文献

### コンテキストヘルプ

-[Configuration - Inventory - Workflows](/configuration-inventory-workflows)
  -[Configuration - Inventory - Workflows - Job Options](/configuration-inventory-workflows-job-options)
  -[Configuration - Inventory - Workflows - Job Properties](/configuration-inventory-workflows-job-properties)
  -[Configuration - Inventory - Workflows - Job Node Properties](/configuration-inventory-workflows-job-node-properties)
  -[Configuration - Inventory - Workflows - Job Tags](/configuration-inventory-workflows-job-tags)
-[Monitor - Order Notifications](/monitor-notifications-order)
-[Monitor - System Notifications](/monitor-notifications-system)
-[Notifications](/notifications)

###Product Knowledge Base

-[JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)

