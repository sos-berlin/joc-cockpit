# IDサービス管理 - LDAP構成

IDサービスは、認証と認可によってJOCコックピットへのアクセスを管理します。[IDサービス管理](/identity-services) を参照してください。

IDサービスは、以下の設定が必要です：

-  **一般設定** は、すべての IDサービスで必要な項目を設定します。[IDサービス管理 - 設定](/identity-service-configuration) を参照。
- LDAP IDサービスタイプに固有の設定。

## 構成

LDAPでは、*簡略構成* および *詳細構成* のタブが提供されます。

- *簡略構成* は、Microsoft Active Directory®などが使用されている場合に適用できます。
- *詳細構成* は、どのLDAPサーバーに対してもきめ細かな設定が可能です。

詳細については、下記を参照してください。
- [JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service)
  - [JS7 - LDAP Identity Service Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service+Configuration)
  - [JS7 - LDAP over TLS using STARTTLS and LDAP over SSL using LDAPS](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+over+TLS+using+STARTTLS+and+LDAP+over+SSL+using+LDAPS)

### 簡略構成：シンプルモード

- **LDAPホスト** には、LDAPサーバーホストのホスト名またはIPアドレスを指定します。TLS/SSLプロトコルを使用する場合は、LDAPサーバーの SSL証明書が発行されたホストの FQDN を使用する必要があります。
- **LDAPプロトコル** には、プレーンテキスト、TLS、SSL のいずれかを使用できます。ユーザーアカウントとパスワードが暗号化されずにネットワーク経由で送信されるため、プレーンテキストは推奨されません。TLSおよびSSLプロトコルは、LDAPサーバーへのコンテンツ/接続内容を暗号化するため、安全であると見なされます。
- **LDAPポート** は、LDAPサーバーがリッスンしているポートです。プレーンテキストおよびTLS接続ではポート389がよく使用され、SSL接続ではポート636がよく使用されます。
- **LDAP AD** は、LDAPサーバーがMicrosoft Active Directoryの場合、設定を簡素化します。Active Directoryが使用されている場合、ユーザー検索とグループ検索のための多くの属性が自動的に想定されます。
- **LDAP with samAccountName** は、*samAccountName* がユーザーアカウントの一意な識別子として機能するかどうかを指定します。この属性は、Active Directory LDAPサーバーで頻繁に使用できます。
- **LDAP with memberOf** は、ユーザーアカウントがメンバーシップを持つセキュリティグループの検索を簡略化します。この属性は、Active DirectoryタイプのLDAPサーバーで頻繁に使用できますが、他のLDAP製品でも同様に実装できます。
- **LDAP User DN Template**は、ユーザーアカウントを識別する識別名(DN)のプレースホルダーです。値 *{0}* はActive Directory LDAPサーバーに使用でき、ログイン中に指定されたユーザーアカウントに置き換えられます。
- **LDAP Search Base**は、LDAPサーバーエントリーの階層でユーザーアカウントを検索するために使用されます。
- **LDAP User Search Filter**は、LDAPエントリーの階層でユーザーアカウントを識別するために使用されるLDAPクエリーを指定します。

### 詳細構成：エキスパートモード

#### 共通

- **LDAPサーバーURL** は、プロトコルを指定します。例えば、プレーンテキストおよびTLS接続の場合は *ldap://*、SSL接続の場合は *ldaps://* となります。プロトコルには、LDAPサーバーのホスト名(FQDN)とポート番号を追加します。
- **LDAPリードタイムアウト** は、接続が確立されたときに JOCコックピットが LDAPサーバーの応答を待つ時間を秒単位で指定します。
- **LDAP接続タイムアウト** は、接続を確立するときに JOCコックピットが LDAPサーバーの応答を待つ時間を秒単位で指定します。
- **LDAP UseStartTls** は、LDAPサーバーへの接続のプロトコルをTLSにします。
- **LDAP Host Name Verification** は、LDAPサーバーの URLと、LDAPサーバー証明書のホスト名が一致するかどうかを検証することを、有効化します。
- **LDAPトラストストアパス**は、LDAPサーバーが TLS/SSLプロトコルに構成されている場合に、トラストストアの場所を指定します。指定されたトラストストアは、サーバー認証の拡張キー使用法に指定された X.509 証明書を含む必要があります。
  - Azure® などの LDAP ID プロバイダへの接続の場合、ユーザーは JOCコックピットで使用される Java JDK に同梱されている Java *cacerts* トラストストアファイルへのパスを指定する必要があります。
  - トラストストアは、プライベート CA 署名証明書またはパブリック CA 署名証明書を含むことができます。通常、ルート CA 証明書が使用されます。そうしないと、サーバー認証証明書の署名に関係する完全な証明書チェーンをトラストストアで利用できるようにする必要があるためです。
  - LDAPサーバーが TLS/SSL 接続で動作しており、この設定が指定されていない場合、JOCコックピットは *JETTY_BASE/resources/joc/joc.properties* 設定ファイルで設定されているトラストストアを使用します。これには、トラストストアのパスワードとトラストストアのタイプの設定の使用も含まれます。
  - トラストストアのパスは、*JETTY_BASE/resources/joc* ディレクトリからの相対パスで指定します。トラストストアがこのディレクトリにある場合は、ファイル名のみを指定します。通常、拡張子は .p12 です。トラストストアが *JETTY_BASE* ディレクトリにある場合は、*../../joc-truststore.p12* などを使って他の相対位置を指定できます。絶対パスは指定できず、ファイル・システム階層で *JETTY_BASE* ディレクトリより前にあるパスは指定できません。
- **LDAPトラストストアパスワード** は、LDAPトラストストアを保護するパスワードを指定します。Java JDK *cacerts*トラストストアを使用する場合、既定のパスワードは*changeit*です。
- **LDAPトラストストアタイプ**では、トラストストアのタイプを*PKCS12*または*JKS*（非推奨）のいずれかに指定します。

#### 認証

- **LDAP User DN Template** は、ユーザーアカウントを識別する識別名（DN）のプレースホルダです。値 *{0}* は Active Directory LDAP サーバーに使用でき、ログイン中に指定されたユーザーアカウントに置き換えられます。 
- **LDAPシステムユーザーDNテンプレート**は、*システムユーザーアカウント* がLDAPサーバーへのバインドに使用される場合に適用され、ログインを実行するユーザーアカウントが指定されたアカウントとパスワードで存在するかどうかを確認します。*システムユーザーアカウント* の使用は、アカウントのパスワードが公開されるため推奨されません。この設定は、*LDAP User DN Template* と似ており、*システムユーザーアカウント* の識別名のプレースホルダを指定します。
- **LDAPシステムユーザー** は、*samAccountName* やその他の属性、例えば *account@domain* などからログインするユーザーアカウントを指定します。
- **LDAPシステムパスワード** は、ユーザーアカウントのパスワードを指定します。

#### グループロールマッピング

- **LDAP Search Base** は、LDAP検索に用いる *OU=Operations, O=IT, O=Users, DC=example,DC=com* などです。
- **LDAP Group Search Base**は、*LDAP Search Base* と同様に、ユーザーアカウントが所属するセキュリティグループを検索するために使用されます。
- **LDAP Group Search Filter**は、ユーザーアカウントがメンバーであるセキュリティグループを特定するために使用されるLDAPクエリーを指定します。フィルタは、グループ検索ベースから提供される検索結果に適用されます。
- **LDAP User Search Filter**
- **Group Name 属性***は、ユーザーアカウントがメンバーであるセキュリティグループの名前を提供する属性を指定します。
- **LDAP User Name 属性**
- **LDAP グループロールマッピング**
  - **ネストされたグループ検索を無効にする** は、セキュリティグループのメンバーである場合、セキュリティグループが再帰的に検索されないように指定します。
  - **Group/Name Mapping** は、ユーザーアカウントがメンバーである Security Groups と JS7ロールのマッピングを指定します。セキュリティグループは、*CN=js7_admins, OU=Operations, O=IT, O=Groups, DC=example, DC=com*のように識別名として、または*js7_admins*のように共通名として、*LDAPグループ検索属性*に応じて指定する必要があります。

## 参照

### コンテキストヘルプ

- [IDサービス管理 - 設定](/identity-service-configuration)
- [IDサービス管理](/identity-services)

###Product Knowledge Base

- [JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
  - [JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service)
    - [JS7 - LDAP Identity Service Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service+Configuration)
    - [JS7 - LDAP over TLS using STARTTLS and LDAP over SSL using LDAPS](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+over+TLS+using+STARTTLS+and+LDAP+over+SSL+using+LDAPS)

