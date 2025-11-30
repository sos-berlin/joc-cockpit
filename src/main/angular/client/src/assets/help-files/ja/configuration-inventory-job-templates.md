# 構成 - インベントリ - ジョブテンプレート

ジョブテンプレート*パネルはワークフローで使用されるジョブ用の一元管理されたテンプレートを指定することができます。これらのテンプレートは同じジョブが複数のジョブで使用される場合に適用されます。

- ジョブテンプレートはジョブが作成されたときに適用されます。 
- ジョブテンプレートが変更されるとジョブも更新されます。
- ジョブテンプレートは、シェルジョブやエージェントの Java 仮想マシンで実行される JVM ジョブなど、どのジョブクラスに対しても作成することができます。

ジョブテンプレートは以下のパネルで管理できます：

- ウィンドウの左側にある[Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation) は、ジョブテンプレートを保持するフォルダごとにナビゲートします。さらに、このパネルはジョブテンプレートに対する操作を提供します。
- ウィンドウ右側の*Job Template Panel*はスケジュール設定の詳細を表示します。

## ジョブテンプレートパネル

ジョブテンプレートでは以下の入力が可能です：

- **Name** はジョブテンプレートの一意な識別子です。[Object Naming Rules](/object-naming-rules) を参照してください。
- その他の入力はジョブの入力に対応します：
  -[Job Properties](/configuration-inventory-workflow-job-properties)
  -[Job Options](/configuration-inventory-workflow-job-options)
  -[Job Node Properties](/configuration-inventory-workflow-job-node-properties)
  -[Job Notifications](/configuration-inventory-workflow-job-notifications)
  -[Job Tags](/configuration-inventory-workflow-job-tags)
- **引数**はJVMジョブで使用されます。 
  - **Required**はジョブで使用されるときに引数が必須か削除可能かを指定します。
  - **Description**はHTMLタグを含むことができる引数の説明を追加します。

## ジョブテンプレートに対する操作

一般的な操作については[Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation) を参照してください。

ジョブテンプレートでは以下の操作でジョブを更新することができます：

- ジョブテンプレートがリリースされると、**Apply Template to Jobs** ボタンが利用可能になります。
  - ジョブテンプレートを使用しているワークフローとジョブがポップアップウィンドウに表示されます。
  - ユーザーは更新するワークフローとジョブを選択することができます。
  - **Filter**により、*Draft* ステータスのワークフロー、または *Deployed* ステータスのワークフローにアップデートを制限することができます。
  - **Update Notification** はジョブテンプレートからジョブ通知設定を更新することを指定します。
  - **Update Admission Times** はジョブテンプレートからジョブ通知時間を更新することを指定します。
  - **Update from required arguments** 指定されたジョブテンプレートの引数のうち、必須であると判断された引数を更新します。
  - **Update from optional arguments** は、選択されたジョブにおいて、optionalであると判断されたジョブテンプレートの引数を更新することを指定します。
- **Update Jobs from Templates** は *Navigation Panel* から利用可能で、任意のフォルダにあるジョブテンプレートから、選択した *Inventory Folder* にあるワークフローのジョブを更新します。
- **Apply Template to Jobs** は *Navigation Panel* から利用可能で、選択された *Inventory Folder* やサブフォルダに含まれるジョブテンプレートへの参照を保持する任意のフォルダにあるワークフローのジョブを更新します。

ジョブテンプレートからジョブを更新した後、関連するワークフローは *Draft* ステータスに設定されます。

## ジョブとの併用

ジョブテンプレートは既存のジョブから作成することができます。あるワークフローの *Configuration-&gt;Inventory* ビューで、ユーザーは関連するジョブをクリックし、そのアクションメニューから *Make Job Template* 操作を行うことができます。

ジョブにジョブテンプレートを割り当てるには以下のようにします：

- ウィンドウ右上のウィザードを起動します。
- これによりポップアップウィンドウが表示され、*User Job Templates* タブを選択することができます。
  - 希望のジョブテンプレートに移動するか、ジョブテンプレートの名前の一部を入力します。
  - ジョブテンプレートを選択し、オプションでジョブテンプレートが提供する引数を追加します。
  
ジョブテンプレートにジョブが割り当てられると、ウィンドウの右上に表示されます：

- ユーザーは *Job Template Reference* を見つけます、
- その後に *Synchronization Status Indicator* のアイコンが表示されます： 
  - 緑色はジョブとジョブテンプレートが同期していることを示します。 
  - オレンジ色はジョブテンプレートが変更され、ジョブが同期されていないことを示します。
- オレンジ色の *Synchronization Status Indicator* をクリックすると、ジョブテンプレートからジョブが更新されます。

ジョブテンプレート参照をジョブから削除するには、ジョブテンプレート名の右上にあるゴミ箱アイコンをクリックします。この操作によってジョブテンプレートへのリンクは解除され、ジョブプロパティはそのまま残ります。 

ジョブテンプレートを参照しているジョブでは、ジョブの主要な部分を変更することはできません。代わりに、変更はジョブテンプレートに適用されなければなりません。これは自由に選択できる以下の入力には適用されません：

- 仕事名** **ラベル
- **ラベル
- **エージェント
- **求人受付時間
- **求人通知

JVMジョブ用の引数**またはシェルジョブ用の環境変数**に動的に値を割り当てるには、ユーザは以下のように操作します：

- ジョブテンプレートは **引数** または **環境変数** に値を割り当てるためにワークフロー変数を使用します。
- ジョブテンプレートを参照するジョブを保持するワークフローは、デフォルト値や入力されるオーダーからワークフロー変数を宣言します。

## 参照

### コンテキストヘルプ

-[Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation)
-[Job Node Properties](/configuration-inventory-workflow-job-node-properties)
-[Job Notifications](/configuration-inventory-workflow-job-notifications)
-[Job Options](/configuration-inventory-workflow-job-options)
-[Job Properties](/configuration-inventory-workflow-job-properties)
-[Job Tags](/configuration-inventory-workflow-job-tags)
-[Object Naming Rules](/object-naming-rules)

###Product Knowledge Base

-[JS7 - Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+Job+Templates)
  -[JS7 - JITL Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+JITL+Integration+Job+Templates)
  -[JS7 - User Defined Job Templates](https://kb.sos-berlin.com/display/JS7/JS7+-+User+Defined+Job+Templates)

