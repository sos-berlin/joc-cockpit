import {
  ComponentPortal,
  DomPortalOutlet,
  PortalInjector,
} from '@angular/cdk/portal';
import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  Injectable,
  Injector,
  OnDestroy,
} from '@angular/core';

import {InjectionToken} from '@angular/core';
import {LogViewComponent} from "../components/log-view/log-view.component";

export interface PopoutData {
  modalName: string;
  controllerId: string;
  historyId?: number;
  orderId?: string;
  workflow?: string;
  taskId?: number;
  job?: string;
}

export const POPOUT_MODAL_DATA = new InjectionToken<PopoutData>('POPOUT_MODAL_DATA');

export let POPOUT_MODALS: any = {};

@Injectable({
  providedIn: 'root'
})
export class PopupService implements OnDestroy {
  styleSheetElement: any;

  constructor(
    private injector: Injector,
    private componentFactoryResolver: ComponentFactoryResolver,
    private applicationRef: ApplicationRef
  ) {
  }

  ngOnDestroy() {
  }

  openPopoutModal(data: any, properties: any) {
    const windowInstance = this.openOnce(
      'assets/log.html',
      properties
    );

    this.checkAndCall(data, windowInstance);
  }

  private checkAndCall(data: any, windowInstance:any){
    // Wait for window instance to be created
    setTimeout(() => {
      if(this.isPopupInitialized(windowInstance)) {
        this.createCDKPortal(data, windowInstance);
      } else{
        this.checkAndCall(data, windowInstance);
      }
    }, 400);
  }

  // Check if the popup window is initialized
  private isPopupInitialized(popupWindow:any) {
    return popupWindow !== null && popupWindow.document && popupWindow.document.body && popupWindow.document.body.getAttribute('id');
  }

  openOnce(url:string, options?:string) {
    // Open a blank "target" window
    // or get the reference to the existing "target" window
    const winRef:any = window.open('', '', options);
    // If the "target" window was just opened, change its url
    if (winRef.location.href === 'about:blank') {
      winRef.location.href = url;
    }
    return winRef;
  }

  createCDKPortal(data:any, windowInstance:any) {
    if (windowInstance) {
      // Create a PortalOutlet with the body of the new window document
      const outlet = new DomPortalOutlet(
        windowInstance.document.body,
        this.componentFactoryResolver,
        this.applicationRef,
        this.injector
      );

      // Copy stylesheet link from parent window
      this.styleSheetElement = this.getStyleSheetElement();
      windowInstance.document.head?.appendChild(this.styleSheetElement);

      // Clear popout modal content
      if (windowInstance.document.body) {
        windowInstance.document.body.innerText = '';
      }
      POPOUT_MODALS['windowInstance'] = windowInstance;
      // Create an injector with modal data
      const injector = this.createInjector(data);
      // Attach the portal
      let componentInstance = this.attachLogContainer(outlet, injector);

      POPOUT_MODALS['outlet'] = outlet;
      POPOUT_MODALS['componentInstance'] = componentInstance;
    }
  }

  isPopoutWindowOpen() {
    return (
      POPOUT_MODALS['windowInstance'] && !POPOUT_MODALS['windowInstance'].closed
    );
  }

  focusPopoutWindow() {
    POPOUT_MODALS['windowInstance'].focus();
  }

  closePopoutModal() {
    if (POPOUT_MODALS['windowInstance']) {
      POPOUT_MODALS['windowInstance'].close();
    }
  }

  attachLogContainer(outlet:any, injector:any) {
    const containerPortal = new ComponentPortal(
      LogViewComponent,
      null,
      injector
    );
    const containerRef: ComponentRef<LogViewComponent> =
      outlet.attach(containerPortal);
    return containerRef.instance;
  }

  createInjector(data:any): PortalInjector {
    const injectionTokens = new WeakMap();
    injectionTokens.set(POPOUT_MODAL_DATA, data);
    return new PortalInjector(this.injector, injectionTokens);
  }

  getStyleSheetElement() {
    const styleSheetElement = document.createElement('link');
    document.querySelectorAll('link').forEach((htmlElement) => {
      if (htmlElement.rel === 'stylesheet') {
        const absoluteUrl = new URL(htmlElement.href).href;
        styleSheetElement.rel = 'stylesheet';
        styleSheetElement.href = absoluteUrl;
      }
    });
    return styleSheetElement;
  }

}
