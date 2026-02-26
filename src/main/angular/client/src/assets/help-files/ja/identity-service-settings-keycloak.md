# IDサービス管理 - Keycloak構成

IDサービスは、認証と認可によってJOCコックピットへのアクセスを管理します。[IDサービス管理](/identity-services) を参照してください。

IDサービスは、以下の設定が必要です：

-  **一般設定** は、すべての IDサービスで必要な項目を設定します。[IDサービス管理 - 設定](/identity-service-configuration) を参照。
- Keycloak IDサービスタイプに固有の設定。

## 構成

- **Keycloak URL**はKeycloak REST APIが利用できるベースURLです。
- **Keycloak Adminアカウント**は、Keycloak の *realm-management.view-clients* および* realm-management.view-users* ロールが割り当てられた管理ロールを持つKeycloakアカウントです。Adminアカウントは、Keycloakアカウントのロールを取得し、アクセストークンを更新するために使用されます。
- **Keycloak Adminパスワード**は、*Keycloak Adminアカウント* のパスワードです。
- **Keycloak トラストストアパス**は、KeycloakサーバーがHTTPS接続用に構成されている場合のトラストストアの場所を指定します。指定されたトラストストアは、サーバー認証の拡張鍵用途に指定されたX.509証明書を含んでいなければなりません。
  - トラストストアは、プライベートCA署名証明書またはパブリックCA署名証明書を含むことができます。通常、ルート CA 証明書が使用されます。そうでない場合は、サーバー認証証明書に署名するための完全な証明書チェーンをトラストストアで利用できるようにする必要があるからです。
  - もしKeycloakサーバーがHTTPS接続のために運用されていて、この設定が指定されていない場合、JOCコックピットtは *JETTY_BASE/resources/joc/joc.properties* ファイルで設定されているトラストストアを使用します。これには、トラストストアのパスワードとトラストストアのタイプの設定の使用も含まれます。
- トラストストアのパスは、*JETTY_BASE/resources/joc* ディレクトリからの相対パスで指定します。トラストストアがこのディレクトリにある場合、ファイル名のみが指定され、通常拡張子は .p12 です。トラストストアが *JETTY_BASE* ディレクトリにある場合は、*../../joc-truststore.p12* のように相対パスを指定できます。絶対パスは指定できず、ファイルシステム階層で *JETTY_BASE* ディレクトリより前にあるパスは指定できません。
- **Keycloak トラストストアパスワード**は、KeycloakサーバーがHTTPS接続用に構成されている場合にトラストストアのパスワードを指定します。
- **Keycloak トラストストアタイプ**には、*PKCS12* または *JKS* （非推奨）のいずれかを指定します。この設定は、KeycloakサーバーがHTTPS接続用に構成されている場合に使用されます。
- Keycloakクライアントは、ユーザーアカウントの認証をKeycloakに要求する属性です。たとえば、JOCコックピットのようなアプリケーションは、Keycloakサーバーに対するクライアントとして動作します。クライアントはKeycloakを使って認証を行い、シングルサインオンソリューションを提供します。
  - **KeycloakクライアントID**と *Keycloakクライアントシークレット* は、次の場合に使用されます。
    - アクセストークンの要求
      - ユーザー認証
      - 管理者アクセス
    - 既存のアクセストークンの検証
    - 既存のアクセストークンの更新
  - **Keycloakクライアントシークレット** は、クライアントが所有し、KeycloakサーバーとJOCコックピットの両方が知っている必要があります。
- **Keycloak Realm** は、ユーザー、認証情報、ロール、グループのセットを管理します。ユーザーはRelmに所属し、Relmへのログインを実行します。Relmは互いに分離されており、Relmが管理するユーザーアカウントだけを管理し、認証します。
- **Keycloak V.16またはそれ以下**は、以前のKeycloakリリースの互換性スイッチです。

## 参照

### コンテキストヘルプ

- [IDサービス管理 - 設定](/identity-service-configuration)
- [IDサービス管理](/identity-services)

###Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
- [JS7 - Keycloak Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Keycloak+Identity+Service)

