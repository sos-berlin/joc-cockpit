# 設定 - インベントリ - 操作 - Git - クローンリポジトリ

インベントリ・オブジェクトは Git リポジトリを使ってロールアウトできます。[JS7 - Inventory Git Integration](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Git+Integration) を参照してください。

これには、オブジェクトのコミット、プッシュ、プルの Git 操作が含まれます。

Git リポジトリはトップレベルのインベントリー・フォルダーにマッピングされます。 

- 初期操作には、リモートリポジトリをJOC Cockpitが管理するローカルリポジトリにクローンすることが含まれます。
- JOC Cockpitのリポジトリは、*<jetty-base\>/resources/joc/repositories*ファイル・システム・ディレクトリにあります。 
  - local*サブディレクトリは、JOC Cockpitインスタンスにローカルなオブジェクト、たとえば環境に固有の設定を保持するJob Resourcesに使用されるリポジトリを示します。
  - rollout*サブディレクトリは、他の環境にロールアウトされるオブジェクトに使用されるリポジトリを示します。たとえば、すべての環境で変更なしで使用されるワークフローなどです。
  - インベントリオブジェクトタイプと Git リポジトリタイプのマッピングについては、[Settings - Git](/settings-git) を参照してください。
- ユーザーはファイルシステムから JOC Cockpit のリポジトリにアクセスでき、ブランチの管理など、関連する操作に Git クライアントを使用できます。

Clone*操作は*Navigation*パネルから利用可能で、トップレベルのフォルダーに対して関連する3ドットのアクションメニューから提供されます。メニュー階層には、*Git Repository-&gt;Local|Rollout-&gt;Git-&gt;Clone* があります。

## リポジトリのクローン

<img src="git-clone.png" alt="Git Clone Repository" width="400" height="130" />

入力フィールドには、クローン作成に使用するGitのURLを指定します。

- *git@*は定数接頭辞です、
- *github.com* は Git サーバーのホスト名を指定します、
- *sos-berlin*はリポジトリのオーナーです、
- *js7-demo-inventory-rollout*はリポジトリ名です、
- *.git* は定数サフィックスです。

上記の値は一例です。希望する Git サーバーに合った値を指定してください。

## 参考文献

### コンテキストヘルプ

-[Dependency Matrix](/dependencies-matrix)

###Product Knowledge Base

-[JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
-[JS7 - Inventory Git Integration](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Git+Integration)
-[JS7 - Git Repository Interface](https://kb.sos-berlin.com/display/JS7/JS7+-+Git+Repository+Interface)

