# ジョブ定義 - インベントリー - 操作 - Git - クローンリポジトリ

インベントリオブジェクトは Git リポジトリを使ってロールアウトできます。[JS7 - Inventory Git Integration](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Git+Integration) を参照してください。

これには、オブジェクトのコミット、プッシュ、プルの Git 操作が含まれます。

Git リポジトリはトップレベルのインベントリーフォルダーにマッピングされます。 

- 初期操作には、リモートリポジトリをJOCコックピットが管理するローカルリポジトリにクローンすることが含まれます。
- JOCコクピットのリポジトリは、*jetty-base/resources/joc/repositories* ディレクトリにあります。 
  - *local* サブディレクトリは、JOCコックピットにローカルなオブジェクト、たとえば環境に固有の設定を保持するジョブリソースに使用されるリポジトリを示します。
  - *rollout* サブディレクトリは、他の環境にロールアウトされるオブジェクトに使用されるリポジトリを示します。たとえば、すべての環境で変更なしで使用されるワークフローなどです。
  - インベントリーオブジェクトタイプと Git リポジトリタイプのマッピングについては、[設定 - Git](/settings-git) を参照してください。
- ユーザーはファイルシステムから JOCコックピットのリポジトリにアクセスでき、ブランチの管理など、関連する操作に Git クライアントを使用できます。

*Clone* 操作は *ナビゲーション* パネルから利用可能で、トップレベルのフォルダーのアクションメニューから提供されます。メニュー階層には、*リポジトリ -&gt; ローカル | ロールアウト -&gt; Git -&gt; クローン* があります。

## リポジトリのクローン

<img src="git-clone.png" alt="Git Clone Repository" width="400" height="130" />

入力フィールドには、クローン作成に使用するGitのURLを指定します。例えば；

- *git@* は定数接頭辞です、
- *github.com* は、Git サーバーのホスト名を指定します、
- *sos-berlin* は、リポジトリのオーナーです、
- *js7-demo-inventory-rollout* は、リポジトリ名です、
- *.git* は、定数サフィックスです。

上記の値は一例です。希望する Git サーバーに合った値を指定してください。

## 参照

### コンテキストヘルプ

- [依存関係](/dependencies-matrix)

###Product Knowledge Base

- [JS7 - Inventory Object Dependencies](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Object+Dependencies)
- [JS7 - Inventory Git Integration](https://kb.sos-berlin.com/display/JS7/JS7+-+Inventory+Git+Integration)
- [JS7 - Git Repository Interface](https://kb.sos-berlin.com/display/JS7/JS7+-+Git+Repository+Interface)

