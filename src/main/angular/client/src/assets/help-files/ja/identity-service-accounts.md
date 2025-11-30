# アイデンティティサービスアカウント

認証と承認による JOC コックピットへのアクセスは、[Identity Services](/identity-services) を参照してください。

ユーザーアカウントは、JOC Cockpit で管理および保存されます：

| アイデンティティサービスタイプ
| ----- | ----- |
| *JOC* |[JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service) 
| keycloak-joc*｜[JS7 - Keycloak Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Keycloak+Identity+Service) ｜。
| *ldap-joc* |[JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service) |
| *oidc-joc* |[JS7 - OIDC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+OIDC+Identity+Service) |
| *certificate* |[JS7 - Certificate Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service) |
| *FIDO* |[JS7 - FIDO Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Certificate+Identity+Service) |

以下の Identity Service Type では、ユーザーアカウントは JOC Cockpit ではなく Identity Service Provider で管理されます：

| アイデンティティサービスタイプ
| ----- | ----- |
| *keycloak* |[JS7 - Keycloak Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Keycloak+Identity+Service) | *LDAP* | 
| *LDAP* |[JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service) 
| *OIDC* |[JS7 - OIDC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+OIDC+Identity+Service) |

## アカウント一覧

各アカウントについて、以下のプロパティが表示されます：

- **アカウント**はログイン時に指定されたアカウントを示します。
- **ロール**は、そのアカウントに割り当てられている[Identity Service - Roles](/identity-service-roles) のリストを示します。
- **強制パスワード変更**は、ユーザーアカウントが次回ログイン時にパスワードを変更する必要があるかどうかを示します。
- **Blocked**は、アカウントが[Identity Service - Blocklist](/identity-service-blocklist) に追加され、アクセスが拒否されていることを示します。
- **Disabled**は、アカウントが非アクティブであり、アクセスが拒否されていることを示します。

## アカウントに対する操作

ユーザーはビューの右上にある関連ボタンを使ってアカウントを追加できます。

### 単一アカウントに対する操作

各アカウントの3点アクションメニューから以下の操作が可能です：

- **Edit**では、[Identity Service - Account Configuration](/identity-service-account-configuration) を指定できます。
- **選択したアカウントを新しいアカウントにコピーします。ユーザーは新しいアカウントの名前を指定する必要があります。
- **パスワードのリセット**は、アカウントのパスワードを削除し、[Settings - Identity Service](/settings-identity-service) の *initial_password* 設定で指定されたパスワードを割り当てます。関連するユーザー・アカウントは *initial_password* でログインする必要があり、次回のログイン時にパスワードを変更する必要があります。
- **強制パスワード変更**は、次回ログイン時にパスワードを変更させます。
- **Add to Blocklist** は、アカウントが[Identity Service - Blocklist](/identity-service-blocklist) に追加されている間、そのアカウントへのアクセスを拒否します。
- **このアカウントからのアクセスを拒否します。
- **Delete** Identity Service からアカウントを消去します。
- **Show Permissions** 指定されたアカウントのマージされたロールの結果のアクセス許可リストを表示します。

### アカウントの一括操作

ユーザは、画面上部のボタンから以下の一括操作を見つけることができます：

- **エクスポート** 選択したアカウントを JSON 形式のエクスポートファイルに追加します。
- **コピー** 選択したアカウントを内部クリップボードにコピーし、そこから同じ JOC Cockpit インスタンス内の別の ID サービスに貼り付けることができます。

ユーザは 1 つ以上の *Accounts* を選択して、選択した *Accounts* に対して上記の操作を一括して実行できます。

- **パスワードのリセット**は、選択したアカウントのパスワードを削除し、[Settings - Identity Service](/settings-identity-service) ページの *initial_password* 設定で指定されたパスワードを割り当てます。関連するユーザーアカウントは *initial_password* でログインする必要があり、次回のログイン時にパスワードを変更する必要があります。
- **選択されたアカウントは、次回のログイン時にパスワードを変更する必要があります。
- **選択したアカウントを無効化し、指定したアカウントからのアクセスを拒否します。
- **有効化** 選択された、無効化されたアカウントを有効にします。
- **選択したアカウントを ID サービスから消去します。

## 参考文献

### コンテキストヘルプ

-[Identity Service - Configuration](/identity-service-configuration)
-[Identity Service - Account Configuration](/identity-service-account-configuration)
- [Identity Service - Roles](/identity-service-roles) 
-[Identity Service - Blocklist](/identity-service-blocklist)
-[Identity Services](/identity-services)
-[Settings - Identity Service](/settings-identity-service)
-[Settings - JOC Cockpit](/settings-joc)

###Product Knowledge Base

-[JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)

