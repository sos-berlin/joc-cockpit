# IDサービス管理 - アカウント管理

IDサービスは、認証と認可によってJOCコックピットへのアクセスを管理します。[IDサービス管理](/identity-services) を参照してください。

ユーザーアカウントは、JOC コクピットで管理および保存されます：

| IDサービスタイプ|Product Knowledge Base|
| ----- | ----- |
| *JOC* |[JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service) 
| *KEYCLOAK-JOC* | [JS7 - Keycloak Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Keycloak+Identity+Service)
| *LDAP-JOC* |[JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service) |
| *OIDC-JOC* |[JS7 - OIDC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+OIDC+Identity+Service) |
| *CERTIFICATE* |[JS7 - Certificate Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service) |
| *FIDO* |[JS7 - FIDO Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service) |

以下の IDサービスタイプでは、ユーザーアカウントは JOCコックピットではなく、IDサービスプロバイダーで管理されます：

| IDサービスタイプ|Product Knowledge Base|
| ----- | ----- |
| *KEYCLOAK* |[JS7 - Keycloak Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Keycloak+Identity+Service) |
| *LDAP* |[JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service) 
| *OIDC* |[JS7 - OIDC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+OIDC+Identity+Service) |

## アカウントリスト

各アカウントについて、以下の項目が表示されます：

- **アカウント** は、ログイン時に指定するアカウント名を示します。
- **ロール** は、そのアカウントに割り当てられている[IDサービス管理 - ロール管理](/identity-service-roles) のリストを示します。
- **パスワード変更を強制** は、ユーザーアカウントが次回ログイン時にパスワードを変更する必要があるかどうかを示します。
- **ブロック中** は、アカウントが[IDサービス管理 - ブロックリスト](/identity-service-blocklist) に追加され、アクセスが拒否されていることを示します。
- **無効** は、アカウントが無効であり、アクセスが拒否されていることを示します。

## アカウントの操作

ユーザーは画面右上にある *アカウント作成* ボタンを使ってアカウントを追加できます。

### 単一アカウントに対する操作

各アカウントのアクションメニューから以下の操作が可能です：

- **編集** は、[IDサービス管理 - アカウント構成](/identity-service-account-configuration) を設定できます。
- **複製** は、選択したアカウント設定を新しいアカウントにコピーします。ユーザーは新しいアカウントの名前を指定する必要があります。
- **パスワードリセット** は、アカウントのパスワードを削除し、[設定 - Identity Service](/settings-identity-service) の *initial_password* 設定で指定されたパスワードを割り当てます。関連するユーザー・アカウントは *initial_password* でログインする必要があり、次回のログイン時にパスワードを変更する必要があります。
- **パスワード変更を強制** は、次回ログイン時にパスワード変更を強制します。
- **ブロックリストに追加** は、アカウントが[IDサービス管理 - ブロックリスト](/identity-service-blocklist) に追加されている間、そのアカウントへのアクセスを拒否します。
- **無効** は、このアカウントからのアクセスを拒否します。
- **削除** は、IDサービスからアカウントを削除します。
- **パーミッション表示** は、 指定されたアカウントのロールのパーミッションを表示します。

### アカウントの一括操作

ユーザーは、画面上部のボタンから下記の一括操作が可能です：

- **エキポート** は、選択したアカウントを JSON 形式のエキスポートファイルに出力します。
- **コピー** 選択したアカウントを内部クリップボードにコピーし、そこから同じ JOCコックピットインスタンス内の別の IDサービスに貼り付けることができます。

ユーザーは 1 つ以上の *アカウント* を選択して、選択した *アカウント* に対して上記の操作を一括して実行できます。

- **パスワードリセット** は、選択したアカウントのパスワードを削除し、[設定 - Identity Service](/settings-identity-service) の *initial_password* 設定で指定されたパスワードを割り当てます。関連するユーザーアカウントは *initial_password* でログインする必要があり、次回のログイン時にパスワードを変更する必要があります。
- **パスワード変更を強制** は、選択されたアカウントは、次回のログイン時にパスワードを変更する必要があります。
- **無効** は、選択したアカウントを無効化し、指定したアカウントからのアクセスを拒否します。
- **有効** は、選択された、無効アカウントを有効にします。
- **削除** は、選択したアカウントを IDサービスから消去します。

## 参照

### コンテキストヘルプ

- [IDサービス管理 - 設定](/identity-service-configuration)
- [IDサービス管理 - アカウント構成](/identity-service-account-configuration)
- [IDサービス管理 - ロール管理](/identity-service-roles) 
- [IDサービス管理 - ブロックリスト](/identity-service-blocklist)
- [IDサービス管理](/identity-services)
- [設定 - Identity Service](/settings-identity-service)
- [設定 - JOC](/settings-joc)

###Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)

