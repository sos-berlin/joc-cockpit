# ジョブ定義 - インベントリー - ワークフロー

*ワークフロー* 画面では、ワークフロー命令を処理する有向非巡回グラフ(DAG)を作成できます。

- 左側にある *ツールバー* からワークフロー命令をドラッグ＆ドロップすることで、一連のジョブ、分岐、結合、条件実行などのワークフローパターンを作成することができます。
- [ジョブ定義 - インベントリー - ナビゲーションパネルl](/configuration-inventory-navigation) から、タグやフォルダーによるナビゲーションが可能です。さらに、このパネルではワークフローに対する操作が可能です。

## ツールバーパネル

*ツールバー*には以下の機能があります：

- **Job命令** は、ジョブを実行します。ワークフローはいくつでもジョブを含むことができます。詳細は[JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction) を参照してください。
- **Try/Catch命令** は、ジョブや他の命令を含む *Try* ブロックからの例外処理を実行します。ジョブが失敗した場合、*Catch* ブロック内の命令が実行されます。空の *Catch* ブロックは、以前に失敗した命令のエラーステータスを正常に解決します。詳細は[JS7 - Try-Catch Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Try-Catch+Instruction) を参照してください。
- **Retry命令** は、失敗した場合にジョブや他の命令を繰り返し再実行するためのものです。*Retry* ブロック内のジョブの1つが失敗した場合、そのオーダーは *Retry* ブロックの先頭に移動され、繰り返し実行されます。詳細は[JS7 - Retry Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Retry+Instruction) を参照してください。
- **Finish命令** は、オーダーをワークフローから離脱させ、成功または失敗の結果を[JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History) 。 詳細は[JS7 - Finish Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Finish+Instruction) を参照してください。
- **Fail命令** は、オーダーを失敗させます。更なるエラーハンドリングがなければ、オーダーは *失敗* ステートのままとなります（[オーダーステート](/order-states) 参照）。*Fail* 命令が実行されると、それに伴って *Try/Catch* 命令または *Retry* 命令が自動的に起動されます。詳細は[JS7 - Fail Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fail+Instruction) を参照してください。
- **Fork命令** は、ワークフロー内のジョブや他の命令の並列処理を可能にするため、オーダーをフォークし、待ち合わせすることができます。分岐は、*Fork* 命令上に他の命令をドラッグ＆ドロップすることで作成されます。オーダーが *Fork* 命令に入ると、分岐ごとに子オーダーが作成されます。詳細は[JS7 - Fork-Join Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fork-Join+Instruction) を参照してください。
  - それぞれの子オーダーは、並列の子オーダーとは独立して、ブランチ内のノードを渡します。
  - 子オーダーは変数を渡すことで、親オーダーに結果を返すことができます。
  - 子オーダーは、入れ子構造の *Fork* 命令の中で、親オーダーの役割を果たします。
- **ForkList命令** は、*Fork* 命令の動的に拡張した機能で、以下の2種類があります：
  - この命令は、値のリスト(配列)として実装される *リスト変数* を提供するオーダーが必要です。リストは、任意の数の名前と値のペア（変数）を含むことができます。*ForkList* 命令は、1つの分岐として設計されており、オーダーが提供する *リスト変数* のエントリ数に応じて、エージェントは各エントリに対して動的に分岐を作成します。これにより、例えば *リスト変数* の各エントリに対してジョブを実行することができます。詳細は[JS7 - ForkList-Join Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ForkList-Join+Instruction) を参照してください。
  - この命令により、動的に多数の子オーダーと分岐を作成し、多数のサブエージェント上で同じ一連のジョブや他の命令を実行することができます。ユーザーは、サブエージェントを実行する多数のサーバーやコンテナ上で同じジョブを並行して実行することができます。例えば、同じようなバックアップジョブをより多くのサーバで実行するような場合です。詳細は[JS7 - ForkList-Join Instruction for Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+ForkList-Join+Instruction+for+Agent+Clusters) を参照してください。
- **Cycle命令** は、ワークフロー内のジョブやその他の命令の全部または一部を繰り返し実行します。これは、ワークフロー全体、またはワークフロー内の選択されたジョブや命令を実行するブロック型の命令です。*Cycle* 命令は入れ子にすることができます。詳細は[JS7 - Cycle Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Cycle+Instruction) を参照してください。
- **Break命令** は、*Cycle* 命令の中で使用され、サイクル処理を終了させたり、オーダーをサイクルから離脱させたりします。詳細は[JS7 - Break Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Break+Instruction) を参照してください。
- **Lock命令** は、1つ以上のジョブや他の命令を指定し、排他制御を行うブロック型の命令です。 *Lock* 命令は入れ子にすることができます。詳細は[JS7 - Lock Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Lock+Instruction) をご参照ください。
- **Sleep命令**は、ワークフローの処理を秒単位で遅延させる命令です。詳細は[JS7 - Sleep Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Sleep+Instruction) を参照してください。
- **Prompt命令** は、プロンプトが確認されるまでワークフロー内のオーダーの実行を停止します。オーダーは指示待ち状態になります。[オーダーステート](/order-states)を参照ください。ユーザーは *指示待ち* オーダーを確認またはキャンセルすることができます。詳細は[JS7 - Prompt Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Prompt+Instruction) を参照してください。
- **AdmissionTime命令** は、指定されたタイムスロットに達するまで、ワークフロー内のオーダーの実行を停止します。オーダーは待機状態になります。また、与えられたタイムスロットを超えた場合、オーダーを終了させることができます。この命令は、オーダーの実行計画に合致するタイムスロットが見つからない場合、そのオーダーに含まれる全ての命令をスキップするように設定することができます。詳細は [[JS7 - AdmissionTime Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+AdmissionTime+Instruction)を参照してください。
- **AddOrder命令 ** は、ワークフロー内で使用され、別のワークフロー用のオーダーを生成します。デフォルトでは、追加されたオーダーは別のワークフローで非同期に実行され、現在のオーダーと並行して実行されます。追加されたオーダーの実行が同期される場合、*ExpectNotices* 命令と *ConsumeNotices* 命令を使用することができます。詳細は[JS7 - AddOrder Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+AddOrder+Instruction) を参照してください。
- **PostNotices命令** は、通知ボードに1つ以上の通知を作成するために使用されます。通知は、対応する *ExpectNotices* 命令  および *ConsumeNotices* 命令によって、同じワークフローまたは異なるワークフローから待機されます。ワークフローは、同じまたは異なる通知ボードに通知を発行するための *PostNotices* 命令をいくつでも含むことができます。通知を発行しても、ワークフロー内のオーダーの実行はブロックされません。オーダーは、通知を発行した直後から続行されます。詳細は[JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction) を参照してください。
- **ExpectNotices命令** は、*PostNotices* 命令、またはユーザーによって追加された1つまたは複数の通知ボードから通知が利用可能かどうかを確認するために使用されます。通知が存在しない場合、オーダーは *待機中* のままとなります。ワークフローは、同じまたは異なる通知ボードからの通知をまつために、いくつでも*ExpectNotices* 命令を含むことができます。詳細は[JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction) を参照してください。
- **ConsumeNotices指示** は、*PostNotices* 命令、またはユーザーによって追加された1つまたは複数の通知ボードからの通知をオーダーに受け取るために使用されます。*ConsumeNotices* 命令は、他の命令を含むことができるブロック命令であり、オーダーが命令ブロックの終端に到達すると、待っていた通知を削除します。詳細は[JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction) を参照してください。
- **If命令** は、ワークフローの条件処理に使用されるブロック命令です。前のジョブのリターンコードや戻り値をチェックし、オーダー変数を評価することができます。詳細は[JS7 - If Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+If+Instruction) を参照してください。
- **Case命令 ** は、ワークフロー内のジョブや他の命令の条件処理に使用されます。この命令は *If 命令* を拡張したものです。*Case命令* は、繰り返される *Case-When* 命令や、1つの *Case-Else* 命令と共に使用することもできます。詳細については、[JS7 - Case Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Case+Instruction) を参照してください。
- **CaseWhen命令** は、*If* 命令と同様の述語をチェックするために使用されます。この命令は、*Case* 命令内で何回でも使用できます。
- **CaseElse命令** は、*CaseWhen* 命令のすべてのチェックが失敗した場合に使用されます。
- **StickySubagent命令** は、エージェントクラスター内の同じサブエージェントで複数のジョブを実行するために使用できます。このブロック命令は、サブエージェントクラスター内の最初の利用可能なサブエージェントをチェックします。このサブエージェントは、ブロック命令内で後続のジョブに使用されます。エージェントクラスターの使用には、[JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License) の有償ライセンスが必要です。 詳細は[JS7 - StickySubagent Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+StickySubagent+Instruction+for+Agent+Clusters) を参照してください。
- **Options命令** は、*Lock* 命令と *ConsumeNotices* 命令のエラー処理を規定するブロック命令です。*Options* 命令があり、*Stop on Failure*　項目が指定されている場合、*失敗* オーダーは、失敗した命令(例えばジョブ)と共に残ります。命令が配置されていない場合、*Lock* 命令、または *ConsumeNotices* 命令内で失敗したオーダーは、命令ブロックの先頭に移動され、*失敗* 状態のままになります。詳細については、[JS7 - Options Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Options+Instruction) を参照してください。
- **Paste命令** は、以前にコピーまたはカットされた命令をワークフローにドラッグ＆ドロップする機能です。

## ワークフローパネル

ワークフローをグラフィカルに表示編集するパネルです。

- ツールバーパネルからワークフローへドラッグ＆ドロップすることができます。
  - ワークフローの最初の命令をドラッグ＆ドロップするには、マウスキーを押したまま、 ワークフローのドロップエリアに命令をドロップします。
  - さらに命令をドラッグ＆ドロップするには、マウスキーを押したまま命令間の接続線に移動し、マウスキーを離します。
- *Fork* 命令の場合、*Fork* ノードに直接 *Job* 命令をドラッグ＆ドロップして、新しい分岐を作成することができます。
- *If* 命令の場合、直接 *If* ノードに *Job* ジョブ命令をドラッグ＆ドロップできます。最初の命令が *true* の分岐を、ドラッグ＆ドロップした2番目の命令が *false* 分岐を作成します。

ワークフローは自動的にインベントリーに保存されます。これは 30秒ごと、および *ワークフローパネル* を離れるときに発生します。

ワークフローでは以下の入力が可能です：

- **名称** は、ワークフローの一意な識別子です。[オブジェクト命名ルール](/object-naming-rules) を参照してください。
- **タイトル** は、ワークフローの目的を説明するオプションです。
- **ジョブリソース** は、ワークフロー変数や環境変数から利用可能なキーと値のペアの変数を保持するインベントリーオブジェクトです。 *ジョブリソース*　はジョブレベルで割り当てることができ、ワークフローレベルで割り当てることで、ワークフロー内の全てのジョブで利用することができます。詳細は[ジョブ定義 - インベントリー - ジョブリソース](/configuration-inventory-job-resources) を参照してください。
- **許可時間タイムゾーン** は、ユーザーの[プロファイル - 設定値](/profile-preferences) から入力されます。入力には、*UTC*、*Asia/Tokyo*などのタイムゾーン名が使用できます。タイムゾーン名の完全なリストについては、[List of tz database time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) を参照してください。
  - *タイムゾーン* は、*許可時間* と *Cycle* 命令の期間に適用されます。
  - [設定 - Daily Plan](/settings-daily-plan) と異なる *タイムゾーン* を使用することも可能です。
- **宣言されていない変数を許可** は、ワークフローで宣言されていないオーダー変数を使用することができます。これには、オー ダーがデータ型や強制的な使用をチェックされていない変数を使用できることが含まれます。オーダーで使用できない宣言されていない変数を参照すると、ジョブは失敗します。

### ワークフロー変数

ワークフロー変数はワークフローから宣言され、ジョブ実行のパラメータとして使用されます：

- 必須変数はデフォルト値なしでワークフローにより宣言されます。ワークフローに追加されたオーダーは、必須変数の値を指定する必要があります。
- オプション変数は、ワークフローがデフォルト値で宣言します。ワークフローに追加されたオー ダーは値を指定することができ、指定しない場合はデフォルト値が使用されます。

ワークフロー変数には以下のデータタイプがあります：

- **String** は、任意の文字を格納します。オプションで、値をシングルクォートで囲むことができます。
  - 定数値： *hello world*
  - 関数： *now( format='yyyy-MM-dd hh:mm:ss', timezone='Europe/London' )*, *env('HOSTNAME')*.
- **Number** は、整数と3.14のような浮動小数点数を保持します。
- **Boolean** は、 *true* または *false* です。
- **Final** は、オーダーが追加されたときにコントローラーによって評価されます。その他のデータ型は、オーダーが開始されたときにエージェントによって評価されます。
  - 主な用途は以下のような関数です： *jobResourceVariable( 'myJobResource', 'myVariable' )*
  - 詳細は[JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables) を参照してください。
- **List** は、配列データ型で、それぞれのデータ型とデフォルト値を使用して、任意の数の変数を追加することができます。
  - 配列変数を参照するには、次の構文を使用します： *$colors(0).lightblue,$colors(0).blue,$colors(1).lightgreen1,$colors(1).green*
- **Map** は、それぞれのデータ型とデフォルト値を使用する変数のリストです。
  - マップ変数への参照には、次の構文を使用します： *$colors.blue,$colors.green*

### ワークフロー検索

ワークフローパネルの上部には検索ボタンがあります。ボタンをクリックすると、ジョブまたはワークフロー命令の名前に一致する文字列を指定することができます。

- 最初の文字を入力するとリストボックスが表示され、一致するワークフロー命令が赤色で表示されます。
- ヒットした文字列をクリックすると、関連するジョブまたはワークフロー命令がスクロール表示されます。
- 命令の検索は大文字・小文字を区別せず、左詰め・右詰めで行われます。例えば、**O**（大文字のo）と入力すると、*J**o**b*が検索されます。

### ワークフローの操作

#### 配置

*ワークフローパネル* の上部には、以下のステータスが表示されます：

- ワークフローが整合性があり、配置準備が整っている場合、**有効** / **無効**は青色/オレンジ色で表示されます。 *無効* ワークフローは配置できませんが、変更はインベントリーに保存されます。例えば、ジョブへのエージェントの割り当てがない場合、ワークフローは *無効* となります。*無効* ステータスには、ワークフローが *無効* である理由を表示する(i)アイコンがあります。
- **配置済**／**未配置** は、ワークフローの現在のバージョンが配置済みか、配置されていない下書きかを示します。

*配置* ボタンは、シングルクリックでコントローラーへ配置します。それ以外の配置操作はフォルダー単位で可能です。[ジョブ定義 - インベントリー - ナビゲーション](/configuration-inventory-navigation) を参照してください。

#### ワークフロー命令の操作

マウスをワークフロー命令上に置くと、アクションメニューが表示され、 以下の操作ができます：

- **全ての命令** では、*コピー*、*切り取り*、*削除* の操作が可能です。*削除* はその命令のみを削除しますが、*全削除* はその命令とジョブなどの命令をすべて削除します。
- **Job命令** は、現在のジョブからジョブテンプレートを作成する *ジョブテンプレートにする* 操作ができます。このジョブテンプレートは同じワークフローや異なるワークフローの他のジョブで使用することができます。

#### コピー、切り取り、貼り付け

**コピー** と **切り取り** は、命令のアクションメニューから利用できます。命令に対する *コピー* と *切り取り* は、その範囲に含まれるすべての命令に対して作用します。同じレベルから複数の命令をコピーまたはカットするには、マウスキーを押したまま、投げ縄のように命令をマークします。 

- **Ctrl+C** キーボードショートカットは、ハイライトされた命令をコピーします。
- **Ctrl+X** キーボードショートカットは、ハイライトされた命令をカットします。

**貼り付け** は *ツールバーパネル* から可能で、コピーまたは切り取りした命令をワークフローにドラッグ＆ドロップすることができます。

- **Ctrl+V** キーボードショートカットは、コピーまたはカットされた命令をワークフロー命令間のコネクターラインをクリックすると貼り付けします。

#### オペレーションパネル

*ワークフローパネル* のキャンバスをクリックすると、以下の操作が可能な *オペレーションパネル* が表示されます：

- ズーム操作
  - **拡大** は、表示サイズを拡大します。
  - **縮小** は、表示サイズを縮小します。
  - **デフォルト** は、表示のデフォルトサイズを設定します。
  - **調整** は、ワークフローがパネルサイズに収まるようにワークフロー表示のサイズを選択します。
- 元に戻す、やり直し操作
  - **元に戻す** は、変更内容を元に戻します。最大 20個まで戻すことができます。
  - **やり直し** は、元に戻された最新の変更を再生します。
- ダウンロード、アップロード操作
  - **ダウンロード** ワークフローを JSON 形式でダウンロードします。
  - **アップロード** ワークフローを置き換える .json ファイルをアップロードします。
- エキスポート操作
  - **Pingエキスポート** ワークフローの .png イメージファイルをダウンロードします。

## 参照

### コンテキストヘルプ

- [ジョブ定義 - インベントリー - ジョブリソース](/configuration-inventory-job-resources)
- [ジョブ定義 - インベントリー - ナビゲーション](/configuration-inventory-navigation)
- [実行計画](/daily-plan)
- [オーダー履歴](/history-orders)
- [オーダーステート](/order-states)

###Product Knowledge Base

- [有向非巡回グラフ(DAG)](https://en.wikipedia.org/wiki/Directed_acyclic_graph)
- [JS7 - Assignment of Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Assignment+of+Variables)
- [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables)
- [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License)
- [JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History)
- [JS7 - Order Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+Variables)
- [JS7 - Workflow Instructions - Processing](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Processing)
  - [JS7 - AdmissionTime Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+AdmissionTime+Instruction)
  - [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)
  - [JS7 - Lock Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Lock+Instruction)
  - [JS7 - Options Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Options+Instruction)
  - [JS7 - Prompt Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Prompt+Instruction)
  - [JS7 - Sleep Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Sleep+Instruction)
- [JS7 - Workflow Instructions - Clustering](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Clustering)
  - [JS7 - ForkList-Join Instruction for Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+ForkList-Join+Instruction+for+Agent+Clusters)
  - [JS7 - StickySubagent Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+StickySubagent+Instruction+for+Agent+Clusters)
- [JS7 - Workflow Instructions - Conditional Processing](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Conditional+Processing)
  - [JS7 - If Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+If+Instruction)
  - [JS7 - Case Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Case+Instruction)
- [JS7 - Workflow Instructions - Cyclic Execution](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Cyclic+Execution)
  - [JS7 - Cycle Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Cycle+Instruction)
  - [JS7 - Break Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Break+Instruction)
- [JS7 - Workflow Instructions - Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Dependencies)
  - [JS7 - AddOrder Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+AddOrder+Instruction)
  - [JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction)
  - [JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction)
  - [JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction)
- [JS7 - Workflow Instructions - Error Handling](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Error+Handling)
  - [JS7 - Fail Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fail+Instruction)
  - [JS7 - Finish Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Finish+Instruction)
  - [JS7 - Retry Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Retry+Instruction)
  - [JS7 - Try-Catch Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Try-Catch+Instruction)
-[JS7 - Workflow Instructions - Forking](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Forking)
  -[JS7 - Fork-Join Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fork-Join+Instruction)
  -[JS7 - ForkList-Join Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ForkList-Join+Instruction)

