# IDサービス管理

IDサービスは、認証と認可によってJOCコックピットへのアクセスを管理します。

IDサービスは、認証方式の実装とアイデンティティプロバイダーへのアクセスを提供します。例えば、ユーザーアカウント/パスワードなどの認証情報は、アイデンティティプロバイダーとして機能するLDAPディレクトリサービスなどへのアクセス手段として使用されます。詳細は[JS7 - Identity and Access Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+and+Access+Management) を参照してください

- [JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service)
- [JS7 - Keycloak Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Keycloak+Identity+Service)
- [JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service)
- [JS7 - OIDC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+OIDC+Identity+Service)
- [JS7 - Certificate Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service)
- [JS7 - FIDO Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service)

詳細は[JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services) を参照ください。

デフォルトでは、ユーザーは初期インストール時に追加される JOC-INITIAL IDサービスが利用できます。

- デフォルトでは、パスワード *root* のユーザーアカウント *root* で設定されています。ユーザーは、初回ログイン時に *root*ユーザーアカウントのパスワードを変更する必要があります。
- ユーザーは、[IDサービス管理 - アカウント作成](/identity-service-accounts) と[IDサービス管理 - ロール追加](/identity-service-roles) を利用できます。
- ユーザーは既存の IDサービスを変更したり、新しいサービスを追加したりできます。

## IDサービスの実行順序

IDサービスは、オプションまたは必須として設定することができます。これらはサービスが実行される順序となります。

- IDサービスは昇順で実行されます。
- IDサービスがオプションとして指定されている場合、最初の IDサービスでログインに成功すればログインが完了します。ログインに失敗した場合、次の IDサービスが実行されます。
- IDサービスが必須として設定されている場合、ユーザーがログイン処理の度に必ずその IDサービスが実行されます。

## IDサービスの一覧

各 IDサービスについて、以下の項目が表示されます：

- **IDサービス名** は、自由に設定できます。
- **IDサービスタイプ** は、JOC、LDAP、OIDC、CERTIFICATE、FIDO、KEYCLOAK のいずれかです。LDAP、OIDC、KEYCLOAKについては、JOCコックピットでロール割り当てを保存する追加サービスタイプLDAP-JOC、OIDC-JOC、KEYCLOAK-JOCを使用することができます。
- **サービス認証スキーム** は、*単一要素* または *二要素* のいずれかです。 
- **二要素認証** は、*二要素* 認証が有効になっているかどうかを示します。
- **順序** は、IDサービスが認証のために実行される順序を示します。
- **無効** は、IDサービスが無効で、ログインに使用されないことを示します。
- **必須** は、IDサービスが、それ以前の順序の IDサービスに加えて実行されることを示します。

## IDサービスに対する操作

ユーザーは、IDサービスのいずれかをクリックして、[IDサービス管理 - ロール](/identity-service-roles) 画面または[IDサービス管理 - アカウント](/identity-service-accounts) 画面に移動できます。

ユーザーは、画面右上の *IDサービス追加* 関連ボタンから IDサービスを追加できます。

既存の IDサービスでは、アクションメニューから以下の操作が可能です：

- **編集**  は、IDサービスの一般的な設定を指定します。
- **設定管理** は、サービスタイプに固有の設定を指定します。
- **無効化** は、IDサービスを無効化します。
- **削除** は、IDサービスを削除します。

## 参照

### コンテキストヘルプ

- [IDサービス管理 - アカウント](/identity-service-accounts)
- [IDサービス管理 - 設定管理](/identity-service-configuration)
- [IDサービス管理 - ロール管理](/identity-service-roles)

###Product Knowledge Base

- [JS7 - Identity and Access Management](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+and+Access+Management)
  - [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
    - [JS7 - Certificate Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service)
    - [JS7 - FIDO Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service)
    - [JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service)
    - [JS7 - Keycloak Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Keycloak+Identity+Service)
    - [JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service)
    - [JS7 - OIDC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+OIDC+Identity+Service)
  - [JS7 - Authentication](https://kb.sos-berlin.com/display/JS7/JS7+-+Authentication)
  - [JS7 - Authorization](https://kb.sos-berlin.com/display/JS7/JS7+-+Authorization)
  
