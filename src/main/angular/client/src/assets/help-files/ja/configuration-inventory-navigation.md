# 構成目録 - ナビゲーション

コンフィギュレーション - インベントリ*ビューは、ワークフロー、スケジュールなどのインベントリオブジェクトを管理するために使用されます。 

- ナビゲーションパネル*はタグやフォルダによるナビゲーションを提供します。また、インベントリオブジェクトの操作も可能です。
- オブジェクトパネル* は関連オブジェクトの表現を保持します。例えば、[Configuration - Inventory - Workflows](/configuration-inventory-workflows) 。

## ナビゲーションパネル

左側のパネルは、フォルダやワークフローやジョブのタグからのナビゲーションを可能にするタブで構成されています。

- **フォルダ** ナビゲーションは選択されたフォルダのインベントリオブジェクトを表示します。
- タグフィルタリングはワークフローを選択するために以下のタブから提供されます：
  - **ワークフロータグ**はワークフローレベルの[Configuration - Inventory - Workflows](/configuration-inventory-workflows) ビューから割り当てられます。
  - **ジョブタグ**はジョブレベルで同じビューから割り当てられます。

### フォルダ

デフォルトでは、*Inventory Folders*はスケジューリングオブジェクトのタイプごとに表示されます。ユーザーは任意の階層の深さで独自のフォルダを作成することができます。同じ*User Folder*名は、異なるフォルダ階層レベルで何度でも使用できます。

フォルダー階層は、以下のフォルダー・タイプを知っています：

- **インベントリフォルダ**は、以下のオブジェクトタイプを保持します：
  - **コントローラ** オブジェクトは、コントローラとエージェントにデプロイされます：
    - [Workflows](/configuration-inventory-workflows) オブジェクトはコントローラとエージェントにデプロイされます。詳細は[JS7 - Workflows](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflows) を参照してください。
    - [File Order Sources](/configuration-inventory-file-order-sources) ディレクトリにファイルが到着すると、自動的にワークフローが開始されます。詳細は[JS7 - File Watching](https://kb.sos-berlin.com/display/JS7/JS7+-+File+Watching) を参照。
    - [Job Resources](/configuration-inventory-job-resources) 複数のジョブで再利用される変数の設定を一元化するために使用されます。詳細は[JS7 - Job Resources](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Resources) を参照してください。
    - [Notice Boards](/configuration-inventory-notice-boards) ワークフロー間の依存関係を指定します。詳細は[JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards) を参照してください。
    - [Resource Locks](/configuration-inventory-resource-locks) ジョブやその他の命令の並列実行を制限します。詳細は[JS7 - Resource Locks](https://kb.sos-berlin.com/display/JS7/JS7+-+Resource+Locks) を参照してください。
  - **Automation**オブジェクトは、JOC Cockpitの自動化に使用されます：
    - [Script Includes](/configuration-inventory-script-includes) 多くのシェルジョブで再利用できるコードスニペットです。詳細は[JS7 - Script Includes](https://kb.sos-berlin.com/display/JS7/JS7+-+Script+Includes) を参照してください。
    - [Schedules](/configuration-inventory-schedules) ワークフロー実行のためのオーダーが開始される時点を決定します。シェルジョブには、1つ以上のワークフローと、指定されたワークフロー内のジョブで使用されるオーダー変数が割り当てられます。また、1 つ以上の *Calendars* を使用します。詳細は[JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules) を参照してください。
    - [Calendars](/configuration-inventory-calendars) カレンダーは、スケジュール・イベントが発生する日を指定します。カレンダーは、*スケジュール* がワークフロー実行のためのオーダーを作成するために使用する、[Daily Plan](/daily-plan). 詳細は[JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars) を参照してください。
    - [Job Templates](/configuration-inventory-job-templates) ジョブテンプレートは、ユーザーのジョブテンプレート、または JS7 に含まれる Java クラスによって提供され、どの OS プラットフォームでも使用することができます。詳細は[JS7 - Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Templates) をご参照ください。
    - [Reports](/configuration-inventory-reports) ワークフローとジョブの実行結果を期間ごとに集計します。詳細は[JS7 - Reports](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports) を参照してください。
- **ユーザーフォルダ**はユーザーによって任意の階層深さで作成されます。各 **ユーザーフォルダ** は、一連の **インベントリフォルダ** を保持します。

#### オブジェクト・クイック検索

ナビゲーションパネル*の最上位フォルダの右側に、インベントリオブジェクトを検索するための検索アイコンがあります。

- 指定した文字で始まるオブジェクトをクイックサーチで検索するには、最低2つの文字を入力する必要があります。
- クイック検索は大文字と小文字を区別せず、右端を切り捨てます。
- Quick Searchは、ワークフローやスケジュールなどのカテゴリごとに、一致する名前のオブジェクトを返します。
- メタ文字は0文字以上のプレースホルダとして使用できます：
  - **\*は、オブジェクト ***test**Initial*, *my**Test*** を検索します。
  - **はオブジェクト ***test**Initial*, ***te**rminate**St**illstand* を探します。

#### オブジェクトのゴミ箱

インベントリオブジェクトが削除されると、それらはゴミ箱に入れられます。ゴミ箱はオブジェクトを復元したり、完全に削除することができます。

Trashは*Navigation Panel*の最上位フォルダにあるTrash Iconから開くことができます。

- ゴミ箱アイコンをクリックすると、ゴミ箱内のオブジェクトの表示が切り替わります。リターンアイコンは、ゴミ箱ビューからインベントリビューに戻るためのものです。
- ゴミ箱のフォルダ構造はインベントリオブジェクトと同じです。
- Trashには、オブジェクトを復元したり、オブジェクトを完全に削除するための、オブジェクトごと、フォルダごとのアクションメニューがあります。

### タグ

タグは、インベントリオブジェクト間をナビゲートするための代替手段です。ワークフロータグ* や "ジョブタグ" タブをアクティブにすると、利用可能なタグのリストが表示されます。

タグは + アイコンから追加することができます。昇順と降順のオーダーが可能です。他のビューでタグを表示するには、[Settings - JOC Cockpit](/settings-joc) ページからアクティ ブにする必要があります。

- 関連するタグをクリックすると、タグが割り当てられたワークフローが表示されます。
- タグの3点アクションメニューから以下の操作が可能です：
  - **名前変更**はタグの名前を変更します。
  - **Delete**はタグとワークフローやジョブへの割り当てを削除します。

## 操作

ナビゲーションパネル*で表示される3ドットのアクションメニューから、フォルダレベルとオブジェクトレベルで操作が可能です。

### フォルダレベルの操作

操作は、*インベントリフォルダ*と*ユーザーフォルダ*で利用できます。

最上位のフォルダ /（スラッシュ）では、以下の操作が可能です：

- **Redeploy**は、Journalが失われた場合にControllerのメモリをワイプし、Controllerを初期化する場合に使用します。この操作は、Controllerにデプロイされているすべてのオブジェクトをデプロイします。 
- **依存関係の更新** オブジェクトの依存関係の内部表現を再作成します。これは自動的に行われ、インベントリオブジェクトの作成時や削除時、 オブジェクト名の変更時にトリガーされます。依存関係が同期していないと想定される理由が見つかった場合、この操作を実行することができます。この作業には、5000 オブジェクトのインベントリで約 3 分かかります。しかし、依存関係が更新される間、ユーザーはJOCコックピットで作業を続けることができます。

#### インベントリフォルダの操作

インベントリフォルダでは以下の操作が可能です：

- コントローラーオブジェクトの操作
  - *ワークフロー*の操作
    - **ワークフローを作成します。
    - **Rename**ではワークフローの名前を変更できます。オブジェクトの依存関係が考慮され、*Schedules* や *File Order Sources* などのインベントリオブジェクトを参照している場合、更新された名前が保持されます。ワークフローと参照オブジェクトは、*draft* ステータスになります。詳細は[Rename Folder](/configuration-inventory-operations-rename-folder) を参照してください。
    -[Manage Tags](/configuration-inventory-operations-manage-tags)**タグの管理**では、フォルダ内のワークフローへのタグの追加と削除ができます。
    - **フォルダ階層とワークフローの JSON 表現を保持する .zip または .tar.gz 形式のエクスポート アーカイブ ファイルを作成できます。詳細は[Export Folder](/configuration-inventory-operations-export-folder) を参照してください。
    - **Gitリポジトリ**はGitサーバーとの統合を提供します。ワークフローを Git リポジトリにコミットし、プルおよびプッシュすることができます。詳細は[Git - Clone Repository](/configuration-inventory-operations-git-clone) を参照してください。
    - **ワークフローの変更管理を行います。ユーザーが作成中のワークフローを*Change*に追加することで、変更されたオブジェクトの共通デプロイやエクスポートが可能になります。詳細は[Changes](/changes) を参照してください。
    - **デプロイ**は、コントローラとエージェントがワークフローを利用できるようにします。ワークフローは *deployed* ステータスになります。詳細は[Deploy Folder](/configuration-inventory-operations-deploy-folder) を参照してください。
    - **Revoke**は、以前の*Deploy*操作を取り消します。ワークフローは*ドラフト*ステータスになります。これは、ワークフローのオーダーが[Daily Plan](/daily-plan) から削除されることを意味します。 オブジェクトの依存関係が考慮され、*スケジュール* や *ファイルオーダーソース* などの参照オブジェクトも取り消し/リコールされます。詳細は[Revoke Folder](/configuration-inventory-operations-revoke-folder) を参照してください。
    - **ワークフローをゴミ箱に移動します。削除されたワークフローは復元することも、ゴミ箱から完全に削除することもできます。詳細は[Remove Folder](/configuration-inventory-operations-remove-folder) を参照してください。
    - **ワークフローの現在のドラフトバージョンを削除します。過去にデプロイされたワークフローが存在する場合、そのワークフローが現在のバージョンとなります。
    - **テンプレートからジョブを更新**は、任意のフォルダにある*ジョブテンプレート*から、選択された*インベントリフォルダ*内のワークフローのジョブを更新します。
  - *ファイルオーダーソース*、*ジョブリソース*、*通知ボード*、*リソースロック*は、*ワークフロー*と同様の操作を提供します。
- オートメーションオブジェクトの操作
  - **リリース**は、*ドラフト*オブジェクトを他のオブジェクトで使用できるようにします。
    - 例えば、*スクリプトインクルード* はワークフローの次回デプロイ時に考慮され、*ジョブテンプレート* はワークフローを参照しながら更新できます。
    -[Daily Plan](/daily-plan) 例えば、*スケジュール*はオーダーの作成に考慮されます。
    - 詳細は[Release Folder](/configuration-inventory-operations-release-folder) を参照してください。
  - **Recall**は以前の*Release*操作を元に戻します。インベントリ・オブジェクトは *draft* ステータスになります。これは、下書きの *スケジュール* と *カレンダー* が[Daily Plan](/daily-plan) で考慮されないことを意味します。この操作はオブジェクトの依存関係を考慮し、参照するオブジェクトもリコール/取り消します。詳細は[Recall Folder](/configuration-inventory-operations-recall-folder) を参照してください。
  - **Apply Template to Jobs** は、選択された *Inventory Folder* または任意のサブフォルダーに含まれる *Job Templates* への参照を保持する任意のフォルダーにあるワークフローのジョブを更新します。
  - その他の操作は、*Operations on Controller Objects* と同様です。

#### ユーザーフォルダーの操作

*ユーザーフォルダはユーザーによって作成され、一連の*インベントリフォルダ*を保持します。以下の操作が可能です：

- すべてのオブジェクトに対する操作
  - **New**は、アクションメニューアイテムから提供されるオブジェクトを作成します：フォルダーまたはインベントリーオブジェクト、[Object Naming Rules](/object-naming-rules) を参照してください。
  - **切り取り** は、フォルダ、サブフォルダ、インベントリオブジェクトを切り取り、フォルダ階層内の別の場所に貼り付けます。
  - **コピー** は、フォルダ、サブフォルダ、インベントリオブジェクトをコピー* します。この操作は *ディープコピー* であり、参照されているすべてのオブジェクトに対して機能します。
  - **浅いコピー**はフォルダ、サブフォルダ、インベントリオブジェクトをコピー*します。他のフォルダ内のインベントリオブジェクトへの参照は考慮されません。
  - **Rename**では、フォルダの名前を変更することができます。詳細は[Rename Folder](/configuration-inventory-operations-rename-folder) を参照してください。
  -[Manage Tags](/configuration-inventory-operations-manage-tags)**Manage Tags** は、指定されたフォルダ階層内のワークフローにタグを追加/削除することができます。
  - **エクスポート**では、フォルダ階層と含まれるインベントリオブジェクトの JSON 表現を保持する .zip または .tar.gz 形式のエクスポートアーカイブファイルを作成できます。詳細は[Export Folder](/configuration-inventory-operations-export-folder) を参照してください。
  - **Gitリポジトリ**はGitサーバーとの統合を提供します。インベントリオブジェクトを Git リポジトリにコミットし、プルおよびプッシュすることができます。詳細は[Git - Clone Repository](/configuration-inventory-operations-git-clone) を参照してください。
  - **Change**は、インベントリオブジェクトの変更管理のための操作を提供します。ユーザーは、作業中のワークフローなどのオブジェクトを、変更されたオブジェクトの共通デプロイとエクスポートを可能にする*Change*に追加することができます。詳細は[Changes](/changes) を参照してください。
- コントローラオブジェクトの操作
  - **Deploy**は、オブジェクトをコントローラとエージェントに提供します。インベントリオブジェクトは *deployed* ステータスになります。詳細は[Deploy Folder](/configuration-inventory-operations-deploy-folder) を参照してください。
  - **Revoke**は以前の*Deploy*操作を取り消します。インベントリ・オブジェクトは *draft* ステータスになります。これは、ワークフローのオーダーが[Daily Plan](/daily-plan) から削除されることを意味します。 詳細は[Revoke Folder](/configuration-inventory-operations-revoke-folder) を参照してください。
  - **Revalidate**はインベントリオブジェクトの有効性をチェックします。
  - **Synchronize**は、コントローラとインベントリのスケジューリングオブジェクトのステータスを同期させます：
    - コントローラに同期** は、インベントリオブジェクトの *デプロイ* または *ドラフト* 状態に応じて、コントローラとエージェントとの間で、インベントリオブジェクトを *デプロイ* または *取り消し* します。この操作は、Controller のメモリがワイプされ、Controller が初期化されたときに、Journal が失われた場合に使用できます。
    - *インベントリに同期*は、インベントリオブジェクトを*デプロイ済み*または*ドラフト*ステータスにします。
- オートメーションオブジェクトの操作
  - **リリース** は、*ドラフト* オブジェクトを使用可能にします。
    - 例えば、*スクリプトインクルード*はワークフローの次回デプロイ時に考慮され、*ジョブテンプレート*はワークフローを参照する際に更新できます。
    -[Daily Plan](/daily-plan) 例えば、*スケジュール*はオーダーの作成に考慮されます。
    - 詳細は[Release Folder](/configuration-inventory-operations-release-folder) を参照してください。
  - **Recall**は以前の*Release*操作を元に戻します。インベントリオブジェクトは *draft* ステータスになります。これは、下書きの *スケジュール* と *カレンダー* が[Daily Plan](/daily-plan) で考慮されないことを意味します。 詳細は[Recall Folder](/configuration-inventory-operations-recall-folder) を参照してください。
- 削除操作
  - **削除** は、フォルダ、サブフォルダ、および含まれているオブジェクトをゴミ箱に移動します。削除されたインベントリ・オブジェクトは復元することも、ゴミ箱から完全に削除することもできます。詳細は[Remove Folder](/configuration-inventory-operations-remove-folder) を参照してください。
  - **Revert Draft** は、フォルダとサブフォルダ内のオブジェクトの現在のドラフトバージョンを削除します。以前に *deployed* または *released* されたバージョンが存在する場合、そのバージョンは関連オブジェクトの現在のバージョンになります。
- ジョブテンプレート操作
  - **Update Jobs from Templates** は、選択された *User Folder* または任意のサブフォルダーに含まれる *Job Templates* への参照を保持する、任意のフォルダーにあるワークフローのジョブを更新します。
  - **Apply Template to Jobs** は、任意のフォルダにある *Job Templates* から、選択された *User Folder* にあるワークフローのジョブを更新します。

### オブジェクトレベルの操作

以下の操作は、個々のインベントリオブジェクトに対して提供されます：

- すべてのオブジェクト
  - **切り取り** は、後でフォルダ階層内の別の場所に貼り付けるためにオブジェクトを *切り取り* ます。
  - **コピー** は、後で貼り付けるためにオブジェクトをコピー* します。
  - **Rename**では、オブジェクトの名前を変更することができます。オブジェクトの依存関係が考慮され、参照するインベントリ・オブジェクトは更新された名前を保持します。名前を変更したオブジェクトと参照するオブジェクトは *draft* ステータスになります。詳細は[Rename Object](/configuration-inventory-operations-rename-object) を参照してください。
  - **Change**は、インベントリオブジェクトの変更管理のための操作を提供します。ユーザーは、作成中のワークフローなどのオブジェクトを *Change* に追加することで、変更されたオブジェクトの共通デプロイとエクスポートが可能になります。詳細は[Changes](/changes) を参照してください。
  - **参照オブジェクトと参照オブジェクトのリストを表示します。例えば、ワークフローはジョブリソー スへの参照を保持し、*スケジュール*や*オーダーソース*から参照されます。
  - **New Draft** は、オブジェクトの *deployed* または *released* バージョンからドラフトバージョンを作成します。
  - JSON 操作
    - **インベントリ・オブジェクトの JSON 保存形式を表示します。
    - **JSON の編集 ** では、JSON ストレージ・フォーマットから直接オブジェクトを変更できます。
    - JSON のダウンロード **Download JSON** は、JSON 保存形式のオブジェクトを .json ファイルにダウンロードします。
    - **JSONのアップロード**は、オブジェクトを置き換える.jsonファイルをアップロードします。
  - 削除操作
    - **オブジェクトをゴミ箱に移動します。削除されたインベントリオブジェクトは復元することも、ゴミ箱から完全に削除することもできます。詳細は[Remove Object](/configuration-inventory-operations-remove-object) を参照してください。
    - **Revert Draft** は、オブジェクトの現在のドラフトバージョンを削除します。以前に *deployed* または *released* されたバージョンが存在する場合、それがオブジェクトの現在のバージョンになります。
- コントローラオブジェクト
  - **タグの管理**はワークフローで利用可能で、ワークフローへのタグの追加や削除ができます。
  - **Deploy**はコントローラとエージェントがオブジェクトを利用できるようにします。オブジェクトは *deployed* 状態になります。デプロイメントでは、参照されるインベントリオブジェクトと参照するインベントリオ ブジェクトのオブジェクト依存関係が考慮されます。詳細は[Deploy Object](/configuration-inventory-operations-deploy-object) を参照してください。
  - **Revoke**は以前の*Deploy*操作を取り消します。オブジェクトは *draft* ステータスになります。ワークフローで使用する場合、これはオーダーが[Daily Plan](/daily-plan) から削除されることを意味します。 詳細は[Revoke Object](/configuration-inventory-operations-revoke-object) を参照してください。
- オートメーションオブジェクト
  - **リリース** は、*ドラフト* オブジェクトを他のオブジェクトで使用できるようにします。
    - たとえば、*スクリプト・インクルード* はワークフローの次回デプロイ時に考慮され、*ジョブ・テンプレート* はワークフローを参照する際に更新できます。
    -[Daily Plan](/daily-plan) 例えば、*スケジュール*はオーダーの作成に考慮されます。
    - 詳細は[Release Object](/configuration-inventory-operations-release-object) を参照してください。
  - **Recall**は以前の*Release*操作を元に戻します。インベントリ・オブジェクトは *draft* ステータスになります。これは、下書きの *スケジュール* と *カレンダー* が[Daily Plan](/daily-plan) で考慮されないことを意味します。詳細は[Recall Object](/configuration-inventory-operations-recall-object) を参照してください。

##参照

### コンテキストヘルプ

-[Changes](/changes)
-[Daily Plan](/daily-plan)
-[Object Naming Rules](/object-naming-rules)
- コントローラオブジェクト
  -[Workflows](/configuration-inventory-workflows)
  -[File Order Sources](/configuration-inventory-file-order-sources)
  -[Job Resources](/configuration-inventory-job-resources)
  -[Notice Boards](/configuration-inventory-notice-boards)
    -[Resouroes - Notice Boards](/resources-notice-boards)
  -[Resource Locks](/configuration-inventory-resource-locks)
    -[Resouroes - Resource Locks](/resources-resource-locks)
- オートメーション・オブジェクト
  -[Script Includes](/configuration-inventory-script-includes)
  -[Schedules](/configuration-inventory-schedules)
  -[Calendars](/configuration-inventory-calendars)
  -[Job Templates](/configuration-inventory-job-templates)
  -[Reports](/configuration-inventory-reports)
- オブジェクトの操作
  -[Deploy Object](/configuration-inventory-operations-deploy-object)
  -[Revoke Object](/configuration-inventory-operations-revoke-object)
  -[Release Object](/configuration-inventory-operations-release-object)
  -[Recall Object](/configuration-inventory-operations-recall-object)
  -[Remove Object](/configuration-inventory-operations-remove-object)
  -[Rename Object](/configuration-inventory-operations-rename-object)
- ユーザーフォルダーの操作
  -[Deploy Folder](/configuration-inventory-operations-deploy-folder)
  -[Revoke Folder](/configuration-inventory-operations-revoke-folder)
  -[Release Folder](/configuration-inventory-operations-release-folder)
  -[Recall Folder](/configuration-inventory-operations-recall-folder)
  -[Remove Folder](/configuration-inventory-operations-remove-folder)
  -[Rename Folder](/configuration-inventory-operations-rename-folder)
  -[Export Folder](/configuration-inventory-operations-export-folder)
  -[Git - Clone Repository](/configuration-inventory-operations-git-clone)
  -[Manage Tags](/configuration-inventory-operations-manage-tags)

###Product Knowledge Base

- コントローラオブジェクト
  -[JS7 - Workflows](https://kb.sos-berlin.com/display/JS7/JS7+-+Workflows)
  -[JS7 - File Watching](https://kb.sos-berlin.com/display/JS7/JS7+-+File+Watching)
  -[JS7 - Job Resources](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Resources)
  -[JS7 - Notice Boards](https://kb.sos-berlin.com/display/JS7/JS7+-+Notice+Boards)
  -[JS7 - Resource Locks](https://kb.sos-berlin.com/display/JS7/JS7+-+Resource+Locks)
- オートメーション・オブジェクト
  -[JS7 - Script Includes](https://kb.sos-berlin.com/display/JS7/JS7+-+Script+Includes)
  -[JS7 - Schedules](https://kb.sos-berlin.com/display/JS7/JS7+-+Schedules)
  -[JS7 - Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Calendars)
    -[JS7 - Management of Calendars](https://kb.sos-berlin.com/display/JS7/JS7+-+Management+of+Calendars)
  -[JS7 - Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Templates)
  -[JS7 - Reports](https://kb.sos-berlin.com/display/JS7/JS7+-+Reports)

