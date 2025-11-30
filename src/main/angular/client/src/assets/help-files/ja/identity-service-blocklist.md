# アイデンティティ・サービス・ブロックリスト

認証と承認による JOC コックピットへのアクセスは、[Identity Services](/identity-services) を参照してください。

管理ユーザーアカウントは、任意の ID サービスのアカウントをブロックリストに追加できます：

- ブロックされたアカウントは JOC Cockpit へのアクセスが拒否され、LDAP、OIDC などの ID サービスプロバイダではブロックされません。
- ブロックされたアカウントは、リストから削除されるまでブロックリストに残ります。

## ブロックリストへのアカウントの追加

ブロックリスト*サブビューでは、ビューの右上隅にある関連ボタンからブロックリストにアカウントを追加できます。

ユーザーアカウントは以下のサブビューからブロックリストに追加できます：

-[Audit Log - Failed Logins](/identity-service-faíled-logins) 頻繁にログインに失敗するアカウントが確認された場合、これは攻撃を示している可能性があります。このようなアカウントはブロックリストに追加できます。
-[Identity Service - Active Sessions](/identity-service-active-sessions) アクティブなセッションのアカウントが不要であることが確認された場合、ブロックリストに追加できます。

どちらのサブビューも、ブロックリストに単一のアカウントを追加したり、一括操作から選択したアカウントを追加したりできます。

### ブロックリストからのアカウントの削除

ブロックリスト]サブビューでは、表示されているアカウントごとに[ブロックリストから削除]というアクションメニュー項目があります。

サブビューの右上隅にある*Remove from Blocklist*ボタンを使用すると、選択したアカウントの一括操作が可能です。

##参照

### コンテキストヘルプ

-[Audit Log - Failed Logins](/identity-service-faíled-logins)
-[Identity Service - Active Sessions](/identity-service-active-sessions)
-[Identity Services](/identity-services)

###Product Knowledge Base

-[JS7 - Identity Services](https://kb.sos-berlin.com/display/JS7/JS7+-+Identity+Services)

