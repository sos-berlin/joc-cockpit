# 設定 - Identity Servie

以下の設定は、すべての[Identity Services](/identity-services) に適用されます。変更は直ちに有効になります。

設定ページには、メニューバーのホイールアイコンからアクセスできます。

## Identity Service設定

### 設定： *idle_session_timeout*, Default： *30*m

JOCコックピットのアイドルセッションタイムアウト時間を分単位で指定します。

- 指定された時間の間ユーザーがアクティブでない場合、ユーザーセッションは失効して終了します。ユーザーは資格情報を指定してログインし直し、新しいユーザーセッションを作成できます。
- 外部のIdentity Serviceから提供されたアクセストークンの有効期限がアイドルセッションタイムアウトと異なる場合、JOCコックピットはIdentity Serviceとアクセストークンの更新を試みます。アクセストークンの更新では、ユーザはログイン認証情報を再入力する必要はありません。
- Identity Serviceは、アクセストークンの有効期間を制限したり、アクセストークンの更新を制限したりできます（最大有効期間）。アクセストークンを更新できない場合、ユーザーセッションは終了し、ユーザーはログインをし直す必要があります。

### 設定： *initial_password*, Default： *initial*

新しいアカウントを作成するとき、または[JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service) でパスワードをリセットするときに使用される初期パスワードを指定します。

- 管理者がJOCコックピットでユーザーアカウントを追加し、パスワードを指定しない場合、初期パスワードが使用されます。原則として、JOCコックピットは空のパスワードの使用を許可せず、*initial_password*から入力します。管理者は初期パスワードを適用することができ、指定されたアカウントの個別のパスワードを指定することができます。
- ユーザーアカウントのパスワードをリセットする場合、既存のパスワードは *initial_password* に置き換えられます。
- ユーザーアカウントに*initial_password*または個別のパスワードが割り当てられている場合 とは別に、パスワードは初回ログイン時にユーザーによって変更されなければなりません。これにより、ユーザーは初回ログイン時以降は初期パスワードを使用できなくなります。

### 設定：*minimum_password_length*, Default： *1*

Identity Serviceのパスワードの最小長を指定します。

指定されたすべてのパスワード（*initial_password* を含む）について、最小の長さが示されます。
文字数と文字選択の任意性は、安全なパスワードの重要な要素であることに注意してください。使用する数字や特殊文字などを必要とするパスワードの複雑さは、短いパスワードの場合を除き、パスワードのセキュリティを実質的に高めるものではありません。

## 参照

### コンテキストヘルプ

- [Identity Services](/identity-services)
- [設定](/settings)

###Product Knowledge Base

- [JS7 - JOC Identity Service](https://kb.sos-berlin.com/display/JS7/JS7+-+JOC+Identity+Service)
- [JS7 - Log Notification Service](https://kb.sos-berlin.com/display/JS7/JS7+-+Log+Notification+Service)
- [JS7 - Settings](https://kb.sos-berlin.com/display/JS7/JS7+-+Settings)

