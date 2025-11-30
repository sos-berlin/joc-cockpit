# 初期動作 - レジスタコントローラ

JS7 Controller、Agent、JOC Cockpit のインストール後に初期操作を行います。

コントローラクラスタの運用は、[JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License) の契約に従います。

- スタンドアロンコントローラの使用
  - スタンドアロンコントローラの使用：オープンソースライセンスの所有者および商用ライセンスの所有者が使用できます。
- コントローラクラスタの使用：
  - 商用ライセンス所有者が利用できます、
  - 詳細は[JS7 - Management of Controller Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Controller+Clusters)

スタンドアロンコントローラの初期動作には以下が含まれます。

- スタンドアロンコントローラの登録
- [Initial Operation - Register Standalone Agent](/initial-operation-register-agent-standalone) および[Initial Operation - Register Cluster Agent](/initial-operation-register-agent-cluster) を参照してください。

コントローラクラスタの初期操作

- コントローラクラスタの登録
- スタンドアロンエージェントまたはクラスタエージェントの登録が含まれます。

## コントローラの登録

最初にログインすると、コントローラを登録するポップアップウィンドウが表示されます。このポップアップウィンドウは、メインメニューバーのホイールアイコンから *Manage Controllers/Agents* ページを選択することで利用できます。

ポップアップウィンドウには、スタンドアロンコントローラの登録が表示されます。コントローラクラスタの登録は、JOC Cockpit に JS7 のライセンスキーがある場合に行われます。JOC Cockpit GUI の左上にある JS7 ロゴをクリックすると、使用中のライセンス タイプが表示されます。

ユーザーは、JOC Cockpit のサーバーからコントローラーのサーバーへのネットワーク接続が可能であること、およびファイアウォールのルールが接続を許可していることを確認する必要があります。

登録に成功すると、Controller インスタンスが *Dashboard* ビューに表示されます。

### スタンドアロンコントローラの登録

ユーザは以下の入力を行います：

- **Caption**は、[Dashboard - Product Status](/dashboard-product-status) パネルの Controller の四角形と共に表示される Controller のタイトルです。
- **JOC Cockpit Connection to Controller** は、JOC Cockpit がコントローラに接続する際に使用するプロトコル、ホスト、ポートの URL を指定します（例：http://localhost:4444）。
  - コントローラがプレーン HTTP を使用する場合、URL は *http* プロトコルから始まります。コントローラが HTTPS 用に設定されている場合は、*https* プロトコルが使用されます。
  - Controller が JOC Cockpit と同じマシンにインストールされている場合、ホスト名は *localhost* になります。それ以外の場合は、Controller のホストの FQDN を指定する必要があります。
  - Controllerの*port*は、インストール時に決定されます。 

登録情報が送信されると、JOC Cockpit はスタンドアロンコントローラーへの接続を確立します。

### コントローラクラスタの登録

インストール前の前提条件

- JOC CockpitとすべてのControllerインスタンスに有効なJS7ライセンスキーが必要です。
- セカンダリコントローラは、./config/controller.conf ファイルに次の設定を保持している必要があります： *js7.journal.cluster.node.is-backup=yes*。
- プライマリとセカンダリの両方のコントローラインスタンスが稼働している必要があります。

ユーザは以下の入力を行います：

- **プライマリコントローラ** は、最初にアクティブな役割を割り当てるコントローラインスタンスです。アクティブロールは後で切り替えることができます。
  - **Caption** は、[Dashboard - Product Status](/dashboard-product-status) パネルのコントローラのレクタングルと一緒に表示されるコントローラのタイトルです。
  - **JOC Cockpit Connection to Primary Controller** は、JOC Cockpit がプライマリコントローラに接続する際に使用するプロトコル、ホスト、ポートの URL を指定します（例：http://primary-server:4444）。
  - ほとんどの場合、**Secondary Controller connection to Primary Controller** は *JOC Cockpit Connection to Primary Controller** と同じです。プライマリコントローラとセカンダリコントローラ間でプロキシサーバを運用している場合は、異なる URL が適用されます。この URL はセカンダリコントローラーがプライマリコントローラーに接続する際に使用します。
- **セカンダリコントローラー**は、最初にスタンバイロールが割り当てられるコントローラーインスタンスです。
  - **Caption** は、[Dashboard - Product Status](/dashboard-product-status) パネルの Controller のレクタングルと一緒に表示される Controller のタイトルです。
  - **JOC Cockpit Connection to Secondary Controller** は、JOC Cockpit がセカンダリコントローラーに接続する際に使用するプロトコル、ホスト、ポートの URL を指定します（例：http://secondary-server:4444）。
  - プライマリコントローラからセカンダリコントローラへの接続**は、ほとんどの場合、*JOC Cockpit Connection to Secondary Controller**と同じです。プライマリコントローラとセカンダリコントローラの間でプロキシサーバを運用している場合は、異なる URL が適用されます。この URL はプライマリコントローラがセカンダリコントローラに接続する際に使用します。

登録情報を送信すると、JOC Cockpit は Primary Controller と Secondary Controller の両方のインスタンスに接続を確立します。

## 参考

### コンテキストヘルプ

-[Dashboard - Product Status](/dashboard-product-status)
-[Initial Operation - Register Cluster Agent](/initial-operation-register-agent-cluster)
-[Initial Operation - Register Standalone Agent](/initial-operation-register-agent-standalone)

###Product Knowledge Base

-[JS7 - How to troubleshoot Controller Cluster Initial Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+troubleshoot+Controller+Cluster+Initial+Operation)
-[JS7 - Initial Operation for Controller Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Initial+Operation+for+Controller+Cluster)
-[JS7 - Initial Operation for Standalone Controller](https://kb.sos-berlin.com/display/JS7/JS7+-+Initial+Operation+for+Standalone+Controller)
-[JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License)
-[JS7 - Management of Controller Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Controller+Clusters)

