# オブジェクトの命名規則

オブジェクト名は、以下のように多くの場所で指定されます：

- ワークフロー、ジョブ、変数、掲示板、リソースロック、ファイルオーダーソース、ジョブリソース、フォルダ、
- カレンダー、スケジュール、スクリプトインクルード、ジョブテンプレート、レポート。

JS7はオブジェクトの命名規則を強制しません。ユーザーは自由に命名規則を選択することができます：

- キャメルケーススタイル *loadDataWarehouseDaily* のように
- のようなケバブスタイル *ロードデータウェアハウスデイリー
- のようなミックススタイル： *DataWarehouse-Load-Daily*（データウェアハウス・ロード・デイリー

## 文字セット

JS7ではオブジェクト名にUnicode文字を使用することができます。

### オブジェクト名

オブジェクト名にはいくつかの制限があります：

#### 命名規則

- オブジェクト名については、以下の命名規則を考慮する必要があります： [Java Identifiers](https://docs.oracle.com/javase/specs/jls/se7/html/jls-3.html#jls-3.8)
- 正規表現による制御文字は使用できません。
- 句読点は使用できません。ただし、正規表現ではドット'.'、アンダースコア'_'、ダッシュ'-'は使用可能：\[^\\\\x20-\\\\x2C\\\\x2F\\\\x3A-\\\\x40\\\\x5B-\\\\x5E\\\\x60\\\\x7B-\\\\x7E\\\\xA0-\\\\xBF\\\\xD7\\\\xF7\]
  - ドット：先頭文字としても末尾文字としても使用できず、2つのドットを連続して使用することもできません。
  - ダッシュ：先頭または末尾の文字として使用できません。
  - 括弧は使用できません。
- 半角文字は使用できません。[半角と全角の書式](https://en.wikipedia.org/wiki/Halfwidth_and_Fullwidth_Forms_(Unicode_block))を参照してください。
- 空白文字は使用できません。
- オブジェクト名は数字で始めることができます。
- Java予約キーワードは使用できません：
  - *抽象、continue、for、new、switch、assert、default、goto、package、synchronized、boolean、do、if、private、this、break、double、implements、protected、throw、byte、else、import、public、throws、case、enum、instanceof、return、transient、catch、extends、int、short、try、char、final、interface、static、void、class、finally、long、strictfp、volatile、const、float、native、super、while*。
  - 例：予約キーワード *switch* の使用は禁止されていますが、*myswitch* の使用は許可されています。

#### 例

- 日本語などの国語文字：
  - *こんにちは世界
- ドット、ダッシュ、アンダースコアの使用：
  - *セイ.ハロー
  - *こんにちは
  - *say_hello*

### ラベル

ジョブや他のワークフロー命令の位置を示すために使用される *ラベル* には、より緩やかなルールが適用されます：

- ラベルは数字、文字、_で始めることができます。
- ラベルには $, _, -, #, :, .を含めることができます！
- 例えば、引用符なし、スペースなし、[, ], {, }, /,  \, =, +などです。

### オブジェクト名の一意性

JS7 のオブジェクト名は、ワークフローごと、ワークフロー内のジョブごと、リソースロックごと など、オブジェクトタイプごとに一意です。

- ユーザーは大文字/小文字のスペルでオブジェクト名を追加できます。
- オブジェクト名はJOCコックピットGUIによってユーザーが入力したとおりに保存されます。
- nvarchar*データ型の基礎となるDBMSでサポートされていない場合は、同じオブジェクト名を異なるスペルで追加することはできません。たとえば、既存のオブジェクト名 *myLock* があるとすると、MySQL DBMS を使用している場合は *mylock* という名前の新しいオブジェクトを作成できません。

### オブジェクト名の長さ

オブジェクト名の最大長は以下のとおりです：

- 基本的に、オブジェクト名は最大 255 文字の Unicode 文字を使用できます。
- 以下の制限が適用されます：
  - 通常、オブジェクトはフォルダ内に配置されます。フォルダ階層とオブジェクト名の全体の長さは、255 文字を超えてはなりません。
  - [JS7 - Fork-Join Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fork-Join+Instruction) 内の分岐は 10 文字までに制限されています。
  - 分岐は最大 15 レベルまで入れ子にすることができます。

## 参考文献

- [半角・全角フォーム](https://en.wikipedia.org/wiki/Halfwidth_and_Fullwidth_Forms_(Unicode_block))
- [Java識別子](https://docs.oracle.com/javase/specs/jls/se7/html/jls-3.html#jls-3.8)
-[JS7 - Fork-Join Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fork-Join+Instruction)
-[JS7 - Object Naming Rules](https://kb.sos-berlin.com/display/JS7/JS7+-+Object+Naming+Rules)

