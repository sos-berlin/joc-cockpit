# ジョブ定義 - 通知

JS7製品の警告やエラー、ジョブやワークフローが失敗した場合に通知を送信することができます。また、ジョブやワークフローが正常に実行された場合にも通知を送ることができます。

- 通知は　JOCコックピットの [モニターサービス](/service-monitor)  による監視に基づき、[JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor) 画面に表示されます。これには以下が含まれます：
  - コントローラーとエージェントの監視
  - ワークフローとジョブ実行の監視。
- 通知は以下のいずれかの方法で転送されます：
  - メール通知： [JS7 - Notifications - Configuration Element MailFragment](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications+-+Configuration+Element+MailFragment) と [JS7 - How to set up e-mail notification for jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+set+up+e-mail+notification+for+jobs) を参照してください。
  - システム監視ツールなどからのCLI：[JS7 - Passive Checks with a System Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Passive+Checks+with+a+System+Monitor) 詳細は[JS7 - Notifications - Configuration Element CommandFragment](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications+-+Configuration+Element+CommandFragment) を参照してください。

通知は、JOCコックピットのジョブ定義 - 通知設定画面で管理できます。構成はXML形式で保存され、ページ上部に示されている *適用スキーマ* に対して検証されます。

ページは左側の *ナビゲーションパネル* と右側の *詳細パネル* に分かれています。 

- *詳細パネル* は、項目フィールドと関連ドキュメントを表示します。
- 設定の詳細を入力すると、30秒以内に自動的に保存され、ページを離れると保存されます。

通知設定を変更する際の方法は以下の通りです。

- 設定の詳細を入力
- *確認* ボタンを押し、設定の整合性を確認します、
- *リリース* ボタンを押して設定を有効にします。

## ナビゲーションパネル

設定は項目ごとにナビゲーションから提供されます。項目をクリックすると、その要素が開き、利用可能なサブ要素が表示されます。要素名の左側にある矢印は、サブ要素が利用可能かどうかを示します。

要素のアクションメニューでは、以下の操作が可能です：

- **子ノードを追加** は、現在の要素にノードを追加します。利用可能なノードタイプが表示されます。
- **全子ノード表示** は、可能性のある子ノードを表示するポップアップ・ウィンドウを表示します。この機能には、子ノードをトラバースしたり、子ノードを名前で検索したりする機能があります。
- **切り取り／コピー／ペースト** は、子ノードを含むノードをコピーします。貼り付けは親ノードのアクションメニューから行えます。
- **削除** は、ノードと子ノードを削除します。

### フラグメント

#### MessageFragments

- **メッセージ**
  - *メッセージ* は、メールでユーザーに送信される内容や、監視ツールに転送される内容など、CLIのパラメータに使用される内容を定義します。
    - メールで使用される *メッセージ* は、平文または HTML で、メール本文を表します。
    - CLIで使用するメッセージは、*CommandFragmentRef* 要素で使用できる文字列を表します。
    - *メッセージ* 要素には、値のプレースホルダーであるモニター変数（ワークフローパス、オーダーIDなど）を含めることができます。
    - *メッセージ*要素はいくつでも追加できます。

#### MonitorFragments

フラグメントには、以下の通知タイプに対応するさまざまな種類があります。

- **メールフラグメント**
  - メールを送信するには、以下の要素が必要です：
    - **MessageRef**：：メール本文を提供する メッセージ要素への参照を指定します。
    - **Subject**：メールの件名を指定し、モニター変数を含めることができます。
    - **To**：受信者のメールアドレスを指定します。複数の受信者をカンマで区切ることができます。
  - 以下の要素はメール送信のオプションです：
    - **CC**：カーボンコピーの受信者。複数の受信者をカンマ区切りで指定できます。
    - **BCC**：ブラインドカーボンコピーの受信者。複数の受信者をコンマで区切ることができます。
    - **From**：メール送信に使用するアカウントの電子メールアドレス。メールサーバーの設定によって、特定のアカウントか任意のアカウントかが決まると考えてください。
- **コマンドフラグメント**
  - **MessageRef**：コマンドと共に転送されるコンテンツを提供する *メッセージ* 要素への参照を指定します。メッセージの内容は、*${MESSAGE}* モニター変数から使用できます。
  - **Command**：システム監視ツールなどに通知を転送するために使用する Linux/Windows 用のシェルコマンドを指定します。
    - たとえば、次のようなシェルコマンドを使用できます：
      - *echo "${MESSAGE}"&gt;&gt; /tmp/notification.log*
      - *echo* シェル・コマンドで、*${MESSAGE}}* モニター変数の内容を */tmp* ディレクトリのファイルに追加します。
- **JMSFragment**
  - このフラグメントは、JMS API を実装する Java メッセージキュー製品を利用するために使用されます。属性の値は、使用する JMS 製品に固有です。

#### ObjectFragments 

- **Workflows**：ワークフローはいくつでも追加でき、要素に割り当てられた一意の名称によって区別されます。
  - **Workflows**：ワークフローはその名称で指定することができます。*Path*属性はワークフローパスの一部を正規表現で指定することができます。
    - **WorkflowJob**：この要素を使用して、通知をワークフロー内の特定のジョブに制限することができます。
      - これには、*Job Name* または *Label* を指定するオプションが含まれます。両方の属性に定数値や正規表現を使用することができます。
      - 2.7.1より前のリリースの場合：
        - 要素を使用する際には、*ALL*、*NORMAL*、または *CRITICAL* のうちの1つである重大度を指定する必要があります。
      - 2.7.1以降のリリースの場合：
        - 重大度は、*MINOR*、*NORMAL*、*MAJOR*、*CRITICAL* の中から1つ以上指定できます。
        - *ALL* は非推奨です。
      - **return_code_from** と **return_code_to** は、指定されたリターンコードで完了したジョブに通知を限定するために使用することができます。シェルジョブのリターンコードはOSの終了コードに対応します。
    - 空欄の場合：*WorkflowJob*が指定されていない場合、通知はFail命令 [JS7 - Fail Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fail+Instruction) を含む全てのワークフロー命令 [JS7 - Workflow Instructions](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions) に適用されます。それ以外の場合は、JS7のジョブ命令 [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)の各発生箇所に適用されます。

### Notifications

Notifications は、前述の *Fragment* 要素を参照することで、通知を有効にします。

#### システム通知

- **システム通知**：上記の *MonitorFragment* を 1 つ以上選択します。同じフラグメント・タイプの複数の *Fragment* を選択できます。
  - 通知は、JS7 製品のログファイルから識別されるシステムエラーと警告から作成されます。[Log Notification Service](/service-log-notification) を参照してください。
  - この要素は、JOC Cockpit の[Monitor - System Notifications](/monitor-notifications-system) サブビューに入力するために使用されます。

#### 通知

- **通知**：*Notification* はいくつでも追加できます。*Notification* には *SUCCESS*、*WARNING*、*ERROR* のいずれかのタイプが割り当てられます。これにより、例えばジョブのエラーや警告が発生したときに通知を送ることができます。同様に、ワークフローが正常に実行された場合にも通知を送ることができます。ジョブが正常に実行された場合、ジョブエラーが発生しなかった場合と、警告が発生した場合の両方が含まれます。
  - **NotificationMonitors**：上記の **MonitorFragments** から 1 つ以上を選択します。同じフラグメントタイプの複数のフラグメントを選択することができます。
    -  **CommandFragmentRef**：使用する *CommandFragment* を選択します。
      -  **MessageRef**：*コマンド* で使用される *メッセージ* 要素を選択します。
    - **MailFragmentRef**：メールで通知を送信するために使用する *MailFragment* を選択します。複数の *MailFragment* 要素を参照する場合、異なる受信者、または電子メール本文の内容やレイア ウトが異なるなど、異なるタイプの電子メールを使用できます。
    - **JMSFragmentRef**: Java メッセージキュー互換製品に通知を送信するために使用する *JMSFragment* を選択します。
  - **NotificationObjects**： 通知を作成するワークフローを選択します。
    - **NotificationObjects**：通知が作成されるワークフローを選択します.
      - **WorkflowRef**：通知を関連するワークフローに限定する ワークフローを選択します。ワークフローはいくつでも追加できます。

## 通知の操作

通知画面のページ上部のボタンから以下の操作が可能です：

- **新規作成**: 空の設定から開始します。
- **削除**: 現在の設定を削除します。
- **下書削除**: 最近リリースされたバージョンから新しいドラフトを作成します。現在の変更は失われます。
- **インポート**：設定を保存したXMLファイルをアップロードできます。
- **エキスポート**：設定を XML ファイルにダウンロードします。
- **XML編集**：XMLフォーマットで設定内容を直接編集することができます。
- **確認**：XSD スキーマに対して構成を検証します。これにより、XML構成が整形式で形式的に正しいことが保証されます。
- **リリース**：設定をJOCコックピットに公開します。変更は直ちに有効になります。

## 参照

### コンテキストヘルプ

- [ログ通知サービス](/service-log-notification)
- [モニター - エージェントモニター](/monitor-availability-agent)
- [モニター - コントローラーモニター](/monitor-availability-controller)
- [モニター - オーダー通知](/monitor-notifications-order)
- [モニター - システム通知](/monitor-notifications-system)
- [モニターサービス](/service-monitor)

###Product Knowledge Base

- [JS7 - How to set up e-mail notification for jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+set+up+e-mail+notification+for+jobs)
- [JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor)
- [JS7 - Monitor Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor+Service)
- [JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications)
  - [JS7 - Notifications - Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications+-+Configuration)
    - [JS7 - Notifications - Configuration Element CommandFragment](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications+-+Configuration+Element+CommandFragment)
    - [JS7 - Notifications - Configuration Element MailFragment](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications+-+Configuration+Element+MailFragment)
  - [JS7 - Passive Checks with a System Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Passive+Checks+with+a+System+Monitor)
- [JS7 - Workflow Instructions](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions)
  - [JS7 - Fail Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fail+Instruction)
  - [JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)

