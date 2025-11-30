# 初期操作 - サブエージェントの登録

JS7 Controller、Agent、JOC Cockpit のインストール後に行います。サブエージェントの登録は、[Initial Operation - Register Agent Cluster](/initial-operation-register-agent-cluster) 完了後に行います。

## アーキテクチャ

### エージェント

- **スタンダロンエージェント**は、オンプレミスとコンテナからリモートマシン上でジョブを実行します。エージェントは個別に運用され、コントローラによって管理されます。
- **エージェントクラスタ
  - **Directorエージェント**は、エージェントクラスタ内の*Subagents*をオーケストレーションします。これらのエージェントはアクティブパッシブクラスタリングで2つのインスタンスから運用され、Controllerによって管理されます。
  - **Subagents**はオンプレミスのリモートマシンやコンテナからジョブを実行します。これらはエージェントクラスタのワーカーノードと考えることができ、**Director Agent*によって管理されます。

### 接続

- **Standalone Agent**, **Director Agent** 接続は、Controller によって確立されます。 
- エージェントクラスタ内の**サブエージェント**接続は、**Director Agent**によって確立されます。

## サブエージェントの登録

ユーザーは、Director Agent のサーバーからサブエージェントのサーバーへのネットワーク接続が利用可能であること、およびファイアウォールルールがサブエージェントのポートへの接続を許可していることを確認する必要があります。

メインメニューバーのホイールアイコンから *Manage Controllers/Agents* ページを開き、エージェントクラスタのアクションメニューから *Add Subagent* 操作を行います。これにより、サブエージェントを登録するためのポップアップウィンドウが表示されます。

ユーザは以下の入力を行います：

- **サブエージェントID**はサブエージェントの一意な識別子で、サブエージェントの有効期間中は変更できません。サブエージェントID**はジョブやワークフローでは表示されません。
- **タイトル(Title)**はサブエージェントの説明です。
- **URL** は、Director エージェントがサブエージェントに接続するために使用するプロトコル、ホスト、ポートの URL を指定します (例: http://localhost:4445)。
  - サブエージェントがプレーン HTTP を使用する場合、URL は *http* プロトコルから始まります。サブエージェントが HTTPS 用に設定されている場合、*https* プロトコルが使用されます。
  - サブエージェントが Director エージェントと同じマシンにインストールされている場合、ホスト名は *localhost* になります。そうでない場合は、サブエージェントのホストの FQDN を指定します。
  - Subagent の *port* はインストール時に決定されます。 
  - **As own Subagent Cluster** オプションで、Subagent 用の Subagent Cluster を作成します。[Initial Operation - Register Subagent Cluster](/initial-operation-register-agent-subagent-cluster) を参照してください。

登録に成功すると、サブエージェントが[Resources - Agents](/resources-agents) ビューに表示されます。

## 参考文献

### コンテキストヘルプ

-[Dashboard - Product Status](/dashboard-product-status)
-[Initial Operation - Register Agent Cluster](/initial-operation-register-agent-cluster)
-[Initial Operation - Register Controller](/initial-operation-register-controller)
-[Initial Operation - Register Subagent Cluster](/initial-operation-register-agent-subagent-cluster)

###Product Knowledge Base

-[JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)
-[JS7 - Management of Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Agent+Clusters)

