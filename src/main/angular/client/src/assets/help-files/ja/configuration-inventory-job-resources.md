# 構成 - 在庫 - 求人情報

ジョブリソースパネル*はワークフローとジョブで使用するジョブリソースを指定します。

ジョブリソースは以下の目的で使用されるキーと値のペアの変数を保持します：

- エージェントの Java 仮想マシンで実行される JVM ジョブでは、変数は *引数* から指定されます。ジョブリソースにジョブが割り当てられると、一致するジョブの引数が入力されます。
- シェルジョブでは、変数は *環境変数* から指定します。ジョブリソースにジョブが割り当てられると、環境変数が自動的に作成されます。

ジョブリソースは関連するオブジェクトプロパティからワークフローまたはジョブに割り当てられます（[Configuration - Inventory - Workflow - Job Options](/configuration-inventory-workflow-job-options) を参照）。ワークフローレベルで割り当てられた場合、ジョブリソースの変数はワークフロー内の全てのジョブで使用可能です。

ジョブリソースは以下のパネルで管理します：

- ウィンドウの左側にある[Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation) は、ジョブリソースを保持するフォルダのナビゲーショ ンを提供します。また、このパネルではジョブリソースに対する操作も可能です。
- ウィンドウ右側の*ジョブリソースパネル*はジョブリソース設定の詳細を表示します。

## ジョブリソースパネル

ジョブリソースでは以下の入力が可能です：

- **Name**はジョブリソースの一意な識別子です。[Object Naming Rules](/object-naming-rules) を参照してください。
- **タイトル(Title) **はジョブリソースの目的についての説明です。

このパネルでは以下のタブでジョブリソースの変数を設定できます：

- **引数** はJavaやJavaScriptなどから作成されたJVMジョブによって使用されます。
- **環境変数** はシェルジョブによって使用されます。

ジョブリソース変数は各タブで以下の入力から設定します：

- **名前** は[Object Naming Rules](/object-naming-rules) 内で自由に選択できます。
  - 引数**にはJavaの制限が適用されます。引数名のスペルは大文字と小文字を区別します。
  - 環境変数*オペレーティング・システムの制限が適用されます。よく使われる命名規則には、大文字の綴りがあります。Unixでは環境変数名は大文字と小文字を区別し、Windowsでは大文字と小文字を区別しません。
- **値**は文字列、数値、式から直接入力することができます。[JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables) を参照してください。

同じ変数を *引数* と *環境変数* の両方で使用できるようにする場合、環境変数の値は次のように *引数* 名を参照できます： *引数名

### ジョブ・リソースに対する操作

利用可能な操作については、[Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation) を参照してください。

## 参考文献

-[Configuration - Inventory - Workflow - Job Options](/configuration-inventory-workflow-job-options)
-[Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation)
-[Object Naming Rules](/object-naming-rules)
-[JS7 - Assignment of Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Assignment+of+Variables)
-[JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables)
-[JS7 - Order Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+Variables)

