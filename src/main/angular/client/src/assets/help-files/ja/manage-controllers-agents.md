# コントローラー・エージェント管理

*コントローラー/エージェントの管理* 画面は、

- スタンドアロンコントローラーやコントローラークラスターを登録します、
- スタンドアロンエージェントをコントローラーに登録します、
- クラスターエージェントをコントローラーに登録します、
  - *ディレクターエージェント* のクラスターの設定
  - ワーカーノードとして動作する任意の数の *サブエージェント* の設定
  - エージェントの使用をルール化し、ワークフローでジョブを割り当てることができる *サブエージェントクラスター* を任意の数だけ設定

コントローラークラスター及びエージェントクラスターの利用は、[JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License) の契約が必要です。

## コントローラーの登録

コントローラーの登録は *新規コントローラー* ボタンから行います。JOCコックピットを初めて使用する場合は、初期操作時に自動的にコントローラーの登録ポップアップが表示されます。

詳しくは[初期設定 - コントローラー登録](/initial-operation-register-controller) を参照してください。

## コントローラーに関する操作

既存のコントローラーでは、アクションメニューから以下の操作が可能です：

- **編集** は、コントローラーのインスタンスのURLなど、コントローラーのプロパティを変更できます。
- **単独エージェント追加** は、スタンドアロンエージェントの登録を行います。
  - 説明については[初期設定 - スタンドアロンエージェント登録](/initial-operation-register-agent-standalone) を参照してください。
- **クラスターエージェント追加** は、エージェントクラスターを登録します。 
  - この操作には、*ディレクターエージェント* と *サブエージェント* の設定が含まれます。
  - 説明については[初期設定 - クラスターエージェント登録](/initial-operation-register-agent-cluster) を参照してください。
- **ワンタイムトークン作成**
- **エージェント設定エキスポート** 選択したコントローラーのエージェント設定を JSON フォーマットでエキスポートしたファイルをダウンロードできます。
- **エージェント設定インポート** は、以前にエキスポートされたエージェント設定の JSON フォーマットのエキスポートファイルをアップロードします。関連するエージェントはコントローラーに登録されます。
- **削除**は、すべてのエージェント設定を含むコントローラーを削除します。これはディスクからコントローラーとエージェントを削除するのではなく、JOCコックピットの設定を削除します。

## フィルター

エージェントのフィルターボタンは画面上部から利用できます：

- **全エージェント** は、全てのエージェント設定を表示します。
- **同期済** は、コントローラーに同期されたエージェント設定を表示します。
- **未同期** は、変更がコントローラーに同期されていないエージェント設定を表示します。
- **未配置** は、コントローラーに配置されていないエージェント設定を表示します。
- **不明** は、ステータスが不明なエージェント構成を表示します。ユーザーはエージェント設定を配置する必要があります。

## 参照

### コンテキストヘルプ

- [初期設定 - クラスターエージェント登録](/initial-operation-register-agent-cluster)
- [初期設定 - スタンドアロンエージェント登録](/initial-operation-register-agent-standalone)
- [初期設定 - コントローラー登録](/initial-operation-register-controller)

###Product Knowledge Base

- [JS7 - How to troubleshoot Controller Cluster Initial Operation](https://kb.sos-berlin.com/display/JS7/JS7+-+How+to+troubleshoot+Controller+Cluster+Initial+Operation)
- [JS7 - Initial Operation for Controller Cluster](https://kb.sos-berlin.com/display/JS7/JS7+-+Initial+Operation+for+Controller+Cluster)
- [JS7 - Initial Operation for Standalone Controller](https://kb.sos-berlin.com/display/JS7/JS7+-+Initial+Operation+for+Standalone+Controller)
- [JS7 - License](https://kb.sos-berlin.com/display/JS7/JS7+-+License)
- [JS7 - Management of Controller Clusters](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Controller+Clusters)

