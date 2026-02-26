# ジョブ定義 - インベントリー - ワークフロー - ノードプロパティ

*ワークフロー* 画面では、ワークフロー命令を処理する有向非巡回グラフ(DAG)を作成できます。
ジョブをクリックすると、ジョブの詳細を指定するためのタブがいくつか表示されます。4番目のタブは *ノードプロパティ* です。

## ノードプロパティ

ノードとはワークフローにおけるジョブの位置です。同じジョブが同じワークフロー内で何度も発生する場合、同じ *ジョブ名称* が使用されますが、異なる *ラベル* が使用されます。*ラベル* はワークフロー内のノードを識別します。

同じジョブがワークフロー内で異なるパラメータセットで使用される場合、*ノードプロパティ* を使用することができます。ノードプロパティはノード変数を作成するキーと値のペアを提供します。

- **名称** はノード変数の名前を指定します。
  - 構文 *$myNodeVariable* を使用してノード変数の *名称* を環境変数に割り当てることにより、Shell ジョブで使用できます。
  - 構文 *$myNodeVariable* を使用してノード変数の *名称* をジョブ変数に割り当てることにより、JVM ジョブで使用できます。
- **値** は、文字列、数値、および *$myWorkflowVariable* のようなワークフロー変数への参照から入力を受け付けます。

ノード変数名は大文字と小文字を区別します。

## 参照

### コンテキストヘルプ

- [ジョブ定義 - インベントリー - ワークフロー](/configuration-inventory-workflows)
  - [ジョブ定義 - インベントリー - ワークフロー - ジョブオプション](/configuration-inventory-workflows-job-options)
  - [ジョブ定義 - インベントリー - ワークフロー - プロパティ](/configuration-inventory-workflows-job-properties)
  - [ジョブ定義 - インベントリー - ワークフロー - 通知](/configuration-inventory-workflows-job-notifications)
  - [ジョブ定義 - インベントリー - ワークフロー - ジョブタグ](/configuration-inventory-workflows-job-tags)

###Product Knowledge Base

- [JS7 - Assignment of Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Assignment+of+Variables)
- [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables)
- [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)
- [JS7 - Order Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+Variables)

