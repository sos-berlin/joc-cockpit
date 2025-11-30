# 初期操作 - サブエージェントクラスターの登録

初期運用は、JS7 Controller、Agent、JOC Cockpit のインストール後に行います。サブエージェントクラスタの登録は、[Initial Operation - Register Agent Cluster](/initial-operation-register-agent-cluster) 完了後に行われます。

## アーキテクチャ

### エージェント

- **スタンダロンエージェント**は、オンプレミスとコンテナからリモートマシン上でジョブを実行します。エージェントは個別に運用され、コントローラによって管理されます。
- **エージェントクラスタ
  - **Directorエージェント**は、エージェントクラスタ内の*Subagents*をオーケストレーションします。これらのエージェントはアクティブパッシブクラスタリングで2つのインスタンスから運用され、Controllerによって管理されます。
  - **Subagents**はオンプレミスのリモートマシンやコンテナからジョブを実行します。これらはエージェントクラスタのワーカーノードと考えることができ、**Director Agent*によって管理されます。

### 接続

- **Standalone Agent**, **Director Agent** 接続は、Controller によって確立されます。 
- エージェントクラスタ内の**サブエージェント**接続は、**Director Agent**によって確立されます。

## サブエージェントクラスターの登録

サブエージェントクラスターの登録には、以下の登録が含まれます。

- エージェントクラスタ内のディレクターエージェントとサブエージェントの*選択*。
- サブエージェントの動作シーケンス
  - *active-active*：次のジョブは次のサブエージェントで実行されます。これは、選択された全てのサブエージェントが関与することを意味します。詳細は[JS7 - Agent Cluster - Active-Active Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Active+Subagent+Cluster) をご覧ください。
  - *active-passive*: 最初のSubagentのみがジョブ実行に使用されます。利用できない場合は、次のSubagentが使用されます。詳細は[JS7 - Agent Cluster - Active-Passive Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Passive+Subagent+Cluster) を参照してください。
  - *metrics-based*: CPUやメモリの消費量などのルールに基づいて、次のSubagentがジョブの実行に選択されます。詳細は[JS7 - Agent Cluster - Metrics-based Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Metrics-based+Subagent+Cluster) を参照してください。

詳細は[Initial Operation - Subagent Cluster](/initial-operation-agent-subagent-cluster)

## 参考文献

### コンテキストヘルプ

-[Dashboard - Product Status](/dashboard-product-status)
-[Initial Operation - Register Agent Cluster](/initial-operation-register-agent-cluster)
-[Initial Operation - Register Controller](/initial-operation-register-controller)
-[Initial Operation - Register Subagent](/initial-operation-register-agent-subagent)
-[Initial Operation - Subagent Cluster](/initial-operation-agent-subagent-cluster)

###Product Knowledge Base

-[JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)
  -[JS7 - Agent Cluster - Active-Active Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Active+Subagent+Cluster)
  -[JS7 - Agent Cluster - Active-Passive Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Passive+Subagent+Cluster)
  -[JS7 - Agent Cluster - Metrics-based Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Metrics-based+Subagent+Cluster)

