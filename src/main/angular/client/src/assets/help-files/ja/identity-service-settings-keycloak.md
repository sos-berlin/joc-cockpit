# Keycloakアイデンティティサービス設定

アイデンティティサービスは、認証と承認によってJOCコックピットへのアクセスをルール化します。[Identity Services](/identity-services) を参照してください。

Identityサービスは以下の設定から指定します：

- すべての ID サービスに利用可能なプロパティを保持する **一般構成**（[Identity Service - Configuration](/identity-service-configuration) を参照）。
- **Keycloak Identity Service Type に固有の設定。

## 設定

- **KeycloakのURL**はKeycloak REST APIが利用可能なベースURLです。
- **Keycloak管理アカウント**は、Keycloakの*realm-management.view-clients*および*realm-management.view-users*ロールが割り当てられた管理ロールを持つKeycloakアカウントです。管理者アカウントは、Keycloakアカウントのロールを取得し、アクセストークンを更新するために使用されます。
- **Keycloak管理パスワード**は、*Keycloak管理アカウント*のパスワードです。
- **Keycloakトラストストア・パス**は、KeycloakサーバーがHTTPS接続用に構成されている場合のトラストストアの場所を指定します。指定されたトラストストアは、サーバー認証の拡張鍵用途に指定されたX.509証明書を含んでいなければなりません。
  - トラストストアは、プライベートCA署名証明書またはパブリックCA署名証明書を含むことができます。通常、ルート CA 証明書が使用されます。そうでない場合は、サーバー認証証明書に署名するための完全な証明書チェーンをトラストストアで利用できるようにする必要があるからです。
  - もしKeycloak ServerがHTTPS接続のために運用されていて、この設定が指定されていない場合、JOC Cockpitは*JETTY_BASE/resources/joc/joc.properties*設定ファイルで設定されているトラストストアを使用します。これには、トラストストアのパスワードとトラストストアのタイプの設定の使用も含まれます。
- トラストストアのパスは、*JETTY_BASE/resources/joc* ディレクトリからの相対パスで指定します。トラストストアがこのディレクトリにある場合、ファイル名のみが指定され、通常拡張子は .p12 です。トラストストアが *JETTY_BASE* ディレクトリにある場合は、*../../joc-truststore.p12* のように相対パスを指定できます。絶対パスは指定できず、ファイルシステム階層で*JETTY_BASE*ディレクトリより前にあるパスは指定できません。
- **Keycloakトラストストア・パスワード**は、KeycloakサーバーがHTTPS接続用に構成されている場合にトラストストアを保護するパスワードを指定します。
- **Keycloakトラストストア・タイプ**には、*PKCS12*または*JKS*（非推奨）のいずれかを指定します。この設定は、Keycloak ServerがHTTPS接続用に構成されている場合に使用されます。
- Keycloakクライアントは、ユーザーアカウントの認証をKeycloakに要求するエンティティです。たとえば、JOCコックピットのようなアプリケーションは、Keycloakサーバーに対するクライアントとして動作します。クライアントはキークロークを使って認証を行い、シングルサインオン・ソリューションを提供します。
  - **KeycloakクライアントID**と*Keycloakクライアントシークレット*は、次の場合に使用されます。
    - アクセストークンの要求
      - ユーザー認証
      - 管理者アクセス
    - 既存のアクセストークンの検証
    - 既存のアクセストークンの更新
  - **Keycloakクライアントシークレット**はクライアントが所有し、KeycloakサーバーとJOCコックピットの両方が知っている必要があります。
- **Keycloakレルム**は、ユーザー、認証情報、ロール、グループのセットを管理します。ユーザーはレルムに所属し、レルムへのログインを実行します。レルムは互いに分離されており、レルムが管理するユーザーアカウントだけを管理し、認証します。
- **Keycloakバージョン16以前**は、以前のKeycloakリリースの互換性スイッチです。

## 参考文献

### コンテキストヘルプ

-[Identity Service - Configuration](/identity-service-configuration)
-[Identity Services](/identity-services)

###Product Knowledge Base

-[JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
-[JS7 - Keycloak Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Keycloak+Identity+Service)

