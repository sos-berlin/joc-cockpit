# 設定 - 通知

JS7は、JS7製品の警告やエラー、ジョブやワークフローが失敗した場合に通知を送信します。また、ジョブやワークフローが正常に実行された場合にも通知を送ることができます。

- 通知は[Monitor Service](/service-monitor) から JOC Cockpit による継続的な監視に基づき、[JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor) のビューで視覚化されます。これには以下が含まれます：
  - コントローラとエージェントの可用性の監視
  - ワークフローとジョブの実行の監視。
- 通知は以下のいずれかの方法で転送されます：
  - 詳細は[JS7 - Notifications - Configuration Element MailFragment](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications+-+Configuration+Element+MailFragment) と[JS7 - How to set up e-mail notification for jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+set+up+e-mail+notification+for+jobs) を参照してください。
  -[JS7 - Passive Checks with a System Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Passive+Checks+with+a+System+Monitor) 詳細は[JS7 - Notifications - Configuration Element CommandFragment](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications+-+Configuration+Element+CommandFragment) を参照してください。

通知は、JOCコックピットのConfiguration-&gt;Notificationサブビューで管理されます。構成はXML形式で保存され、ページ上部に示されている*割り当てられたXSDスキーマ*に対して検証されます。

ページは左側の *Navigation Panel* と右側の *Details Panel* に分かれています。 

- 詳細パネル*は、要素ごとに入力フィールドと関連ドキュメントを提供します。
- 設定の詳細を入力すると、30秒以内に自動的に保存され、ページを離れると保存されます。

Notificationを変更する際の典型的なライフサイクルは以下の通りです。

- 設定の詳細を入力
- Validate*ボタンを押し、設定の整合性を確認します、
- Release*ボタンを押して設定を有効にします。

## ナビゲーションパネル

コンフィギュレーションはエレメントによるナビゲーションから提供されます。要素名をクリックすると、その要素が開き、利用可能なサブ要素が表示されます。要素名の左側にある矢印は、サブ要素が利用可能かどうかを示します。

要素の3点アクションメニューでは、以下の操作が可能です：

- **子ノードの追加** 現在の要素にノードを追加します。利用可能なノードタイプが表示されます。
- **選択したノードのすべての子ノードを表示**」は、可能性のある子ノードを表示するポップアップ・ウィンドウを表示します。この機能には、子ノードをトラバースしたり、子ノードを名前で検索したりする機能があります。
- **Copy/Paste(コピー/貼り付け)**は、子ノードを含むノードをコピーします。貼り付けは親ノードのアクションメニューから行えます。
- **Remove**は、ノードと子ノードを削除します。

### フラグメント

#### メッセージフラグメント

- **メッセージ
  - メッセージ** は、電子メールでユーザーに送信される内容や、システム・モニターに転送される内容 など、コマンド行ユーティリティのパラメータに使用される内容を定義します。
    - 電子メールで使用される*メッセージ*は、プレーン・テキストまたは HTML から使用される電子メール本文を表します。
    - コマンド・ラインで使用するメッセージは、*CommandFragmentRef* 要素で使用できる文字列を表します。
    - *Message*要素には、値のプレースホルダーであるモニター変数（ワークフローパス、オーダーIDなど）を含めることができます。
    - Message*要素はいくつでも追加できます。

#### モニターフラグメント

フラグメントには、以下の通知タイプに対応するさまざまな種類があります。

- **MailFragment**
  - メールを送信するには、以下の要素が必要です：
    - **MessageRef**：MessageRef**：メール本文を提供する Message 要素への参照を指定します。
    - **メール本文を提供する Message 要素への参照を指定します：Subject**：メールの件名を指定し、モニター変数を含めることができます。
    - **宛先**：受信者のメールアドレスを指定します。複数の受信者をカンマで区切ることができます。
  - 以下の要素はメール送信のオプションです：
    - **CC**：カーボンコピーの受信者。複数の受信者をカンマ区切りで指定できます。
    - **BCC**：ブラインドカーボンコピーの受信者。複数の受信者をコンマで区切ることができます。
    - **From**：メール送信に使用するアカウントの電子メールアドレス。メールサーバーの設定によって、特定のアカウントか任意のアカウントかが決まると考えてください。
- **コマンドフラグメント
  - **MessageRef**：Command 要素と共に転送されるコンテンツを提供する *Message* 要素への参照を指定します。メッセージ・コンテンツは、*${MESSAGE}} Monitor Variable から使用できます。
  - **Command**：システムモニタユーティリティなどに通知を転送するために使用する Linux/Windows 用のシェルコマンドを指定します。
    - たとえば、次のシェルコマンドを使用できます：
      - *echo "${MESSAGE}"&gt;&gt; /tmp/notification.log*。
      - echo* シェル・コマンドは、*${MESSAGE}}* Monitor Variable の内容を */tmp* ディレクトリのファイルに追加します。
- **JMSFragment**
  - フラグメント型は、JMS API を実装する Java メッセージ・キュー製品を統合するために使用されます。属性の値は、使用する JMS 製品に固有です。

#### オブジェクト・フラグメント 

- **ワークフロー**：ワークフロー**：ワークフロー構成はいくつでも追加でき、要素に割り当てられた一意の名 前によって区別されます。
  - **ワークフロー**：ワークフロー**：ワークフローはその名前で指定することができます。Path*属性はワークフローパスの一部を正規表現で指定することができます。
    - **WorkflowJob**：この要素を使用して、通知をワークフロー内の特定のジョブに制限することができます。
      - これには、*Job Name*属性および/または*Label*属性を指定するオプションが含まれます。両方の属性に定数値や正規表現を使用することができます。
      - 2.7.1より前のリリースの場合：
        - 要素を使用する際には、*ALL*、*NORMAL*、または*CRITICAL*のうちの1つであるcriticalityを指定する必要があります。
      - 2.7.1以降のリリースの場合：
        - クリティカリティは、*MINOR*, *NORMAL*, *MAJOR*, *CRITICAL*の中から1つ以上指定できます。
        - ALL*クリティカルは非推奨です。
      - return_code_from**と**return_code_to**属性は、指定されたリターンコードで完了したジョブに通知を限定するために使用することができます。シェルジョブのリターンコードはOSの終了コードに対応します。
    - 空です：[JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)Empty: *WorkflowJob* 要素が指定されていない場合、通知は[JS7 - Fail Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fail+Instruction) を含むすべての[JS7 - Workflow Instructions](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions) に適用されます。

### 通知

Notification は、前述の *Fragment* 要素を参照することで、有効な Notification をアクティブにします。

#### システム通知

- **SystemNotification**：上記の *MonitorFragment* を 1 つ以上選択します。同じフラグメント・タイプの複数の *Fragment* を選択できます。
  - 通知は、JS7 製品のログファイルから識別されるシステムエラーと警告から作成されます。[Log Notification Service](/service-log-notification) を参照してください。
  - この要素は、JOC Cockpit の[Monitor - System Notifications](/monitor-notifications-system) サブビューに入力するために使用されます。

#### 通知

- **通知**：Notification **Notification**：Notificationはいくつでも追加できます。Notification には *SUCCESS*、*WARNING*、*ERROR* のいずれかのタイプが割り当てられます。これにより、例えばジョブのエラーや警告が発生したときに通知を送ることができます。同様に、ワークフローが正常に実行された場合にも通知を送ることができます。ジョブが正常に実行された場合、ジョブエラーが発生しなかった場合と、警告が発生した場合の両方が含まれます。
  - **NotificationMonitors**：上記の **MonitorFragments* から 1 つ以上を選択します。同じフラグメントタイプの複数のフラグメントを選択することができます。
    - CommandFragmentRef**：*CommandFragmentRef** を選択します：使用する *CommandFragment* を選択します。
      - **CommandFragmentRef**：使用する *CommandFragment* を選択します：MessageRef**：*Command*で使用される*Message*要素を選択します。
    - **MailFragmentRef**：電子メールで通知を送信するために使用する *MailFragment* を選択します。複数の *MailFragment* 要素を参照する場合、異なる受信者、または電子メール本文の内容やレイア ウトが異なるなど、異なるタイプの電子メールを使用できます。
    - **JMSFragmentRef**：JMSFragmentRef**: Java メッセージ・キュー互換製品に通知を送信するために使用する *JMSFragment* を選択します。
  - **NotificationObjects**： **NotificationObjects**を選択します：NotificationObjects**：通知を作成するワークフローを選択します。
    - **NotificationObjects**：通知が作成されるワークフローを選択します：WorkflowRef**：通知を関連するワークフローに限定する **Workflows* 要素を選択します。ワークフロー参照はいくつでも追加できます。

## 通知に対する操作

通知]ページでは、ページ上部の関連ボタンから以下の操作が可能です：

- **新規**: 空の設定から開始します。
- **Remove**: 現在の設定を削除します。
- **Revert Draft**: 最近リリースされたバージョンから新しいドラフトを作成します。現在の変更は失われます。
- **Upload**：設定を保存したXMLファイルをアップロードできます。
- **設定を XML ファイルにダウンロードします。
- **XMLの編集**：XMLフォーマットでコンフィギュレーションを直接編集することができます。
- **XSD スキーマに対して構成を検証します。これにより、XML構成が整形式で形式的に正しいことが保証されます。
- **設定をJOC Cockpitに公開します。変更は直ちに有効になります。

## 参考文献

### コンテキストヘルプ

-[Log Notification Service](/service-log-notification)
-[Monitor - Agent Availability](/monitor-availability-agent)
-[Monitor - Controller Availability](/monitor-availability-controller)
-[Monitor - Order Notifications](/monitor-notifications-order)
-[Monitor - System Notifications](/monitor-notifications-system)
-[Monitor Service](/service-monitor)

###Product Knowledge Base

-[JS7 - How to set up e-mail notification for jobs](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+set+up+e-mail+notification+for+jobs)
-[JS7 - Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor)
-[JS7 - Monitor Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Monitor+Service)
-[JS7 - Notifications](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications)
  -[JS7 - Notifications - Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications+-+Configuration)
    -[JS7 - Notifications - Configuration Element CommandFragment](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications+-+Configuration+Element+CommandFragment)
    -[JS7 - Notifications - Configuration Element MailFragment](https://kb.sos-berlin.com/display/JS7/JS7+-+Notifications+-+Configuration+Element+MailFragment)
  -[JS7 - Passive Checks with a System Monitor](https://kb.sos-berlin.com/display/JS7/JS7+-+Passive+Checks+with+a+System+Monitor)
-[JS7 - Workflow Instructions](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflow+Instructions)
  -[JS7 - Fail Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Fail+Instruction)
  -[JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)

