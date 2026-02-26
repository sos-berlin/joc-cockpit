# 初期設定 - サブエージェントクラスター登録

初期設定は、コントローラー、エージェント、JOCコックピットのインストール後に行います。サブエージェントクラスターの登録は、[初期設定 - エージェントクラスター登録](/initial-operation-register-agent-cluster) 完了後に行います。

## アーキテクチャー

### エージェント

- **スタンドアロンエージェント** は、オンプレミスやVM/コンテナからリモートマシン上でジョブを実行します。エージェントは個別に運用され、コントローラーによって管理されます。
- **クラスターエージェント**
   - **ディレクターエージェント** は、クラスターエージェント内の *サブエージェント* を管理します。ディレクターエージェントはアクティブパッシブクラスタリングで2つのインスタンスから運用され、コントローラーによって管理されます。
  - **サブエージェント** は、オンプレミスのリモートマシンやVM/コンテナからジョブを実行します。これらはクラスターエージェントのワーカーノードと考えることができ、*ディレクターエージェント* によって管理されます。

### 接続

- **スタンドアロンエージェント**、**ディレクターエージェント** は、コントローラーから接続されます。
- クラスターエージェント内の **サブエージェント** は、*ディレクターエージェント* から接続されます。

## サブエージェントクラスターの登録

サブエージェントクラスターの登録には、以下の登録が含まれます。

- クラスターエージェント内の使用するサブエージェントを *選択* できます。
- サブエージェントの実行順序
  - *active-active（ラウンドロビンモード）*：次のジョブは必ず次のサブエージェントで実行されます。これは、選択された全てのサブエージェントでジョブが実行されることを意味します。詳細は[JS7 - Agent Cluster - Active-Active Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Active+Subagent+Cluster) を参照してください。
  - *active-passive（固定順モード）*: 最初のサブエージェントが必ずジョブ実行に使用されます。最初のサブエージェントが利用できない場合のみ、次のサブエージェントが使用されます。詳細は[JS7 - Agent Cluster - Active-Passive Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Passive+Subagent+Cluster) を参照してください。
  - *metrics-based（メトリックスベース）*: CPUやメモリの消費量、並列タスク数などのルールに基づいて、最適なサブエージェントがジョブの実行に選択されます。詳細は[JS7 - Agent Cluster - Metrics-based Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Metrics-based+Subagent+Cluster) を参照してください。

詳細は[初期設定 - サブエージェントクラスター](/initial-operation-agent-subagent-cluster)

## 参照

### コンテキストヘルプ

- [ダッシュボード - システムステータス](/dashboard-product-status)
- [初期設定 - クラスターエージェント登録](/initial-operation-register-agent-cluster)
- [初期設定 - コントローラー登録](/initial-operation-register-controller)
- [初期設定 - サブエージェント登録](/initial-operation-register-agent-subagent)
- [初期設定 - サブエージェントクラスター](/initial-operation-agent-subagent-cluster)

###Product Knowledge Base

- [JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)
  - [JS7 - Agent Cluster - Active-Active Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Active+Subagent+Cluster)
  - [JS7 - Agent Cluster - Active-Passive Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Passive+Subagent+Cluster)
  - [JS7 - Agent Cluster - Metrics-based Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Metrics-based+Subagent+Cluster)

