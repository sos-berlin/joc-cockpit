# コンフィギュレーション - インベントリ - ワークフロー - ジョブタグ

ワークフロー*パネルは一連の指示からワークフローをデザインします。ユーザーは*ツールバー*から*ジョブ指示*をワークフローの位置にドラッグ＆ドロップすることができます。

GUIにはジョブ詳細を指定するためのタブがいくつかあります。3つ目のタブは*ジョブタグ*用です。

## タグ

ジョブにはいくつでもタグをつけることができます。タグは[Workflows](/workflows) で表示され、オプションで通知にも含まれます。詳細は[JS7 - Tagging Jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+Tagging+-+Jobs) を参照してください。

- **タグ**ではタグの追加と削除ができます。タグは既存のタグリストから選択できます。タグ名を入力するとタグが作成されます。

## タググループ

タググループは共通のグループを共有するタグを整理するために使われます。例えば、ジョブの重要度に応じて、チケットの優先度 P1, P2, P3, P4 のどれかが割り当てられるとします。ユーザは、*TicketPriority:P1*, *TicketPriority:P2* などのように、タググループとタグをコロンで区切って入力することができます。ジョブのチケットプライオリティは、障害が発生したときに通知が作成され、チケットシステムに反映されるときに利用できます。

- **Tag-Group:Tag**は指定された Tag Group に関連する Tag を追加または削除することができます。タググループが存在しない場合は作成されます。

##参照

### コンテキストヘルプ

-[Configuration - Inventory - Workflows](/configuration-inventory-workflows)
  -[Configuration - Inventory - Workflows - Job Options](/configuration-inventory-workflows-job-options)
  -[Configuration - Inventory - Workflows - Job Properties](/configuration-inventory-workflows-job-properties)
  -[Configuration - Inventory - Workflows - Job Node Properties](/configuration-inventory-workflows-job-node-properties)
  -[Configuration - Inventory - Workflows - Job Notifications](/configuration-inventory-workflows-job-notifications)
-[Tags](/tags)

###Product Knowledge Base

-[JS7 - Tagging](https://kb.sos-berlin.com/display/JS7/JS7+-+Tagging)
  -[JS7 - Tagging Jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+Tagging+-+Jobs)
  -[JS7 - Tagging Orders](https://kb.sos-berlin.com/display/JS7/JS7+-+Tagging+-+Orders)
  -[JS7 - Tagging Workflows](https://kb.sos-berlin.com/display/JS7/JS7+-+Tagging+-+Workflows)

