# コンフィギュレーション - インベントリ - スケジュール

スケジュールパネル*では、[Daily Plan](/daily-plan) からオーダーを作成するためのルールを指定することができます。 詳細は[JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules) をご覧ください。

- スケジュールはワークフロー実行のためのオーダーを開始する時点を決定します。スケジュールパネルには1つ以上のワークフローと、そのワークフロー内のジョブが使用する変数が割り当てられます。
  - **開始日**は[Configuration - Inventory - Calendars](/configuration-inventory-calendars) で指定され、ワークフローの実行日を制限します。
  - **開始時間**はスケジュールによって指定され、1日の中で1つ以上の時間を示します。スケジュールはワークフロー実行日をさらに制限することができます。
- スケジュールは 1 日単位でオーダーを作成します。
  - ワークフローを 1 回だけ実行するためのオーダーを 1 日単位で作成します。これには、1日に複数の時点から開始するワークフローも含まれます。
  - ワークフローを周期的に実行する場合。これは、設定可能な間隔に基づくワークフローの反復実行を指定します。
- スケジュールは、[Daily Plan](/daily-plan) によって適用され、その日時のオーダーが作成されます。
  - スケジュールは、実行計画ビューから手動で適用できます。
  - スケジュールは[Daily Plan Service](/service-daily-plan) によって自動的に適用されます。

スケジュールは、以下のパネルで管理できます：

- ウィンドウの左側にある[Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation) では、スケジュールを保持するフォルダーごとにナビゲートできます。また、スケジュールに対する操作も可能です。
- ウィンドウ右側の*スケジュールパネル*にはスケジュール設定の詳細が表示されます。

## スケジュールパネル

スケジュールでは以下の入力が可能です：

- **Name**はスケジュールのユニークな識別子で、[Object Naming Rules](/object-naming-rules) を参照してください。
- **タイトル**にはスケジュールの目的を説明します。
- **ワークフロー名**は、開始すべきワークフローのリストです。
- **Plan Order automatically** は、スケジュールが[Daily Plan Service](/service-daily-plan) で考慮されることを指定します。
- **計画時にコントローラーにオーダーを送信する**」は、オーダーが計画され次第、即座にコントローラーに送信することを指定します。このオプションがない場合、実行計画サービスは[Settings - Daily Plan](/settings-daily-plan) に基づいて *計画* オーダーを送信します。

### オーダーのパラメータ化

- **オーダー名**：多くのビューでオーダーをフィルタリングするために使用できるオプションの名前。
- **タグ名**：オーダーに追加されるタグをいくつでも指定できます。オーダータグは、[Settings - JOC Cockpit](/settings-joc) ページから指定すると、複数のビューに表示されます。
- **Ignore Job Admission Times**：ジョブは特定の曜日やタイムスロットに限定することができます。タイムスロット外に到着したオーダーは次のタイムスロットを待たなければなりません。このオプションにより、ジョブはそのような制限から独立して開始されます。

### オーダーポジション

オーダーをワークフローの最初のノードから開始しない場合は、位置を指定できます。

- **ブロック位置**：Try/Catch、ResourceLock、Fork/Join などのブロック命令を保持するワークフローでは、 関連する命令を選択できます。
- **開始位置**：開始位置**が指定されていない場合、オーダーは最初のノードから開始されます。
  - Block Position**が指定されていない場合、ワークフロー内のトップレベルの命令を選択することができ、そこからオーダーが開始されます。
  - ブロック位置*が指定されている場合、*開始位置*はブロック内の同じレベルのノードになります。
- **終了位置**：
  - 終了位置**：*ブロック位置*が指定されていない場合、オーダーが終了するワークフロー内のトップレベル命令を選択することができます。
  - ブロック位置**が指定された場合、オーダーが終了する前に、ブロック内の任意の同レベルノードを指定することができます。
  - 複数の*End Position*を指定することができます。
- **優先度**：
  - 優先順位(**Priority**): オーダーが、並列処理を制限するワークフロー内のリソースロック命令 に適合する場合、その**優先順位(**Priority*)は、待機中の**オーダーのキュー内の位置を決定します。
  - *優先度*は負、0、正の整数、またはショートカットから指定します。優先度*は高い方が優先されます。ショートカットには以下の値があります：
    - **Low**： -20000
    - **通常**以下： -10000
    - **通常**：0
    - **標準以上10000
    - **高い**：20000

### オーダー変数

オーダー変数は、ワークフローがジョブの実行をパラメータ化する変数を宣言する場合に指定します：

- 必須変数は、デフォルト値なしでワークフローによって宣言されます。スケジュールで自動的に使用可能となり、関連する値を割り当てる必要があります。
- オプション変数は、デフォルト値付きでワークフローによって宣言されます。以下のリンクから呼び出すことができます：
  - **変数変更**では、ワークフロー変数リストから特定の変数を選択することができます。変数はデフォルト値から設定されます。
  - **すべてのワークフロー変数の入力を追加します。変数はデフォルト値から入力されます。

変数への値の割り当てには、文字列と数値の指定があります。空文字列は、2 つのシングルクォートで代入できます。

## 実行時

ランタイム*ボタンは、ポップアップウィンドウからオーダーの開始時間を指定することができます。詳細は[Configuration - Inventory - Schedules - Run-time](/configuration-inventory-schedules-run-time) をご覧ください。

## スケジュールに対する操作

利用可能な操作については[Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation) を参照してください。

## 参考文献

### コンテキストヘルプ

-[Configuration - Inventory - Calendars](/configuration-inventory-calendars)
-[Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation)
-[Configuration - Inventory - Schedules - Run-time](/configuration-inventory-schedules-run-time)
-[Configuration - Inventory - Workflows](/configuration-inventory-workflows)
-[Daily Plan](/daily-plan)
-[Daily Plan Service](/service-daily-plan)
-[Object Naming Rules](/object-naming-rules)
-[Order History](/history-orders)
-[Profile - Preferences](/profile-preferences)
-[Settings - Daily Plan](/settings-daily-plan)
-[Task History](/history-tasks)

###Product Knowledge Base

-[JS7 - Assignment of Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Assignment+of+Variables)
-[JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars)
-[JS7 - Cycle Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Cycle+Instruction)
-[JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables)
-[JS7 - Order Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+Variables)
-[JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules)
- [tzデータベースのタイムゾーン一覧](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

