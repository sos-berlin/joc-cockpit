# 初期操作 - スタンドアロンエージェントの登録

イニシャルオペレーションは、JS7 コントローラ、エージェント、JOC コックピットのインストール後に実行されます。エージェント登録は[Initial Operation - Register Controller](/initial-operation-register-controller) 完了後に行われます。

## スタンドアロンエージェントの登録

コントローラのサーバーからエージェントのサーバーへのネットワーク接続が可能であること、ファイアウォールのルールがエージェントのポートへの接続を許可していることを確認してください。

メインメニューバーのホイールアイコンから *Manage Controllers/Agents* ページを開き、Controller のアクションメニューから *Add Standalone Agent* 操作を行います。これにより、スタンドアロンエージェントの登録用ポップアップウィンドウが表示されます。

ユーザは以下の入力を行います：

- **エージェント ID**はエージェントの一意の識別子で、エージェントの有効期間中は変更できません。エージェント ID**は、ジョブおよびワークフローでは表示されません。
- **エージェント名** は、エージェントの一意の名前です。ジョブにエージェントを割り当てる場合、**エージェント名**が使用されます。エージェント名**を後で変更する場合は、*エイリアス名**から以前の*エージェント名**を引き続き使用する必要があります。
- **タイトル** はエージェントに追加できる説明です。
- **エイリアス名** は、同じエージェントの別の名前です。ジョブにエージェントを割り当てる場合、**エイリアス名**も提供されます。 *エイリアス名** は、例えばテスト環境が本番環境より少ないエージェントを含んでいる場合に使用できます。
- **URL** は、エージェントへの接続にコントローラが使用するプロトコル、ホスト、ポート、例えば http://localhost:4445 から URL を指定します。
  - エージェントがプレーン HTTP を使用する場合、URL は *http* プロトコルから始まります。エージェントが HTTPS 用に設定されている場合は、*https* プロトコルが使用されます。
  - エージェントがコントローラと同じマシンにインストールされている場合、ホスト名は *localhost* になります。それ以外の場合は、エージェントのホストの FQDN を指定する必要があります。
  - エージェントの *port* はインストール時に決定されます。 

登録に成功すると、エージェントは[Resources - Agents](/resources-agents) ビューに表示されます。

## 参考文献

### コンテキストヘルプ

-[Dashboard - Product Status](/dashboard-product-status)
-[Initial Operation - Register Agent Cluster](/initial-operation-register-agent-cluster)
-[Initial Operation - Register Controller](/initial-operation-register-controller)

###Product Knowledge Base

-[JS7 - How to troubleshoot Agent Initial Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+troubleshoot+Agent+Initial+Operation)
-[JS7 - Management of Agent Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Agent+Clusters)

