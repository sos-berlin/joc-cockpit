# コンフィギュレーション - インベントリ - ワークフロー - ジョブオプション

ワークフロー*パネルは一連の指示からワークフローをデザインすることができます。ユーザーは*ツールバー*から*ジョブ指示*をワークフローの位置にドラッグ＆ドロップすることができます。

GUIにはジョブ詳細を指定するためのタブがいくつかあります。2つ目のタブは*ジョブオプション*です。

## 頻繁に使用されるジョブオプション

- **Parallelism** はジョブが実行できる並列インスタンス数を指定します。複数のオーダーがワークフローを処理する場合、並行してジョブを実行することができます。Parallelism**に加えて、スタンドアロンエージェントとエージェントクラスタによって強制されるプロセス制限が適用されます。
- **Criticality** はジョブの失敗の関連性を指定します。Criticality**はジョブの失敗に関する通知で利用できます。

### ジョブの実行期間

- **Timeout** はジョブが消費できる最大実行時間を指定します。ジョブが *Timeout* を超えた場合、ジョブの *Grace Timeout* を考慮してエージェントによってキャンセルされます。入力は以下のフォーマットで指定できます：
  - *1* または *1s*: 数値または *s* に続く数値で、*Timeout* を秒単位で指定します。
  - *1m 2d 3h*：最大実行期間として1ヶ月、2日、3時間を指定します。
  - *01:02:03*：最大実行時間として1時間2分3秒を指定します。
- **Warn on shorter execution period** 指定された期間より早くジョブが終了する場合、警告と関連する通知を出します。入力フォーマットは以下の通りです：
  - *1* または *1s*: 数値または *s* に続く数値で、実行期間を秒単位で指定します。
  - *01:02:03*：実行期間を1時間2分3秒で指定します。
  - *30%*：ジョブの過去の実行の平均よりも30%短い実行期間を指定します。この計算では、[Cleanup Service](/service-cleanup) によってパージされる[Task History](/history-tasks) を使用します。
- **Warn on longer execution period** ジョブが指定された期間を超える場合、警告と関連する通知を発生します。入力フォーマットは以下の通りです：
  - *1* または *1s*: 数値または *s* に続く数値で、実行期間を秒単位で指定します。
  - *01:02:03*：実行期間を1時間2分3秒で指定します。
  - *30%*：ジョブの過去の実行の平均よりも30%長い実行期間を指定します。この計算では、[Cleanup Service](/service-cleanup) によってパージされる[Task History](/history-tasks) を使用します。

### ジョブ・ログ出力

- **Fail on output to stderr** は、ジョブが stderr チャンネルに出力を書き込んだ場合、エージェントがそのジョブを失敗させることを指定します。このチェックはジョブの *戻り値* (シェルジョブの場合: 終了コード) のチェックに加えて行われます。
- **Warn on output to stderr** は *Fail on output to stderr* と同じチェックを行います。しかし、ジョブは失敗せず、警告が発生し、Notification が作成されます。

### ジョブ投入時間

*Admission Times* は、ジョブがいつ開始できるか、いつスキップされるべきか、ジョブが実行される絶対的な期間を指定します。詳細は[JS7 - Admission Times for Jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+Admission+Times+for+Jobs) を参照してください。

- **Skip Job if no admission for Order's date** は、ジョブの *Admission Time*がオーダーの日付と一致しない場合、ジョブをスキップすることを指定します。例えば、ジョブの *Admission Time* は週末を除くことができ、その結果ジョブは月曜日から金曜日まで実行され、土曜日から日曜日にスケジュールされたオーダーによってスキップされます。ユーザーは、オーダーがジョブに到着する日付ではなく、オーダーがスケジュールされる日付が重要であることを考慮する必要があります。もしオーダーのスケジュールされた日付が*Admission Time*と一致しても、オーダーが*Admission Time*の外に到着した場合、ジョブはスキップされず、オーダーは次の*Admission Time*を待つことになります。
- **Terminate Job at end of period** は、ジョブが*Admission Time*で指定された時間を超えた場合、エージェントがそのジョブをキャンセルすることを指定します。
- **Admission Time**は、*Show Periods*リンクからジョブが実行できる日数と時間を指定することができます。

#### アドミッションタイプ

*Admission Types*ではジョブの開始日を指定することができます。さらに、*Admission Type*を特定の月に限定することもできます。

- **平日(Weekdays)**は、仕事を開始できる曜日を指定します。
- **特定の平日(Specific Weekday)**は月の第一月曜日や最終月曜日などの相対的な平日を指定します。
- **特定の日**は、1年の曜日を指定します。
- **月日**は、月の最初の日や最後の日など、月の相対的な日を指定します。

#### 実行期間

実行期間** は、*開始** と*継続** から指定します：

- **開始時間** は、HH:MM:SS の形式で指定します。
- **継続時間**は以下のフォーマットで指定します：
  - *1*または*1s*：数値または数値の後に*s*を続けたもので、*Duration*を秒単位で指定します。
  - *1m 2d 3h*: *Duration*に1ヶ月、2日、3時間を指定します。
  - *01:02:03*：*Duration*に1時間、2分、3秒を指定します。

## ジョブオプションは, *その他のオプション*から選択できます.

Configuration - Inventory*画面ではウィンドウ上部に*More Options*スライダーが表示されます。このスライダーを使用すると、追加オプションが利用可能になります。

- **Grace Timeout** は Unix のジョブに適用され、*Timeout* を超えた時、またはユーザーの介入によって強制的に終了させられた時に SIGTERM シグナルを送ります。もしジョブがSIGTERMに応答して終了しない場合、*Grace Timeout*の後にエージェントはSIGKILLシグナルを送り、強制的にジョブを終了させます。詳細は[JS7 - FAQ - How does JobScheduler terminate Jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+FAQ+-+How+does+JobScheduler+terminate+Jobs) と[JS7 - Agent Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Operation) を参照してください。
- **Compatibility** は JobScheduler のブランチ 1.x のユーザのために *v1* 互換性レベルを提供します。互換モードでは以下の動作が変更されます：
  - *環境変数*は指定する必要はなく、すべてのワークフロー変数に対して自動的に作成されます。環境変数の名前は*SCHEDULER_PARAM_*から大文字のみで接頭辞が付けられます。
  - ジョブ引数を使用するために、互換モードは対応するタブを提供します。

### ジョブの再起動

- 再スタート不可能なジョブ(**Job not restartable**) は、エージェントの停止またはキャンセル時に、エージェントまたはそのウォッチドッグによって強制終了されたジョブに適用されます。デフォルトでは、ジョブは再起動可能とみなされ、エージェントの再起動時に再起動されます。ユーザはチェックボックスを有効にすることで、この動作を防ぐことができます。

### 異なるユーザアカウントを使用した Windows 用ジョブの実行

以下のオプションは、Windows 用のエージェントで実行されるジョブに対して、ジョブがユーザコンテキストを切り替えるように指定します。[JS7 - Running Jobs as a different User](https://kb.sos-berlin.com/display/JS7/JS7+-+Running+Jobs+as+a+different+User) を参照してください。

- **Credential Key** は、Windows Credential Manager でターゲットユーザーアカウントの認証情報を保持するエントリのキーを指定します。
- **Load User Profile** は、レジストリエントリを含むターゲットユーザアカウントのプロファイルをジョブ開始時にロードするかどうかを指定します。

##参照

### コンテキストヘルプ

-[Cleanup Service](/service-cleanup)
-[Configuration - Inventory - Workflows](/configuration-inventory-workflows)
  -[Configuration - Inventory - Workflows - Job Properties](/configuration-inventory-workflows-job-properties)
  -[Configuration - Inventory - Workflows - Job Node Properties](/configuration-inventory-workflows-job-node-properties)
  -[Configuration - Inventory - Workflows - Job Notifications](/configuration-inventory-workflows-job-notifications)
  -[Configuration - Inventory - Workflows - Job Tags](/configuration-inventory-workflows-job-tags)
-[Task History](/history-tasks)

###Product Knowledge Base

-[JS7 - Admission Times for Jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+Admission+Times+for+Jobs).
-[JS7 - Agent Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Operation)
-[JS7 - Assignment of Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Assignment+of+Variables)
-[JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables)
-[JS7 - FAQ - How does JobScheduler terminate Jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+FAQ+-+How+does+JobScheduler+terminate+Jobs)
-[JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)
-[JS7 - Order Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+Variables)
-[JS7 - Running Jobs as a different User](https://kb.sos-berlin.com/display/JS7/JS7+-+Running+Jobs+as+a+different+User)

