# 設定 - インベントリ - 操作 - オブジェクト名の変更

インベントリオブジェクトの名前を変更したり、再配置したりすることができます。これはオブジェクト、ユーザフォルダ、またはその両方に適用されます。ユーザフォルダの名前の変更については、[Configuration - Inventory - Operations - Rename Folder](/configuration-inventory-operations-rename-folder) を参照してください。 

オブジェクトの名前を変更する場合は、[Object Naming Rules](/object-naming-rules) 。

Rename*操作は、*Navigation*パネルから利用可能で、オブジェクトとユーザーフォルダについては、それらに関連する3ドットのアクションメニューから提供されます。

<img src="rename-object.png" alt="Rename Object" width="400" height="125" />

## オブジェクトの名前の変更

ユーザーはオブジェクトの場所と名前を変更することができます。以下では、**/Test/Users** フォルダにある **myWorkflow** という名前のオブジェクトを想定しています：

- オブジェクト名が変更された場合、オブジェクトは指定されたフォルダに残り、ドラフト状態に設定されます。
- オブジェクト名が変更された場合、オブジェクトは指定されたフォルダに残り、ドラフト ステータスに設定されます：
  - Test/Workflows**フォルダが存在しない場合、作成されます。
  - ワークフローの名前が **myWorkflow** から **yourWorkflow** に変更されます。
- ワークフロー/yourWorkflow**のように相対パスを指定することもできます：
  - ワークフロー**フォルダは現在のフォルダに作成されます。
  - オブジェクトの名前が変更され、**/Test/Users/ワークフロー/yourWorkflow** に配置されます。
- オブジェクト名が変更されずにオブジェクトフォルダが変更された場合、オブジェクトはデプロイ済み/リリース済みステータスのままになります。

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

-[Configuration - Inventory - Operations - Rename Folder](/configuration-inventory-operations-rename-folder)
-[Dependency Matrix](/dependencies-matrix)
-[Object Naming Rules](/object-naming-rules)

###Product Knowledge Base

-[JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)

