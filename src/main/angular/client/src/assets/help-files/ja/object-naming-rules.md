# オブジェクト命名規則

オブジェクト名は以下の各要素に対して複数の箇所で指定可能です：

- ワークフロー、ジョブ、変数、通知ボード、リソースロック、ファイルオーダーソース、ジョブリソース、フォルダー
- カレンダー、スケジュール、スクリプトインクルード、ジョブテンプレート、レポート

JS7ではオブジェクト名の命名規則を強制しません。ユーザーは任意の命名規則を自由に選択できます。例えばジョブ名に関しては以下のスタイルが使用可能です：

- キャメルケース形式（例：*loadDataWarehouseDaily*）
- ケバブケース形式（例：*load-data-warehouse-daily*）
- 混合スタイル（例：*DataWarehouse-Load-Daily*）

## 使用可能文字セット

JS7ではオブジェクト名にUnicode文字を使用することができます。

### オブジェクト名の制約事項

オブジェクト名には以下の制限が適用されます：

#### 命名規則

- オブジェクト名の命名には以下の規則を遵守する必要があります：[Java識別子命名規則](https://docs.oracle.com/javase/specs/jls/se7/html/jls-3.html#jls-3.8)
- 正規表現 \[^\\\\x00-\\\\x1F\\\\x7F\\\\x80-\\\\x9F\]で定義される制御文字は使用できません
- 句読点文字の使用は禁止されています。ただし、ドット '.'、アンダースコア '_'、ハイフン '-' については、正規表現 \[^\\\\x20-\\\\x2C\\\\x2F\\\\x3A-\\\\x40\\\\x5B-\\\\x5E\\\\x60\\\\x7B-\\\\x7E\\\\xA0-\\\\xBF\\\\xD7\\\\xF7\] で許可されています
  - ドット: 先頭または末尾の文字として使用することはできず、連続した2つのドットも許可されません
  - ハイフン: 先頭または末尾の文字として使用することはできず、連続した2つのハイフンも許可されません
  - 括弧類は使用できません \[({})\]
- 半角文字の使用は禁止されています。詳細は [Halfwidth and Fullwidth Forms](https://en.wikipedia.org/wiki/Halfwidth_and_Fullwidth_Forms_(Unicode_block)) を参照してください
- スペースの使用は禁止されています
- オブジェクト名は数字で開始することができます
- Javaの予約キーワードの使用は禁止されています：
  - *abstract、continue、for、new、switch、assert、default、goto、package、synchronized、boolean、do、if、private、this、break、double、implements、protected、throw、byte、else、import、public、throws、case、enum、instanceof、return、transient、catch、extends、int、short、try、char、final、interface、static、void、class、finally、long、strictfp、volatile、const、float、native、super、while*
  - 例: 予約キーワード *switch* の使用は許可されませんが、*myswitch* のような名前は許可されます

#### 使用例

- 日本語などの各国言語文字の使用例:
  - *こんにちは世界*
- ドット、ハイフン、アンダースコアの使用例:
  - *Say.Hello*
  - *Say-Hello*
  - *say_hello*

### ラベル

ジョブやその他のワークフロー命令の位置を示すために使用される *ラベル* に適用されるより緩やかな規則は以下の通りです：

- ラベルは数字、文字、アンダースコア(_)で開始可能
- ラベルには$、_、-、#、:、!を含めることが可能
- オブジェクト名で許可されていない要素はラベルにも使用できません（例：引用符、スペース、［、］、{、}、/、\、=、+など）

### オブジェクト名の一意性

JS7におけるオブジェクト名は、オブジェクトタイプごとに一意となります：具体的には、ワークフロー単位、ワークフロー内の各ジョブ単位、リソースロック単位などで一意性が保証されます。

- ユーザーは大文字/小文字の区別を含めてオブジェクト名を登録可能
- JOCコックピットGUIは、ユーザーが入力した通りの正確な形式でオブジェクト名を保持します
- 使用するDBMSが *nvarchar* データ型をサポートしていない場合、ユーザーは同じオブジェクト名を異なる綴りで登録することはできません。例えば、既存のオブジェクト名が *myLock* の 場合、MySQL DBMSを使用している場合、*mylock* という名前の新しいオブジェクトは作成できません

### オブジェクト名の最大長

オブジェクト名の最大長は以下の通りです：

- 基本的にオブジェクト名は最大255文字のUnicode文字を使用できます
- 以下の制限が適用されます：
  - オブジェクトは通常フォルダー内に配置されます：フォルダー階層全体とオブジェクト名の合計長は255文字を超えてはなりません
  - [JS7 - Fork-Join 命令](https://kb.sos-berlin.com/display/JS7/JS7+-+Fork-Join+Instruction)内の分岐名は10文字までに制限されます
  - 分岐は最大15階層までネスト可能です

## 参照

- [Halfwidth and Fullwidth Forms](https://en.wikipedia.org/wiki/Halfwidth_and_Fullwidth_Forms_(Unicode_block))
- [Java Identifiers](https://docs.oracle.com/javase/specs/jls/se7/html/jls-3.html#jls-3.8)
- [JS7 - Fork-Join Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fork-Join+Instruction)
- [JS7 - Object Naming Rules](https://kb.sos-berlin.com/display/JS7/JS7+-+Object+Naming+Rules)
