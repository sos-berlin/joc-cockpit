# コントローラーとエージェントの管理

コントローラ/エージェントの管理*ページを使用します。 

- スタンドアロンコントローラとコントローラクラスタを登録します、
- スタンドアロンエージェントをコントローラに登録します、
- クラスタエージェントをコントローラに登録します、
  - Directorエージェント*のクラスタの指定
  - ワーカーノードとして動作する任意の数の*サブエージェント*の指定
  - エージェントの使用をルール化し、ワークフローでジョブを割り当てることができる*サブエージェントクラスター*を任意の数だけ指定します。

コントローラクラスタまたはエージェントクラスタの運用は、[JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License) の契約に従います。

## コントローラの登録

コントローラの登録は *New Controller* ボタンから行います。JOC Cockpit を初めて使用する場合は、初期操作時に自動的にコントローラの 登録ポップアップが表示されます。

詳しくは[Initial Operation - Register Controller](/initial-operation-register-controller) を参照してください。

## コントローラに関する操作

既存のコントローラーでは、3-dotsのアクションメニューから以下の操作が可能です：

- **編集** コントローラのインスタンスのURLなど、コントローラのプロパティを変更できます。
- **Add Standalone Agent** 自律エージェントの登録を行います。
  - 説明については[Initial Operation - Register Standalone Agent](/initial-operation-register-agent-standalone) を参照してください。
- **Add Cluster Agent** はエージェントのクラスタを登録します。 
  - この操作には、*Director Agent* と *Subagents* の指定が含まれます。
  - 説明については[Initial Operation - Register Cluster Agent](/initial-operation-register-agent-cluster) を参照してください。
- **ワンタイムトークンの作成 
- **エージェント設定のエクスポート** 選択したコントローラのエージェント設定を JSON フォーマットでエクスポートしたファ イルをダウンロードできます。
- **エージェント設定のインポート** は、以前にエクスポートされたエージェント設定を保持する JSON フォーマットのエクスポートファイルをアップロードします。関連するエージェントはコントローラに登録されます。
- **Delete**は、すべてのAgent設定を含むController設定を削除します。これはディスクからControllerとAgentを消去するのではなく、JOC Cockpitの設定を削除します。

## フィルタ

エージェントのフィルタボタンは画面上部から利用できます：

- **すべてのエージェント** は、デプロイステータスから独立してすべてのエージェントコンフィグレーショ ンを表示します。
- **同期済み** コントローラにデプロイされたエージェントコンフィグレーションを表示します。
- **Not Synchronized** 変更がコントローラにデプロイされていないエージェント構成を表示します。
- **Not Deployed** は、Controller に初期デプロイされていないエージェントコンフィグレーシ ョンを表示します。
- **Unknown**は、ステータスが不明なエージェント構成を表示します。ユーザーはエージェント構成をデプロイする必要があります。

## 参照

### コンテキストヘルプ

-[Initial Operation - Register Cluster Agent](/initial-operation-register-agent-cluster)
-[Initial Operation - Register Standalone Agent](/initial-operation-register-agent-standalone)
-[Initial Operation - Register Controller](/initial-operation-register-controller)

###Product Knowledge Base

-[JS7 - How to troubleshoot Controller Cluster Initial Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+troubleshoot+Controller+Cluster+Initial+Operation)
-[JS7 - Initial Operation for Controller Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Initial+Operation+for+Controller+Cluster)
-[JS7 - Initial Operation for Standalone Controller](https://kb.sos-berlin.com/display/JS7/JS7+-+Initial+Operation+for+Standalone+Controller)
-[JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License)
-[JS7 - Management of Controller Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Controller+Clusters)

