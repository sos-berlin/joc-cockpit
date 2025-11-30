# OIDC アイデンティティサービス設定

アイデンティティサービスは、認証と承認によってJOCコックピットへのアクセスをルール化します。[Identity Services](/identity-services) を参照してください。

アイデンティティサービスは、以下の設定から指定します：

- すべての ID サービスに利用可能なプロパティを保持する **General Configuration**（[Identity Service - Configuration](/identity-service-configuration) を参照）。
- **OIDC Identity Service Type に固有の設定。

## 設定

以下の設定があります：

- **OIDC名**は、JOCコックピットがログインページの関連ログインボタンのキャプションに使用します。
- **OIDC 認証 URL** OIDC ID プロバイダにログインするためにクライアントが使用します。この URL は、ログインのためにクライアントによって呼び出され、OIDC アイデンティティプロバイダからアクセストークンを返します。同様に、*/.well-known/openid-configuration* URL で OIDC アイデンティティプロバイダの設定を読み込む際にも使用され、トークン検証時に発行元として使用されます。
- **フロータイプ
  - **認可コードフロー**は、実績のあるセキュリティで最も一般的に使用されるフローです。
  - **暗黙フロー**は、以前は安全でないと考えられていたフローです。
  - **クライアント認証情報フロー(Client Credentials Flow)***は、ユーザーとのインタラクションを伴わないバッチ処理用の簡略化されたフローです。
- **OIDC クライアント ID** は、OIDC ID プロバイダでクライアントを識別します。
- OIDC Client Secret** は、OIDC ID プロバイダで *OIDC Client ID** に割り当てられたパスワードです。
- **OIDC User Name Attribute** は、OIDC Identity Service がユーザーアカウントを識別するために使用する属性名。
  - JOC Cockpit アカウントへのマッピングに使用される属性を識別するために、以下のストラテジが適用されます：
    - <identity-provider\> /.well-known/openid-configuration* が呼び出されます。
    - 応答は、オブジェクト *claims_supported* についてチェックされます。
      - 利用可能でないか空の場合、*email*属性が使用されます。
      - もし利用可能で、*preferred_username*属性が含まれていれば、この属性が使用されます。
    - 属性が特定されなかった場合、*email*属性が使用されます。
  - これによって識別可能なユーザアカウントが得られない場合、ユーザは name 属性を指定することができます。OIDC アイデンティティプロバイダは、*username* や *email* といった属性名をサポートすることがよくあります。
- **OIDCイメージ**はオプションでアップロードすることができ、ログインページとともに表示されます。ユーザーはこの画像をクリックして、OIDC アイデンティティサービスでログインすることができます。
- **OIDC トラストストアのパス**（指定された場合）には、ID プロバイダのサーバ認証の拡張キー使 用法に指定された X.509 証明書を含める必要があります。
  - Azure® などのよく知られた OIDC ID プロバイダへの接続の場合、ユーザーは JOC Cockpit で使用される Java JDK に同梱されている Java *cacerts* トラストストア・ファイルへのパスを指定する必要があります。
  - トラストストアは、プライベート CA またはパブリック CA からの自己署名証明書を含む必要があります。通常、CA 証明書が使用されます。そうしないと、サーバ認証証明書の署名に関係する完全な証明書チェーンをトラストストアで利用できるようにする必要があるためです。
  - この設定が指定されていない場合、JOC Cockpitは*JETTY_BASE/resources/joc/joc.properties*構成ファイルで構成されているトラストストアを使用します。これには、*OIDC Truststore Password* と *OIDC Truststore Type* の設定の使用も含まれます。
  - トラストストアのパスは、*JETTY_BASE/resources/joc* ディレクトリからの相対パスで指定できます。トラストストアがこのディレクトリにある場合、ファイル名のみが指定され、通常拡張子は.p12または.pfxです。トラストストアが *JETTY_BASE* ディレクトリにある場合は、 *../../joc-truststore.p12* のように相対パスを指定できます。
  - 絶対パスを指定することもできます。
- **Java JDKの*cacerts*トラストストアの場合、デフォルトのパスワードは*changeit*です。
- **OIDCトラストストア・タイプ**は、PKCS12またはJKS（非推奨）のいずれかです。
- **OIDCクレーム**は、JS7ロールへのマッピングに使用されるOIDC *ロール*または*グループ*を指定します。デフォルトの*OIDCクレーム*には、*ロール*、*グループ*が含まれます。
- **OIDC Scopes** は、OIDC Identity Service Provider から返される *OIDC Claims* のスコープを指定します。デフォルトの *OIDC スコープ* には、*roles*、*groups*、*profile* が含まれます。
- **OIDC Group/Roles Mapping** は、アカウントにロールを割り当てるためのものです。
  - OIDC Identity Service Provider で構成されたグループを含む請求のリストを指定できます。利用可能なクレームは、登録時に *JSON Web Token* をチェックすることで利用可能になります。
 - 割り当て中、OIDC Identity Service Provider から利用可能なグループは、Identity Service で構成されたロールに割り当てられます。各グループには、任意の数のロールを割り当てることができます。

## 参照

### コンテキストヘルプ

-[Identity Service - Configuration](/identity-service-configuration)
-[Identity Services](/identity-services)

###Product Knowledge Base

-[JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
-[JS7 - OIDC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+OIDC+Identity+Service)

