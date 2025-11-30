# プロフィール - お気に入り管理

プロフィール-お気に入り管理*タブでは、別々のタブからお気に入りのエントリーを指定することができます。

- ジョブに割り当てられた*エージェント*の選択。
- オーダー変数へのユーザー入力をルール化する*Facets*用。

詳細は[JS7 - Inventory Favorites](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Favorites) および[JS7 - Profiles - Favorite Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles+-+Favorite+Management) を参照してください。

## お気に入りエージェント

ユーザは、[Standalone Agents](/initial-operation-register-agent-standalone) と[Subagent Clusters](/initial-operation-register-agent-subagent-cluster) から、自分のスケジューリング環境に、より多くのエージェントを見つけることができるでしょう。 長いリストをスクロールする代わりに、ユーザは、割り当て可能なエージェントのリストの一番上に来るように、*お気に入りのエージェント*を指定することができます。

### お気に入りエージェントの追加

*お気に入りエージェント*は、[Configuration - Inventory - Workflows - Job Properties](/configuration-inventory-workflow-job-properties) タブでエージェントを割り当てる際に直接追加することができます。エージェントの[お気に入り]リンクをクリックすると、関連するエージェントがお気に入りリストに追加されます。

ユーザーは、*お気に入り追加*ボタンを使って、*プロフィール*から*お気に入りエージェント*を追加することができます。これにより、追加するエージェントを選択することができます。

### お気に入りエージェントのリスト

お気に入りエージェントのリストは、*Shared with me*ボタンから制限することができます。これにより、他のユーザーによって共有されたお気に入りにリストが制限されます。

検索*入力フィールドにエージェント名から検索される文字列を指定することで、さらにリストを制限することができます。検索は左右の切り捨てを意味します。

ユーザーは、*お気に入りエージェント*を前または後に移動することで、リストをオーダーすることができます。

### お気に入りエージェントの操作

お気に入りエージェント*の3点アクションメニューから以下の操作が可能です：

- **編集**でエージェントを切り替えることができます。
- **お気に入りエージェントを他のユーザーと共有することができます。共有されたお気に入りには関連アイコンが表示されます。
- **削除**はお気に入りリストから削除します。

## お気に入りファセット

[Configuration - Inventory - Workflows](/configuration-inventory-workflows)ワークフローが文字列データ型のワークフロー変数を指定する場合、ユーザ入力を制限するため に*ファセット*を適用することができます。 *ファセット*は、ユーザー入力のマッチングをチェックするために適用される正規表現です。

ファセット*をワークフロー変数に割り当てる場合、長いリストをスクロールする代わ りに、ユーザーはリストの最上位に表示されるお気に入りのファセット*を指定できます。

### お気に入りファセットの追加

*[Configuration - Inventory - Workflows](/configuration-inventory-workflows) ビューでワークフロー変数を指定する際、Favorite Facets* を直接追加することができます。Facet "の "Facet "リンクをクリックすると、関連する "Facet "がお気に入りリストに追加されます。

ユーザーは、*Add Favorite*ボタンを使用して、*Profile*から*Favorite Facets*を追加できます。これにより、追加する*ファセット*名と関連する正規表現を指定することができます。

### お気に入りファセットのリスト

Shared with me "ボタンから、"Favorite Facets "のリストを制限することができます。これにより、リストが他のユーザーによって共有されたお気に入りに制限されます。

ユーザーは、*Facetの*名前で検索される文字列を*Search*入力フィールドに指定することで、リストをさらに制限できます。検索は左右の切り捨てを意味します。

ユーザーは、*Favorite Facet*を前の位置または後の位置に移動することで、リストをオーダーできます。

### お気に入りファセットに対する操作

お気に入りFacetの3点アクションメニューから以下の操作が可能です：

- **編集**では、ファセットの名前と正規表現を変更することができます。
- **共有**は、お気に入りを他のユーザーと共有することができます。共有されたお気に入りには、関連アイコンが表示されます。
- **削除**は、お気に入りリストから関連する*Facet*を削除します。

## 参考

### コンテキストヘルプ

-[Configuration - Inventory - Workflows](/configuration-inventory-workflows)
-[Configuration - Inventory - Workflows - Job Properties](/configuration-inventory-workflow-job-properties)
-[Initial Operation - Register Standalone Agent](/initial-operation-register-agent-standalone)
-[Initial Operation - Register Subagent Clusters](/initial-operation-register-agent-subagent-cluster)
-[Profile](/profile)

###Product Knowledge Base

-[JS7 - Inventory Favorites](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Favorites)
-[JS7 - Profiles - Favorite Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Profiles+-+Favorite+Management)

