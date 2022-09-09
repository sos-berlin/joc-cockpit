import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AuthModule, LogLevel, StsConfigHttpLoader, StsConfigLoader } from 'angular-auth-oidc-client';
import { catchError, map } from 'rxjs';


export const configLoaderFactory = (httpClient: HttpClient) => {
    const config$ = httpClient.post<any>(`iam/identityproviders`, {}).pipe(
        map((res: any) => {
            console.log(res.identityServiceItems);
            if (res.identityServiceItems.length === 0) {
                return [];
            }
            //  let arr = <any>[];
            for (let i in res.identityServiceItems) {
                return {
                    authority: res.identityServiceItems[i].iamOidcdUrl,
                    clientId: res.identityServiceItems[i].iamOidcClientId,
                    redirectUrl: window.location.origin,
                    postLogoutRedirectUri: window.location.origin,
                    scope: 'openid profile email',
                    postLoginRoute: '/',
                    logLevel: LogLevel.Debug,
                    historyCleanupOff: true,
                    responseType: 'id_token token',
                    silentRenew: true,
                    silentRenewUrl: window.location.origin,
                    useRefreshToken: true,
                };
            }
            // return arr;
        }),
        catchError((err) => {
            console.log(err);
            return [];
        })
    );

    console.log('>>>>', config$)
    return new StsConfigHttpLoader([config$]);
};



@NgModule({
    imports: [
        AuthModule.forRoot({
            loader: {
                provide: StsConfigLoader,
                useFactory: configLoaderFactory,
                deps: [HttpClient],
            }
        }),
    ],
    exports: [AuthModule],
})
export class AuthConfigModule { }
