# IDサービス管理 - 設定

IDサービスは、認証と認可によってJOCコックピットへのアクセスを管理します。[IDサービス管理](/identity-services) を参照してください。
IDサービスは、以下の設定が必要です：

- **一般設定** すべての IDサービスで使用可能な設定です。
- **IDサービスタイプに固有の設定**（[Identity Service - Settings](/identity-service-settings) を参照）。

## 一般設定

すべての IDサービスについて、以下の項目が表示されます：

- **IDサービス名** は自由に選択できます。
- **IDサービスタイプ** は、JOC、LDAP、OIDC、CERTIFICATE、FIDO、KEYCLOAK のいずれかです。LDAP、OIDC、KEYCLOAKについては、JOCコックピットでロール割り当てを保存する追加サービスタイプLDAP-JOC、OIDC-JOC、KEYCLOAK-JOCを使用できます。
- **順序** は、IDサービスが認証のために実行される順序を示します。
  - 順序を示す整数値を指定できます。
  - ユーザーは、[IDサービス](/identity-services) のリストでサービスを移動することで、順序を変更できます。
- **必須** は、IDサービスが、それ以前の順序の IDサービスに加えて実行されることを示します。
- **無効化** は、IDサービスが無効で、ログインに使用されないことを示します。
- **サービス認証スキーム** は、*単一要素* または *二要素* のいずれかを選べます。
  - *二要素* が選択された場合、ユーザは *FIDO* または *CERTIFICATE* IDサービスタイプのいずれかの IDサービスから 2 つ目の要素を選択する必要があります。

##参照

### コンテキストヘルプ

- [IDサービス管理 - 構成](/identity-service-settings)
- [IDサービス管理](/identity-services)

###Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)

