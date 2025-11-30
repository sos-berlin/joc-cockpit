# アイデンティティ・サービス

アイデンティティサービスは、認証と承認によってJOCコックピットへのアクセスを制御します。

ID サービスは、認証方法と ID プロバイダへのアクセスを実装します。たとえば、ユーザアカウント／パスワードなどの資格情報は、ID プロバイダとして機能する LDAP ディレクトリサービスにアクセスするための認証方法として使用されます。[JS7 - Identity and Access Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+and+Access+Management) を参照。

-[JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service)
-[JS7 - Keycloak Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Keycloak+Identity+Service)
-[JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service)
-[JS7 - OIDC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+OIDC+Identity+Service)
-[JS7 - Certificate Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service)
-[JS7 - FIDO Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service)

詳細は[JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services) をご覧ください。

デフォルトでは、ユーザーは初期インストール時に追加される JOC-INITIAL Identity Service を見つけます。

- ID サービスは、パスワード *root*を持つ単一のユーザアカウント *root* を保持します。ユーザーは、初回ログイン時に *root*ユーザーアカウントのパスワードを変更する必要があります。
- ユーザーは、Identity Service に[Identity Service - Accounts](/identity-service-accounts) と[Identity Service - Roles](/identity-service-roles) を追加できます。
- ユーザーは既存の ID サービスを変更したり、新しい ID サービスを追加したりできます。

## Identityサービスのトリガー

ID サービスは、任意または必須にすることができます。トリガーされるオーダーを示します。

- Identityサービスは昇順でトリガーされます。
- Identity Services がオプションとして指定されている場合、最初の Identity Service でログインに成功するとログインが完了します。ログインに失敗した場合、次の Identity Service がトリガされます。
- Identity Services が必須であると指定された場合、ユーザがログインするとすべての Identity Services が起動します。

## アイデンティティサービスの一覧

各アイデンティティサービスについて、以下のプロパティが表示されます：

- **アイデンティティサービス名**は自由に選択できます。
- **ID サービスタイプ**は、JOC、LDAP、OIDC、CERTIFICATE、FIDO、KEYCLOAK のいずれかです。LDAP、OIDC、KEYCLOAKについては、JOC Cockpitで役割割り当てを保存する追加サービスタイプLDAP-JOC、OIDC-JOC、KEYCLOAK-JOCを使用することができます。
- 認証スキーム**は、*1ファクター**または*2ファクター**のいずれかです。 
- **第 2 因子** は、第 2 因子が *2 因子* 認証で有効になっているかどうかを示します。
- **Ordering** は、Identity Service が認証のためにトリガされる順序を示します。
- **Disabled** は、Identity Service が非アクティブで、ログインに使用されないかどうかを示します。
- **Required**は、Identity Service が、それ以前の順序の Identity Service に加えてトリガされることを示します。

## Identity サービスに対する操作

ユーザは、Identity Services のいずれかをクリックして、[Identity Service - Roles](/identity-service-roles) ビューまたは[Identity Service - Accounts](/identity-service-accounts) ビューに移動できます。

ユーザは、画面右上の関連ボタンから ID サービスを追加できます。

既存の ID サービスでは、3 つの点のアクションメニューから以下の操作が可能です：

- **Edit** アイデンティティサービスの一般的な設定を指定します。
- **設定管理**」は、サービスタイプに固有の設定を指定します。
- **Disable（無効化）** ID サービスを非アクティブにします。
- **削除]は、Identity Service を削除します。

## 参照

### コンテキストヘルプ

-[Identity Service - Accounts](/identity-service-accounts)
-[Identity Service - Configuration](/identity-service-configuration)
-[Identity Service - Roles](/identity-service-roles)

###Product Knowledge Base

-[JS7 - Identity and Access Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+and+Access+Management)
  -[JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
    -[JS7 - Certificate Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service)
    -[JS7 - FIDO Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service)
    -[JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service)
    -[JS7 - Keycloak Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Keycloak+Identity+Service)
    -[JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service)
    -[JS7 - OIDC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+OIDC+Identity+Service)
  -[JS7 - Authentication](https://kb.sos-berlin.com/display/JS7/JS7+-+Authentication)
  -[JS7 - Authorization](https://kb.sos-berlin.com/display/JS7/JS7+-+Authorization)
  
