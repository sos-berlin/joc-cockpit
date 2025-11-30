# 初期操作 - エージェントクラスタの登録

初期運用は、JS7 コントローラ、エージェント、JOC コックピットのインストール後に行います。エージェントクラスタの登録は、[Initial Operation - Register Controller](/initial-operation-register-controller) 完了後に行われます。

エージェントクラスタの運用は、[JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License) の契約に従います。

- スタンドアロンエージェントの使用
  - スタンドアロンエージェントの使用: オープンソースライセンス保有者および商用ライセンス保有者が使用できます。
- エージェントクラスタの使用：
  - 商用ライセンス所有者が利用できます、
  - 詳細は[JS7 - Management of Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Agent+Clusters)

## アーキテクチャ

### エージェント

- **スタンダロンエージェント**は、オンプレミスとコンテナからリモートマシン上でジョブを実行します。エージェントは個別に運用され、コントローラによって管理されます。
- **エージェントクラスタ
  - **Directorエージェント**は、エージェントクラスタ内の*Subagents*をオーケストレーションします。これらのエージェントはアクティブパッシブクラスタリングで2つのインスタンスから運用され、Controllerによって管理されます。
  - **Subagents**はオンプレミスのリモートマシンやコンテナからジョブを実行します。これらはエージェントクラスタのワーカーノードと考えることができ、**Director Agent*によって管理されます。

### 接続

- **Standalone Agent**, **Director Agent** 接続は、Controller によって確立されます。 
- エージェントクラスタ内の**サブエージェント**接続は、**Director Agent**によって確立されます。

## エージェントクラスタの登録

エージェントクラスタの登録には、プライマリとセカンダリのDirector Agentの登録が含まれます。後のサブエージェントの登録については -[Initial Operation - Register Subagent](/initial-operation-register-agent-subagent) を参照してください。

インストール前の前提条件

- JOC コックピット、コントローラ、およびすべての Director Agent インスタンスには、有効な JS7 ライセンスキーが必要です。
- セカンダリ・ディレクター・エージェントは、./config/agent.conf ファイルに次の設定を保持する必要があります： *js7.journal.cluster.node.is-backup=yes*。
- プライマリとセカンダリの Director Agent インスタンスの両方が稼働している必要があります。

ユーザーは、コントローラーのサーバーから両方の Director Agent のサーバーへのネットワーク接続が利用可能であること、およびファイアウォールルールが Director Agent のポートへの接続を許可していることを確認する必要があります。

メインメニューバーのホイールアイコンから *Manage Controllers/Agents* ページを開き、Controller のアクションメニューから *Add Agent Cluster* 操作を行います。これにより、エージェントクラスタの登録用ポップアップウィンドウが表示されます。

ユーザは以下の入力を行います：

- **エージェントID**はエージェントクラスタの一意の識別子で、クラスタの有効期間中は変更できません。エージェントID**は、ジョブおよびワークフローでは表示されません。
- **エージェントクラスタ名** は、エージェントクラスタの一意の名前です。ジョブにエージェントを割り当てる場合、**エージェントクラスタ名**が使用されます。エージェントクラスタ名**を後で変更するには、*エイリアス名**から以前の*エージェントクラスタ名**を引き続き使用する必要があります。
- **Title**は、エージェントクラスタに追加できる説明です。
- **エイリアス名** は、同じエージェントクラスタの代替名です。ジョブにエージェントを割り当てる場合、**エイリアスクラスタ名** も提供されます。 *エイリアスクラスタ名** は、例えばテスト環境が本番環境より少ないエージェントクラスタを含んでいる場合に使用できます。
- **プライマリディレクタエージェント
  - **サブエージェント ID** は、プライマリディレクタエージェントの一意の識別子です。サブエージェント ID** は、ジョブおよびワークフローでは表示されません。
  - **タイトル** は、ディレクターエージェントに追加できる説明です。
  - **URL** は、プライマリ Director エージェントに接続するためにコントローラーが使用するプロトコル、ホスト、ポートから URL を指定します。例えば、http://localhost:4445。
    - Director Agent がプレーン HTTP を使用する場合、URL は *http* プロトコルから開始します。Director Agent が HTTPS 用に設定されている場合は、*https* プロトコルが使用されます。
    - Director Agent がコントローラーと同じマシンにインストールされている場合、ホスト名は *localhost* になります。そうでない場合は、Director Agent のホストの FQDN を指定します。
    - Director Agent の *port* は、インストール中に決定されます。 
  - **As own Subagent Cluster** オプションで、各プライマリとセカンダリの Director Agent にサブエージェントクラスターを作成します。[Initial Operation - Register Subagent Cluster](/initial-operation-register-agent-subagent-cluster) を参照してください。
- **セカンダリディレクタエージェント
  - **サブエージェント ID** は、セカンダリディレクタエージェントの一意の識別子です。サブエージェントID** は、ジョブおよびワークフローでは表示されません。
  - **タイトル** は、ディレクターエージェントに追加できる説明です。
  - **URL** は、*Primary Director Agent* と同様に、コントローラーから Secondary Director Agent に接続するためのプロトコル、ホスト、ポートの URL を指定します。

登録に成功すると、エージェントは[Resources - Agents](/resources-agents) ビューに表示されます。

## 参照

### コンテキストヘルプ

-[Dashboard - Product Status](/dashboard-product-status)
-[Initial Operation - Register Standalone Agent](/initial-operation-register-agent-standalone)
-[Initial Operation - Register Subagent](/initial-operation-register-agent-subagent)
-[Initial Operation - Register Subagent Cluster](/initial-operation-register-agent-subagent-cluster)
-[Initial Operation - Register Controller](/initial-operation-register-controller)

###Product Knowledge Base

-[JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)
-[JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License)
-[JS7 - How to troubleshoot Agent Initial Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+troubleshoot+Agent+Initial+Operation)
-[JS7 - Management of Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Agent+Clusters)

