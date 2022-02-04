/* tslint:disable:no-unused-variable */
import { CoreService } from "./core.service";
import {TestBed} from "@angular/core/testing";
import {HttpClient} from "@angular/common/http";
import {AuthService} from "../components/guard";
import {Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {ClipboardService} from "ngx-clipboard";
import {TranslateService} from "@ngx-translate/core";


describe("CoreService", () => {
  let service: CoreService;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [HttpClient, AuthService, Router, ToastrService, ClipboardService, TranslateService] });
  });

  it("#getProtocols should return nine protocols", () => {
    const protocols = service.getProtocols();
    expect(protocols.length).toBeGreaterThanOrEqual(9);
  });

});
