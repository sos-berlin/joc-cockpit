# ジョブ定義 - インベントリー - ジョブリソース

*ジョブリソース* では、ワークフローとジョブで使用するジョブリソースを指定します。

ジョブリソースは、以下の目的で使用されるキーと値のペアの変数を保持します：

- エージェントの Java 仮想マシンで実行される JVM ジョブでは、変数は *引数* から指定されます。ジョブリソースにジョブが割り当てられると、一致するジョブの引数が入力されます。
- Shellジョブでは、変数は *環境変数* から指定します。ジョブリソースにジョブが割り当てられると、環境変数が自動的に作成されます。

ジョブリソースは関連するオブジェクトプロパティからワークフローまたはジョブに割り当てられます（[ジョブ定義 - インベントリー - ワークフロー - ジョブオプション](/configuration-inventory-workflow-job-options) を参照）。ワークフローレベルで割り当てられた場合、ジョブリソースの変数はワークフロー内の全てのジョブで使用可能です。

ジョブリソースは以下のパネルで管理します：

- ウィンドウの左側にある[ジョブ定義 - インベントリー - ナビゲーションパネル](/configuration-inventory-navigation) は、ジョブリソースのフォルダーのナビゲーショ ンを提供します。また、このパネルではジョブリソースに対する操作も可能です。
- ウィンドウ右側の *ジョブリソースパネル* はジョブリソース設定の詳細を表示します。

## ジョブリソースパネル

ジョブリソースでは以下の入力が可能です：

- **名称** は、ジョブリソースの一意な識別子です。[オブジェクト命名規則](/object-naming-rules) を参照してください。
- **タイトル** は、ジョブリソースの目的などの説明です。

このパネルでは以下のタブでジョブリソースの変数を設定できます：

- **引数** はJavaやJavaScriptなどから作成されたJVMジョブによって使用されます。
- **環境変数** はShellジョブによって使用されます。

ジョブリソース変数は各タブで以下の入力から設定します：

- **名称** は、[オブジェクト命名規則](/object-naming-rules) 内で自由に選択できます。
  - **引数** には、Javaの制限が適用されます。引数名のスペルは大文字と小文字を区別します。
  - **環境変数** には、オペレーティング・システムの制限が適用されます。よく使われる命名規則には、大文字の綴りがあります。Unixでは環境変数名は大文字と小文字を区別し、Windowsでは大文字と小文字を区別しません。
- **値** は、文字列、数値、式から直接入力することができます。[JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables) を参照してください。

同じ変数を *引数* と *環境変数* の両方で使用できるようにする場合、環境変数の値は次のように *引数* 名を参照できます： *$argument*

### ジョブリソースに対する操作

利用可能な操作については、[ジョブ定義 - インベントリー - ナビゲーションパネル](/configuration-inventory-navigation) を参照してください。

## 参照

### コンテキストヘルプ

- [ジョブ定義 - インベントリー - ワークフロー - ジョブオプション](/configuration-inventory-workflow-job-options)
- [ジョブ定義 - インベントリー - ナビゲーションパネル](/configuration-inventory-navigation)
- [オブジェクト命名規則](/object-naming-rules)

### Product Knowledge Base

- [JS7 - Assignment of Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Assignment+of+Variables)
- [JS7 - Expressions for Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Expressions+for+Variables)
- [JS7 - Order Variables](https://kb.sos-berlin.com/display/JS7/JS7+-+Order+Variables)

