# 構成 - インベントリ - ワークフロー - ジョブノードプロパティ

ワークフロー*パネルは一連の指示からワークフローをデザインします。ユーザーは*ツールバー*から*ジョブ指示*をワークフローの位置にドラッグ＆ドロップすることができます。

GUIにはジョブ詳細を指定するためのタブがいくつかあります。4番目のタブは*ノードプロパティ*です。

## ノードプロパティ

ノードとはワークフローにおけるジョブの位置です。同じジョブが同じワークフロー内で何度も発生する場合、同じ *ジョブ名* が使用されますが、異なる *ラベル* が使用されます。ラベル*はワークフロー内のノードを識別します。

同じジョブがワークフロー内で異なるパラメータセットで使用される場合、*ノードプロパティ*を使用することができます。ノードプロパティはノード変数を作成するキーと値のペアを提供します。

- **Name**はノード変数の名前を指定します。
  - 構文 *$myNodeVariable* を使用してノード変数の *Name* を環境変数に割り当てることにより、シェル・ジョブで使用できます。
  - 構文 *$myNodeVariable* を使用してノード変数の *Name* をジョブ変数に割り当てることにより、JVM ジョブで使用できます。
- **値** は、文字列、数値、および *$myWorkflowVariable* のようなワークフロー変数への参照から入力を受け付けます。

ノード変数名は大文字と小文字を区別します。

## 参照

### コンテキストヘルプ

-[Configuration - Inventory - Workflows](/configuration-inventory-workflows)
  -[Configuration - Inventory - Workflows - Job Options](/configuration-inventory-workflows-job-options)
  -[Configuration - Inventory - Workflows - Job Properties](/configuration-inventory-workflows-job-properties)
  -[Configuration - Inventory - Workflows - Job Notifications](/configuration-inventory-workflows-job-notifications)
  -[Configuration - Inventory - Workflows - Job Tags](/configuration-inventory-workflows-job-tags)

###Product Knowledge Base

-[JS7 - Assignment of Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Assignment+of+Variables)
-[JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables)
-[JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)
-[JS7 - Order Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+Variables)

