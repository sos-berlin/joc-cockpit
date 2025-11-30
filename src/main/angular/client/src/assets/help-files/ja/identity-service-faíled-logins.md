# ログイン失敗

Identity Services は、認証と承認によって JOC Cockpit へのアクセスをルール化します。[Identity Services](/identity-services) を参照してください。

ログインに失敗したユーザーアカウントは、[*失敗したログイン*] サブビューに記録されます。

- 失敗したログイン」のリストには、失敗してトリガされた ID サービスのエントリが含まれます。オプションの Identity Services が複数使用されている場合、Identity Services の 1 つが正常にトリガされると、ログインは成功したと見なされます。この場合、「ログイン失敗」は報告されません。
- JOC Cockpit は、レスポンスタイムの分析を防止し、ブルートフォース攻撃を防止するために、何度もログインに失敗した場合の遅延を実装しています。
- 多くの ID プロバイダ（たとえば、Active Directory アクセスに使用される LDAP など）は、繰り返し失敗するログイン試行を受け入れず、関連するユーザアカウントをブロックする可能性があることに注意してください。

ログイン失敗の履歴データは、[Cleanup Service](/service-cleanup) によって削除される可能性があることに注意してください。

## 失敗したログインに関する操作

失敗したログインに対する操作は以下の通りです：

- **ブロックリストに追加** 関連するアカウントを[Identity Service - Blocklist](/identity-service-blocklist) 。この操作はアカウントが指定されている場合に有効です。アカウントなしで実行されたログインでは、**none*プレースホルダが表示されます。

## 参照

### コンテキストヘルプ

-[Cleanup Service](/service-cleanup)
-[Identity Service - Blocklist](/identity-service-blocklist)
-[Identity Services](/identity-services)

###Product Knowledge Base

-[JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)

