# ジョブ定義 - インベントリ - ワークフロー - ジョブタグ

*ワークフロー* 画面では、ワークフロー命令を処理する有向非巡回グラフ(DAG)を作成できます。
ユーザーは*ツールバーパネル* から *ジョブ命令* をワークフローの位置にドラッグ＆ドロップすることができます。
ジョブをクリックすると、*ジョブプロパティ* が表示され、ジョブ詳細を指定するためのタブがいくつかあります。3つ目のタブが *ジョブタグ* です。

## ジョブタグ

ジョブにはいくつでもタグをつけることができます。タグは[ワークフロー](/workflows) で表示され、オプションで通知にも含まれます。詳細は[JS7 - Tagging Jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+Tagging+-+Jobs) を参照してください。

- **タグ** はタグの追加と削除ができます。タグは既存のタグリストから選択できます。タグ名を入力するとタグが作成されます。

## タググループ

*タググループ* は、共通のグループを共有するタグを整理するために使われます。例えば、ジョブの重要度に応じて、チケットの優先度 P1, P2, P3, P4 のどれかが割り当てられるとします。ユーザは、*チケット優先度:P1*, *チケット優先度:P2* などのように、タググループとタグをコロンで区切って入力することができます。ジョブのチケット優先度は、障害が発生したときに通知が作成され、チケットシステムに反映されるときに利用できます。

- **Tag-Group:Tag** は、指定された *タググループ*  に関連するタグを追加または削除することができます。タググループが存在しない場合は作成されます。

##参照

### コンテキストヘルプ

- [ジョブ定義 - インベントリー - ワークフロー](/configuration-inventory-workflows)
  - [ジョブ定義 - インベントリー - ワークフロー - ジョブオプション](/configuration-inventory-workflows-job-options)
  - [ジョブ定義 - インベントリー - ワークフロー - ジョブプロパティ](/configuration-inventory-workflows-job-properties)
  - [ジョブ定義 - インベントリー - ワークフロー - ジョブノードプロパティ](/configuration-inventory-workflows-job-node-properties)
  - [ジョブ定義 - インベントリー - ワークフロー - ジョブ通知](/configuration-inventory-workflows-job-notifications)
- [タグ](/tags)

###Product Knowledge Base

- [JS7 - Tagging](https://kb.sos-berlin.com/display/JS7/JS7+-+Tagging)
  - [JS7 - Tagging Jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+Tagging+-+Jobs)
  - [JS7 - Tagging Orders](https://kb.sos-berlin.com/display/JS7/JS7+-+Tagging+-+Orders)
  - [JS7 - Tagging Workflows](https://kb.sos-berlin.com/display/JS7/JS7+-+Tagging+-+Workflows)

