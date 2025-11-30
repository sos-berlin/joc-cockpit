# LDAP アイデンティティサービスの設定

アイデンティティサービスは、認証と承認によってJOCコックピットへのアクセスをルール化します。[Identity Services](/identity-services) を参照してください。

アイデンティティサービスは、以下の設定から指定します：

- すべての ID サービスで使用可能なプロパティを保持する **一般構成**（[Identity Service - Configuration](/identity-service-configuration) を参照）。
- **LDAP ID サービスタイプに固有の設定。

## 設定

LDAP の場合、*Fewer Options* および *More Options* のタブが提供されます。

- 少ないオプション(*Fewer Options*)はMicrosoft Active Directory®などが使用されている場合に適用されます。
- より詳細なオプション(*More Options*)では、どのLDAPサーバーに対してもきめ細かい設定が可能です。

詳細については
-[JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service)
  -[JS7 - LDAP Identity Service Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service+Configuration)
  -[JS7 - LDAP over TLS using STARTTLS and LDAP over SSL using LDAPS](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+over+TLS+using+STARTTLS+and+LDAP+over+SSL+using+LDAPS)

### 設定をご覧ください：少ないオプション

- **LDAPサーバーホスト**には、LDAPサーバーホストのホスト名またはIPアドレスを指定します。TLS/SSLプロトコルを使用する場合は、LDAPサーバーSSL証明書が発行されたホストの完全修飾ドメイン名(FQDN)を使用する必要があります。
- **LDAPサーバープロトコル**には、プレーンテキスト、TLS、SSLのいずれかを使用できます。ユーザーアカウントとパスワードが暗号化されずにネットワーク経由で送信されるため、プレーンテキストは推奨されません。TLSおよびSSLプロトコルは、LDAPサーバーへのコンテンツ/接続を暗号化するため、安全であると見なされます。
- **LDAPサーバーポート**は、LDAPサーバーがリッスンしているポートです。プレーンテキストおよびTLS接続ではポート389がよく使用され、SSL接続ではポート636がよく使用されます。
- **LDAP Server is Active Directory**は、LDAPサーバーがActive Directoryによって実装されている場合、設定を簡素化します。Active Directoryが使用されている場合、ユーザー検索とグループ検索のための多くの属性が自動的に想定されます。
- **LDAP Server offers samAccountName attribute** は、*samAccountName* 属性がユーザーアカウントの一意な識別子として機能するかどうかを指定します。この属性は、Active Directory LDAPサーバーで頻繁に使用できます。
- **LDAP Server offers memberOf 属性** は、ユーザーアカウントがメンバーシップを持つセキュリティグループの検索を簡略化します。この属性は、Active DirectoryタイプのLDAPサーバーで頻繁に使用できますが、他のLDAP製品でも同様に実装できます。
- **LDAPユーザーDNテンプレート**は、ユーザーアカウントを識別する識別名(DN)のプレースホルダーです。値*{0}*はActive Directory LDAPサーバーに使用でき、ログイン中に指定されたユーザーアカウントに置き換えられます。
- **LDAPサーバー検索ベース**は、LDAPサーバーエントリーの階層でユーザーアカウントを検索するために使用されます。
- **LDAPユーザー検索フィルター**は、LDAPエントリーの階層でユーザー・アカウントを識別するために使用されるLDAPクエリーを指定します。

### 設定：その他のオプション

#### 一般設定

- **LDAPサーバーのURL**はプロトコルを指定します。例えば、プレーンテキストおよびTLS接続の場合は*ldap://*、SSL接続の場合は*ldaps://*となります。プロトコルは、LDAPサーバーのホスト名(FQDN)とポートが追加されます。
- **LDAP Server Read Timeout** は、接続が確立されたときに JOC Cockpit が LDAP Server の応答を待つ時間を秒単位で指定します。
- **LDAPサーバー接続タイムアウト**は、接続を確立するときにJOC CockpitがLDAPサーバーの応答を待つ時間を秒単位で指定します。
- **LDAP開始TLS**スイッチは、LDAPサーバーへの接続のプロトコルをTLSにします。
- LDAPサーバURLとLDAPサーバ証明書のホスト名が一致するかどうかを検証するために、**LDAPホスト名検証**スイッチをアクティブにする必要があります。
- **LDAPトラストストア・パス**は、LDAPサーバーがTLS/SSLプロトコル用に構成されている場合に、トラストストアの場所を指定します。指定されたトラストストアは、サーバー認証の拡張キー使用法に指定された X.509 証明書を含む必要があります。
  - Azure® などのよく知られた LDAP ID プロバイダへの接続の場合、ユーザは JOC Cockpit で使用される Java JDK に同梱されている Java *cacerts* トラストストア・ファイルへのパスを指定する必要があります。
  - トラストストアは、プライベート CA 署名証明書またはパブリック CA 署名証明書を含むことができます。通常、ルート CA 証明書が使用されます。そうしないと、サーバー認証証明書の署名に関係する完全な証明書チェーンをトラストストアで利用できるようにする必要があるためです。
  - LDAP サーバーが TLS/SSL 接続で動作しており、この設定が指定されていない場合、JOC Cockpit は *JETTY_BASE/resources/joc/joc.properties* 設定ファイルで設定されているトラストストアを使用します。これには、トラストストアのパスワードとトラストストアのタイプの設定の使用も含まれます。
  - トラストストアのパスは、*JETTY_BASE/resources/joc* ディレクトリからの相対パスで指定します。トラストストアがこのディレクトリにある場合は、ファイル名のみを指定します。通常、拡張子は .p12 です。トラストストアが *JETTY_BASE* ディレクトリにある場合は、*../../joc-truststore.p12* などを使って他の相対位置を指定できます。絶対パスは指定できず、ファイル・システム階層で *JETTY_BASE* ディレクトリより前にあるパスは指定できません。
- **LDAPトラストストアのパスワード** は、LDAPトラストストアを保護するパスワードを指定します。Java JDK *cacerts*トラストストアを使用する場合、既定のパスワードは*changeit*です。
- **LDAPトラストストア・タイプ**では、トラストストアのタイプを*PKCS12*または*JKS*（非推奨）のいずれかに指定します。

#### 認証設定

- **LDAP User DN Template** は、ユーザーアカウントを識別する識別名（DN）のプレースホルダです。値 *{0}* は Active Directory LDAP サーバーに使用でき、ログイン中に指定されたユーザーアカウントに置き換えられます。 
- **LDAPシステム・ユーザーDNテンプレート**は、*システム・ユーザー・アカウント*がLDAPサーバーへのバインドに使用される場合に適用され、ログインを実行するユーザー・アカウントが指定されたアカウントとパスワードで存在するかどうかを確認します。システム・ユーザー・アカウント*の使用は、アカウントのパスワードが公開されるため推奨されません。この設定は、*LDAP User DN Template* と似ており、*System User Account* の識別名のプレースホルダを指定します。
- **LDAPシステムユーザーアカウント** は、*samAccountName* やその他の属性、例えば *account@domain* などからログインするユーザーアカウントを指定します。
- **システムユーザーアカウントのパスワードを指定します。

#### 認証設定

- **例えば、*OU=Operations, O=IT, O=Users, DC=example,DC=com* などです。
- **LDAPグループ検索ベース**は、*検索ベース*と同様に、ユーザーアカウントが所属するセキュリティグループを検索するために使用されます。
- **LDAPグループ検索フィルター**は、ユーザーアカウントがメンバーであるセキュリティグループを特定するために使用されるLDAPクエリーを指定します。フィルタは、グループ検索ベースから提供される検索結果に適用されます。
- **LDAP Group Name Attribute（LDAPグループ名属性）***は、ユーザーアカウントがメンバーであるセキュリティグループの名前を提供する属性を指定します。
- LDAP グループ/ロール・マッピング
  - **ネストされたグループ検索を無効にする**」は、セキュリティグループのメンバーである場合、セキュリティグループが再帰的に検索されないように指定します。
  - **Group/Name Mapping** は、ユーザーアカウントがメンバーである Security Groups と JS7 ロールのマッピングを指定します。セキュリティグループは、*CN=js7_admins, OU=Operations, O=IT, O=Groups, DC=example, DC=com*のように識別名として、または*js7_admins*のように共通名として、*LDAPグループ検索属性*に応じて指定する必要があります。

## 参考文献

### コンテキストヘルプ

-[Identity Service - Configuration](/identity-service-configuration)
-[Identity Services](/identity-services)

###Product Knowledge Base

-[JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)
  -[JS7 - LDAP Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service)
    -[JS7 - LDAP Identity Service Configuration](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+Identity+Service+Configuration)
    -[JS7 - LDAP over TLS using STARTTLS and LDAP over SSL using LDAPS](https://kb.sos-berlin.com/display/JS7/JS7+-+LDAP+over+TLS+using+STARTTLS+and+LDAP+over+SSL+using+LDAPS)

