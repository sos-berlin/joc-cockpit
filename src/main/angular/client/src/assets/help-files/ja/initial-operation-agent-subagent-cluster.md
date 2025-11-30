# 初期運用 - サブエージェントクラスター

初期運用は、JS7 Controller、Agent、JOC Cockpit のインストール後に行います。サブエージェントクラスタの登録は、[Initial Operation - Register Agent Cluster](/initial-operation-register-agent-cluster) 完了後に行われます。

## サブエージェントクラスター

サブエージェントクラスターの構成には以下が含まれます。

- エージェントクラスタ内のディレクターエージェントとサブエージェントの選択
- サブエージェントの動作シーケンス
  - *active-passive*: ジョブの実行には最初のSubagentのみが使用されます。Subagentが利用できない場合は、次のSubagentが使用されます。詳細は[JS7 - Agent Cluster - Active-Passive Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Passive+Subagent+Cluster) を参照してください。
  - *active-active*: 次のジョブが次のSubagentで実行されます。これは選択された全てのサブエージェントが関与することを意味します。詳細は -[JS7 - Agent Cluster - Active-Active Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Active+Subagent+Cluster) を参照してください。
  - *metrics-based*：CPUやメモリの消費量などのルールに基づいて、次のSubagentがジョブ実行のために選択されます。詳細は[JS7 - Agent Cluster - Metrics-based Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Metrics-based+Subagent+Cluster) を参照してください。

### エージェントの選択

左側のパネルには、選択可能な Director Agent を含む Subagent のリストが表示されます。

サブエージェントは右パネルのドラッグエリアにドラッグ＆ドロップすることができます。サブエージェントの選択を解除するには、右側のパネルで *Drop here to remove Subagent* と表示されているドラッグエリアにドラッグ＆ドロップします。

### エージェントのシーケンス

サブエージェントの順序によって、クラスタのタイプが決まります：

#### アクティブ・パッシブ・サブエージェント・クラスター

サブエージェントは同じ列*にドラッグ＆ドロップされます：

- 同じ列のSubagentはアクティブ-パッシブクラスタ（固定優先）を指定し、最初のSubagentが利用可能な限り、すべてのジョブに使用されます。最初のSubagentが使用できない場合のみ、次のSubagentが使用されます。
- 詳細は[JS7 - Agent Cluster - Active-Passive Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Passive+Subagent+Cluster) を参照してください。

#### アクティブ-アクティブサブエージェントクラスター

サブエージェントは、同じ行*にドラッグ＆ドロップされます：

- 同じ行のサブエージェントは、次のジョブが次のサブエージェントで実行されるアクティブ・アクティブ・クラスタ（ラウンドロビン）を指定します。
- 詳細は[JS7 - Agent Cluster - Active-Active Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Active+Subagent+Cluster) を参照してください。

#### メトリクスベースのサブエージェントクラスタ

サブエージェントは同じ行*にドラッグ＆ドロップされ、*Metrics-based Priority*が割り当てられます：

- 同じ行のサブエージェントには、メトリクス・ベースの優先順位が指定されます：
    - Subagentの矩形にマウスを置くと、3ドットのアクション・メニューが表示されます： *Metrics-based Priority* アクションでは、式から優先度を指定できます。
- 詳細は[JS7 - Agent Cluster - Metrics-based Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Metrics-based+Subagent+Cluster) を参照してください。

メトリクスベースの優先度の式

| Indicator Variable | Metric |
| ----- | ----- |
| js7SubagentProcessCount｜サブエージェントで実行されているプロセスの数。|
| js7ClusterSubagentProcessCount | サブエージェントで実行されている指定されたサブージェント・クラスターのプロセス数。|
| https://docs.oracle.com/en/java/javase/17/docs/api/jdk.management/com/sun/management/OperatingSystemMXBean.html｜｜で説明されているように、以下のインジケータが利用可能です。
| js7CpuLoad｜オペレーティング環境の "最近のCPU使用率 "を返します。この値は[0.0,1.0]間隔のdoubleです。0.0の値は、最近観測された期間中、すべてのCPUがアイドル状態であったことを意味し、1.0の値は、最近観測された期間中、すべてのCPUが100%アクティブに動作していたことを意味します。0.0と1.0の間のすべての値は、起こっている活動に応じて可能です。最近の CPU 使用率が利用できない場合、このメソッドは負の値を返します。負の値は欠落として報告されます。CPU負荷はMacOSでは利用できないため、missingとして報告されます。|
| js7CommittedVirtualMemorySize｜実行中のプロセスが利用可能であることが保証されている仮想メモリの量をバイト単位で返します。負の値は不足として報告されます。|
| js7FreeMemorySize | 空きメモリの量をバイト単位で返します。js7FreeMemorySize｜空きメモリの量をバイト単位で返します。|
| js7TotalMemorySize関数は、メモリの合計量をバイト単位で返します。メモリの総量をバイト単位で返します。

## 参照

### コンテキストヘルプ

-[Initial Operation - Register Agent Cluster](/initial-operation-register-agent-cluster)
-[Initial Operation - Register Subagent Cluster](/initial-operation-register-agent-subagent-cluster)

###Product Knowledge Base

-[JS7 - Agent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster)
  -[JS7 - Agent Cluster - Active-Active Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Active+Subagent+Cluster)
  -[JS7 - Agent Cluster - Active-Passive Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Active-Passive+Subagent+Cluster)
  -[JS7 - Agent Cluster - Metrics-based Subagent Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Agent+Cluster+-+Metrics-based+Subagent+Cluster)

