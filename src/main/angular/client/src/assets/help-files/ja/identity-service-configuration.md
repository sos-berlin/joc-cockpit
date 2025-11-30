# アイデンティティ・サービスの構成

アイデンティティサービスは、認証と承認によって JOC コックピットへのアクセスをルール化します（[Identity Services](/identity-services) を参照）。

Identityサービスは、以下の構成から指定します：

- すべての ID サービスで使用可能なプロパティを保持する **一般構成**。
- **Identity Service Type に固有の設定**（[Identity Service - Settings](/identity-service-settings) を参照）。

## 一般構成

すべての ID サービスについて、以下のプロパティが表示されます：

- **アイデンティティサービス名**は自由に選択できます。
- **ID サービスタイプ**は、JOC、LDAP、OIDC、CERTIFICATE、FIDO、KEYCLOAK のいずれかです。LDAP、OIDC、KEYCLOAKについては、JOC Cockpitで役割割り当てを保存する追加サービスタイプLDAP-JOC、OIDC-JOC、KEYCLOAK-JOCを使用できます。
- **オーダー** は、Identity Service が認証のためにトリガされる順序を示します。
  - オーダリングを示す整数値を指定できます。
  - ユーザーは、[Identity Services](/identity-services) のリストでサービスを移動することで、オーダーを変更できます。
- **Required**は、Identity Service が、それ以前の順序の Identity Service に加えてトリガされることを示します。
- **Disabled**は、Identity Serviceが非アクティブで、ログインに使用されないことを示します。
- **Authentication Scheme** は、*single-factor* または *two-factor* のいずれか。 
  - two-factor* が選択された場合、ユーザは FIDO または CERTIFICATE Identity Service Types のいずれかの Identity Services から 2 つ目の要素を選択する必要があります。

##参照

### コンテキストヘルプ

-[Identity Service - Settings](/identity-service-settings)
-[Identity Services](/identity-services)

###Product Knowledge Base

-[JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)

