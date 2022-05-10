import {Injectable} from '@angular/core';
import {isEmpty, isArray, clone, isNaN} from 'underscore';
import {TranslateService} from '@ngx-translate/core';
import {CoreService} from './core.service';
import {StringDatePipe} from '../pipes/core.pipe';

declare const mxHierarchicalLayout: any;
declare const mxTooltipHandler: any;
declare const mxUtils: any;
declare const mxGraph: any;
declare const mxImage: any;
declare const mxConstants: any;
declare const saveSvgAsPng: any;
declare const $: any;

@Injectable()
export class WorkflowService {
  preferences: any = {};
  theme: string;
  private jobPath = '';

  constructor(public translate: TranslateService, public coreService: CoreService,
              private stringDatePipe: StringDatePipe) {
    mxHierarchicalLayout.prototype.interRankCellSpacing = 45;
    mxTooltipHandler.prototype.delay = 0;
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences);
    }
  }

  /**
   * Reformat the layout
   */
  static executeLayout(graph: any): void {
    const layout = new mxHierarchicalLayout(graph);
    layout.execute(graph.getDefaultParent());
  }

  static svgToImageURL(svgString): any {
    const base64Data = window.btoa(svgString);
    return 'data:image/svg+xml;base64,' + base64Data;
  }

  static setStyleToSymbol(name, colorCode, theme, graph = null): any {
    let svg;
    let color = '#333333';
    let color2 = '#ffffff';
    if (theme === 'dark') {
      color = '#ffffff';
      color2 = '#333333';
    }
    if (name === 'fork') {
      let path = '<path d="M32.54,30.5 L32,30.5 C29.63,30.5 28.46,29.36 26.99,27.92 C26.33,27.29 25.64,26.6 24.83,26.03 C25.73,25.43 26.45,24.71 27.11,24.05 C28.55,22.64 29.69,21.5 32,21.5 L32.54,21.5 L32.54,23.15 L38,20 L32.54,16.85 L32.54,18.5 L32,18.5 C28.46,18.5 26.63,20.3 25.01,21.92 C23.54,23.36 22.37,24.5 20,24.5 L19.61,24.5 L14.15,24.5 L14.15,27.5 L19.61,27.5 L20,27.5 C22.31,27.5 23.45,28.64 24.89,30.05 C26.45,31.58 28.4,33.5 32,33.5 L32.54,33.5 L32.54,35.15 L38,32 L32.54,28.85 L32.54,30.5 Z" id="Shape" fill="#fafafa" fill-rule="nonzero"></path>';
      if (theme !== 'dark') {
        path = '<path d="M32.54,30.5 L32,30.5 C29.63,30.5 28.46,29.36 26.99,27.92 C26.33,27.29 25.64,26.6 24.83,26.03 C25.73,25.43 26.45,24.71 27.11,24.05 C28.55,22.64 29.69,21.5 32,21.5 L32.54,21.5 L32.54,23.15 L38,20 L32.54,16.85 L32.54,18.5 L32,18.5 C28.46,18.5 26.63,20.3 25.01,21.92 C23.54,23.36 22.37,24.5 20,24.5 L19.61,24.5 L14.15,24.5 L14.15,27.5 L19.61,27.5 L20,27.5 C22.31,27.5 23.45,28.64 24.89,30.05 C26.45,31.58 28.4,33.5 32,33.5 L32.54,33.5 L32.54,35.15 L38,32 L32.54,28.85 L32.54,30.5 Z" id="Shape" fill="#50514f" fill-rule="nonzero"></path>';
      }
      const fillColor = colorCode || '#FFEE73';
      svg = '<svg width="48px" height="48px" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="grad2" y1="100%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:' + fillColor + ';stop-opacity:1" /><stop offset="100%" style="stop-color:' + color2 + ';stop-opacity:1" /></linearGradient></defs><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="noun_fork_60030" transform="translate(24.000000, 24.000000) rotate(90.000000) translate(-24.000000, -24.000000) translate(-2.000000, -2.000000)"><rect id="Rectangle-33" stroke="' + fillColor + '" fill="url(#grad2)" transform="translate(25.955844, 26.044156) rotate(45.000000) translate(-25.955844, -26.044156) " x="8.45584412" y="8.54415588" width="35" height="35" rx="4"></rect>' + path + '</g></g></svg>';
    } else if (name === 'join') {
      let path = ' <g id="noun_fork_60030-copy" transform="translate(24.000000, 24.000000) rotate(270.000000) translate(-24.000000, -24.000000) translate(12.000000, 12.000000)" fill="#fafafa" fill-rule="nonzero"><path d="M23.79,16.5 L23.25,16.5 C20.88,16.5 19.71,15.36 18.24,13.92 C17.58,13.29 16.89,12.6 16.08,12.03 C16.98,11.43 17.7,10.71 18.36,10.05 C19.8,8.64 20.94,7.5 23.25,7.5 L23.79,7.5 L23.79,4.5 L23.25,4.5 C19.71,4.5 17.88,6.3 16.26,7.92 C14.79,9.36 13.62,10.5 11.25,10.5 L10.86,10.5 L5.4,10.5 L5.4,13.5 L10.86,13.5 L11.25,13.5 C13.56,13.5 14.7,14.64 16.14,16.05 C17.7,17.58 19.65,19.5 23.25,19.5 L23.79,19.5 L23.79,16.5 Z" id="Shape"></path><polygon id="Shape" transform="translate(4.140452, 11.310751) rotate(-60.000000) translate(-4.140452, -11.310751) " points="1.41045183 12.8107506 1.41045183 14.4607506 6.87045183 11.3107506 1.41045183 8.16075065 1.41045183 9.81075065"></polygon></g>';
      if (theme !== 'dark') {
        path = '<g id="noun_fork_60030-copy" transform="translate(24.000000, 24.000000) rotate(270.000000) translate(-24.000000, -24.000000) translate(12.000000, 12.000000)" fill="#50514f" fill-rule="nonzero"><path d="M23.79,16.5 L23.25,16.5 C20.88,16.5 19.71,15.36 18.24,13.92 C17.58,13.29 16.89,12.6 16.08,12.03 C16.98,11.43 17.7,10.71 18.36,10.05 C19.8,8.64 20.94,7.5 23.25,7.5 L23.79,7.5 L23.79,4.5 L23.25,4.5 C19.71,4.5 17.88,6.3 16.26,7.92 C14.79,9.36 13.62,10.5 11.25,10.5 L10.86,10.5 L5.4,10.5 L5.4,13.5 L10.86,13.5 L11.25,13.5 C13.56,13.5 14.7,14.64 16.14,16.05 C17.7,17.58 19.65,19.5 23.25,19.5 L23.79,19.5 L23.79,16.5 Z" id="Shape"></path><polygon id="Shape" transform="translate(4.140452, 11.310751) rotate(-60.000000) translate(-4.140452, -11.310751) " points="1.41045183 12.8107506 1.41045183 14.4607506 6.87045183 11.3107506 1.41045183 8.16075065 1.41045183 9.81075065"></polygon></g>';
      }
      const fillColor = colorCode || '#FFEE73';
      svg = '<svg width="48px" height="48px" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" ><defs><linearGradient id="grad2"  y1="100%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:' + fillColor + ';stop-opacity:1" /><stop offset="100%" style="stop-color:' + color2 + ';stop-opacity:1" /></linearGradient></defs><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="icon-merge"><g id="noun_fork_60030" transform="translate(24.000000, 24.000000) rotate(90.000000) translate(-24.000000, -24.000000) translate(-2.000000, -2.000000)" fill="url(#grad2)" stroke="' + fillColor + '"><rect id="Rectangle-33" transform="translate(25.955844, 26.044156) rotate(45.000000) translate(-25.955844, -26.044156) " x="8.45584412" y="8.54415588" width="35" height="35" rx="4"></rect></g>' + path + '</g></g></svg>';
    } else if (name === 'forkList') {
      const fillColor = colorCode || '#97B0FF';
      svg = '<svg width="52px" height="52px" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient x1="0%" y1="100%" x2="100%" y2="0%" id="linearGradient-1"><stop stop-color="' + fillColor + '" offset="0%"></stop><stop stop-color="' + color2 + '" offset="100%"></stop></linearGradient></defs><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="fork" transform="translate(1.000000, 1.000000)" fill-rule="nonzero"><g id="noun_fork_60030" transform="translate(24.748737, 24.748737) rotate(90.000000) translate(-24.748737, -24.748737) "><rect id="Rectangle-33" stroke="' + fillColor + '" fill="url(#linearGradient-1)" transform="translate(24.748737, 24.748737) rotate(45.000000) translate(-24.748737, -24.748737) " x="7.24873734" y="7.24873734" width="35" height="35" rx="4"></rect><g id="noun_fork_60030-copy-2" transform="translate(13.000000, 12.497475)" fill="' + color + '"><path d="M18.54,2.85 L24,6 L18.54,9.15 L18.54,7.5 L18,7.5 C15.69,7.5 14.55,8.64 13.11,10.05 C12.45,10.71 11.73,11.43 10.83,12.03 C11.64,12.6 12.33,13.29 12.99,13.92 C14.39875,15.3 15.5319792,16.4044792 17.7098915,16.4941233 L18,16.5 L18.54,16.5 L18.54,14.85 L24,18 L18.54,21.15 L18.54,19.5 L18,19.5 C14.4,19.5 12.45,17.58 10.89,16.05 C10.0856923,15.2624487 9.37497704,14.5591306 8.50170293,14.0916454 L8.50081732,9.93957451 C9.4262588,9.4694162 10.1690375,8.7438 11.01,7.92 C12.576,6.354 14.3382333,4.6198 17.6516444,4.50592667 L18,4.5 L18.54,4.5 L18.54,2.85 Z M6.75,4 C7.16421356,4 7.5,4.33578644 7.5,4.75 L7.5,19.25 C7.5,19.6642136 7.16421356,20 6.75,20 C6.33578644,20 6,19.6642136 6,19.25 L6,4.75 C6,4.33578644 6.33578644,4 6.75,4 Z M3.75,4 C4.16421356,4 4.5,4.33578644 4.5,4.75 L4.5,19.25 C4.5,19.6642136 4.16421356,20 3.75,20 C3.33578644,20 3,19.6642136 3,19.25 L3,4.75 C3,4.33578644 3.33578644,4 3.75,4 Z M0.75,4 C1.16421356,4 1.5,4.33578644 1.5,4.75 L1.5,19.25 C1.5,19.6642136 1.16421356,20 0.75,20 C0.335786438,20 -3.47438424e-16,19.6642136 -3.98164955e-16,19.25 L4.89703974e-16,4.75 C4.38977443e-16,4.33578644 0.335786438,4 0.75,4 Z" id="Combined-Shape"></path></g></g></g></g></svg>';
    } else if (name === 'closeForkList') {
      const fillColor = colorCode || '#97B0FF';
      svg = '<svg width="52px" height="52px" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient x1="0%" y1="100%" x2="100%" y2="0%" id="linearGradient-1"><stop stop-color="' + fillColor + '" offset="0%"></stop><stop stop-color="' + color2 + '" offset="100%"></stop></linearGradient></defs><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(1.000000, 1.000000)"><g id="noun_fork_60030" transform="translate(24.748737, 24.748737) rotate(90.000000) translate(-24.748737, -24.748737) " fill="url(#linearGradient-1)" fill-rule="nonzero" stroke="' + fillColor + '"><rect id="Rectangle-33" transform="translate(24.748737, 24.748737) rotate(45.000000) translate(-24.748737, -24.748737) " x="7.24873734" y="7.24873734" width="35" height="35" rx="4"></rect></g><g id="noun_fork_60030-copy-2" transform="translate(25.000000, 25.000000) scale(1, -1) rotate(90.000000) translate(-25.000000, -25.000000) translate(13.000000, 13.000000)" fill="' + color + '"><path d="M23.79,4.5 L23.79,7.5 L23.25,7.5 C20.94,7.5 19.8,8.64 18.36,10.05 C17.7,10.71 16.98,11.43 16.08,12.03 C16.89,12.6 17.58,13.29 18.24,13.92 C19.71,15.36 20.88,16.5 23.25,16.5 L23.25,16.5 L23.79,16.5 L23.79,19.5 L23.25,19.5 C19.65,19.5 17.7,17.58 16.14,16.05 C15.5766667,15.4984028 15.0592454,14.9881264 14.4997275,14.5712579 L14.4995262,9.48221771 C15.1048583,9.05053792 15.6572063,8.5104918 16.26,7.92 C17.88,6.3 19.71,4.5 23.25,4.5 L23.25,4.5 L23.79,4.5 Z M5.999,13.5 L5.4,13.5 L5.4,10.5 L5.999,10.5 L5.999,13.5 Z" id="Combined-Shape" fill-rule="nonzero"></path><path d="M17.5,14.25 C17.9142136,14.25 18.25,14.5857864 18.25,15 C18.25,15.4142136 17.9142136,15.75 17.5,15.75 L3,15.75 C2.58578644,15.75 2.25,15.4142136 2.25,15 C2.25,14.5857864 2.58578644,14.25 3,14.25 L17.5,14.25 Z M17.5,11.25 C17.9142136,11.25 18.25,11.5857864 18.25,12 C18.25,12.4142136 17.9142136,12.75 17.5,12.75 L3,12.75 C2.58578644,12.75 2.25,12.4142136 2.25,12 C2.25,11.5857864 2.58578644,11.25 3,11.25 L17.5,11.25 Z M17.5,8.25 C17.9142136,8.25 18.25,8.58578644 18.25,9 C18.25,9.41421356 17.9142136,9.75 17.5,9.75 L3,9.75 C2.58578644,9.75 2.25,9.41421356 2.25,9 C2.25,8.58578644 2.58578644,8.25 3,8.25 L17.5,8.25 Z" id="Combined-Shape" transform="translate(10.250000, 12.000000) rotate(90.000000) translate(-10.250000, -12.000000) "></path><polygon fill-rule="nonzero" transform="translate(4.140452, 11.310751) rotate(-60.000000) translate(-4.140452, -11.310751) " points="1.41045183 12.8107506 1.41045183 14.4607506 6.87045183 11.3107506 1.41045183 8.16075065 1.41045183 9.81075065"></polygon></g></g></g></svg>';
    } else if (name === 'lock') {
      const fillColor = colorCode || '#d4baff';
      svg = '<svg width="50px" height="50px" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient x1="0%" y1="100%" x2="100%" y2="0%" id="linearGradient-1"><stop stop-color="' + fillColor + '" offset="0%"></stop><stop stop-color="' + color2 + '" offset="100%"></stop></linearGradient></defs><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g fill-rule="nonzero"><g transform="translate(25.000000, 25.000000) rotate(90.000000) translate(-25.000000, -25.000000) "><rect stroke="' + fillColor + '" fill="url(#linearGradient-1)" transform="translate(24.955844, 25.044156) rotate(45.000000) translate(-24.955844, -25.044156) " x="7.45584417" y="7.544156" width="35" height="35" rx="4"></rect><g transform="translate(25.000000, 25.000000) rotate(-90.000000) translate(-25.000000, -25.000000) translate(13.000000, 13.000000)" fill="' + color + '"><path d="M12,1.5 C14.7273287,1.5 17.0094053,3.13098933 17.5864163,5.31512764 C17.08783,5.60061864 16.4844995,5.65550598 15.9379167,5.45512365 C15.4565605,3.98001796 13.8757001,2.9 12,2.9 C9.74065332,2.9 7.90909095,4.46700338 7.90909095,6.4 L7.90909095,6.4 L7.90909095,8.5 L14.9999999,8.499 L15,8.5 L17.7269999,8.561 C19.5642353,8.89080629 20.9019887,10.235545 20.9948437,11.8226924 L21,12 L21,19 C21,20.9329966 19.1684375,22.5 16.9090909,22.5 L16.9090909,22.5 L7.09090914,22.5 C4.83156246,22.5 3,20.9329966 3,19 L3,19 L3,12 C2.99960326,10.3365598 4.36772903,8.90268801 6.27272733,8.57 L6.27272733,8.57 L6.27272733,6.4 C6.27272733,3.69380473 8.83691464,1.5 12,1.5 Z M16.9090909,9.9 L7.09090914,9.9 C5.73530113,9.9 4.63636371,10.840202 4.63636371,12 L4.63636371,12 L4.63636371,19 C4.63636371,20.159798 5.73530113,21.1 7.09090914,21.1 L7.09090914,21.1 L16.9090909,21.1 C18.2646989,21.1 19.3636363,20.159798 19.3636363,19 L19.3636363,19 L19.3636363,12 C19.3636363,10.840202 18.2646989,9.9 16.9090909,9.9 L16.9090909,9.9 Z M12.1789153,12.7026676 C13.0109567,12.7809635 13.6397863,13.3838555 13.6363775,14.1 C13.6334866,14.7011593 13.1823449,15.2336383 12.5154545,15.423 L13.1209091,16.97 C13.2780182,17.3852102 13.1049688,17.8397604 12.6921755,18.096158 C12.2793823,18.3525555 11.7206177,18.3525555 11.3078245,18.096158 C10.8950312,17.8397604 10.7219818,17.3852102 10.8790909,16.97 L11.4845455,15.423 C10.690102,15.1974066 10.2227376,14.4952412 10.4013274,13.7955801 C10.5799172,13.095919 11.3468739,12.6243718 12.1789153,12.7026676 Z" id="Combined-Shape"></path></g></g></g></g></svg>';
    } else if (name === 'closeLock') {
      const fillColor = colorCode || '#d4baff';
      svg = '<svg width="50px" height="50px" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient x1="0%" y1="100%" x2="100%" y2="0%" id="linearGradient-1"><stop stop-color="' + fillColor + '" offset="0%"></stop><stop stop-color="' + color2 + '" offset="100%"></stop></linearGradient></defs><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g fill-rule="nonzero"><g transform="translate(25.000000, 25.000000) rotate(90.000000) translate(-25.000000, -25.000000) "><rect stroke="' + fillColor + '" fill="url(#linearGradient-1)" transform="translate(24.955844, 25.044156) rotate(45.000000) translate(-24.955844, -25.044156) " x="7.45584417" y="7.544156" width="35" height="35" rx="4"></rect><g transform="translate(25.000000, 25.000000) rotate(-90.000000) translate(-25.000000, -25.000000) translate(13.000000, 13.000000)" fill="' + color + '"><path d="M17.7272727,8.57 L17.7272727,6.4 C17.7272727,3.69380473 15.1630854,1.5 12,1.5 C8.83691464,1.5 6.27272733,3.69380473 6.27272733,6.4 L6.27272733,8.57 C4.36772903,8.90268801 2.99960326,10.3365598 3,12 L3,19 C3,20.9329966 4.83156246,22.5 7.09090914,22.5 L16.9090909,22.5 C19.1684375,22.5 21,20.9329966 21,19 L21,12 C21.0003967,10.3365598 19.632271,8.90268801 17.7272727,8.57 Z M7.90909095,6.4 C7.90909095,4.46700338 9.74065332,2.9 12,2.9 C14.2593467,2.9 16.0909091,4.46700338 16.0909091,6.4 L16.0909091,8.5 L7.90909095,8.5 L7.90909095,6.4 Z M19.3636363,19 C19.3636363,20.159798 18.2646989,21.1 16.9090909,21.1 L7.09090914,21.1 C5.73530113,21.1 4.63636371,20.159798 4.63636371,19 L4.63636371,12 C4.63636371,10.840202 5.73530113,9.9 7.09090914,9.9 L16.9090909,9.9 C18.2646989,9.9 19.3636363,10.840202 19.3636363,12 L19.3636363,19 Z M13.6363775,14.1 C13.6334866,14.7011593 13.1823449,15.2336383 12.5154545,15.423 L13.1209091,16.97 C13.2780182,17.3852102 13.1049688,17.8397604 12.6921755,18.096158 C12.2793823,18.3525555 11.7206177,18.3525555 11.3078245,18.096158 C10.8950312,17.8397604 10.7219818,17.3852102 10.8790909,16.97 L11.4845455,15.423 C10.690102,15.1974066 10.2227376,14.4952412 10.4013274,13.7955801 C10.5799172,13.095919 11.3468739,12.6243718 12.1789153,12.7026676 C13.0109567,12.7809635 13.6397863,13.3838555 13.6363775,14.1 Z" id="Shape"></path></g></g></g></g></svg>';
    } else if (name === 'addOrder') {
      const fillColor = colorCode || '#ffb481';
      svg = '<svg width="52px" height="52px" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient x1="0%" y1="100%" x2="100%" y2="0%" id="linearGradient-1"><stop stop-color="' + fillColor + '" offset="0%"></stop><stop stop-color="' + color2 + '" offset="100%"></stop></linearGradient></defs><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(1.000000, 1.000000)"><g id="noun_fork_60030" transform="translate(24.748737, 24.748737) rotate(90.000000) translate(-24.748737, -24.748737) " fill="url(#linearGradient-1)" fill-rule="nonzero" stroke="' + fillColor + '"><rect id="Rectangle-33" transform="translate(24.748737, 24.748737) rotate(45.000000) translate(-24.748737, -24.748737) " x="7.24873734" y="7.24873734" width="35" height="35" rx="4"></rect></g><g id="noun_Add-Receipt_783557" transform="translate(13.000000, 14.000000)" fill="' + color + '"><path d="M15.9560181,14.9122362 L12.4359743,14.9122362 L12.4359743,13.6516532 L15.9560181,13.6516532 L15.9560181,10.0879853 L17.2011698,10.0879853 L17.2011698,13.6516532 L20.7212136,13.6516532 L20.7212136,14.9122362 L17.2011698,14.9122362 L17.2011698,18.4759041 L15.9560181,18.4759041 L15.9560181,14.9122362 Z M4.5,9.26058293 L15.5,9.26058293 L15.5,8 L4.5,8 L4.5,9.26058293 Z M4.5,6.26058293 L17.2,6.26058293 L17.2,5 L4.5,5 L4.5,6.26058293 Z M4.5,12.2605829 L13.7085193,12.2605829 L13.7085193,11 L4.5,11 L4.5,12.2605829 Z M4.5,14.9105829 L10.9959564,14.9105829 L10.9959564,13.65 L4.5,13.65 L4.5,14.9105829 Z" id="Shape"></path></g></g></g></svg>';
    } else if (name === 'expectNotice') {
      svg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><rect width="16.8" height="16.8" x="4" y="4" fill="none" fill-rule="nonzero" stroke="' + (colorCode || color) + '" stroke-width=".5" rx="1.92" transform="rotate(45 12.4 12.4)"/><g stroke="' + (colorCode || color) + '" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.212" transform="translate(8 8)"><polyline points="4.762 4.762 7.619 7.619 4.762 10.476"/><path d="M5.71428571,4.26325641e-14 L3.80952381,4.26325641e-14 C1.70571429,4.26325641e-14 -3.3158661e-14,1.70571429 -3.3158661e-14,3.80952381 L-3.3158661e-14,3.80952381 C-3.3158661e-14,5.91333333 1.70571429,7.61904762 3.80952381,7.61904762 L7.61904762,7.61904762"/></g></g></svg>';
    } else if (name === 'postNotice') {
      svg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><rect width="16.8" height="16.8" x="4" y="4" stroke="' + (colorCode || color) + '" stroke-width=".5" rx="1.92" transform="rotate(45 12.4 12.4)"/><g stroke="' + (colorCode || color) + '" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.212" transform="matrix(1 0 0 -1 8 17)"><polyline points="4.762 4.762 7.619 7.619 4.762 10.476"/><path d="M5.71428571,4.26325641e-14 L3.80952381,4.26325641e-14 C1.70571429,4.26325641e-14 -3.3158661e-14,1.70571429 -3.3158661e-14,3.80952381 L-3.3158661e-14,3.80952381 C-3.3158661e-14,5.91333333 1.70571429,7.61904762 3.80952381,7.61904762 L7.61904762,7.61904762"/></g></g></svg>';
    } else if (name === 'finish') {
      svg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><rect width="16.8" height="16.8" x="4" y="4" stroke="' + (colorCode || color) + '" stroke-width=".5" rx="1.92" transform="rotate(45 12.4 12.4)"/><polygon fill="' + (colorCode || color) + '" fill-rule="nonzero" stroke="' + color2 + '" stroke-width=".4" points="8.571 0 9.857 1.286 3.866 7.286 0 3.429 1.286 2.143 3.866 4.714" transform="translate(7 9)"/></g></svg>';
    } else if (name === 'fail') {
      svg = '<svg width="48px" height="48px" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g ><g transform="translate(24.000000, 24.000000) rotate(90.000000) translate(-24.000000, -24.000000) translate(-2.000000, -2.000000)" stroke="' + (colorCode || color) + '"><rect id="Rectangle-33" transform="translate(25.955844, 26.044156) rotate(45.000000) translate(-25.955844, -26.044156) " x="8.45584412" y="8.54415588" width="35" height="35" rx="4"></rect></g><path d="M24.88275,23.82175 L31.42375,17.28075 C31.71675,16.98775 31.71675,16.51275 31.42375,16.21975 C31.13075,15.92675 30.65575,15.92675 30.36275,16.21975 L23.82175,22.76075 L17.28075,16.22075 C16.98775,15.92775 16.51275,15.92775 16.21975,16.22075 C15.92675,16.51375 15.92675,16.98875 16.21975,17.28175 L22.76075,23.82275 L16.22075,30.36275 C15.92775,30.65575 15.92775,31.13075 16.22075,31.42375 C16.36775,31.56975 16.55875,31.64375 16.75075,31.64375 C16.94275,31.64375 17.13475,31.57075 17.28075,31.42375 L23.82175,24.88275 L30.36275,31.42375 C30.50975,31.56975 30.70075,31.64375 30.89275,31.64375 C31.08475,31.64375 31.27675,31.57075 31.42275,31.42375 C31.71575,31.13075 31.71575,30.65575 31.42275,30.36275 L24.88275,23.82175 Z" id="Shape" fill="' + (colorCode || color) + '" fill-rule="nonzero"></path></g></g></svg>';
    } else if (name === 'prompt') {
      svg = '<svg width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(0.000000, 0.000000)" stroke="' + (colorCode || color) + '" stroke-width="0.5"><path d="M5.43471863,3.51471863 L18.5652814,3.51471863 C19.6256681,3.51471863 20.4852814,4.37433191 20.4852814,5.43471863 L20.4852814,18.5652814 C20.4852814,19.6256681 19.6256681,20.4852814 18.5652814,20.4852814 L5.43471863,20.4852814 C4.37433191,20.4852814 3.51471863,19.6256681 3.51471863,18.5652814 L3.51471863,5.43471863 C3.51471863,4.37433191 4.37433191,3.51471863 5.43471863,3.51471863 Z" id="Rectangle" transform="translate(12.000000, 12.000000) rotate(45.000000) translate(-12.000000, -12.000000) "></path></g><path d="M12.2944336,14.0712891 C12.2944336,13.5380859 12.3547363,13.1350098 12.4753418,12.8620605 C12.5959473,12.5891113 12.859375,12.2558594 13.265625,11.8623047 C13.8242188,11.320638 14.1955566,10.9101562 14.3796387,10.6308594 C14.5637207,10.3515625 14.6557617,9.98763021 14.6557617,9.5390625 C14.6557617,8.7985026 14.4050293,8.19018555 13.9035645,7.71411133 C13.4020996,7.23803711 12.7345378,7 11.9008789,7 C10.9995117,7 10.2906901,7.27823893 9.77441406,7.8347168 C9.25813802,8.39119466 9,9.12646484 9,10.0405273 L9,10.0405273 L10.1298828,10.0405273 C10.1510417,9.49039714 10.237793,9.06933594 10.3901367,8.77734375 C10.6609701,8.25260417 11.1497396,7.99023438 11.8564453,7.99023438 C12.4277344,7.99023438 12.8371582,8.14257812 13.0847168,8.44726562 C13.3322754,8.75195312 13.4560547,9.11165365 13.4560547,9.52636719 C13.4560547,9.82259115 13.3714193,10.1082357 13.2021484,10.3833008 C13.1090495,10.5398763 12.9863281,10.6901042 12.8339844,10.8339844 L12.8339844,10.8339844 L12.3261719,11.3354492 C11.8395182,11.8136393 11.5242513,12.2378743 11.3803711,12.6081543 C11.2364909,12.9784342 11.1645508,13.4661458 11.1645508,14.0712891 L11.1645508,14.0712891 L12.2944336,14.0712891 Z M12.4023438,16.4453125 L12.4023438,15.125 L11.1391602,15.125 L11.1391602,16.4453125 L12.4023438,16.4453125 Z" id="?" fill="' + (colorCode || color) + '" fill-rule="nonzero"></path></g></svg>';
    }
    const symbol: any = {};
    symbol[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_IMAGE;
    symbol.image = WorkflowService.svgToImageURL(svg);
    symbol.perimeter = 'rectanglePerimeter';
    symbol.labelBackgroundColor = 'transparent';
    symbol.fontSize = '12';
    symbol.align = 'center';
    symbol.verticalAlign = 'top';
    symbol.verticalLabelPosition = 'bottom';
    if (graph) {
      graph.getStylesheet().putCellStyle(name, symbol);
    } else {
      return 'symbol;image=data:image/svg+xml,' + window.btoa(svg);
    }
  }

  static setStyleToVertex(name, colorCode, theme, graph = null): any {
    const vertexStyle: any = {};
    vertexStyle[mxConstants.STYLE_ROUNDED] = true;
    if (name === 'if' || name === 'cycle' || name.match('try')) {
      vertexStyle.shape = 'rhombus';
      vertexStyle.perimeter = 'rhombusPerimeter';
    }

    if (name === 'job') {
      vertexStyle.image = theme === 'dark' ? './assets/mxgraph/images/symbols/job-white.svg' : './assets/mxgraph/images/symbols/job.svg';
      vertexStyle.shape = 'label';
      vertexStyle.strokeColor = colorCode || '#90C7F5';
      vertexStyle.fillColor = colorCode || '#90C7F5';
      vertexStyle.gradientColor = '#fff';
      vertexStyle.imageWidth = '20';
      vertexStyle.imageHeight = '20';
    } else if (name === 'if') {
      vertexStyle.strokeColor = colorCode || '#CDEB8B';
      vertexStyle.fillColor = colorCode || '#CDEB8B';
    } else if (name === 'cycle') {
      vertexStyle.strokeColor = colorCode || '#C2b280';
      vertexStyle.fillColor = colorCode || '#C2b280';
    } else if (name === 'retry') {
      vertexStyle.strokeColor = colorCode || '#FFC7C7';
      vertexStyle.fillColor = colorCode || '#FFC7C7';
    } else if (name === 'try') {
      vertexStyle.strokeColor = colorCode || '#FFCF8A';
      vertexStyle.fillColor = colorCode || '#FFCF8A';
    } else if (name === 'catch') {
      vertexStyle.shape = 'rectangle';
      vertexStyle.perimeter = 'rectanglePerimeter';
      vertexStyle.strokeColor = colorCode || '#FFCF8c';
      vertexStyle.fillColor = colorCode || '#FFCF8c';
    } else if (name === 'dashRectangle') {
      vertexStyle.shape = 'rectangle';
      vertexStyle.perimeter = 'rectanglePerimeter';
      vertexStyle.strokeColor = colorCode || '#FFCF8c';
      vertexStyle.fillColor = colorCode || '#FFCF8c';
      vertexStyle.dashed = '1';
      vertexStyle.shadow = '0';
      vertexStyle.opacity = '70';
    } else {
      vertexStyle[mxConstants.STYLE_ROUNDED] = false;
      vertexStyle.shape = 'rectangle';
      vertexStyle.perimeter = 'rectanglePerimeter';
      vertexStyle.strokeColor = colorCode;
      vertexStyle.fillColor = colorCode;
    }

    if (theme === 'dark') {
      vertexStyle.gradientColor = '#333';
    } else {
      vertexStyle.gradientColor = '#fff';
    }

    if (graph) {
      graph.getStylesheet().putCellStyle(name, vertexStyle);
    } else {
      if (name === 'job') {
        return 'shape=label;whiteSpace=wrap;html=1;rounded=1;fillColor=' + vertexStyle.fillColor + ';strokeColor='
          + vertexStyle.strokeColor + ';gradientColor=' + vertexStyle.gradientColor + ';image=' + vertexStyle.image + ';imageWidth=20;imageHeight=20;';
      } else {
        return 'shape=' + vertexStyle.shape + ';whiteSpace=wrap;html=1;rounded=1;fillColor=' + vertexStyle.fillColor
          + ';strokeColor=' + vertexStyle.strokeColor + ';gradientColor=' + vertexStyle.gradientColor + ';';
      }
    }
  }

  getStyleOfSymbol(name, image): any {
    let svg;
    let color = '#333333';
    if (this.theme === 'dark') {
      color = '#ffffff';
    }
    if (name === 'Fork') {
      let path = '<path d="M32.54,30.5 L32,30.5 C29.63,30.5 28.46,29.36 26.99,27.92 C26.33,27.29 25.64,26.6 24.83,26.03 C25.73,25.43 26.45,24.71 27.11,24.05 C28.55,22.64 29.69,21.5 32,21.5 L32.54,21.5 L32.54,23.15 L38,20 L32.54,16.85 L32.54,18.5 L32,18.5 C28.46,18.5 26.63,20.3 25.01,21.92 C23.54,23.36 22.37,24.5 20,24.5 L19.61,24.5 L14.15,24.5 L14.15,27.5 L19.61,27.5 L20,27.5 C22.31,27.5 23.45,28.64 24.89,30.05 C26.45,31.58 28.4,33.5 32,33.5 L32.54,33.5 L32.54,35.15 L38,32 L32.54,28.85 L32.54,30.5 Z" id="Shape" fill="#fafafa" fill-rule="nonzero"></path>';
      if (this.theme !== 'dark') {
        path = '<path d="M32.54,30.5 L32,30.5 C29.63,30.5 28.46,29.36 26.99,27.92 C26.33,27.29 25.64,26.6 24.83,26.03 C25.73,25.43 26.45,24.71 27.11,24.05 C28.55,22.64 29.69,21.5 32,21.5 L32.54,21.5 L32.54,23.15 L38,20 L32.54,16.85 L32.54,18.5 L32,18.5 C28.46,18.5 26.63,20.3 25.01,21.92 C23.54,23.36 22.37,24.5 20,24.5 L19.61,24.5 L14.15,24.5 L14.15,27.5 L19.61,27.5 L20,27.5 C22.31,27.5 23.45,28.64 24.89,30.05 C26.45,31.58 28.4,33.5 32,33.5 L32.54,33.5 L32.54,35.15 L38,32 L32.54,28.85 L32.54,30.5 Z" id="Shape" fill="#50514f" fill-rule="nonzero"></path>';
      }
      const fillColor = '#FFEE73';
      svg = '<svg width="48px" height="48px" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="grad2" y1="100%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:transparent;stop-opacity:1" /><stop offset="100%" style="stop-color:transparent;stop-opacity:1" /></linearGradient></defs><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="noun_fork_60030" transform="translate(24.000000, 24.000000) rotate(90.000000) translate(-24.000000, -24.000000) translate(-2.000000, -2.000000)"><rect id="Rectangle-33" stroke="' + fillColor + '" fill="url(#grad2)" transform="translate(25.955844, 26.044156) rotate(45.000000) translate(-25.955844, -26.044156) " x="8.45584412" y="8.54415588" width="35" height="35" rx="4"></rect>' + path + '</g></g></svg>';
    } else if (name === 'ForkList') {
      const fillColor = '#97B0FF';
      svg = '<svg width="52px" height="52px" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient x1="0%" y1="100%" x2="100%" y2="0%" id="linearGradient-1"><stop stop-color="transparent" offset="0%"></stop><stop stop-color="transparent" offset="100%"></stop></linearGradient></defs><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="fork" transform="translate(1.000000, 1.000000)" fill-rule="nonzero"><g id="noun_fork_60030" transform="translate(24.748737, 24.748737) rotate(90.000000) translate(-24.748737, -24.748737) "><rect id="Rectangle-33" stroke="' + fillColor + '" fill="url(#linearGradient-1)" transform="translate(24.748737, 24.748737) rotate(45.000000) translate(-24.748737, -24.748737) " x="7.24873734" y="7.24873734" width="35" height="35" rx="4"></rect><g id="noun_fork_60030-copy-2" transform="translate(13.000000, 12.497475)" fill="' + color + '"><path d="M18.54,2.85 L24,6 L18.54,9.15 L18.54,7.5 L18,7.5 C15.69,7.5 14.55,8.64 13.11,10.05 C12.45,10.71 11.73,11.43 10.83,12.03 C11.64,12.6 12.33,13.29 12.99,13.92 C14.39875,15.3 15.5319792,16.4044792 17.7098915,16.4941233 L18,16.5 L18.54,16.5 L18.54,14.85 L24,18 L18.54,21.15 L18.54,19.5 L18,19.5 C14.4,19.5 12.45,17.58 10.89,16.05 C10.0856923,15.2624487 9.37497704,14.5591306 8.50170293,14.0916454 L8.50081732,9.93957451 C9.4262588,9.4694162 10.1690375,8.7438 11.01,7.92 C12.576,6.354 14.3382333,4.6198 17.6516444,4.50592667 L18,4.5 L18.54,4.5 L18.54,2.85 Z M6.75,4 C7.16421356,4 7.5,4.33578644 7.5,4.75 L7.5,19.25 C7.5,19.6642136 7.16421356,20 6.75,20 C6.33578644,20 6,19.6642136 6,19.25 L6,4.75 C6,4.33578644 6.33578644,4 6.75,4 Z M3.75,4 C4.16421356,4 4.5,4.33578644 4.5,4.75 L4.5,19.25 C4.5,19.6642136 4.16421356,20 3.75,20 C3.33578644,20 3,19.6642136 3,19.25 L3,4.75 C3,4.33578644 3.33578644,4 3.75,4 Z M0.75,4 C1.16421356,4 1.5,4.33578644 1.5,4.75 L1.5,19.25 C1.5,19.6642136 1.16421356,20 0.75,20 C0.335786438,20 -3.47438424e-16,19.6642136 -3.98164955e-16,19.25 L4.89703974e-16,4.75 C4.38977443e-16,4.33578644 0.335786438,4 0.75,4 Z" id="Combined-Shape"></path></g></g></g></g></svg>';
    } else if (name === 'lock') {
      const fillColor = '#d4baff';
      svg = '<svg width="50px" height="50px" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient x1="0%" y1="100%" x2="100%" y2="0%" id="linearGradient-1"><stop stop-color="transparent" offset="0%"></stop><stop stop-color="transparent" offset="100%"></stop></linearGradient></defs><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g fill-rule="nonzero"><g transform="translate(25.000000, 25.000000) rotate(90.000000) translate(-25.000000, -25.000000) "><rect stroke="' + fillColor + '" fill="url(#linearGradient-1)" transform="translate(24.955844, 25.044156) rotate(45.000000) translate(-24.955844, -25.044156) " x="7.45584417" y="7.544156" width="35" height="35" rx="4"></rect><g transform="translate(25.000000, 25.000000) rotate(-90.000000) translate(-25.000000, -25.000000) translate(13.000000, 13.000000)" fill="' + color + '"><path d="M12,1.5 C14.7273287,1.5 17.0094053,3.13098933 17.5864163,5.31512764 C17.08783,5.60061864 16.4844995,5.65550598 15.9379167,5.45512365 C15.4565605,3.98001796 13.8757001,2.9 12,2.9 C9.74065332,2.9 7.90909095,4.46700338 7.90909095,6.4 L7.90909095,6.4 L7.90909095,8.5 L14.9999999,8.499 L15,8.5 L17.7269999,8.561 C19.5642353,8.89080629 20.9019887,10.235545 20.9948437,11.8226924 L21,12 L21,19 C21,20.9329966 19.1684375,22.5 16.9090909,22.5 L16.9090909,22.5 L7.09090914,22.5 C4.83156246,22.5 3,20.9329966 3,19 L3,19 L3,12 C2.99960326,10.3365598 4.36772903,8.90268801 6.27272733,8.57 L6.27272733,8.57 L6.27272733,6.4 C6.27272733,3.69380473 8.83691464,1.5 12,1.5 Z M16.9090909,9.9 L7.09090914,9.9 C5.73530113,9.9 4.63636371,10.840202 4.63636371,12 L4.63636371,12 L4.63636371,19 C4.63636371,20.159798 5.73530113,21.1 7.09090914,21.1 L7.09090914,21.1 L16.9090909,21.1 C18.2646989,21.1 19.3636363,20.159798 19.3636363,19 L19.3636363,19 L19.3636363,12 C19.3636363,10.840202 18.2646989,9.9 16.9090909,9.9 L16.9090909,9.9 Z M12.1789153,12.7026676 C13.0109567,12.7809635 13.6397863,13.3838555 13.6363775,14.1 C13.6334866,14.7011593 13.1823449,15.2336383 12.5154545,15.423 L13.1209091,16.97 C13.2780182,17.3852102 13.1049688,17.8397604 12.6921755,18.096158 C12.2793823,18.3525555 11.7206177,18.3525555 11.3078245,18.096158 C10.8950312,17.8397604 10.7219818,17.3852102 10.8790909,16.97 L11.4845455,15.423 C10.690102,15.1974066 10.2227376,14.4952412 10.4013274,13.7955801 C10.5799172,13.095919 11.3468739,12.6243718 12.1789153,12.7026676 Z" id="Combined-Shape"></path></g></g></g></g></svg>';
    } else if (name === 'AddOrder') {
      const fillColor = '#ffb481';
      svg = '<svg width="52px" height="52px" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient x1="0%" y1="100%" x2="100%" y2="0%" id="linearGradient-1"><stop stop-color="transparent" offset="0%"></stop><stop stop-color="transparent" offset="100%"></stop></linearGradient></defs><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(1.000000, 1.000000)"><g id="noun_fork_60030" transform="translate(24.748737, 24.748737) rotate(90.000000) translate(-24.748737, -24.748737) " fill="url(#linearGradient-1)" fill-rule="nonzero" stroke="' + fillColor + '"><rect id="Rectangle-33" transform="translate(24.748737, 24.748737) rotate(45.000000) translate(-24.748737, -24.748737) " x="7.24873734" y="7.24873734" width="35" height="35" rx="4"></rect></g><g id="noun_Add-Receipt_783557" transform="translate(13.000000, 14.000000)" fill="' + color + '"><path d="M15.9560181,14.9122362 L12.4359743,14.9122362 L12.4359743,13.6516532 L15.9560181,13.6516532 L15.9560181,10.0879853 L17.2011698,10.0879853 L17.2011698,13.6516532 L20.7212136,13.6516532 L20.7212136,14.9122362 L17.2011698,14.9122362 L17.2011698,18.4759041 L15.9560181,18.4759041 L15.9560181,14.9122362 Z M4.5,9.26058293 L15.5,9.26058293 L15.5,8 L4.5,8 L4.5,9.26058293 Z M4.5,6.26058293 L17.2,6.26058293 L17.2,5 L4.5,5 L4.5,6.26058293 Z M4.5,12.2605829 L13.7085193,12.2605829 L13.7085193,11 L4.5,11 L4.5,12.2605829 Z M4.5,14.9105829 L10.9959564,14.9105829 L10.9959564,13.65 L4.5,13.65 L4.5,14.9105829 Z" id="Shape"></path></g></g></g></svg>';
    }

    if (!svg) {
      return image;
    } else {
      return WorkflowService.svgToImageURL(svg);
    }
  }

  init(theme: string, graph, colorCode = null): void {
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences);
    }
    this.theme = theme;
    WorkflowService.setStyleToSymbol('fork', colorCode, theme, graph);
    WorkflowService.setStyleToSymbol('join', colorCode, theme, graph);
    WorkflowService.setStyleToSymbol('forkList', colorCode, theme, graph);
    WorkflowService.setStyleToSymbol('closeForkList', colorCode, theme, graph);
    WorkflowService.setStyleToSymbol('lock', colorCode, theme, graph);
    WorkflowService.setStyleToSymbol('closeLock', colorCode, theme, graph);
    WorkflowService.setStyleToSymbol('expectNotice', colorCode, theme, graph);
    WorkflowService.setStyleToSymbol('postNotice', colorCode, theme, graph);
    WorkflowService.setStyleToSymbol('finish', colorCode, theme, graph);
    WorkflowService.setStyleToSymbol('fail', colorCode, theme, graph);
    WorkflowService.setStyleToSymbol('prompt', colorCode, theme, graph);
    WorkflowService.setStyleToSymbol('addOrder', colorCode, theme, graph);

    WorkflowService.setStyleToVertex('job', colorCode, theme, graph);
    WorkflowService.setStyleToVertex('if', colorCode, theme, graph);
    WorkflowService.setStyleToVertex('cycle', colorCode, theme, graph);
    WorkflowService.setStyleToVertex('retry', colorCode, theme, graph);
    WorkflowService.setStyleToVertex('try', colorCode, theme, graph);
    WorkflowService.setStyleToVertex('catch', colorCode, theme, graph);
    WorkflowService.setStyleToVertex('dashRectangle', colorCode, theme, graph);

    const style = graph.getStylesheet().getDefaultVertexStyle();
    style[mxConstants.STYLE_PERIMETER] = 'rectanglePerimeter';
    style[mxConstants.STYLE_SHAPE] = 'rectangle';
    style.fontSize = '12';
    graph.getStylesheet().putDefaultVertexStyle(style);

    const expectStyle: any = {};
    expectStyle.shape = 'offPageConnector';
    expectStyle.strokeColor = '#999';
    expectStyle.fillColor = '#e0ffe0';
    expectStyle.gradientColor = '#fff';

    const postStyle: any = {};
    postStyle.shape = 'offPageConnector';
    postStyle.strokeColor = '#999';
    postStyle.fillColor = '#ffffe0';
    postStyle.gradientColor = '#fff';
    postStyle.direction = 'west';

    const symbolStyle: any = {};
    symbolStyle.shape = 'image';
    symbolStyle.perimeter = 'rhombusPerimeter';
    symbolStyle.verticalAlign = 'top';
    symbolStyle.verticalLabelPosition = 'bottom';

    const ellipseStyle: any = {};
    ellipseStyle.shape = 'ellipse';
    ellipseStyle.perimeter = 'ellipsePerimeter';
    ellipseStyle.fillColor = 'transparent';

    const orderStyle: any = {};
    orderStyle.shape = 'ellipse';
    orderStyle.perimeter = 'ellipsePerimeter';
    orderStyle[mxConstants.STYLE_ROUNDED] = true;
    orderStyle.strokeColor = '#ff944b';
    orderStyle.fillColor = '#ff944b';
    orderStyle.gradientColor = '#fff';

    if (theme === 'dark') {
      style.fontColor = '#fafafa';
      style.strokeColor = '#fafafa';
      symbolStyle.fontColor = '#fafafa';
      expectStyle.gradientColor = '#333';
      expectStyle.strokeColor = '#e0ffe0';
      postStyle.gradientColor = '#333';
      postStyle.strokeColor = '#ffffe0';
      orderStyle.gradientColor = '#333';
    } else {
      style.fontColor = '#3d464d';
      symbolStyle.fontColor = '#3d464d';
    }

    graph.getStylesheet().putCellStyle('expect', expectStyle);
    graph.getStylesheet().putCellStyle('post', postStyle);
    graph.getStylesheet().putCellStyle('symbol', symbolStyle);
    graph.getStylesheet().putCellStyle('ellipse', ellipseStyle);
    graph.getStylesheet().putCellStyle('order', orderStyle);

    const style2 = graph.getStylesheet().getDefaultEdgeStyle();
    style2[mxConstants.STYLE_ROUNDED] = true;
    style2.shape = 'connector';
    style2.fontSize = '10';
    style2.verticalAlign = 'center';
    style2.edgeStyle = 'elbowEdgeStyle';
    style2.endArrow = 'classic';
    if (theme === 'dark') {
      style2.fontColor = '#ffffff';
      style2.strokeColor = '#ffffff';
      if (this.preferences.theme === 'blue-lt') {
        style2.labelBackgroundColor = 'rgba(70, 82, 95, 0.6)';
      } else if (this.preferences.theme === 'blue') {
        style2.labelBackgroundColor = 'rgba(50, 70, 90, 0.61)';
      } else if (this.preferences.theme === 'cyan') {
        style2.labelBackgroundColor = 'rgba(29, 29, 28, 0.6)';
      } else if (this.preferences.theme === 'grey') {
        style2.labelBackgroundColor = 'rgba(78, 84, 92, 0.62)';
      } else {
        style2.labelBackgroundColor = 'rgba(29, 29, 28, 0.7)';
      }
      mxGraph.prototype.collapsedImage = new mxImage('./assets/mxgraph/images/collapsed-white.png', 12, 12);
      mxGraph.prototype.expandedImage = new mxImage('./assets/mxgraph/images/expanded-white.png', 12, 12);
    } else {
      style2.strokeColor = 'grey';
      style2.fontColor = '#3d464d';
      style2.labelBackgroundColor = '#fff';
      mxGraph.prototype.collapsedImage = new mxImage('./assets/mxgraph/images/collapsed.png', 12, 12);
      mxGraph.prototype.expandedImage = new mxImage('./assets/mxgraph/images/expanded.png', 12, 12);
    }
    graph.getStylesheet().putCellStyle('edgeStyle', style2);
  }

  create_UUID(): string {
    let dt = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  convertTryInstruction(instruction: any): void {
    const catchObj = clone(instruction.catch);
    instruction.try = {
      instructions: instruction.instructions
    };
    delete instruction.instructions;
    delete instruction.catch;
    instruction.catch = catchObj;
  }

  convertRetryToTryCatch(instruction: any): void {
    instruction.try = {
      instructions: instruction.instructions
    };
    instruction.catch = {
      instructions: [
        {
          TYPE: 'Retry'
        }
      ]
    };
    if (typeof instruction.retryDelays === 'string') {
      instruction.retryDelays = instruction.retryDelays.split(',').map(Number);
    }
    const catchObj = clone(instruction.catch);
    const retryDelays = clone(instruction.retryDelays);
    const maxTries = clone(instruction.maxTries);
    delete instruction.instructions;
    delete instruction.catch;
    delete instruction.retryDelays;
    delete instruction.maxTries;
    instruction.catch = catchObj;
    instruction.maxTries = parseInt(maxTries, 10);
    instruction.retryDelays = retryDelays;
  }

  isValidObject(v: string): boolean {
    if (!v.match(/[!?~'"}\[\]{@:;#\/\\^$%\^\&*\)\(+=]/) && /^(?!\.)(?!.*\.$)(?!.*?\.\.)/.test(v) && /^(?!-)(?!.*--)/.test(v)
      && !v.substring(0, 1).match(/[-]/) && !v.substring(v.length - 1).match(/[-]/) && !/\s/.test(v)) {
      return !/^(abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|double|do|else|enum|extends|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|native|new|package|private|protected|public|return|short|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|void|volatile|while)$/.test(v);
    } else {
      return false;
    }
  }

  isValidLabel(v: string): boolean {
    return !v.match(/[?~'"}\[\]{@;\/\\^%\^\&*\)\(+=]/) && /^(?!\.)(?!.*\.$)(?!.*?\.\.)/.test(v) && /^(?!-)(?!.*--)/.test(v)
      && !v.substring(0, 1).match(/[-,/|:!#$]/) && !v.substring(v.length - 1).match(/[-,/|:!#$]/) && !/\s/.test(v);
  }

  validateFields(value: any, type: string): boolean {
    if (value) {
      if (value.defaultArguments && isEmpty(value.defaultArguments)) {
        delete value.defaultArguments;
      }
      if (type === 'Job') {
        if (isEmpty(value.admissionTimeScheme) || value.admissionTimeScheme.periods.length === 0) {
          delete value.admissionTimeScheme;
        }
        if (!value.executable || (!value.executable.className && value.executable.TYPE === 'InternalExecutable')
          || (!value.executable.script && value.executable.TYPE === 'ShellScriptExecutable') || !value.agentName) {
          return false;
        }
        if (value.executable && value.executable.login && value.executable.login.withUserProfile && !value.executable.login.credentialKey) {
          return false;
        }
      }
      if (type === 'ExpectNotice' || type === 'PostNotice') {
        if (!value.noticeBoardName) {
          return false;
        }
      }
      if (type === 'AddOrder') {
        if (!value.workflowName) {
          return false;
        }
      }
      if (type === 'Lock') {
        if (!value.count) {
          delete value.count;
        }
        if (!value.lockName) {
          return false;
        }
      }

      if (type === 'Node') {
        if (!value.label || value.label === '' || value.label == 'null' || value.label == 'undefined') {
          return false;
        } else if (value.label && !this.isValidLabel(value.label)) {
          value.label = '';
          return false;
        }
        if (!this.isValidObject(value.jobName)) {
          return false;
        }
      }

      if (type === 'Fail') {
        if (value.uncatchable && value.uncatchable != 'null' && value.uncatchable != 'undefined' && typeof value.uncatchable === 'string') {
          value.uncatchable = value.uncatchable == 'true';
        } else {
          delete value.uncatchable;
        }
      }

      if (type === 'ForkList') {
        if (!value.children) {
          return false;
        }
      }

      if (type === 'Fork') {
        if (!value.branches || value.branches.length < 2) {
          return false;
        }
        for (let i = 0; i < value.branches.length; i++) {
          if (!value.branches[i].id) {
            return false;
          } else {
            if (!this.isValidObject(value.branches[i].id)) {
              return false;
            }
          }
        }
      }

      if (value.executable && value.executable.returnCodeMeaning) {
        if (value.executable.returnCodeMeaning.success && typeof value.executable.returnCodeMeaning.success === 'string') {
          value.executable.returnCodeMeaning.success = value.executable.returnCodeMeaning.success.split(',').map(Number);
          delete value.executable.returnCodeMeaning.failure;
        } else if (value.executable.returnCodeMeaning.failure && typeof value.executable.returnCodeMeaning.failure === 'string') {
          value.executable.returnCodeMeaning.failure = value.executable.returnCodeMeaning.failure.split(',').map(Number);
          delete value.executable.returnCodeMeaning.success;
        }
        if (value.executable.returnCodeMeaning.failure === '') {
          delete value.executable.returnCodeMeaning.failure;
        }
        if (value.executable.TYPE !== 'ShellScriptExecutable' || (value.executable.returnCodeMeaning.success === '' && !value.executable.returnCodeMeaning.failure)) {
          value.executable.returnCodeMeaning = {};
        }
        if (isEmpty(value.executable.returnCodeMeaning)) {
          delete value.executable.returnCodeMeaning;
        }
      }
      if (value.returnCode && value.returnCode != 'null' && value.returnCode != 'undefined' && typeof value.returnCode === 'string') {
        value.returnCode = parseInt(value.returnCode, 10);
        if (isNaN(value.returnCode)) {
          delete value.returnCode;
        }
      } else {
        delete value.returnCode;
      }

      if (value.timeout1) {
        delete value.timeout1;
      }
      if (value.graceTimeout1) {
        delete value.graceTimeout1;
      }
      if (typeof value.taskLimit === 'string') {
        value.taskLimit = parseInt(value.taskLimit, 10);
        if (isNaN(value.taskLimit)) {
          value.taskLimit = 1;
        }
      }
      if (typeof value.timeout === 'string') {
        value.timeout = parseInt(value.timeout, 10);
        if (isNaN(value.timeout)) {
          delete value.timeout;
        }
      }
      if (typeof value.graceTimeout === 'string') {
        value.graceTimeout = parseInt(value.graceTimeout, 10);
        if (isNaN(value.graceTimeout)) {
          delete value.graceTimeout;
        }
      }
    }
    return true;
  }

  checkEmptyObjects(mainJson: any, cb: any): void {
    function recursive(json: any) {
      if (json.instructions) {
        for (let x = 0; x < json.instructions.length; x++) {
          if (json.instructions[x].instructions) {
            recursive(json.instructions[x]);
          }
          if (json.instructions[x].catch) {
            if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
              recursive(json.instructions[x].catch);
            }
          }
          if (json.instructions[x].then) {
            if (json.instructions[x].then.instructions) {
              recursive(json.instructions[x].then);
            } else {
              delete json.instructions[x].then;
            }
          }
          if (json.instructions[x].else) {
            if (json.instructions[x].else.instructions) {
              recursive(json.instructions[x].else);
            } else {
              delete json.instructions[x].else;
            }
          }
          if (json.instructions[x].branches) {
            json.instructions[x].branches = json.instructions[x].branches.filter((branch: any) => {
              return (branch.instructions && branch.instructions.length > 0);
            });
            if (json.instructions[x].branches.length > 0) {
              for (let i = 0; i < json.instructions[x].branches.length; i++) {
                if (json.instructions[x].branches[i]) {
                  recursive(json.instructions[x].branches[i]);
                }
              }
            }
          }
        }
      }
    }

    recursive(mainJson);
    if (cb) {
      cb();
    }
  }

  convertTryToRetry(mainJson: any, cb: any, jobs = {}): void {
    let count = 1;

    function recursive(json: any, parent = null) {
      if (json.instructions) {
        for (let x = 0; x < json.instructions.length; x++) {
          if (!cb) {
            json.instructions[x].id = ++count;
            if (json.instructions[x].TYPE === 'ImplicitEnd' && (json.TYPE || parent)) {
              if (json.TYPE === 'ForkList') {
                json.instructions[x].TYPE = 'ForkListEnd';
              } else if (parent) {
                let positions = [];
                if (!parent.join) {
                  parent.join = {};
                } else {
                  positions = clone(parent.join.positionStrings);
                }
                positions.push(json.instructions[x].position);
                parent.join.positionStrings = positions;
                json.instructions[x].TYPE = 'Join';
              }
            }
          }
          if (json.instructions[x].TYPE === 'Execute.Named') {
            json.instructions[x].TYPE = 'Job';
            if (!isEmpty(jobs) && !json.instructions[x].documentationName) {
              const job = jobs[json.instructions[x].jobName];
              json.instructions[x].documentationName = job ? job.documentationName : null;
            }
          }
          if (json.instructions[x].TYPE === 'Try') {
            let isRetry = false;
            if (json.instructions[x].catch) {
              if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length === 1
                && json.instructions[x].catch.instructions[0].TYPE === 'Retry') {
                json.instructions[x].TYPE = 'Retry';
                json.instructions[x].instructions = json.instructions[x].try.instructions;
                isRetry = true;
                delete json.instructions[x].try;
                delete json.instructions[x].catch;
              }
            }
            if (!isRetry) {
              if (json.instructions[x].try) {
                json.instructions[x].instructions = json.instructions[x].try.instructions || [];
                delete json.instructions[x].try;
              }
              if (json.instructions[x].catch) {
                if (!json.instructions[x].catch.instructions) {
                  json.instructions[x].catch.instructions = [];
                }
              } else {
                json.instructions[x].catch = {instructions: []};
              }
            }
          }
          if (json.instructions[x].TYPE === 'Lock') {
            if (json.instructions[x].lockedWorkflow) {
              json.instructions[x].instructions = json.instructions[x].lockedWorkflow.instructions;
              delete json.instructions[x].lockedWorkflow;
            }
          }
          if (json.instructions[x].TYPE === 'Cycle') {
            if (json.instructions[x].cycleWorkflow) {
              json.instructions[x].instructions = json.instructions[x].cycleWorkflow.instructions;
              delete json.instructions[x].cycleWorkflow;
            }
          }
          if (json.instructions[x].TYPE === 'ForkList') {
            if (json.instructions[x].workflow) {
              json.instructions[x].instructions = json.instructions[x].workflow.instructions;
              delete json.instructions[x].workflow;
            }
          }
          if (mainJson.compressData && (json.instructions[x].TYPE === 'PostNotice' || json.instructions[x].TYPE === 'ExpectNotice')) {
            let isChecked = false;
            for (const key in mainJson.compressData) {
              if (mainJson.compressData[key].name === json.instructions[x].noticeBoardName) {
                isChecked = true;
                mainJson.compressData[key].instructions.push(json.instructions[x]);
                break;
              }
            }
            if (!isChecked) {
              mainJson.compressData.push({
                name: json.instructions[x].noticeBoardName,
                instructions: [json.instructions[x]]
              });
            }
          }
          if (json.instructions[x].instructions) {
            recursive(json.instructions[x]);
          }
          if (json.instructions[x].catch) {
            if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
              recursive(json.instructions[x].catch);
            }
          }
          if (json.instructions[x].then && json.instructions[x].then.instructions) {
            recursive(json.instructions[x].then);
          }
          if (json.instructions[x].else && json.instructions[x].else.instructions) {
            recursive(json.instructions[x].else);
          }
          if (json.instructions[x].branches) {
            json.instructions[x].branches = json.instructions[x].branches.filter((branch: any) => {
              branch.instructions = branch.workflow.instructions;
              branch.result = branch.workflow.result;
              delete branch.workflow;
              return (branch.instructions && branch.instructions.length > 0);
            });
            for (let i = 0; i < json.instructions[x].branches.length; i++) {
              if (json.instructions[x].branches[i]) {
                recursive(json.instructions[x].branches[i], json.instructions[x]);
              }
            }
          }
        }
      }
    }

    recursive(mainJson);
    if (cb) {
      cb();
    }
  }

  createWorkflow(mainJson: any, editor: any, mapObj: any): void {
    mapObj.nodeMap = new Map();
    if (mapObj.vertixMap) {
      mapObj.vertixMap = new Map();
    }
    const isGraphView = mapObj.graphView;
    const colorCode = mapObj.colorCode;
    let boardType;
    let boardName;
    if (mapObj.cell) {
      boardType = mapObj.cell.value.tagName;
      boardName = mapObj.cell.getAttribute('noticeBoardName') || mapObj.workflowName;
    }
    const graph = editor.graph;
    const self = this;
    const doc = mxUtils.createXmlDocument();
    const vertexMap = new Map();
    const defaultParent = graph.getDefaultParent();

    let isFound = false;

    function connectWithDummyNodes(json: any): void {
      if (json.instructions && json.instructions.length > 0) {
        const _node = doc.createElement('Process');
        _node.setAttribute('title', 'start');
        const v1 = graph.insertVertex(defaultParent, null, _node, 0, 0, 70, 70, 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;dashed=1;shadow=0;opacity=70' + (colorCode ? ';strokeColor=' + colorCode : ';'));

        let wf;
        if (isGraphView && colorCode !== '#90C7F5') {
          const node1 = doc.createElement('Workflow');
          const workflowName = mainJson.path.substring(mainJson.path.lastIndexOf('/') + 1);
          node1.setAttribute('workflowName', workflowName);
          node1.setAttribute('path', mainJson.path);
          wf = graph.insertVertex(defaultParent, null, node1, 0, 0, 160, 40, WorkflowService.setStyleToVertex('', colorCode, self.theme, null));
          let isConnect = true;

          if (mapObj.addOrderdMap.has(workflowName)) {
            let arr = mapObj.addOrderdMap.get(workflowName);
            arr = JSON.parse(arr);
            arr.forEach(id => {
              const vert = graph.getModel().getCell(id);
              if (vert && vert.value.tagName === 'AddOrder') {
                connectInstruction(vert, wf, '', '', defaultParent);
                isConnect = false;
              }
            });
          }

          if (isConnect) {
            connectInstruction(v1, wf, '', '', defaultParent);
          } else {
            graph.removeCells([v1]);
          }
        }

        const start = vertexMap.get(json.instructions[0].uuid);
        const last = json.instructions[json.instructions.length - 1];
        if (wf) {
          connectInstruction(wf, start, '', '', defaultParent);
        } else {
          connectInstruction(v1, start, '', '', defaultParent);
        }

        if (mapObj.cell && !isFound && wf && boardType !== 'AddOrder' && boardType !== 'PostNotice' && boardType !== 'ExpectNotice') {
          connectInstruction(wf, mapObj.cell, '', '', defaultParent);
        }

        if (last.TYPE !== 'ImplicitEnd') {
          let end = vertexMap.get(last.uuid);
          if (self.isInstructionCollapsible(last.TYPE)) {
            const targetId = mapObj.nodeMap.get(last.id);
            if (targetId) {
              end = graph.getModel().getCell(targetId);
            }
          }
          const _node2 = doc.createElement('Process');
          _node2.setAttribute('title', 'end');
          const v2 = graph.insertVertex(defaultParent, null, _node2, 0, 0, 70, 70, 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;dashed=1;shadow=0;opacity=70' + (colorCode ? ';strokeColor=' + colorCode : ';'));
          connectInstruction(end, v2, '', '', defaultParent);
        }
      }
    }

    function recursive(json: any, type: any, parent: any): void {
      if (json.instructions) {
        let v1, endNode;
        for (let x = 0; x < json.instructions.length; x++) {
          let v2;
          const _node = doc.createElement(json.instructions[x].TYPE);
          if (json.instructions[x].position) {
            _node.setAttribute('position', JSON.stringify(json.instructions[x].position));
          }
          if (!json.instructions[x].uuid) {
            json.instructions[x].uuid = self.create_UUID();
          }
          if (json.instructions[x].TYPE === 'Job') {
            _node.setAttribute('jobName', json.instructions[x].jobName);
            if (json.instructions[x].label !== undefined) {
              _node.setAttribute('label', json.instructions[x].label);
            }
            _node.setAttribute('uuid', json.instructions[x].uuid);
            if (json.instructions[x].documentationName !== undefined) {
              _node.setAttribute('documentationName', json.instructions[x].documentationName);
            }
            if (json.instructions[x].defaultArguments && typeof json.instructions[x].defaultArguments === 'object') {
              _node.setAttribute('defaultArguments', JSON.stringify(json.instructions[x].defaultArguments));
            }
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 180, 40, isGraphView ? WorkflowService.setStyleToVertex('job', colorCode, self.theme) : 'job');
            if (mapObj.vertixMap && json.instructions[x].position) {
              mapObj.vertixMap.set(JSON.stringify(json.instructions[x].position), v1);
            }
          } else if (json.instructions[x].TYPE === 'Finish') {
            _node.setAttribute('label', 'finish');
            _node.setAttribute('uuid', json.instructions[x].uuid);
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 68, 68, isGraphView ? WorkflowService.setStyleToSymbol('finish', colorCode, self.theme) : 'finish');
            if (mapObj.vertixMap && json.instructions[x].position) {
              mapObj.vertixMap.set(JSON.stringify(json.instructions[x].position), v1);
            }
          } else if (json.instructions[x].TYPE === 'Fail') {
            _node.setAttribute('label', 'fail');
            const outcome = json.instructions[x].outcome || {returnCode: 0};
            _node.setAttribute('outcome', JSON.stringify(outcome));
            if (json.instructions[x].message !== undefined) {
              _node.setAttribute('message', json.instructions[x].message);
            }
            if (json.instructions[x].uncatchable !== undefined) {
              _node.setAttribute('uncatchable', json.instructions[x].uncatchable);
            }
            _node.setAttribute('uuid', json.instructions[x].uuid);
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 68, 68, isGraphView ? WorkflowService.setStyleToSymbol('fail', colorCode, self.theme) : 'fail');
            if (mapObj.vertixMap && json.instructions[x].position) {
              mapObj.vertixMap.set(JSON.stringify(json.instructions[x].position), v1);
            }
          } else if (json.instructions[x].TYPE === 'AddOrder') {
            _node.setAttribute('label', 'addOrder');
            if (json.instructions[x].arguments !== undefined) {
              _node.setAttribute('arguments', JSON.stringify(json.instructions[x].arguments));
            }
            if (json.instructions[x].workflowName !== undefined) {
              _node.setAttribute('workflowName', json.instructions[x].workflowName);
            }
            if (json.instructions[x].remainWhenTerminated !== undefined) {
              _node.setAttribute('remainWhenTerminated', json.instructions[x].remainWhenTerminated);
            }
            _node.setAttribute('uuid', json.instructions[x].uuid);
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 68, 68, isGraphView ? WorkflowService.setStyleToSymbol('addOrder', colorCode, self.theme) : 'addOrder');
            if (mapObj.vertixMap && json.instructions[x].position) {
              mapObj.vertixMap.set(JSON.stringify(json.instructions[x].position), v1);
            }
            if (mapObj.addOrderdMap) {
              let arr = [];
              if (mapObj.addOrderdMap.has(json.instructions[x].workflowName)) {
                arr = arr.concat(JSON.parse(mapObj.addOrderdMap.get(json.instructions[x].workflowName)));
              } else {
                arr.push(v1.id);
              }
              mapObj.addOrderdMap.set(json.instructions[x].workflowName, JSON.stringify(arr));
            }
            if (json.instructions[x].workflowName && boardName === json.instructions[x].workflowName) {
              isFound = true;
              if (mapObj.cell) {
                connectInstruction(v1, mapObj.cell, boardName, '', mapObj.cell.parent);
              }
            }
          } else if (json.instructions[x].TYPE === 'PostNotice') {
            _node.setAttribute('label', 'postNotice');
            if (json.instructions[x].noticeBoardName !== undefined) {
              _node.setAttribute('noticeBoardName', json.instructions[x].noticeBoardName);
            }
            _node.setAttribute('uuid', json.instructions[x].uuid);
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 68, 68, isGraphView ? WorkflowService.setStyleToSymbol('postNotice', colorCode, self.theme) : 'postNotice');
            if (mapObj.vertixMap && json.instructions[x].position) {
              mapObj.vertixMap.set(JSON.stringify(json.instructions[x].position), v1);
            }
            if (boardType === 'ExpectNotice' && boardName === json.instructions[x].noticeBoardName) {
              connectInstruction(v1, mapObj.cell, boardName, '', mapObj.cell.parent);
            }
          } else if (json.instructions[x].TYPE === 'Prompt') {
            _node.setAttribute('label', 'prompt');
            if (json.instructions[x].question !== undefined) {
              _node.setAttribute('question', json.instructions[x].question);
            }
            _node.setAttribute('uuid', json.instructions[x].uuid);
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 68, 68, isGraphView ? WorkflowService.setStyleToSymbol('prompt', colorCode, self.theme) : 'prompt');
            if (mapObj.vertixMap && json.instructions[x].position) {
              mapObj.vertixMap.set(JSON.stringify(json.instructions[x].position), v1);
            }
          } else if (json.instructions[x].TYPE === 'ImplicitEnd' || json.instructions[x].TYPE === 'ForkListEnd' || json.instructions[x].TYPE === 'Join') {
            _node.setAttribute('label', 'end');
            _node.setAttribute('uuid', json.instructions[x].uuid);
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 70, 70, 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;dashed=1;shadow=0;opacity=70' + (colorCode ? ';strokeColor=' + colorCode : ';'));
            if (mapObj.vertixMap && json.instructions[x].position) {
              mapObj.vertixMap.set(JSON.stringify(json.instructions[x].position), v1);
            }
          } else if (json.instructions[x].TYPE === 'ExpectNotice') {
            _node.setAttribute('label', 'expectNotice');
            if (json.instructions[x].noticeBoardName !== undefined) {
              _node.setAttribute('noticeBoardName', json.instructions[x].noticeBoardName);
            }
            _node.setAttribute('uuid', json.instructions[x].uuid);
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 68, 68, isGraphView ? WorkflowService.setStyleToSymbol('expectNotice', colorCode, self.theme) : 'expectNotice');
            if (mapObj.vertixMap && json.instructions[x].position) {
              mapObj.vertixMap.set(JSON.stringify(json.instructions[x].position), v1);
            }

            if (boardType === 'PostNotice' && boardName === json.instructions[x].noticeBoardName) {
              connectInstruction(mapObj.cell, v1, boardName, '', mapObj.cell.parent);
            }
          } else if (json.instructions[x].TYPE === 'Fork') {
            _node.setAttribute('label', 'fork');
            if (json.instructions[x].joinIfFailed !== undefined) {
              _node.setAttribute('joinIfFailed', json.instructions[x].joinIfFailed);
            }
            _node.setAttribute('uuid', json.instructions[x].uuid);
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 68, 68, isGraphView ? WorkflowService.setStyleToSymbol('fork', colorCode, self.theme) : 'fork');
            if (mapObj.vertixMap && json.instructions[x].position) {
              mapObj.vertixMap.set(JSON.stringify(json.instructions[x].position), v1);
            }
            if (json.instructions[x].branches) {
              json.instructions[x].branches = json.instructions[x].branches.filter((branch: any) => {
                return (branch.instructions && branch.instructions.length > 0);
              });
              for (let i = 0; i < json.instructions[x].branches.length; i++) {
                recursive(json.instructions[x].branches[i], 'branch', v1);
                connectInstruction(v1, vertexMap.get(json.instructions[x].branches[i].instructions[0].uuid), json.instructions[x].branches[i].id, 'branch', v1, json.instructions[x].branches[i].result);
              }
              v2 = joinFork(json.instructions[x].branches, v1, parent);
            } else {
              v2 = joinFork(v1, v1, parent);
            }
          } else if (json.instructions[x].TYPE === 'ForkList') {
            _node.setAttribute('label', 'forkList');
            if (json.instructions[x].childToId !== undefined) {
              _node.setAttribute('childToId', json.instructions[x].childToId);
            }
            if (json.instructions[x].joinIfFailed !== undefined) {
              _node.setAttribute('joinIfFailed', json.instructions[x].joinIfFailed);
            }
            if (json.instructions[x].children !== undefined) {
              _node.setAttribute('children', json.instructions[x].children);
            }
            _node.setAttribute('uuid', json.instructions[x].uuid);
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 68, 68, isGraphView ? WorkflowService.setStyleToSymbol('forkList', colorCode, self.theme) : 'forkList');
            if (mapObj.vertixMap && json.instructions[x].position) {
              mapObj.vertixMap.set(JSON.stringify(json.instructions[x].position), v1);
            }
            if (json.instructions[x].instructions && json.instructions[x].instructions.length > 0) {
              recursive(json.instructions[x], '', v1);
              connectInstruction(v1, vertexMap.get(json.instructions[x].instructions[0].uuid), 'forkList', 'forkList', v1);
              v2 = joinForkList(json.instructions[x], v1.id, parent);
            } else {
              v2 = joinForkList(v1, v1.id, parent);
            }
          } else if (json.instructions[x].TYPE === 'If') {
            _node.setAttribute('label', 'if');
            _node.setAttribute('predicate', json.instructions[x].predicate);
            _node.setAttribute('uuid', json.instructions[x].uuid);
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 75, 75, isGraphView ? WorkflowService.setStyleToVertex('if', colorCode, self.theme) : 'if');
            if (mapObj.vertixMap && json.instructions[x].position) {
              mapObj.vertixMap.set(JSON.stringify(json.instructions[x].position), v1);
            }
            if (json.instructions[x].then && json.instructions[x].then.instructions && json.instructions[x].then.instructions.length > 0) {
              recursive(json.instructions[x].then, 'endIf', v1);
              connectInstruction(v1, vertexMap.get(json.instructions[x].then.instructions[0].uuid), 'then', 'then', v1);
            }
            if (json.instructions[x].else && json.instructions[x].else.instructions && json.instructions[x].else.instructions.length > 0) {
              recursive(json.instructions[x].else, 'endIf', v1);
              connectInstruction(v1, vertexMap.get(json.instructions[x].else.instructions[0].uuid), 'else', 'else', v1);
            }
            v2 = endIf(json.instructions[x], v1, parent);
          } else if (json.instructions[x].TYPE === 'Retry') {
            _node.setAttribute('label', 'retry');
            _node.setAttribute('maxTries', json.instructions[x].maxTries || '10');
            _node.setAttribute('retryDelays', json.instructions[x].retryDelays ? json.instructions[x].retryDelays.toString() : '0');
            _node.setAttribute('uuid', json.instructions[x].uuid);
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 75, 75, isGraphView ? WorkflowService.setStyleToVertex('retry', colorCode, self.theme) : 'retry');
            if (mapObj.vertixMap && json.instructions[x].position) {
              mapObj.vertixMap.set(JSON.stringify(json.instructions[x].position), v1);
            }
            if (json.instructions[x].instructions && json.instructions[x].instructions.length > 0) {
              recursive(json.instructions[x], '', v1);
              connectInstruction(v1, vertexMap.get(json.instructions[x].instructions[0].uuid), 'retry', 'retry', v1);
              v2 = closingNode(json.instructions[x], v1.id, parent, 'Retry');
            } else {
              v2 = closingNode(v1, v1.id, parent, 'Retry');
            }
          } else if (json.instructions[x].TYPE === 'Lock') {
            _node.setAttribute('label', 'lock');
            if (json.instructions[x].lockName !== undefined) {
              _node.setAttribute('lockName', json.instructions[x].lockName);
            }
            if (json.instructions[x].count !== undefined) {
              _node.setAttribute('count', json.instructions[x].count);
            }
            _node.setAttribute('uuid', json.instructions[x].uuid);
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 68, 68, isGraphView ? WorkflowService.setStyleToSymbol('lock', colorCode, self.theme) : 'lock');
            if (mapObj.vertixMap && json.instructions[x].position) {
              mapObj.vertixMap.set(JSON.stringify(json.instructions[x].position), v1);
            }
            if (json.instructions[x].instructions && json.instructions[x].instructions.length > 0) {
              recursive(json.instructions[x], '', v1);
              connectInstruction(v1, vertexMap.get(json.instructions[x].instructions[0].uuid), 'lock', 'lock', v1);
              v2 = closingNode(json.instructions[x], v1.id, parent, 'Lock');
            } else {
              v2 = closingNode(v1, v1.id, parent, 'Lock');
            }
          } else if (json.instructions[x].TYPE === 'Cycle') {
            _node.setAttribute('label', 'cycle');
            if (json.instructions[x].schedule) {
              _node.setAttribute('schedule', JSON.stringify(json.instructions[x].schedule));
            }
            _node.setAttribute('uuid', json.instructions[x].uuid);
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 75, 75, isGraphView ? WorkflowService.setStyleToVertex('cycle', colorCode, self.theme) : 'cycle');
            if (mapObj.vertixMap && json.instructions[x].position) {
              mapObj.vertixMap.set(JSON.stringify(json.instructions[x].position), v1);
            }
            if (json.instructions[x].instructions && json.instructions[x].instructions.length > 0) {
              recursive(json.instructions[x], '', v1);
              connectInstruction(v1, vertexMap.get(json.instructions[x].instructions[0].uuid), 'cycle', 'cycle', v1);
              v2 = closingNode(json.instructions[x], v1.id, parent, 'Cycle');
            } else {
              v2 = closingNode(v1, v1.id, parent, 'Cycle');
            }
          } else if (json.instructions[x].TYPE === 'Try') {
            _node.setAttribute('label', 'try');
            _node.setAttribute('uuid', json.instructions[x].uuid);
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 75, 75, isGraphView ? WorkflowService.setStyleToVertex('try', colorCode, self.theme) : 'try');
            if (mapObj.vertixMap && json.instructions[x].position) {
              mapObj.vertixMap.set(JSON.stringify(json.instructions[x].position), v1);
            }
            const node = doc.createElement('Catch');
            node.setAttribute('label', 'catch');
            node.setAttribute('targetId', v1.id);
            node.setAttribute('uuid', json.instructions[x].uuid);
            const cv1 = graph.insertVertex(v1, null, node, 0, 0, 110, 40, (json.instructions[x].catch && json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) ?
              (isGraphView ? WorkflowService.setStyleToVertex('catch', colorCode, self.theme) : 'catch') : (isGraphView ? WorkflowService.setStyleToVertex('dashRectangle', colorCode, self.theme) : 'dashRectangle'));
            if (mapObj.vertixMap && json.instructions[x].catch && json.instructions[x].catch.position) {
              mapObj.vertixMap.set(JSON.stringify(json.instructions[x].catch.position), cv1);
            }
            let _id = v1;
            if (json.instructions[x].catch) {
              json.instructions[x].catch.id = cv1.id;
              if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
                recursive(json.instructions[x].catch, 'endTry', v1);
                connectInstruction(cv1, vertexMap.get(json.instructions[x].catch.instructions[0].uuid), 'catch', 'catch', v1);
                _id = catchEnd(json.instructions[x].catch);
              } else {
                json.instructions[x].catch.instructions = [];
                _id = cv1;
              }
            }

            if (json.instructions[x].instructions && json.instructions[x].instructions.length > 0) {
              recursive(json.instructions[x], '', v1);
              connectInstruction(v1, vertexMap.get(json.instructions[x].instructions[0].uuid), 'try', 'try', v1);
              const _lastNode = json.instructions[x].instructions[json.instructions[x].instructions.length - 1];
              if (self.isInstructionCollapsible(_lastNode.TYPE)) {
                const end = graph.getModel().getCell(mapObj.nodeMap.get(_lastNode.id));
                connectInstruction(end, cv1, 'try', 'try', v1);
              } else {
                const end = graph.getModel().getCell(_lastNode.id);
                if (json.instructions[x].catch) {
                  connectInstruction(end, cv1, 'try', 'try', v1);
                } else {
                  _id = end;
                }
              }
            } else {
              if (json.instructions[x].catch) {
                connectInstruction(v1, cv1, 'try', 'try', v1);
              }
            }
            v2 = endTry(_id, v1.id, parent);
          }

          if (endNode) {
            connectInstruction(endNode, v1, type, type, parent);
            endNode = null;
          }

          if (json.instructions.length > (x + 1) && v2) {
            endNode = v2;
          }

          if (!vertexMap.has(json.instructions[x].uuid)) {
            vertexMap.set(json.instructions[x].uuid, v1);
          }
          if (v1) {
            json.instructions[x].id = v1.id;
            if (self.isInstructionCollapsible(json.instructions[x].TYPE)) {
              v1.collapsed = json.instructions[x].isCollapsed == '1';
            }
          }

          if (x > 0) {
            const prev = json.instructions[x - 1];
            if (prev.TYPE !== 'Fork' && prev.TYPE !== 'ForkList' && prev.TYPE !== 'If' && prev.TYPE !== 'Try' && prev.TYPE !== 'Retry' && prev.TYPE !== 'Lock' && prev.TYPE !== 'Cycle' && vertexMap.get(prev.uuid)) {
              connectInstruction(vertexMap.get(prev.uuid), v1, type, type, parent);
            }
          }
        }
      }
    }

    function createCollapsedObjects(json: any, parent: any): void {
      const node1 = doc.createElement('Workflow');
      const workflowName = json.path.substring(json.path.lastIndexOf('/') + 1);
      node1.setAttribute('workflowName', workflowName);
      node1.setAttribute('path', json.path);
      const w1 = graph.insertVertex(parent, null, node1, 0, 0, 160, 40, WorkflowService.setStyleToVertex('', colorCode, self.theme, null));
      if (json.compressData && json.compressData.length > 0) {
        for (let i = 0; i < json.compressData.length; i++) {
          let b1;
          if (mapObj.boardMap.has(json.compressData[i].name)) {
            b1 = mapObj.boardMap.get(json.compressData[i].name);
          } else {
            const node = doc.createElement('Board');
            node.setAttribute('label', json.compressData[i].name);
            b1 = graph.insertVertex(parent, null, node, 0, 0, 130, 36, 'order;fillColor=#856088;strokeColor=#856088;');
            mapObj.boardMap.set(json.compressData[i].name, b1);
          }
          for (let x = 0; x < json.compressData[i].instructions.length; x++) {
            const _node = doc.createElement(json.compressData[i].instructions[x].TYPE);
            let v1;
            if (json.compressData[i].instructions[x].TYPE === 'PostNotice') {
              _node.setAttribute('label', 'postNotice');
              if (json.compressData[i].instructions[x].noticeBoardName !== undefined) {
                _node.setAttribute('noticeBoardName', json.compressData[i].instructions[x].noticeBoardName);
              }
              _node.setAttribute('uuid', json.compressData[i].instructions[x].uuid);
              v1 = graph.insertVertex(parent, null, _node, 0, 0, 68, 68, isGraphView ? WorkflowService.setStyleToSymbol('postNotice', colorCode, self.theme) : 'postNotice');
              if (mapObj.vertixMap && json.compressData[i].instructions[x].position) {
                mapObj.vertixMap.set(JSON.stringify(json.compressData[i].instructions[x].position), v1);
              }
              if (boardType === 'ExpectNotice' && boardName === json.compressData[i].instructions[x].noticeBoardName) {
                connectInstruction(v1, mapObj.cell, boardName, '', parent);
              }
            } else if (json.compressData[i].instructions[x].TYPE === 'ExpectNotice') {
              _node.setAttribute('label', 'expectNotice');
              if (json.compressData[i].instructions[x].noticeBoardName !== undefined) {
                _node.setAttribute('noticeBoardName', json.compressData[i].instructions[x].noticeBoardName);
              }
              _node.setAttribute('uuid', json.compressData[i].instructions[x].uuid);
              v1 = graph.insertVertex(parent, null, _node, 0, 0, 68, 68, isGraphView ? WorkflowService.setStyleToSymbol('expectNotice', colorCode, self.theme) : 'expectNotice');
              if (mapObj.vertixMap && json.compressData[i].instructions[x].position) {
                mapObj.vertixMap.set(JSON.stringify(json.compressData[i].instructions[x].position), v1);
              }

              if (boardType === 'PostNotice' && boardName === json.compressData[i].instructions[x].noticeBoardName) {
                connectInstruction(mapObj.cell, v1, boardName, '', parent);
              }
            }

            if (!vertexMap.has(json.compressData[i].instructions[x].uuid)) {
              vertexMap.set(json.compressData[i].instructions[x].uuid, v1);
            }
            if (v1) {
              json.compressData[i].instructions[x].id = v1.id;
              connectInstruction(w1, v1, '', '', parent);
              connectInstruction(v1, b1, '', '', parent);
            }
          }
        }
      }
      if (mapObj.addOrderdMap.has(workflowName)) {
        let arr = mapObj.addOrderdMap.get(workflowName);
        arr = JSON.parse(arr);
        arr.forEach(id => {
          connectInstruction(graph.getModel().getCell(id), w1, '', '', parent);
        });
      } else if (mapObj.cell && mapObj.cell.value.tagName !== 'ExpectNotice' && mapObj.cell.value.tagName !== 'PostNotice') {
        connectInstruction(w1, mapObj.cell, '', '', parent);
      }
    }

    function connectInstruction(source: any, target: any, label: any, type: any, parent: any, result = null): void {
      // Create new Connection object
      const connNode = doc.createElement('Connection');
      let str = label;
      if (label.substring(0, 6) === '$TYPE$') {
        type = 'branch';
        str = label.substring(6);
      }
      if (result) {
        connNode.setAttribute('result', JSON.stringify(result));
      }
      connNode.setAttribute('label', str);
      connNode.setAttribute('type', type);
      graph.insertEdge(parent, null, connNode, source, target, (colorCode ? 'edgeStyle;strokeColor=' + colorCode : 'edgeStyle'));
    }

    function joinFork(branches: any, target: any, parent: any): any {
      const _node = doc.createElement('Join');
      _node.setAttribute('label', 'join');
      if (target.id) {
        _node.setAttribute('targetId', target.id);
      }
      const v1 = graph.insertVertex(parent, null, _node, 0, 0, 68, 68, isGraphView ? WorkflowService.setStyleToSymbol('join', colorCode, self.theme) : 'join');
      mapObj.nodeMap.set(target.id.toString(), v1.id.toString());
      if (isArray(branches)) {
        if (branches.length === 0) {
          connectInstruction(target, v1, '', '', parent);
        } else {
          for (let i = 0; i < branches.length; i++) {
            if (branches[i].instructions && branches[i].instructions.length > 0) {
              let x = branches[i].instructions[branches[i].instructions.length - 1];
              let pos;
              if ((x.TYPE === 'ImplicitEnd' || x.TYPE === 'ForkListEnd' || x.TYPE === 'Join') && branches[i].instructions.length > 1) {
                pos = JSON.stringify(x.position);
                if (mapObj.vertixMap.has(pos)) {
                  mapObj.vertixMap.set(pos, v1);
                  const cell = vertexMap.get(x.uuid);
                  graph.removeCells([cell], true);
                  vertexMap.delete(x.uuid);
                }
                x = branches[i].instructions[branches[i].instructions.length - 2];
              }
              if (x) {
                let endNode;
                if (self.isInstructionCollapsible(x.TYPE)) {
                  endNode = graph.getModel().getCell(mapObj.nodeMap.get(x.id));
                } else {
                  endNode = vertexMap.get(x.uuid);
                }
                let arr = [];
                const prevVal = v1.value.getAttribute('positions');
                if (prevVal) {
                  arr = JSON.parse(prevVal);
                }
                arr.push(pos);
                v1.value.setAttribute('positions', JSON.stringify(arr));
                connectInstruction(endNode, v1, 'join', 'join', parent);
              }
            } else {
              connectInstruction(target, v1, '', '', parent);
            }
          }
        }
      } else {
        connectInstruction(branches, v1, '', '', parent);
      }
      return v1;
    }

    function endIf(branches: any, target: any, parent: any): any {
      const _node = doc.createElement('EndIf');
      _node.setAttribute('label', 'ifEnd');
      if (target.id) {
        _node.setAttribute('targetId', target.id);
      }
      const v1 = graph.insertVertex(parent, null, _node, 0, 0, 75, 75, isGraphView ? WorkflowService.setStyleToVertex('if', colorCode, self.theme) : 'if');
      mapObj.nodeMap.set(target.id.toString(), v1.id.toString());
      let flag = true;
      if (branches.then && branches.then.instructions) {
        const x = branches.then.instructions[branches.then.instructions.length - 1];
        if (x) {
          let endNode;
          if (self.isInstructionCollapsible(x.TYPE)) {
            endNode = graph.getModel().getCell(mapObj.nodeMap.get(x.id));
          } else {
            endNode = vertexMap.get(x.uuid);
          }
          flag = false;
          connectInstruction(endNode, v1, 'endIf', 'endIf', parent);
        }
      }
      if (branches.else && branches.else.instructions) {
        const x = branches.else.instructions[branches.else.instructions.length - 1];
        if (x) {
          let endNode;
          if (self.isInstructionCollapsible(x.TYPE)) {
            endNode = graph.getModel().getCell(mapObj.nodeMap.get(x.id));
          } else {
            endNode = vertexMap.get(x.uuid);
          }
          flag = false;
          connectInstruction(endNode, v1, 'endIf', 'endIf', parent);
        }
      }
      if (flag) {
        connectInstruction(target, v1, '', '', parent);
      }
      return v1;
    }

    function closingNode(branches: any, targetId: any, parent: any, type): any {
      const _node = doc.createElement(type === 'Lock' ? 'EndLock' : type === 'Retry' ? 'EndRetry' : 'EndCycle');
      _node.setAttribute('label', type === 'Lock' ? 'lockEnd' : type === 'Retry' ? 'retryEnd' : 'cycleEnd');
      if (targetId) {
        _node.setAttribute('targetId', targetId);
      }
      let v1;
      if (type === 'Lock') {
        v1 = graph.insertVertex(parent, null, _node, 0, 0, 68, 68, isGraphView ? WorkflowService.setStyleToSymbol('closeLock', colorCode, self.theme) : 'closeLock');
      } else if (type === 'Retry') {
        v1 = graph.insertVertex(parent, null, _node, 0, 0, 75, 75, isGraphView ? WorkflowService.setStyleToVertex('retry', colorCode, self.theme) : 'retry');
      } else {
        v1 = graph.insertVertex(parent, null, _node, 0, 0, 75, 75, isGraphView ? WorkflowService.setStyleToVertex('cycle', colorCode, self.theme) : 'cycle');
      }
      mapObj.nodeMap.set(targetId.toString(), v1.id.toString());

      if (branches.instructions && branches.instructions.length > 0) {
        const x = branches.instructions[branches.instructions.length - 1];
        if (x) {
          let endNode;
          if (self.isInstructionCollapsible(x.TYPE)) {
            endNode = graph.getModel().getCell(mapObj.nodeMap.get(x.id));
          } else {
            endNode = vertexMap.get(x.uuid);
          }
          connectInstruction(endNode, v1, type === 'Lock' ? 'endLock' : type === 'Retry' ? 'endRetry' : 'endCycle',
            type === 'Lock' ? 'endLock' : type === 'Retry' ? 'endRetry' : 'endCycle', parent);
        }
      } else {
        connectInstruction(branches, v1, '', '', parent);
      }
      return v1;
    }

    function joinForkList(branches: any, targetId: any, parent: any): any {
      const _node = doc.createElement('EndForkList');
      _node.setAttribute('label', 'forkListEnd');
      if (targetId) {
        _node.setAttribute('targetId', targetId);
      }
      const v1 = graph.insertVertex(parent, null, _node, 0, 0, 68, 68, isGraphView ? WorkflowService.setStyleToSymbol('closeForkList', colorCode, self.theme) : 'closeForkList');
      mapObj.nodeMap.set(targetId.toString(), v1.id.toString());

      if (branches.instructions && branches.instructions.length > 0) {
        let x = branches.instructions[branches.instructions.length - 1];
        let pos;
        if ((x.TYPE === 'ImplicitEnd' || x.TYPE === 'ForkListEnd' || x.TYPE === 'Join') && branches.instructions.length > 1) {
          pos = JSON.stringify(x.position);
          if (mapObj.vertixMap.has(pos)) {
            mapObj.vertixMap.set(pos, v1);
            const cell = vertexMap.get(x.uuid);
            graph.removeCells([cell], true);
            vertexMap.delete(x.uuid);
          }
          x = branches.instructions[branches.instructions.length - 2];
        }
        if (x) {
          let endNode;
          if (self.isInstructionCollapsible(x.TYPE)) {
            endNode = graph.getModel().getCell(mapObj.nodeMap.get(x.id));
          } else {
            endNode = vertexMap.get(x.uuid);
          }
          const arr = [pos];
          const prevVal = v1.value.getAttribute('positions')
          if (prevVal) {
            arr.push(prevVal)
          }
          v1.value.setAttribute('positions', JSON.stringify(arr));
          connectInstruction(endNode, v1, 'endForkList', 'endForkList', parent);
        }
      } else {
        connectInstruction(branches, v1, '', '', parent);
      }
      return v1;
    }

    function endTry(x: any, targetId: any, parent: any): any {
      const _node = doc.createElement('EndTry');
      _node.setAttribute('label', 'tryEnd');
      if (targetId) {
        _node.setAttribute('targetId', targetId);
      }
      const v1 = graph.insertVertex(parent, null, _node, 0, 0, 75, 75, isGraphView ? WorkflowService.setStyleToVertex('try', colorCode, self.theme) : 'try');
      mapObj.nodeMap.set(targetId.toString(), v1.id.toString());

      connectInstruction(x, v1, 'endTry', 'endTry', parent);
      return v1;
    }

    function catchEnd(branches: any) {
      let x = branches.instructions[branches.instructions.length - 1];
      if (!x) {
        x = branches;
      }
      if (x) {
        let endNode;
        if (self.isInstructionCollapsible(x.TYPE)) {
          endNode = graph.getModel().getCell(mapObj.nodeMap.get(x.id));
        } else {
          endNode = vertexMap.get(x.uuid);
        }
        return endNode;
      }
    }

    if (!mainJson.isExpanded && isGraphView && mainJson.compressData) {
      createCollapsedObjects(mainJson, defaultParent);
    } else {
      recursive(mainJson, '', defaultParent);
      connectWithDummyNodes(mainJson);
    }
  }

  public convertValueToString(cell: any, graph: any): string {
    function truncate(input: string, num: number): string {
      if (input.length > num) {
        return input.substring(0, num) + '...';
      } else {
        return input;
      }
    }

    let str = '';
    if (mxUtils.isNode(cell.value)) {
      if (cell.value.tagName === 'Process') {
        const title = cell.getAttribute('title');
        if (title != null && title.length > 0) {
          this.translate.get('workflow.label.' + title).subscribe(translatedValue => {
            str = translatedValue;
          });
          return str;
        }
        return '';
      } else if (cell.value.tagName === 'Job') {
        const lb = cell.getAttribute('label');
        if (lb) {
          const edge = graph.getOutgoingEdges(cell)[0];
          if (edge) {
            edge.setAttribute('label', lb);
          }
        }
        const docName = cell.getAttribute('documentationName');
        let className = 'hide';
        if (docName) {
          className = 'show-block';
        }
        return '<div class="cursor workflow-title"><i id="doc-type" class="cursor fa fa-book p-r-xs ' + className + '"></i>'
          + truncate(cell.getAttribute('jobName'), 22) + '</div>';
      } else if (cell.value.tagName === 'PostNotice' || cell.value.tagName === 'ExpectNotice') {
        const noticeBoardName = cell.getAttribute('noticeBoardName');
        if (noticeBoardName) {
          const edge = graph.getOutgoingEdges(cell)[0];
          if (edge) {
            edge.setAttribute('noticeBoardName', noticeBoardName);
          }
        }
      } else if (cell.value.tagName === 'Workflow') {
        const cls = cell.getAttribute('type') === 'expect' ? 'm-t-n-6' : cell.getAttribute('type') === 'post' ? 'm-t-sm' : '';
        return '<div class="cursor text-dark ' + cls + '"><i class="icon-workflows-icon p-r-xs"></i>'
          + truncate(cell.getAttribute('workflowName'), cls ? 16 : 20) + '</div>';
      } else if (cell.value.tagName === 'Board') {
        return '<div class="cursor text-dark"><i class="fa fa-thumb-tack p-r-xs"></i>'
          + truncate(cell.getAttribute('label'), 18) + '</div>';
      } else if (cell.value.tagName === 'Order') {
        let data = cell.getAttribute('order');
        data = JSON.parse(data);
        let className = 'hide';
        if (data.cyclicOrder) {
          className = 'show';
        }
        const class1 = data.state ? this.coreService.getColor(data.state.severity, data.marked ? 'bg' : 'text') : '';
        const class2 = data.marked ? this.coreService.getColor(data.marked.severity, 'bg') : '';
        str = '<div class="vertex-text"><div class="block-ellipsis-job">' +
          '<i style="position: absolute;margin-top: -2px;margin-left: -10px;" class="fa fa-repeat ' + className + '" aria-hidden="true"></i>';
        if (data.marked) {
          str = str + '<span class="half-circle half-circle-left ' + class1 + '"></span>' +
            '<span class="half-circle half-circle-right m-r-xs ' + class2 + '"></span>';
        } else {
          str = str + '<i class="fa fa-circle text-xs p-r-xs ' + class1 + '"></i>';
        }
        if (data.state && (data.state._text !== 'SCHEDULED' && data.state._text !== 'PENDING')) {
          str = str + '<a id="order-type" class="text-hover-primary">' + data.orderId + '</a></div>';
        } else {
          str = str + data.orderId + '</div>';
        }
        if (data.question) {
          str = str + '<div>Prompt: ' + data.question + '</div>';
        }
        if (data.scheduledFor) {
          if (!data.scheduledNever) {
            str = str + ' <span class="text-xs" >' + this.stringDatePipe.transform(data.scheduledFor) + '</span>';
          } else {
            let never = '';
            this.translate.get('common.label.never').subscribe(translatedValue => {
              never = translatedValue;
            });
            str = str + ' <span class="text-xs" >' + never + '</span>';
          }
        }
        str = str + '</div>';
        return str;
      } else if (cell.value.tagName === 'Count') {
        const count = cell.getAttribute('count');
        return '<i class="text-white text-xs cursor">' + count + '</i>';
      } else {
        const x = cell.getAttribute('noticeBoardName') || cell.getAttribute('label');
        if (x) {
          if (cell.value.tagName === 'Connection') {
            if (x === 'then' || x === 'else') {
              this.translate.get('workflow.label.' + x).subscribe(translatedValue => {
                str = translatedValue.toLowerCase();
              });
            } else if ((cell.source.value.tagName === 'Job' && cell.source.getAttribute('label'))) {
              str = cell.source.getAttribute('label');
            } else if (cell.source.value.tagName === 'Fork') {
              str = x;
            }
            if (((cell.source.value.tagName === 'PostNotice' || cell.source.value.tagName === 'ExpectNotice'))) {
              str = '<a class="text-primary cursor">' + x + '</a>';
            } else if (((cell.source.value.tagName === 'AddOrder'))) {
              str = x;
            }
          } else {
            this.translate.get('workflow.label.' + x).subscribe(translatedValue => {
              str = translatedValue;
            });
          }
        }
        return str;
      }
    }
    return str;
  }

  public getTooltipForCell(cell: any): string {
    let str = '';
    if (mxUtils.isNode(cell.value)) {
      if (cell.value.tagName === 'Process' || cell.value.tagName === 'Connection') {
        return '';
      } else if (cell.value.tagName === 'Job') {
        let name = '', label = '';
        this.translate.get('workflow.label.name').subscribe(translatedValue => {
          name = translatedValue;
        });
        this.translate.get('workflow.label.label').subscribe(translatedValue => {
          label = translatedValue;
        });
        return '<b>' + name + '</b> : ' + (cell.getAttribute('jobName') || '-') + '</br>' +
          '<b>' + label + '</b> : ' + (cell.getAttribute('label') || '-');
      } else if (cell.value.tagName === 'Workflow') {
        let name = '';
        this.translate.get('workflow.label.name').subscribe(translatedValue => {
          name = translatedValue;
        });
        return '<b>' + name + '</b> : ' + (cell.getAttribute('workflowName') || '-');
      } else if (cell.value.tagName === 'Board') {
        let name = '';
        this.translate.get('workflow.label.name').subscribe(translatedValue => {
          name = translatedValue;
        });
        return '<b>' + name + '</b> : ' + (cell.getAttribute('label') || '-');
      } else if (cell.value.tagName === 'Retry') {
        let maxTries = '', delay = '';
        this.translate.get('workflow.label.maxTries').subscribe(translatedValue => {
          maxTries = translatedValue;
        });
        this.translate.get('workflow.label.delay').subscribe(translatedValue => {
          delay = translatedValue;
        });
        return '<b>' + maxTries + '</b> : ' + (cell.getAttribute('maxTries') || '-') + '</br>' +
          '<b>' + delay + '</b> : ' + (cell.getAttribute('retryDelays') || '-');
      } else if (cell.value.tagName === 'If') {
        let msg = '';
        this.translate.get('workflow.label.predicate').subscribe(translatedValue => {
          msg = translatedValue;
        });
        return '<b>' + msg + '</b> : ' + (cell.getAttribute('predicate') || '-');
      } else if (cell.value.tagName === 'ForkList') {
        let msg = '';
        this.translate.get('workflow.label.children').subscribe(translatedValue => {
          msg = translatedValue;
        });
        return '<b>' + msg + '</b> : ' + (cell.getAttribute('children') || '-');
      } else if (cell.value.tagName === 'Lock') {
        let msg = '', limit = '';
        this.translate.get('workflow.label.name').subscribe(translatedValue => {
          msg = translatedValue;
        });
        this.translate.get('workflow.label.count').subscribe(translatedValue => {
          limit = translatedValue;
        });
        return '<b>' + msg + '</b> : ' + (cell.getAttribute('lockName') || '-') + '</br>' +
          '<b>' + limit + '</b> : ' + (cell.getAttribute('count') || '-');
      } else if (cell.value.tagName === 'Fail') {
        let msg = '';
        let returnCode = '';
        this.translate.get('workflow.label.message').subscribe(translatedValue => {
          msg = translatedValue;
        });
        this.translate.get('workflow.label.returnCode').subscribe(translatedValue => {
          returnCode = translatedValue;
        });
        const outcome = cell.getAttribute('outcome') ? JSON.parse(cell.getAttribute('outcome')) : {};
        return '<b>' + msg + '</b> : ' + (cell.getAttribute('message') || '-') + '</br>' +
          '<b>' + returnCode + '</b> : ' + (outcome.returnCode || '-');
      } else if (cell.value.tagName === 'AddOrder') {
        let workflowName = '';
        this.translate.get('workflow.label.workflowName').subscribe(translatedValue => {
          workflowName = translatedValue;
        });
        return '<b>' + workflowName + '</b> : ' + (cell.getAttribute('workflowName') || '-');
      } else if (cell.value.tagName === 'Prompt') {
        let question = '';
        this.translate.get('workflow.label.question').subscribe(translatedValue => {
          question = translatedValue;
        });
        return '<b>' + question + '</b> : ' + (cell.getAttribute('question') || '-');
      } else if (cell.value.tagName === 'Order') {
        let data = cell.getAttribute('order');
        data = JSON.parse(data);
        let state = '';
        let orderId;
        let _reason = '';
        let _text = '';
        let _markedText = '';
        let scheduledFor = '', cyclicOrder = '', begin = '', end = '', orders = '';
        let cycleState = '', since = '', next = '', index = '';
        this.translate.get('workflow.label.orderId').subscribe(translatedValue => {
          orderId = translatedValue;
        });
        if (data.state._reason) {
          this.translate.get('common.label.comment').subscribe(translatedValue => {
            _reason = translatedValue;
          });
        }
        this.translate.get('order.label.state').subscribe(translatedValue => {
          state = translatedValue;
        });
        this.translate.get('order.label.scheduledFor').subscribe(translatedValue => {
          scheduledFor = translatedValue;
        });
        this.translate.get(data.state._text).subscribe(translatedValue => {
          _text = translatedValue;
        });
        if (data.marked) {
          this.translate.get(data.marked._text).subscribe(translatedValue => {
            _markedText = translatedValue;
          });
        }
        if (data.cyclicOrder) {
          this.translate.get('dailyPlan.label.cyclicOrder').subscribe(translatedValue => {
            cyclicOrder = translatedValue;
          });
          this.translate.get('dailyPlan.label.begin').subscribe(translatedValue => {
            begin = translatedValue;
          });
          this.translate.get('dailyPlan.label.end').subscribe(translatedValue => {
            end = translatedValue;
          });
          this.translate.get('order.label.orders').subscribe(translatedValue => {
            orders = translatedValue;
          });
        }
        if (data.cycleState) {
          this.translate.get('order.cycleState.label.cycleState').subscribe(translatedValue => {
            cycleState = translatedValue;
          });
          this.translate.get('order.cycleState.label.since').subscribe(translatedValue => {
            since = translatedValue;
          });
          this.translate.get('order.cycleState.label.next').subscribe(translatedValue => {
            next = translatedValue;
          });
          this.translate.get('order.cycleState.label.index').subscribe(translatedValue => {
            index = translatedValue;
          });
        }
        const class1 = this.coreService.getColor(data.state.severity, 'text');
        const class2 = data.marked ? this.coreService.getColor(data.marked.severity, 'text') : '';
        let div = '<div><b>' + orderId + '</b> : ' + (data.orderId || '-') + '</br>' +
          '<b>' + state + '</b> : <span class="' + class1 + '">' + _text + '</span><span class="' + class2 + '">' + (_markedText ? '/' + _markedText : '') + '</span>' + '</br>';
        if (_reason) {
          div = div + '<b>' + _reason + '</b> : ' + (data.state._reason || '-') + '</br>';
        }
        if (data.obstacles && data.obstacles.length > 0) {
          for (let i = 0; i < data.obstacles.length; i++) {
            this.translate.get(data.obstacles[i].type).subscribe(translatedValue => {
              div = div + '<b>' + translatedValue + '</b> : ' + this.stringDatePipe.transform(data.obstacles[i].until) + '</br>';
            });
          }
        }
        if (data.cyclicOrder) {
          div = div + '<b class="m-b-xs">' + cyclicOrder + '</b></br>';
          div = div + '<b class="p-l-sm">' + begin + '</b> : ' + this.stringDatePipe.transform(data.cyclicOrder.firstStart) + '</br>';
          div = div + '<b class="p-l-sm">' + end + '</b> : ' + this.stringDatePipe.transform(data.cyclicOrder.lastStart) + '</br>';
          div = div + '<b class="p-l-sm">' + orders + '</b> : ' + data.cyclicOrder.count;
        }
        if (data.cycleState) {
          div = div + '<b class="m-b-xs">' + cycleState + '</b></br>';
          if (data.cycleState.since) {
            div = div + '<b class="p-l-sm">' + since + '</b> : ' + this.stringDatePipe.transform(data.cycleState.since) + '</br>';
          }
          if (data.cycleState.next) {
            div = div + '<b class="p-l-sm">' + next + '</b> : ' + this.stringDatePipe.transform(data.cycleState.next) + '</br>';
          }
          div = div + '<b class="p-l-sm">' + index + '</b> : ' + data.cycleState.index;
        } else {
          if (data.scheduledFor) {
            if (!data.scheduledNever) {
              div = div + '<b>' + scheduledFor + '</b> : ' + this.stringDatePipe.transform(data.scheduledFor);
            } else {
              let never = '';
              this.translate.get('common.label.never').subscribe(translatedValue => {
                never = translatedValue;
              });
              if (never) {
                never = never.toLowerCase();
              }
              div = div + '<b>' + scheduledFor + '</b> : ' + never;
            }
          }
        }
        div = div + '</div>';
        return div;
      } else {
        const x = cell.getAttribute('label');
        if (x) {
          this.translate.get('workflow.label.' + x).subscribe(translatedValue => {
            str = translatedValue;
          });
        }
        if (((cell.value.tagName === 'PostNotice' || cell.value.tagName === 'ExpectNotice'))) {
          str = str + ': ' + cell.getAttribute('noticeBoardName');
        }
        return str;
      }
    }
    return str;
  }

  convertDurationToString(time: any): string {
    const seconds = Number(time);
    const y = Math.floor(seconds / (3600 * 365 * 24));
    const m = Math.floor((seconds % (3600 * 365 * 24)) / (3600 * 30 * 24));
    const w = Math.floor(((seconds % (3600 * 365 * 24)) % (3600 * 30 * 24)) / (3600 * 7 * 24));
    const d = Math.floor((((seconds % (3600 * 365 * 24)) % (3600 * 30 * 24)) % (3600 * 7 * 24)) / (3600 * 24));
    const h = Math.floor(((((seconds % (3600 * 365 * 24)) % (3600 * 30 * 24)) % (3600 * 7 * 24)) % (3600 * 24)) / 3600);
    const M = Math.floor((((((seconds % (3600 * 365 * 24)) % (3600 * 30 * 24)) % (3600 * 7 * 24)) % (3600 * 24)) % 3600) / 60);
    const s = Math.floor(((((((seconds % (3600 * 365 * 24)) % (3600 * 30 * 24)) % (3600 * 7 * 24)) % (3600 * 24)) % 3600) % 60));
    if (y == 0 && m == 0 && w == 0 && d == 0) {
      if (h == 0 && M == 0) {
        return s + 's';
      } else {
        return (h < 10 ? '0' + h : h) + ':' + (M < 10 ? '0' + M : M) + ':' + (s < 10 ? '0' + s : s);
      }
    } else {
      return (y != 0 ? y + 'y ' : '') + (m != 0 ? m + 'm ' : '') + (w != 0 ? w + 'w ' : '') + (d != 0 ? d + 'd ' : '') + (h != 0 ? h + 'h ' : '') + (M != 0 ? M + 'M ' : '') + (s != 0 ? s + 's ' : '');
    }
  }

  convertSecondToTime(seconds: number): string {
    const h = Math.floor(((((seconds % (3600 * 365 * 24)) % (3600 * 30 * 24)) % (3600 * 7 * 24)) % (3600 * 24)) / 3600);
    const m = Math.floor((((((seconds % (3600 * 365 * 24)) % (3600 * 30 * 24)) % (3600 * 7 * 24)) % (3600 * 24)) % 3600) / 60);
    const s = Math.floor(((((((seconds % (3600 * 365 * 24)) % (3600 * 30 * 24)) % (3600 * 7 * 24)) % (3600 * 24)) % 3600) % 60));
    return (h > 9 ? h : '0' + h) + ':' + (m > 9 ? m : '0' + m) + (s > 0 ? (':' + (s > 9 ? s : '0' + s)) : ':00');
  }

  convertDurationToHour(seconds: number): string {
    if (seconds === 0) {
      return '0';
    }
    const w = Math.floor(((seconds % (3600 * 365 * 24)) % (3600 * 30 * 24)) / (3600 * 7 * 24));
    const d = Math.floor((((seconds % (3600 * 365 * 24)) % (3600 * 30 * 24)) % (3600 * 7 * 24)) / (3600 * 24));
    const h = Math.floor(((((seconds % (3600 * 365 * 24)) % (3600 * 30 * 24)) % (3600 * 7 * 24)) % (3600 * 24)) / 3600);
    const m = Math.floor((((((seconds % (3600 * 365 * 24)) % (3600 * 30 * 24)) % (3600 * 7 * 24)) % (3600 * 24)) % 3600) / 60);
    const s = Math.floor(((((((seconds % (3600 * 365 * 24)) % (3600 * 30 * 24)) % (3600 * 7 * 24)) % (3600 * 24)) % 3600) % 60));
    return ((w != 0 ? w + 'w ' : '') + (d != 0 ? d + 'd ' : '') + (h != 0 ? h + 'h ' : '') + (m != 0 ? m + 'm ' : '') + (s != 0 ? s + 's' : '')).trim();
  }

  convertStringToDuration(str: string, isDuration = false): number {
    function durationSeconds(timeExpr) {
      const units = {h: 3600, m: 60, s: 1};
      const regex = /(\d+)([hms])/g;
      let seconds = 0;
      let match;
      while ((match = regex.exec(timeExpr))) {
        seconds += parseInt(match[1], 10) * units[match[2]];
      }
      return seconds;
    }

    if (isDuration && (/^\s*(?:(?:\d+)h\s*)?(?:\d+m\s*)?(?:\d+s)?\s*$/.test(str))) {
      return durationSeconds(str);
    }

    if (/^([01][0-9]|2[0-3]):?([0-5][0-9]):?([0-5][0-9])\s*-\s*([01][0-9]|2[0-3]):?([0-5][0-9]):?([0-5][0-9])\s*$/.test(str)) {
      const interval = str.split('-');
      const a = interval[0].split(':');
      const b = interval[1].split(':');
      const s1 = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
      const s2 = (+b[0]) * 60 * 60 + (+b[1]) * 60 + (+b[2]);
      return s2 > s1 ? (s2 - s1) : (86400 - (s1 - s2));
    }

    if (/^((\d+)y[ ]?)?((\d+)m[ ]?)?((\d+)w[ ]?)?((\d+)d[ ]?)?((\d+)h[ ]?)?((\d+)M[ ]?)?((\d+)s[ ]?)?\s*$/.test(str)) {
      let seconds = 0;
      const a = str.split(' ');
      for (let i = 0; i < a.length; i++) {
        const frmt: string = a[i].charAt(a[i].length - 1);
        const val: number = Number(a[i].slice(0, a[i].length - 1));
        if (frmt && val) {
          if (frmt === 'y') {
            seconds += val * 365 * 24 * 3600;
          } else if (!isDuration && frmt === 'm') {
            seconds += val * 30 * 24 * 3600;
          } else if (frmt === 'w') {
            seconds += val * 7 * 24 * 3600;
          } else if (frmt === 'd') {
            seconds += val * 24 * 3600;
          } else if (frmt === 'h') {
            seconds += val * 3600;
          } else if (frmt === 'M' || (isDuration || frmt === 'm')) {
            seconds += val * 60;
          } else if (frmt === 's') {
            seconds += Number(val);
          }
        }
      }
      return seconds;
    } else if (/^([01][0-9]|2[0-3]):?([0-5][0-9]):?([0-5][0-9])\s*$/i.test(str)) {
      const a = str.split(':');
      return (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
    } else {
      return parseInt(str, 10);
    }
  }

  isInstructionCollapsible(tagName: string): boolean {
    return (tagName === 'Fork' || tagName === 'ForkList' || tagName === 'If' || tagName === 'Retry'
      || tagName === 'Lock' || tagName === 'Cycle' || tagName === 'Try');
  }

  checkClosingCell(tagName: string): boolean {
    return tagName === 'Join' || tagName === 'EndIf' || tagName === 'EndForkList' ||
      tagName === 'EndTry' || tagName === 'EndRetry' || tagName === 'EndCycle' || tagName === 'EndLock';
  }

  exportInPng(name, isModal = false): void {
    const dom = isModal ? $('.graph2 #graph') : $('#graph');
    let ht = $(document).height();
    let wt = $(document).width();
    if (wt < dom.first()[0].scrollWidth) {
      wt = dom.first()[0].scrollWidth;
    }
    if (ht < dom.first()[0].scrollHeight) {
      ht = dom.first()[0].scrollHeight;
    }
    let bg = dom.css('background-color');
    bg = bg.substring(0, bg.length - 4);
    saveSvgAsPng(dom.first()[0].firstChild, name + '.png', {
      backgroundColor: bg + '1)',
      height: ht + 200,
      width: wt + 200,
      left: -50,
      top: -80
    });
  }

  convertSecondIntoWeek(data, periodList, days, frequency): void {
    const hour = 3600;
    data.periods.forEach((period) => {
      const hours = (period.secondOfWeek || period.secondOfDay || 0) / hour;
      const day = Math.floor(hours / 24) + 1;
      if (frequency.days && frequency.days.indexOf(day.toString()) === -1) {
        frequency.days.push(day.toString());
      }
      const d = day - 1;
      const obj: any = {
        day,
        secondOfWeek: (d * 24 * 3600),
        frequency: days[day],
        periods: []
      };
      if (period.TYPE === 'DailyPeriod') {
        obj.frequency = '';
      }
      const startTime = (period.secondOfWeek || period.secondOfDay || 0) - obj.secondOfWeek;
      const p: any = {
        startTime,
        duration: period.duration
      };
      p.text = this.getText(p.startTime, p.duration);
      let flag = true;
      if (periodList.length > 0) {
        for (const i in periodList) {
          if (periodList[i].day == day) {
            flag = false;
            periodList[i].periods.push(p);
            break;
          }
        }
      }
      if (flag) {
        obj.periods.push(p);
        periodList.push(obj);
      }
    });
  }

  convertRepeatObject(data): any {
    const obj: any = {
      TYPE: data.TYPE
    };
    if (data.TYPE === 'Periodic') {
      if (data.offsets) {
        const arr = data.offsets.split(',');
        obj.offsets = [];
        arr.forEach(val => {
          const time = this.convertStringToDuration(val, true);
          if (obj.offsets.indexOf(time) === -1) {
            obj.offsets.push(time);
          }
        });
      }
      if (data.period) {
        obj.period = this.convertStringToDuration(data.period, true);
      }
    } else if (data.TYPE === 'Continuous') {
      if (data.pause) {
        obj.pause = this.convertStringToDuration(data.pause, true);
      }
      if (data.limit) {
        obj.limit = data.limit;
      }
    } else if (data.TYPE === 'Ticking') {
      if (data.interval) {
        obj.interval = this.convertStringToDuration(data.interval, true);
      }
    }
    return obj;
  }

  getTextOfRepeatObject(obj): any {
    let str = '';
    const returnObj: any = {
      TYPE: obj.TYPE
    };
    if (obj.TYPE === 'Periodic') {
      if (obj.period) {
        returnObj.period = this.convertDurationToHour(obj.period);
      }
      let isZero = false;
      let offsets = '';
      if (obj.offsets) {
        returnObj.offsets = '';
        obj.offsets.forEach((offset, index) => {
          if (offset === 0) {
            returnObj.offsets += '0';
            isZero = true;
          } else {
            offsets += this.convertDurationToHour(offset);
            returnObj.offsets += this.convertDurationToHour(offset);
          }
          if (index !== obj.offsets.length - 1) {
            offsets += ', ';
            returnObj.offsets += ', ';
          }
        });
      }
      this.translate.get(!obj.offsets ? 'workflow.admissionTime.label.periodicTextWithoutOffSets' :
        isZero ? 'workflow.admissionTime.label.periodicTextWithOffSetsWithZero' : 'workflow.admissionTime.label.periodicTextWithOffSetsWithoutZero', {
        period: returnObj.period,
        offsets
      }).subscribe(translatedValue => {
        str = translatedValue;
      });
    } else if (obj.TYPE === 'Continuous') {
      if (obj.pause) {
        returnObj.pause = this.convertDurationToHour(obj.pause);
        if (obj.limit) {
          returnObj.limit = obj.limit;
        }
        this.translate.get(obj.limit ? 'workflow.admissionTime.label.continuousTextWithLimit' : 'workflow.admissionTime.label.continuousTextWithoutLimit', {
          pause: returnObj.pause,
          limit: returnObj.limit,
        }).subscribe(translatedValue => {
          str = translatedValue;
        });
      }
    } else if (obj.TYPE === 'Ticking') {
      str = '';
      if (obj.interval) {
        returnObj.interval = this.convertDurationToHour(obj.interval);
        this.translate.get('workflow.admissionTime.label.tickingText', {
          interval: returnObj.interval
        }).subscribe(translatedValue => {
          str = translatedValue;
        });
      }
    }
    returnObj.text = str;
    return returnObj;
  }

  getText(startTime, dur): string {
    const time = this.convertSecondToTime(startTime);
    const duration = this.convertDurationToHour(dur);
    let str;
    this.translate.get('workflow.admissionTime.label.periodBeginText', {
      time,
      duration
    }).subscribe(translatedValue => {
      str = translatedValue;
    });
    return str;
  }

  setJobValue(val): void {
    this.jobPath = val;
  }

  getJobValue(): string {
    return this.jobPath;
  }
}
