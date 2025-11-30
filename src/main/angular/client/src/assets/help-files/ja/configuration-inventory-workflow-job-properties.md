# 構成 - インベントリ - ワークフロー - ジョブプロパティ

ワークフロー*パネルは一連の指示からワークフローをデザインします。ユーザーは*ツールバー*から*ジョブ指示*をワークフローの位置にドラッグ＆ドロップすることができます。

GUI にはジョブの詳細を指定するためのタブがいくつかあります。最初のタブは*Job Properties*です。

## 必須ジョブプロパティ

ジョブの最低限必要なプロパティは以下の通りです：

- **Name**は一意な名前でジョブを識別します。ワークフロー内で複数のジョブが同じ名前を使用する場合、ジョブのコピーは1つだけ保存され、他のジョブでは異なる **ジョブラベル** を使用してジョブを参照します。
- **ラベル**はワークフロー内の指示のための一意な識別子です。一意性は、ジョブや他のインストラクションにまたがって強制されます。同じ**ジョブ名**がワークフロー内で何度も使用される場合、異なる**ラベル**を使用する必要があります。
- **エージェント**は、ジョブの実行にエージェントを割り当てます。
  - *スタンドアロンエージェントは、*エージェント名*から選択されます。
  - クラスタエージェント** は、*エージェントクラスタ** と希望する*サブエージェントクラスタ** を選択して指定します。
- **スクリプト** は、関連する Unix または Windows プラットフォームのジョブで実行されるシェルコマンド、スクリプトの呼び出し、実行可能ファイルを保持します。

## オプションのジョブプロパティ

- **Title** ジョブの目的を記述します。ユーザーはマークダウン構文を使ってリンクを追加することができます。タイトル**は、[Workflows](/workflows) ビューなどで結果をフィルタリングするときに考慮されます。
- **ジョブ・リソース**は、ワークフロー変数や環境変数から利用可能なキー/値ペアの変数を保持するインベントリ・オブジェクトです。 *ジョブリソース**はジョブレベルで割り当てることができ、ワークフローレベルで割り当てることもできます。詳細は[Configuration - Inventory - Job Resources](/configuration-inventory-job-resources) を参照してください。
- **Return Code**はジョブが成功したか失敗したかを指定します。デフォルトでは 0 が成功、それ以外が失敗を表します。0,2,4,8*のようにコンマで区切ることができます。例えば、*0..8* または *0,2,4,8,16..64*のようにカンマで区切ります。負のリターンコードは未定義です。
  - **成功時**は、成功したリターンコードを指定します。
  - **On Failure** は、失敗を示す失敗したリターン・コードを指定します。
  - **Ignore**はリターンコードをジョブの成否の指標としません。
- **警告時のリターンコード**は、成功時のリターンコードのサブセットです。成功したリターンコードが警告として指定された場合、通知が作成されますが、ワークフロー内のオーダーの流れは警告の影響を受けません。

### ジョブクラス

- **ジョブクラスは実行されるジョブのタイプを指定します。詳細は[JS7 - Job Classes](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Classes) を参照してください。
  - **シェルジョブ** はオペレーティングシステムのシェル、例えば Windows シェルや /bin/sh から利用可能な Unix シェルで実行されます。シェルジョブには、シェルコマンド、スクリプトの呼び出し、実行可能ファイルが含まれます。シェルジョブでは、Node.js、Perl、Python、PowerShell などのスクリプト言語を使用することができます。コマンドラインから実行できるインタプリタがオペレーティングシステムにインストールされている必要があります。
  - **JVM ジョブ** は、JS7 エージェントが[JS7 - Job API](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+API) を提供する Java 仮想マシンで動作する多くの言語で実装されています：
    - *ジョブテンプレート
      - **JITL ジョブ** は、JS7 と一緒に出荷され、[JS7 - Integration Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Integration+Job+Templates) から使用される Java ジョブです。例えば、データベースにアクセスしたり、SSH などでリモートホストにアクセスしたりします。
    - *ユーザ定義ジョブ
      - **Javaジョブ**はJS7エージェントが提供するJVMで実行されます。
      - **JavaScriptジョブ**は、JS7エージェントと共にOracle® GraalVM Java Virtual Machineを使用する必要があります。

### 環境変数

シェルジョブでは、パラメータは環境変数から利用可能です。

- **Name**は、オペレーティング・システムの制限内で自由に選択できます。よく使われる命名規則には、大文字の綴りが含まれます。Unixでは**名前**は大文字と小文字を区別しますが、Windowsでは大文字と小文字を区別しません。
- **値**は、文字列または数値から直接入力することができます。さらに、ワークフローで宣言されたワークフロー変数を指定することができます。ワークフロー変数のスペルは大文字と小文字を区別します。

## ジョブプロパティは*More Options*から利用可能です。

Configuration - Inventory* ビューではウィンドウ上部に *More Options* スライダーが表示されます。このスライダーを使用すると、追加オプションが利用可能になります。

- **Documentation**はジョブの説明に使用できる[Resources - Documentations](/resources-documentations) への参照を保持します。ドキュメントへの参照は[Workflows](/workflows) 。

## 参考文献

### コンテキストヘルプ

-[Configuration - Inventory - Job Resources](/configuration-inventory-job-resources)
-[Configuration - Inventory - Workflows](/configuration-inventory-workflows)
  -[Configuration - Inventory - Workflows - Job Options](/configuration-inventory-workflows-job-options)
  -[Configuration - Inventory - Workflows - Job Node Properties](/configuration-inventory-workflows-job-node-properties)
  -[Configuration - Inventory - Workflows - Job Notifications](/configuration-inventory-workflows-job-notifications)
  -[Configuration - Inventory - Workflows - Job Tags](/configuration-inventory-workflows-job-tags)
-[Resources - Documentations](/resources-documentations)

###Product Knowledge Base

-[JS7 - Integration Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Integration+Job+Templates)
-[JS7 - Job API](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+API)
-[JS7 - Job Classes](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Classes)
-[JS7 - Job Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Instruction)

