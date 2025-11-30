# 設定 - インベントリ - 操作 - フォルダの名前の変更

インベントリオブジェクトの名前を変更したり、再配置したりすることができます。これはオブジェクト、フォルダ、またはその両方に適用されます。オブジェクトの名前の変更については[Configuration - Inventory - Operations - Rename Object](/configuration-inventory-operations-rename-object) を参照してください。 

フォルダの名前を変更する場合は、[Object Naming Rules](/object-naming-rules) 。

Rename*操作は、*Navigation*パネルから利用可能で、オブジェクトとフォルダーについては、それらに関連する3ドットのアクションメニューから提供されます。

ユーザーフォルダーの名前を変更する場合、フォルダー名を変更するオプションと、含まれるオブジェクトの名前を再帰的に変更するオプションが提供されます。

## フォルダー名の変更

<img src="rename-folder.png" alt="Rename Folder" width="400" height="150" />

ユーザーは、フォルダーの場所と名前を変更できます。以下では、**/Test/Users**フォルダ階層にある**myWorkflows**フォルダを想定しています：

- フォルダ名が変更されても、フォルダは指定されたフォルダ階層に残ります。
- フォルダー名が変更された場合、フォルダーは指定されたフォルダー階層に残ります。新しい名前に対 して、ユーザーは、**/Test/yourWorkflows** のようなスラッシュを先頭に持つ絶対パスから別のフォルダー 階層を指定できます：
  - もし **/Test/yourWorkflows** フォルダが存在しなければ、作成されます。
  - フォルダ名は **myWorkflows** から **yourWorkflows** に変更されます。
- ワークフロー/yourWorkflows**のように相対パスを指定することもできます：
  - yourWorkflows**フォルダは現在のフォルダに作成されます。
  - フォルダは名前が変更され、**/Test/Users/ワークフロー/yourWorkflows**に配置されます。

フォルダの名前や場所を変更しても、含まれるオブジェクトは配置済み/リリース済みステータスのままになります。

## オブジェクトの再帰的な名前の変更

<img src="rename-folder-object.png" alt="Rename Folder Objects Recursively" width="400" height="180" />

ユーザーは、フォルダやサブフォルダに含まれるオブジェクトの名前を再帰的に変更できます。

- **検索**は、オブジェクト名で検索される文字列を期待します。
- **Replace**は、検索された文字列を置き換える文字列を期待します。

オブジェクト名の変更は、含まれているオブジェクトをドラフト・ステータスに設定します。

## 依存関係

インベントリオブジェクトは依存関係によって関連付けられます。[Dependency Matrix](/dependencies-matrix) を参照してください。例えば、ワークフローはジョブリソースとリソースロックを参照し、スケジュールはカレンダーと1つ以上のワークフローを参照します。

オブジェクトの名前を変更する場合、整合性が考慮され、参照するオブジェクトは更新され、ドラフトステータスに設定されます：

- 例えば、ワークフローが参照するジョブリソースの名前が変更された場合、ワークフローは更新され、ドラフトステータスに設定されます。 
  - ワークフローは変更された名前を反映するように更新されます、
  - ワークフローはドラフト状態に設定されます、
  - 後の *Deploy* 操作により、両オブジェクトの共通デプロイが実施されます。
- スケジュールから参照されているワークフローの名前が変更された場合、スケジュールは変更された名前を反映して更新されます。
  - スケジュールは変更された名前を反映するように更新されます、
  - スケジュールはドラフトステータスに設定されます、
  - ワークフローに後から*Deploy*操作を行うと、スケジュールに*Release*操作が含まれ、逆も同様です。

## 参照

### コンテキストヘルプ

-[Configuration - Inventory - Operations - Rename Object](/configuration-inventory-operations-rename-object)
-[Configuration - Inventory - Workflows](/configuration-inventory-workflows)
-[Daily Plan](/daily-plan)
-[Dependency Matrix](/dependencies-matrix)
-[Object Naming Rules](/object-naming-rules)

###Product Knowledge Base

-[JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)

