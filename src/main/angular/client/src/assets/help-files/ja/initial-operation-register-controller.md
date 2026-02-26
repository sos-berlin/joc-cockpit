# 初期設定 - コントローラー登録

コントローラー、エージェント、JOCコックピットのインストール後に初期設定が必要です。

コントローラークラスターの利用は、[JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License) の契約が必要です。

- スタンドアロンコントローラーの使用
  - スタンドアロンコントローラーの使用：オープンソースライセンス、および商用ライセンスの契約者が使用できます。
- コントローラークラスターの使用：
  - 商用ライセンス契約者が利用できます、
  - 詳細は[JS7 - Management of Controller Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Controller+Clusters)をご参照ください。

スタンドアロンコントローラーの初期設定には以下が必要です。

- スタンドアロンコントローラーの登録
- [初期設定 - スタンドアロンエージェント登録](/initial-operation-register-agent-standalone) および[初期設定 - クラスターエージェント登録](/initial-operation-register-agent-cluster) を参照してください。

コントローラークラスターの初期設定

- コントローラークラスターの登録
- スタンドアロンエージェントまたはクラスターエージェントの登録が含まれます。

## コントローラー登録

最初にログインすると、コントローラーを登録するポップアップウィンドウが表示されます。このポップアップウィンドウは、メインメニューバーのホイールアイコンから *コントローラー・エージェント管理* を選択することで利用できます。

ポップアップウィンドウには、スタンドアロンコントローラーの登録が表示されます。コントローラークラスターの登録は、JOCコックピットに JS7 の商用ライセンスキーがある場合に行えます。JOCコックピットの左上にある JS7 ロゴをクリックすると、使用中のライセンス タイプが表示されます。

ユーザーは、JOCコックピットのサーバーからコントローラーのサーバーへのネットワーク接続が可能であること、およびファイアウォールのルールが接続を許可していることを確認する必要があります。

登録に成功すると、コントローラーインスタンスが *ダッシュボード* 画面に表示されます。

### スタンドアロンコントローラーの登録

ユーザは以下の入力を行います：

- **名称** は、[ダッシュボード - システムステータス](/dashboard-product-status) 表示の コントローラーの枠に表示される Cコントローラーのタイトルです。
- **スタンドアロンJOC URL** は、JOCコックピットがコントローラーに接続する際に使用するプロトコル、ホスト、ポート番号の URL を指定します（例：http://localhost:4444）。
  - コントローラーが HTTP を使用する場合、URL は *http* から始まります。コントローラーが HTTPS 用に設定されている場合は、*https* が使用されます。
  - コントローラーが JOCコックピットと同じマシンにインストールされている場合、ホスト名は *localhost* になります。それ以外の場合は、コントローラーのホストの FQDN を指定する必要があります。
  - コントローラーの *ポート番号* は、インストール時に決定されます。 

登録情報が送信されると、JOC Cockpit はスタンドアロンコントローラーへの接続を確立します。

### コントローラークラスターの登録

インストール前の前提条件

- JOCコックピットとすべてのコントローラーに有効な商用ライセンスキーが必要です。
- セカンダリーコントローラーは、./config/controller.conf ファイルに次の設定が必要です。： *js7.journal.cluster.node.is-backup=yes*
- プライマリーとセカンダリーの両方のコントローラーが稼働している必要があります。

ユーザーは以下の入力を行います：

- **プライマリーコントローラー** は、最初にアクティブな役割を割り当てるコントローラーです。アクティブロールは後で切り替えることができます。
  - **名称** は、[ダッシュボード - システムステータス](/dashboard-product-status) 表示のコントローラーの枠に表示されるコントローラーのタイトルです。
  - **JOCが見るURL** は、JOCコックピットがプライマリーコントローラーに接続する際に使用するプロトコル、ホスト、ポート番号の URL を指定します（例：http://primary-server:4444）。
  - **セカンダリーコントローラーが見るURL** は *JOCが見るURL* と同じです。プライマリーコントローラーとセカンダリーコントローラー間でプロキシサーバを運用している場合は、異なる URL が適用されます。この URL はセカンダリーコントローラーがプライマリーコントローラーに接続する際に使用します。
- **セカンダリコントローラー** は、最初にスタンバイの役割を割り当てるコントローラーです。
  - **名称** は、[ダッシュボード - システムステータス](/dashboard-product-status) 表示のコントローラーの枠に表示される コントローラーのタイトルです。
  - **JOCが見るURL** は、JOCコックピットがセカンダリーコントローラーに接続する際に使用するプロトコル、ホスト、ポート番号の URL を指定します（例：http://secondary-server:4444）。
  - **プライマリコントローラーが見るURL**は、ほとんどの場合、*JOCが見るURL*と同じです。プライマリーコントローラーとセカンダリーコントローラーの間でプロキシサーバを運用している場合は、異なる URL が適用されます。この URL はプライマリーコントローラーがセカンダリーコントローラーに接続する際に使用します。

登録情報を送信すると、JOCコックピットはプライマリーコントローラーとセカンダリーコントローラーの両方のインスタンスに接続を確立します。

## 参照

### コンテキストヘルプ

- [ダッシュボード - システムステータス](/dashboard-product-status)
- [初期設定 - クラスターエージェント登録](/initial-operation-register-agent-cluster)
- [初期設定 - スタンドアロンエージェント](/initial-operation-register-agent-standalone)

###Product Knowledge Base

- [JS7 - How to troubleshoot Controller Cluster Initial Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+troubleshoot+Controller+Cluster+Initial+Operation)
- [JS7 - Initial Operation for Controller Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Initial+Operation+for+Controller+Cluster)
- [JS7 - Initial Operation for Standalone Controller](https://kb.sos-berlin.com/display/JS7/JS7+-+Initial+Operation+for+Standalone+Controller)
- [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License)
- [JS7 - Management of Controller Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Controller+Clusters)

