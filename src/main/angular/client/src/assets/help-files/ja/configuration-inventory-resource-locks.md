# 設定 - インベントリ - リソースロック

リソースロックパネル*では、ワークフローで使用するリソースロックを指定できます。

リソースロックはジョブや他のワークフロー命令の並列性を制限します。リソースロックは信号機のようなもので、正確には [セマフォ](https://en.wikipedia.org/wiki/Semaphore_%28programming%29) のようなものです。 

- オーダーはワークフローを進めるためにロックを取得する必要があり、そうでない場合はロックが利用可能になるまで*待機*状態に留まります。
- ロックを待つオーダーは、CPUなどのコンピューティングリソースを消費しません、
- オーダーのロック取得の試みは、ワークフローやエージェントにまたがるジョブやその他のワークフロー命令に対して考慮されます。

リソースロックには以下の種類があります：

- **排他ロック**は、[JS7 - Lock Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Lock+Instruction) によるロックの単一使用を許可します。
- **共有ロック** は、同じワークフローまたは異なるワークフローからの多数の *ロック命令* によるロックの並列使用を許可します。
  - 基本的なユースケースは、限られた数のジョブが同時にアクセスできるデータベーステーブルのようなリソースです。データベースのデッドロックを防ぐために、テーブルにアクセスするジョブ数は制限されています。
  - 各 *ロック命令* は、リソース・ロックの *容量* にカウントされる *重み* を指定します。Weight*が利用可能な*Capacity*と一致する場合、オーダーを進めることができ、そうでない場合、オーダーは必要な*Capacity*のシェアが利用可能になるまで待機します。

以下は、*Lock Instruction*によるリソースロックの使用に適用されます：

- *ロック命令*は、任意の数のジョブや他のワークフロー命令を生成できるワークフローで使用されるブロック命令です。
- *ロック命令* は、任意の数のレベルで入れ子にすることができます。
- ジョブがエラーになった場合、デフォルトではオーダーはロックを解除し、*Lock Instruction* の先頭に移動します。失敗した*オーダーにロックの使用を継続させたいユーザーは、*StopOnFailure*オプションに*false*値を指定して[JS7 - Options Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Options+Instruction) 。

リソース・ロックは以下のパネルで管理できます：

- ウィンドウの左側にある[Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation) では、リソースロックを保持しているフォルダごとにナビゲーションが可能です。また、このパネルではリソース・ロックに対する操作が可能です。
- ウィンドウの右側にある *リソースロックパネル* はリソースロックの設定の詳細を表示します。

## リソースロックパネル

リソースロックでは以下の入力が可能です：

- **Name**はリソースロックのユニークな識別子で、[Object Naming Rules](/object-naming-rules) を参照してください。
- **Title**にはリソースロックの目的についての説明を任意で入力します。
- **Capacity**は、並列*Lock命令*からの*Weight*の最大許容量を表す数値です：
  - Capacity**が1の場合、リソース・ロックは*Exclusive*または*Shared* *Lock Instructions*から独立して単一使用に制限されます。
  - Capacity*を大きくすると、*共有ロック*によるリソース・ロックの並列使用が可能になります。関連する *Lock 命令* は、ロックの *Capacity* の使用を指定できます：
    - *排他的*使用は、その*容量*とは無関係に排他的にロックの取得を試みます。 
    - *共有*使用は、*Lock命令*の*Weight*が残りの*Capacity*と一致するかどうかをチェックします。

### リソース・ロックに対する操作

利用可能な操作については、[Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation) を参照してください。

### オーダーの優先順位

リソースロックはオーダーの優先順位*を考慮します。[Configuration - Inventory - Schedules](/configuration-inventory-schedules) からオーダーを追加するとき、および[Workflows - Add Orders](/workflows-orders-add) を使用してアドホックオーダーを追加するとき、 *優先順位* を指定することができます。

複数のオーダーがリソースロックの前で待機している場合、最も高い*優先順位*を持つオー ダーが最初にリソースロックを取得します。

##参照

### コンテキストヘルプ

-[Configuration - Inventory - Navigation Panel](/configuration-inventory-navigation)
-[Object Naming Rules](/object-naming-rules)
-[Workflow - Inventory - Navigation Panel](/configuration-inventory-navigation)

### 商品知識ベース

-[JS7 - Lock Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Lock+Instruction)
-[JS7 - Options Instruction](https://kb.sos-berlin.com/display/JS7/JS7+-+Options+Instruction)
- [セマフォ](https://en.wikipedia.org/wiki/Semaphore_%28programming%29)

