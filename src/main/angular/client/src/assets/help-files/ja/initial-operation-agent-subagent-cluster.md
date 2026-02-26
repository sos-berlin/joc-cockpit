# 初期設定 - サブエージェントクラスター

初期設定は、コントローラー、エージェント、JOCコックピットのインストール後に行います。サブエージェントクラスターの登録は、[初期設定 - エージェントクラスター登録](/initial-operation-register-agent-cluster) 完了後に行います。

## サブエージェントクラスター

サブエージェントクラスターの構成には以下が含まれます。

- エージェントクラスタ内のディレクターエージェントとサブエージェントの選択
- サブエージェントの動作順序
  - *active-passive（固定順モード）*: ジョブの実行には最初のサブエージェントが使用されます。最初のサブエージェントが利用できない場合のみ、次のサブエージェントが使用されます。詳細は[JS7 - Agent Cluster - Active-Passive Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Passive+Subagent+Cluster) を参照してください。
  - *active-active（ラウンドロビンモード）*: 次のジョブは順次、次のサブエージェントで実行されます。これは選択された全てのサブエージェントでジョブが実行されることを意味します。詳細は -[JS7 - Agent Cluster - Active-Active Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Active+Subagent+Cluster) を参照してください。
  - *metrics-based（メトリックベース）*：CPUやメモリの消費量、並列タスク数などのルールに基づいて、次のサブエージェントが選択されます。詳細は[JS7 - Agent Cluster - Metrics-based Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Metrics-based+Subagent+Cluster) を参照してください。

### エージェントの選択

左側のパネルには、選択可能なディレクターエージェントを含むサブエージェントのリストが表示されます。

サブエージェントは右パネルのドラッグエリアにドラッグ＆ドロップすることができます。サブエージェントの選択を解除するには、右側のパネルで *ここにドロップしてサブエージェントを削除* と表示されているドラッグエリアにドラッグ＆ドロップします。

### エージェントの動作順序

サブエージェントの動作順序によって、クラスターのタイプが決まります：

#### active-passive（固定順モード）サブエージェントクラスター

サブエージェントは *同じ列* にドラッグ＆ドロップされます：

- 同じ列のサブエージェントはactive-passive（固定順モード）を指定し、最初のサブエージェントが利用可能な限り、すべてのジョブを実行しますす。最初のサブエージェントが使用できない場合のみ、次のサブエージェントが使用されます。
- 詳細は[JS7 - Agent Cluster - Active-Passive Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Passive+Subagent+Cluster) を参照してください。

#### active-active（ラウンドロビンモード）サブエージェントクラスター

サブエージェントは、*同じ行* にドラッグ＆ドロップされます：

- 同じ行のサブエージェントは、次のジョブが順次、次のサブエージェントで実行されるactive-active（ラウンドロビンモード）を指定します。
- 詳細は[JS7 - Agent Cluster - Active-Active Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Active+Subagent+Cluster) を参照してください。

#### metrics-based（メトリックベース）サブエージェントクラスター

サブエージェントは *同じ行* にドラッグ＆ドロップされ、metrics-based（メトリックベース）が割り当てられます：

- 同じ行のサブエージェントには、メトリックベースの優先順位が指定されます：
    - サブエージェントの枠にマウスを置くと、アクションメニューが表示されます： *メトリック優先度* 画面では、式から優先度を指定できます。
- 詳細は[JS7 - Agent Cluster - Metrics-based Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Metrics-based+Subagent+Cluster) を参照してください。

メトリックベースの優先度の式

| インジケーター変数 | メトリック |
| ----- | ----- |
| $js7SubagentProcessCount |サブエージェントで実行されているプロセスの数。|
| $js7ClusterSubagentProcessCount |サブエージェントで実行されている指定されたサブエージェントクラスターのプロセス数。|
| |下記で説明されているように、以下のインジケーターが利用可能です。 https://docs.oracle.com/en/java/javase/17/docs/api/jdk.management/com/sun/management/OperatingSystemMXBean.html
| $js7CpuLoad |OSの "最近のCPU使用率"を返します。この値は[0.0～1.0]の範囲の浮動小数点数で表されます。値が0.0の場合、観測期間中にすべてのCPUがアイドル状態であったことを示し、1.0の場合は観測期間中すべてのCPUが100%の稼働率で動作していたことを示します。0.0から1.0の間の値は、システムで実行されているアクティビティに応じて発生し得ます。直近のCPU使用率が取得できない場合、メソッドは負の値を返します。負の値はデータが欠落していることを示すものとして扱われます。なお、CPU負荷情報はmacOSでは取得できず、欠落値として報告されます。|
| $js7CommittedVirtualMemorySize | 実行中のプロセスに対して保証される仮想メモリの容量をバイト単位で返します。サポートされていない場合は-1を返します。負の値は未サポートとして報告されます。|
| $js7FreeMemorySize | 空きメモリの量をバイト単位で返します。|
| $js7TotalMemorySize | メモリの合計量をバイト単位で返します。メモリの総量をバイト単位で返します。 |


## 参照

### コンテキストヘルプ

- [初期設定 - クラスターエージェント登録](/initial-operation-register-agent-cluster)
- [初期設定 - サブエージェントクラスター登録](/initial-operation-register-agent-subagent-cluster)

###Product Knowledge Base

- [JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)
  - [JS7 - Agent Cluster - Active-Active Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Active+Subagent+Cluster)
  - [JS7 - Agent Cluster - Active-Passive Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Passive+Subagent+Cluster)
  - [JS7 - Agent Cluster - Metrics-based Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Metrics-based+Subagent+Cluster)

