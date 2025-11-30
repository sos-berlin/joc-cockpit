# プロフィール - 環境設定

プロファイル - プリファレンス*ページでは、ユーザーアカウントの設定を行います。

ユーザーが初めてJOCコックピットに接続すると、*デフォルト・ユーザー・アカウント*の環境設定がユーザーの環境設定にコピーされます。デフォルトユーザーアカウントは[Settings - JOC Cockpit](/settings-joc) ページから指定します。

## ロール

ユーザーアカウントに割り当てられたロールが表示されます。結果としてのパーミッションはロールの割り当てからマージされ、[Profile - Permissions](/profile-permissions) タブから利用可能です。

## 環境設定

ユーザーは自由に環境設定を変更することができます。

### ブラウザ関連の環境設定

このセクションの環境設定は、使用しているブラウザのデフォルト値を使用します：

- **言語**はJOCコックピットのインターフェース言語で、英語、フランス語、ドイツ語、日本語から選択できます。
- **タイムゾーン**は、JOCコックピットに表示される日付が変換されるタイムゾーンを指定します。
- **日付時間フォーマット**は利用可能なフォーマットのリストから選択することができます。

### 関連する環境設定の一覧

環境設定は JOC Cockpit のリスト表示に適用されます。値を増やす場合は、次のことを考慮する必要があります：

- JOC Cockpitからより多くのデータを読み込んでも、GUIの応答性は向上しません。
- リストが長くなると、レンダリングのためにブラウザのメモリとCPUの消費量が増えます。

共通値で管理できる以下の設定は、*Group Limit*リンクから見つけてください：

- **履歴エントリの最大数**は、[History - Orders](/history-orders) ビューに適用されます。
- **監査ログエントリの最大数**は、[Audit Log](/audit-log) ビューに適用されます。
- **通知エントリの最大数**は、*Monitor-Order Notifications* および *Monitor-System Notifications* ビューに適用されます。
- **オーダー概要エントリの最大数**は、[Orders - Overview](/orders-overview) ビューに適用されます。
- **実行計画エントリの最大数**は、[Daily Plan](/daily-plan) ビューに適用されます。
- **ワークフローごとの最大オーダー数**は、[Workflows](/workflows) のビューで利用可能なオーダーの数を制限します。
- **ファイル転送エントリの最大数**は、[History - File Transfers](/history-file-transfers) ビューに適用されます。
- **リソースロックあたりの最大オーダー数**は、[Resources - Resource Locks](/resources-resource-locks) のビューで表示されるオーダーの数を制限します。
- **Max. number of orders per Notice Board** は、[Resources - Notice Boards](/resources-notice-boards) ビューで表示されるオーダーの数を制限します。

### ワークフロービューの環境設定

環境設定は[Workflows](/workflows) ビューに適用されます：

- **Max. Number of Order History entries per Workflow** は *Order History* パネルのエントリ数を制限します。
- **Max. Number of Job History entries per Workflow** limits the number of entries in the **Task History* panel .
- **オブジェクトごとの監査ログの最大エントリ数**は、*監査ログ*パネルのエントリ数を制限します。

### 構成 - インベントリ・ビュー環境設定

- **お気に入りエントリの最大数** ジョブをエージェントに割り当てる時などに、お気に入りの表示を制限します。

### ページネーションの設定

ページネーションの設定はどのページにも適用されます：

- **1ページあたりの最大エントリー数**は、1ページに表示されるエントリー数を制限します。
- 1ページあたりの最大エントリー数**は、1ページで表示されるエントリー数を制限します。**1ページあたりのデフォルト・エントリー数**は、10、25、50、100、1000のうちのデフォルト値を指定します。

### テーマ設定

- **テーマの変更**では、テーマを切り替えることができます。いくつかのテーマは、視覚障害のあるユーザーにより適した高コントラストで提供されています。
  - **オーダー状態の色の変更**は、*テーマの変更*の右側にあるアイコンから利用可能で、[Order States](/order-states) のデフォルト色を変更できます。JS7のドキュメントでは異なる色で表現されている色を変更するのは混乱するかもしれません。しかし、視覚に障害のあるユーザーには、これは便利かもしれません：ユーザーは、オーダーステートに使用される各色のRGB値を指定することができます。
- **メニューバーの色**は、*Light*テーマが使用されている場合に利用可能です。メニューバーの背景色を変更することができます。この設定は、例えば、ユーザが開発、テスト、プロジェクトのために別々のJS7環境で作業する場合に適用できます：異なる背景色を使用すると、関連するJS7環境を識別するのに役立ちます。
- **テーマタイトル**は、メニューバーのすぐ下に表示されます。メニューバーの色*と同様に、これは関連するJS7環境を識別するために使用することができます。

### エディタ環境設定

- **タブサイズ**は、*ジョブスクリプト*を編集するときに[Configuration - Inventory - Workflow - Job Properties](/configuration-inventory-workflow-job-properties) タブで使用されます。この設定では、TABキーを押したときのサイズに対応するスペースの数を指定します。

### ビュー環境設定

- **ログを表示**」は、[Order Log View](/order-log) および[Task Log View](/task-log) の表示を指定します。どちらのログ・ビューでも、ログの表示とダウンロードが可能です。
- **ワークフローとジョブのユーザードキュメントの表示を指定します。

### 構成ビューの環境設定

- **サブフォルダーとフォルダーコンテンツを表示する**は、*Configuration-&gt;Inventory*ビューの*Navigation Panel*でフォルダーをクリックしたときの動作を、利用可能なオブジェクトのみを表示するか、利用可能なオブジェクトとサブフォルダーを表示するかを指定します。

### 混合環境設定

- 各ファイル転送が予測可能な数のファイルを含む場合、**Show Files immediately in File Transfer view** が便利です。1回の転送に数千のファイルが含まれる場合は、この設定を無効にした方がよいでしょう。
- **監査ログの理由を有効にする**は、オーダーの追加やキャンセル、ワークフローの一時停止など、オブジェクトを変更する際にユーザーに理由を指定させます。このユーザー設定は、関連する[Settings - JOC Cockpit](/settings-joc) から上書きできます。
- **ログのタイムスタンプにタイムゾーンを使用する** は、エージェントが異なるタイムゾーンまたはコント ローラーサーバーのタイムゾーンと異なるサーバーで実行されている場合に適用されます。このような状況では、おそらく異なるエージェントで実行された多数のジョブのログ出力を保持するオーダーログが混乱する可能性があります。この設定は、ログのタイムスタンプをユーザーのプロファイルで指定された*タイムゾーン*に変換します。
- JOC Cockpitに複数のControllerが接続されている場合、**Current Controller**が適用されます。[History - Orders](/history-orders) ]ビューなど、多くのビューで提供されているオプションです。チェックを入れると、現在選択されているコントローラに送信されたオーダーに限定し、それ以外の場合は接続されているすべてのコントローラのオーダーを表示します。この設定は、JOCコックピットビューの関連する*Current Controller*オプションのデフォルト値を決定します。
-[Configuration - Inventory - Workflow - Job Properties](/configuration-inventory-workflow-job-properties)**Suppress tooltips for Inventory objects** は、*Configuration-&gt;Inventory*ビューのツールチップに関連します。ツールチップは、入力フィールドのラベルにマウスを移動するとポップアップ表示され、可能な入力を説明することでユーザーを支援します。これはJS7にあまり慣れていないユーザーには便利ですが、経験豊富なユーザーにはツールチップは必要ないかもしれません。
- **ライセンス警告が認められました***は、通常1年間に制限されているサブスクリプション・ライセンスの使用について言及しています。ライセンスの有効期限が切れる前に、JOCコックピットは関連する警告を表示します。ユーザーは関連するライセンス期限切れの警告を抑制することができます。詳細は[JS7 - How to manage License Expiration Warnings](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+manage+License+Expiration+Warnings) を参照してください。
- **より多くのオプションを表示**は、*Configuration-&gt;Inventory*ビューの関連スライダーボタンをアクティブにします。例えば、[Configuration - Inventory - Workflow - Job Options](/configuration-inventory-workflow-job-options) タブで、ジョブ構成のより詳細なオプションを提供します。
- **リスト変数の折りたたみ**は、[Configuration - Inventory - Workflows](/configuration-inventory-workflows) のビューに適用され、多数のデータ型からワークフロー変数を指定できます。リスト*データ型（配列）が使用される場合、より多くのエントリを保持することができます。ワークフローを編集する際、リスト変数を即座に展開したくない場合があります。

### ビュータイプの設定

- **ビューの表示**」は、ウィンドウの右上隅に関連インジケータを表示する多くのビューに適 用されます。この設定では、デフォルトで使用されるビュータイプを指定します。ユーザーは、どのビューでも必要に応じてビュータイプを変更できます。Card*ビュー・タイプは、*List*ビュー・タイプよりも画面上に多くのスペースを必要とします。しかし、カードからの可視性を好むユーザーもいるでしょう。
- **Show Orders Overview**は、*Show View*設定と似ていますが、[Orders - Overview](/orders-overview) のビューに適用されます。さらに、このビューには*Bulk*ビュータイプがあり、一括操作からオーダーを移行することができます。

### ワークフローレイアウト設定

[Configuration - Inventory - Workflows](/configuration-inventory-workflows) ビューでのワークフロー指示の表示に適用されます：

- **ワークフローの表示を縦表示と横表示に切り替えることができます。ワークフローを縦長・横長に表示させることができます。
- **隣接するレイヤーの指示間の間隔**は、垂直方向のワークフロー指示間の間隔を変更することができます。
- **同じレイヤーの命令間の間隔**は、水平方向のワークフロー命令間の間隔を変更することができます。
- **ジョブなどのワークフロー指示の表示エッジをフラットにします。

## 参考文献

### コンテキストヘルプ

-[Audit Log](/audit-log)
-[Configuration - Inventory - Workflows](/configuration-inventory-workflows)
  -[Configuration - Inventory - Workflow - Job Options](/configuration-inventory-workflow-job-options)
  -[Configuration - Inventory - Workflow - Job Properties](/configuration-inventory-workflow-job-properties)
-[Daily Plan](/daily-plan)
-[History - File Transfers](/history-file-transfers)
-[History - Orders](/history-orders)
-[Order Log View](/order-log)
-[Order States](/order-states)
-[Orders - Overview](/orders-overview)
-[Profile](/profile)
   -[Profile - Permissions](/profile-permissions)
-[Resources - Notice Boards](/resources-notice-boards)
-[Resources - Resource Locks](/resources-resource-locks)
-[Settings - Daily Plan](/settings-daily-plan)
-[Settings - JOC Cockpit](/settings-joc)
-[Task Log View](/task-log)
-[Workflows](/workflows)

###Product Knowledge Base

-[JS7 - Audit Log](https://kb.sos-berlin.com/display/JS7/JS7+-+Audit+Log)
-[JS7 - Daily Plan](https://kb.sos-berlin.com/display/JS7/JS7+-+Daily+Plan)
-[JS7 - File Transfer History](https://kb.sos-berlin.com/display/JS7/JS7+-+File+Transfer+History)
-[JS7 - How to manage License Expiration Warnings](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+manage+License+Expiration+Warnings)
-[JS7 - Order History](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+History)
-[JS7 - Order State Transitions](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+State+Transitions)
-[JS7 - Profiles](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles)
-[JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)

