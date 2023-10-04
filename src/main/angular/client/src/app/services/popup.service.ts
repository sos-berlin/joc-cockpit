import {
  ApplicationRef,
  EmbeddedViewRef,
  Injectable,
  Type, ViewContainerRef,
} from '@angular/core';

import {InjectionToken} from '@angular/core';
import {LogViewComponent} from "../components/log-view/log-view.component";

export interface PopoutData {
  modalName: string;
  controllerId: string;
  historyId?: any;
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
export class PopupService {
  styleSheetElement: any;

  constructor(
    private applicationRef: ApplicationRef,
  ) {
  }

  ngOnDestroy() {
  }

  openPopoutModal(data: any, properties: any, viewContainerRef?: ViewContainerRef) {

    const windowInstance = this.openOnce(
      'assets/log.html',
      properties
    );

    this.checkAndCall(data, windowInstance, viewContainerRef);
  }

  private checkAndCall(data: any, windowInstance: any, viewContainerRef: any) {
    // Wait for window instance to be created
    setTimeout(() => {
      if (this.isPopupInitialized(windowInstance)) {
        this.createCDKPortal(data, windowInstance, LogViewComponent, viewContainerRef);
      } else {
        this.checkAndCall(data, windowInstance, viewContainerRef);
      }
    }, 400);
  }

  // Check if the popup window is initialized
  private isPopupInitialized(popupWindow: any) {
    return popupWindow !== null && popupWindow.document && popupWindow.document.body && popupWindow.document.body.getAttribute('id');
  }

  openOnce(url: string, options?: string) {
    // Open a blank "target" window
    // or get the reference to the existing "target" window
    const winRef: any = window.open('', '', options);
    // If the "target" window was just opened, change its url
    if (winRef?.location.href === 'about:blank') {
      winRef.location.href = url;
    }
    return winRef;
  }

  createCDKPortal(data: any, windowInstance: any, component: Type<any>, viewContainerRef: ViewContainerRef) {
    if (windowInstance) {
      const componentRef = viewContainerRef.createComponent(component);

      // Copy stylesheet link from parent window
    //  this.styleSheetElement = this.getStyleSheetElement();
     // windowInstance.document.head?.appendChild(this.styleSheetElement);

      // Clear popout modal content
      if (windowInstance.document.body) {
       windowInstance.document.body.appendChild((componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement);
      }
      POPOUT_MODALS['windowInstance'] = windowInstance;
      POPOUT_MODALS['data'] = data;
      POPOUT_MODALS['componentRef'] = componentRef;
    }
  }

  isPopoutWindowOpen() {
    return (
      POPOUT_MODALS['windowInstance'] && !POPOUT_MODALS['windowInstance'].closed
    );
  }

  focusPopoutWindow(): void {
    POPOUT_MODALS['windowInstance'].focus();
  }

  closePopoutModal(): void {
    if (POPOUT_MODALS['windowInstance']) {
      POPOUT_MODALS['windowInstance'].close();
    }
    this.detachView();
  }

  detachView(): void {
    if (POPOUT_MODALS['componentRef']) {
      this.applicationRef.detachView(POPOUT_MODALS['componentRef'].hostView);
      POPOUT_MODALS['componentRef'].destroy();
    }
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
