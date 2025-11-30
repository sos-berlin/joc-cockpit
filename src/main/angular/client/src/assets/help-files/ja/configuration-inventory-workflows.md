# コンフィギュレーション - インベントリ - ワークフロー

ワークフローパネル*は、ワークフローを形成する一連の命令からワークフローを設計することができます。 

- ツールバー*から命令をドラッグ＆ドロップすることで、一連のジョブ、分岐・結合、条件実行などのワークフローパターンを作成することができます。
- [Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation) では、タグやフォルダによるナビゲーションが可能です。さらに、このパネルではワークフローに対する操作が可能です。

## ツールバーパネル

ツールバー*には以下の機能があります：

- **ジョブ命令** はジョブを実行します。ワークフローはいくつでもジョブを含むことができます。詳細は[JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction) を参照してください。
- **Try/Catch命令**は、ジョブや他の命令を保持する*Try*ブロックからの例外処理を実装します。ジョブが失敗した場合、*Catch*ブロック内の命令が実行されます。空の *Catch* ブロックは、以前に失敗した命令のエラー・ステータスを解決します。詳細は[JS7 - Try-Catch Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Try-Catch+Instruction) を参照してください。
- **Retry命令**は、失敗した場合にジョブや他の命令のシーケンスを繰り返し実行するためのものです。Retry*ブロック内のジョブの1つが失敗した場合、そのオーダーは*Retry*ブロックの先頭に移動され、繰り返し実行されます。詳細は[JS7 - Retry Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Retry+Instruction) を参照してください。
- **Finish命令**は、オーダーをワークフローから離脱させ、成功または失敗の結果を[JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History) 。 詳細は[JS7 - Finish Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Finish+Instruction) を参照。
- **Fail 命令はオーダーを失敗させます。更なるエラーハンドリングがなければ、オーダーは *failed* 状態のままとなります（[Order States](/order-states) 参照）。周囲の *Try/Catch 命令* または *Retry 命令* は、*Fail 命令* によってトリガされます。詳細は[JS7 - Fail Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fail+Instruction) を参照してください。
- **Fork命令**は、ワークフロー内のジョブや他の命令の並列処理を可能にするため、オーダーをフォークし、結合することができます。分岐は、**Fork Instruction* 上に命令をドラッグ＆ドロップすることで作成されます。オーダーが *Fork Instruction* に入ると、分岐ごとに子オーダーが作成されます。詳細は[JS7 - Fork-Join Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fork-Join+Instruction) を参照してください。
  - それぞれの子オーダーは、並列の子オーダーとは独立して、ブランチ内のノードを渡します。
  - 子オーダーは変数を渡すことで、親オーダーに結果を返すことができます。
  - 子オーダーは、ネストされた**フォーク命令**の中で、親オーダーの役割を果たします。
- ForkList命令**は*Fork命令**の動的バージョンで、以下のような種類があります：
  - この命令は、値のリスト(配列)として実装される*リスト変数*をオーダーが提供することを期待します。リストは、任意の数の名前と値のペア（変数）を含むことができます。ForkList命令*は、1つのブランチとして設計されています。オーダーが提供する*List Variable*のエントリ数に応じて、エージェントは*List Variable*の各エントリに対して動的にブランチを作成します。これにより、例えば *List Variable* の各エントリに対してジョブを実行することができます。詳細は[JS7 - ForkList-Join Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ForkList-Join+Instruction) を参照してください。
  - この命令により、多数の子オーダーとブランチを動的に作成し、多数のSubagent上で同じ一連のジョブや他の命令を実行することができます：ユーザは、Subagentを操作する多数のサーバやコンテナ上で同じジョブを並行して実行することができます。例えば、同じようなバックアップジョブをより多くのサーバで実行するような場合です。詳細は[JS7 - ForkList-Join Instruction for Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+ForkList-Join+Instruction+for+Agent+Clusters) を参照してください。
- **サイクル命令**は、ワークフロー内のジョブやその他の命令の全部または一部を繰り返し実行します。これは、ワークフロー全体、またはワークフロー内の選択されたジョブや命令を実行するブロック命令です。サイクル命令**はネストすることができます。詳細は[JS7 - Cycle Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Cycle+Instruction) を参照してください。
- **Break命令**は、*Cycle命令*の中で使用され、サイクルを終了させたり、オーダーをサイクルから離脱させたりします。詳細は[JS7 - Break Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Break+Instruction) を参照してください。
- **ロック命令** は、1 つ以上のジョブや他の命令を指定し、相互排他を行うブロック命令です。 *ロック命令**はネストすることができます。詳細は[JS7 - Lock Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Lock+Instruction) をご参照ください。
- **Sleep 命令**は、ワークフローの処理を秒単位で遅延させる命令です。詳細は[JS7 - Sleep Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Sleep+Instruction) を参照してください。
- **プロンプト命令(Prompt Instruction) **は、プロンプトが確認されるまでワークフロー内のオーダーの実行を停止します。オーダーはプロンプト状態になります。[Order States](/order-states)ユーザーは *プロンプト* オーダーを確認またはキャンセルすることができます。詳細は[JS7 - Prompt Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Prompt+Instruction) を参照してください。
- **AdmissionTime 命令**は、指定されたタイムスロットに達するまで、ワークフロー内のオーダーの実 行を停止します。オーダーは待機状態になります。また、与えられたタイムスロットを超えた場合、オーダーを終了させることができます。この命令は、オーダーの実行計画に合致するタイムスロットが見つからない場合、そのオーダーに 含まれる全ての命令をスキップするように設定することができます。詳細は [[JS7 - AdmissionTime Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+AdmissionTime+Instruction).
- **AddOrder命令**はワークフロー内で使用され、別のワークフロー用のオーダーを作成します。デフォルトでは、追加されたオーダーは別のワークフローで非同期に実行され、現在のオー ダーと並行して実行されます。追加されたオーダーの実行が同期される場合、*ExpectNotices 命令*と *ConsumeNotices 命令*を使用することができます。詳細は[JS7 - AddOrder Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+AddOrder+Instruction) を参照。
- **PostNotices命令**は、Notice Boardsのために1つ以上のNoticeを作成するために使用されます。お知らせは、対応する **ExpectNotices 命令** および **ConsumeNotices 命令** によって、同じワークフローまたは異なるワークフローから待機されます。ワークフローは、同じまたは異なる通知ボードに通知を投稿するための *PostNotices 命令* をいくつでも含むことができます。通知を投稿しても、ワークフロー内のオーダーの実行はブロックされません。オーダーは、Notice を投稿した直後から続行されます。詳細は[JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction) を参照してください。
- **ExpectNotices命令**は、**PostNotices命令**またはユーザーによって追加された1つまたは複数の通知ボードから通知が利用可能かどうかを確認するために使用されます。お知らせが存在しない場合、オーダーは*待機中*のままとなります。ワークフローは、同じまたは異なる通知ボードからの通知を期待するために、いくつでも*ExpectNotices指示*を含むことができます。詳細は[JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction) を参照してください。
- **ConsumeNotices指示**は、*PostNotices指示*またはユーザーによって追加された1つまたは複数の通知ボードからの通知をオーダーに期待させるために使用されます。ConsumeNotices命令**は、他の命令を含むことができるブロック命令であり、オーダーが命令ブロックの終端に到達すると、予期していた通知を削除します。詳細は[JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction) を参照してください。
- **If命令**は、ワークフローの条件処理に使用されるブロック命令です。前のジョブのリターンコードや戻り値をチェックし、オーダー変数を評価することができます。詳細は[JS7 - If Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+If+Instruction) を参照してください。
- **Case命令**は、ワークフロー内のジョブや他の命令の条件処理に使用されます。この命令は *If 命令* を拡張したものです。Case命令**は、繰り返される*Case-When命令**や、1つの*Case-Else命令**と共に使用することもできます。詳細については、[JS7 - Case Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Case+Instruction) を参照してください。
- **CaseWhen 命令** は、*If 命令* と同様の述語をチェックするために使用されます。この命令は、*Case 命令* 内で何回でも使用できます。
- **CaseElse 命令** は、*CaseWhen 命令* のすべてのチェックが失敗した場合に使用されます。
- **StickySubagent命令**は、エージェントクラスタの同じサブエージェントで複数のジョブを実行するために使用できます。このブロック命令は、Subagent Clusterの最初の利用可能なSubagentをチェックします。このSubagentは、ブロック命令内で後続のジョブに使用されます。エージェントクラスタの使用には、[JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License) のクラスタリング条件が適用されます。 詳細は[JS7 - StickySubagent Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+StickySubagent+Instruction+for+Agent+Clusters) を参照してください。
- **オプション命令**は、*Lock命令*と*ConsumeNotices命令*のエラー処理を規定するブロック命令です。オプション命令**があり、*Stop on Failure*プロパティが指定されている場合、*失敗した*オー ダーは、失敗した命令(例えばジョブ)と共に残ります。命令が配置されていない場合、*Lock 命令* または *ConsumeNotices 命令* 内で失敗したオー ダーは、命令ブロックの先頭に移動され、*失敗* 状態のままになります。詳細については、[JS7 - Options Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Options+Instruction) を参照してください。
- **貼り付け**は、以前にコピーまたはカットされた命令をワークフローにドラッグ＆ ドロップする機能です。

## ワークフローパネル

ワークフローをグラフィカルに表示するパネルです。

- ツールバーパネルからワークフローへドラッグ＆ドロップすることができます。
  - ワークフローの最初の命令をドラッグ＆ドロップするには、マウスキーを押したまま、 ワークフローのドロップエリアに命令をドロップします。
  - さらに命令をドラッグ＆ドロップするには、マウスキーを押したまま命令間のコネク タラインに移動し、マウスキーを離します。
- Fork Instruction* の場合、ユーザーは *Fork* ノードに直接 *Job Instruction* をドラッグ &amp; ドロップして、新しい分岐を作成することができます。
- 最初の命令は*true*分岐を表し、ドラッグ＆ドロップした2番目の命令は*false*分岐を作成します。

ワークフローは自動的にインベントリに保存されます。これは 30 秒ごと、および *ワークフローパネル* を離れるときに発生します。

ワークフローでは以下の入力が可能です：

- **Name** はワークフローの一意な識別子です。[Object Naming Rules](/object-naming-rules) を参照してください。
- **Title**はワークフローの目的を説明するオプションです。
- **ジョブリソース**は、ワークフロー変数や環境変数から利用可能なキーと値のペアの変数を保持するインベントリオブジェクトです。 *ジョブリソース**はジョブレベルで割り当てることができ、ワークフローレベルで割り当てることで、ワークフロー内の全てのジョブで利用することができます。詳細は[Configuration - Inventory - Job Resources](/configuration-inventory-job-resources) を参照してください。
- **タイムゾーン**はユーザーの[Profile - Preferences](/profile-preferences) から入力されます。入力には、*UTC*、*Europe/London*などのタイムゾーン識別子が使用できます。タイムゾーン識別子の完全なリストについては、[List of tz database time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) を参照してください。
  - タイムゾーン*は、Job Admission Timesと*Cycle Instructions*の期間に適用されます。
  - [Settings - Daily Plan](/settings-daily-plan) と異なる *タイムゾーン* を使用することも可能です。
- **Allow undeclared variables** ワークフローで宣言されていないオーダー変数を使用することができます。これには、オー ダーがデータ型や強制的な使用をチェックされていない変数を使用できることが含まれます。オーダーで使用できない宣言されていない変数を参照すると、ジョブは失敗します。

### ワークフロー変数

ワークフロー変数はワークフローから宣言され、ジョブ実行のパラメータとして使用されます：

- 必須変数はデフォルト値なしでワークフローにより宣言されます。ワークフローに追加されたオーダーは、必須変数の値を指定する必要があります。
- オプション変数は、ワークフローがデフォルト値で宣言します。ワークフローに追加されたオー ダーは値を指定することができ、指定しない場合はデフォルト値が使用されます。

ワークフロー変数には以下のデータタイプがあります：

- **String**は任意の文字を保持します。オプションで、値をシングルクォートで囲むことができます。
  - 定数値： *hello world* 。
  - 関数： *now( format='yyyy-MM-dd hh:mm:ss', timezone='Europe/London' )*, *env('HOSTNAME')*.
- **Number**は整数と3.14のような浮動小数点数を保持します。
- **Boolean** 値は *true* または *false* です。
- **Final**値は、オーダーが追加されたときにコントローラによって評価されます。その他のデータ型は、オーダーが開始されたときにエージェントによって評価されます。
  - 主な用途は以下のような関数です： *jobResourceVariable( 'myJobResource', 'myVariable' )*。
  - 詳細は[JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables) を参照してください。
- **List**は配列データ型で、それぞれのデータ型とデフォルト値を使用して、任意の数の変数を追加することができます。
  - 配列変数を参照するには、次の構文を使用します： *colors(0).lightblue*、*$colors(0).blue*、*$colors(1).lightgreen*、*$colors(1).green*。
- **Map**は、それぞれのデータ型とデフォルト値を使用する変数のリストです。
  - マップ変数への参照には、次の構文を使用します： *colors.blue*、*$colors.green*。

### ワークフローでの検索

ワークフローパネルの上部には検索アイコンがあります。アイコンをクリックすると、ジョブまたはワークフロー指示の名前にマッチする文字列を指定することができます。

- 最初の文字を入力するとリストボックスが表示され、一致するワークフロー指 示が赤色で表示されます。
- ヒットした文字列をクリックすると、関連するジョブまたはワークフロー指 示がスクロール表示されます。
- 指示検索は大文字・小文字を区別せず、左詰め・右詰めで行われます。例えば、**O**（大文字のo）と入力すると、*J**o**b*が検索されます。

### ワークフローに対する操作

#### デプロイメント操作

ワークフローパネル*の上部には、以下のステータスインジケータが表示されます：

- ワークフローが整合性があり、デプロイ準備が整っている場合、**valid** / **not valid**は青色/オレンジ色で表示されます。 *無効*ワークフローはデプロイできませんが、変更はインベントリに保存されます。例えば、ジョブへのエージェントの割り当てがない場合、ワークフローは*無効*となります。無効*ステータスインジケータ内には、ワークフローが無効*である理由を表示する(i)情報アイコンがあります。
- **deployed**／*not-deployed**は、ワークフローの現在のバージョンがデプロイ済みか、デプロイされていないドラフトかを示します。

デプロイ*ボタンは、シングルクリック操作でコントローラへのデプロイを提供します。それ以外のデプロイ操作はフォルダ単位で可能です。[Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation) を参照してください。

#### 指示に対する操作

マウスをインストラクション上に置くと、3 つの点のアクションメニューが表示され、 以下の操作ができます：

- **すべての命令**では、*Copy*、*Cut*、*Remove*の操作が可能です。Remove*はその命令のみを削除しますが、*Remove All*はその命令とジョブなどの命令をすべて削除します。
- **Job Instruction** は現在のジョブからジョブテンプレートを作成する *Make Job Template* オペレーションを提供します。このジョブテンプレートは同じワークフローや異なるワークフローの他のジョブで使用することができます。

#### コピー、カット、ペースト操作

**コピー**と**カット**操作は、命令の 3-dots アクションメニューから利用できます。ブロック命令に対する*copy*と*cut*の操作は、そのブロック命令 に含まれるすべての命令に対して作用します。同じレベルから複数の命令をコピーまたはカットするには、マウスキーを押したまま、投げ縄のように命令をマークします。 

- **Ctrl+C**キーボードショートカットは、ハイライトされた命令をコピーします。
- **Ctrl+X**キーボードショートカットは、ハイライトされた命令をカットします。

**ペースト**操作は*ツールバーパネル*から可能で、コピーまたはカットした命令をワークフローにドラッグ＆ドロップすることができます。

- **Ctrl+V**キーボードショートカットは、コピーまたはカットされた命令をワークフロー命令間のコネクターラインをクリックするとペーストします。

#### オペレーションパネル

ワークフローパネル*のキャンバスをクリックすると、以下の操作が可能なオペレーションパネル*が表示されます：

- ズーム操作
  - **ワークフロー指示のサイズを拡大します。
  - **Zoom Out** はワークフロー指示のサイズを縮小します。
  - **ワークフロー指示のデフォルトサイズを設定します。
  - **パネルに合わせる］は、ワークフローがパネルサイズに収まるようにワークフロー指 示のサイズを選択します。
- 元に戻す、やり直し操作
  - **Undo**」は、変更内容を元に戻します。最大 20 個まで戻すことができます。
  - **Redo**は元に戻された最新の変更を再生します。
- ダウンロード、アップロード操作
  - **ワークフローを JSON 形式で .json ファイルにダウンロードします。
  - **ワークフローを置き換える .json ファイルをアップロードします。
- エクスポート操作
  - **ワークフローの .png イメージファイルをダウンロードします。

## 参考文献

### コンテキストヘルプ

-[Configuration - Inventory - Job Resources](/configuration-inventory-job-resources)
-[Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation)
-[Daily Plan](/daily-plan)
-[Order History](/history-orders)
-[Order States](/order-states)

###Product Knowledge Base

- [有向無巡回グラフ](https://en.wikipedia.org/wiki/Directed_acyclic_graph)
-[JS7 - Assignment of Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Assignment+of+Variables)
-[JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables)
-[JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License)
-[JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History)
-[JS7 - Order Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+Variables)
-[JS7 - Workflow Instructions - Processing](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Processing)
  -[JS7 - AdmissionTime Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+AdmissionTime+Instruction)
  -[JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)
  -[JS7 - Lock Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Lock+Instruction)
  -[JS7 - Options Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Options+Instruction)
  -[JS7 - Prompt Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Prompt+Instruction)
  -[JS7 - Sleep Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Sleep+Instruction)
-[JS7 - Workflow Instructions - Clustering](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Clustering)
  -[JS7 - ForkList-Join Instruction for Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+ForkList-Join+Instruction+for+Agent+Clusters)
  -[JS7 - StickySubagent Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+StickySubagent+Instruction+for+Agent+Clusters)
-[JS7 - Workflow Instructions - Conditional Processing](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Conditional+Processing)
  -[JS7 - If Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+If+Instruction)
  -[JS7 - Case Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Case+Instruction)
-[JS7 - Workflow Instructions - Cyclic Execution](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Cyclic+Execution)
  -[JS7 - Cycle Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Cycle+Instruction)
  -[JS7 - Break Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Break+Instruction)
-[JS7 - Workflow Instructions - Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Dependencies)
  -[JS7 - AddOrder Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+AddOrder+Instruction)
  -[JS7 - PostNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+PostNotices+Instruction)
  -[JS7 - ExpectNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ExpectNotices+Instruction)
  -[JS7 - ConsumeNotices Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ConsumeNotices+Instruction)
-[JS7 - Workflow Instructions - Error Handling](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Error+Handling)
  -[JS7 - Fail Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fail+Instruction)
  -[JS7 - Finish Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Finish+Instruction)
  -[JS7 - Retry Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Retry+Instruction)
  -[JS7 - Try-Catch Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Try-Catch+Instruction)
-[JS7 - Workflow Instructions - Forking](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions+-+Forking)
  -[JS7 - Fork-Join Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fork-Join+Instruction)
  -[JS7 - ForkList-Join Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+ForkList-Join+Instruction)

