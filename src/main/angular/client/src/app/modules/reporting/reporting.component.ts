import {Component, inject} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef, NzModalService} from "ng-zorro-antd/modal";
import html2canvas from 'html2canvas';
import {jsPDF} from 'jspdf';
import {CoreService} from "../../services/core.service";
import {GroupByPipe} from "../../pipes/core.pipe";
import {AuthService} from "../../components/guard";
import {SharingDataService} from "./sharing-data.service";

@Component({
  selector: 'app-run-modal-content',
  templateUrl: './run-dialog.html'
})
export class RunModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  submitted = false;
  display = false;
  required = false;
  comments: any = {};
  reportPaths = [];

  constructor(public activeModal: NzModalRef, private coreService: CoreService) {
  }

  ngOnInit(): void {
    this.reportPaths = this.modalData.reportPaths;
    this.comments.radio = 'predefined';
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.required = true;
      this.display = true;
    } else {
      this.display = this.modalData.preferences.auditLog;
    }
  }

  onSubmit(): void {
    this.submitted = true;
    const obj: any = {
      reportPaths: this.reportPaths,
      auditLog: {}
    };
    this.coreService.getAuditLogObj(this.comments, obj.auditLog);
    this.coreService.post('reporting/reports/run', obj).subscribe({
      next: () => {
        this.coreService.startReport();
        this.activeModal.close('Done');
        this.submitted = false;
      }, error: () => {
        this.submitted = false;
      }
    })
  }
}

@Component({
  selector: 'app-share-modal-content',
  templateUrl: './share-dialog.html',
  styleUrls: ['./reporting.component.scss']
})
export class ShareModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  submitted: any
  imageUrl: string | undefined;
  loading: boolean = false;

  constructor(public activeModal: NzModalRef) {
  }

  ngOnInit(): void {
    this.imageUrl = this.modalData;
  }

  private async getImage() {
    this.loading = true;
    // Get DOM elements
    const contentElement = this.modalData.content.querySelector('#content');
    const innerData1Element = this.modalData.content.querySelector('.table-responsive');
    const innerData2Element = this.modalData.content.querySelector('.table-responsive2');

    const initialMaxHeightContent = contentElement.style.maxHeight;
    const initialMaxHeightInnerData1 = innerData1Element.style.maxHeight;
    const initialMaxHeightInnerData2 = innerData2Element.style.maxHeight;

    // Set maxHeight to inherit for capturing full content
    contentElement.style.maxHeight = 'inherit';
    innerData1Element.style.maxHeight = 'inherit';
    innerData2Element.style.maxHeight = 'inherit';

    // Create canvas from HTML content
    const canvas = await html2canvas(contentElement, {
      scale: 1
    });

    // Restore initial maxHeight values
    contentElement.style.maxHeight = initialMaxHeightContent;
    innerData1Element.style.maxHeight = initialMaxHeightInnerData1;
    innerData2Element.style.maxHeight = initialMaxHeightInnerData2;

    // Create PDF
    const pdf = new jsPDF();
    const pageWidth = 210; // Width of A4 page in mm
    const pageHeight = (canvas.height * pageWidth) / canvas.width; // Maintain aspect ratio
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pageWidth, pageHeight);

    // Save PDF
    pdf.save('report.pdf');
    this.imageUrl = canvas.toDataURL('image/png');
    this.loading = false;
  }

  onSubmit(): void {
  }
}

@Component({
  selector: 'app-reporting',
  templateUrl: './reporting.component.html',
  styleUrls: ['./reporting.component.scss']
})
export class ReportingComponent {

  preferences: any = {};
  permission: any = {};

  dateFormat: string;

  filter: any = {};
  data: any = [];

  loading = false;
  display = false;

  templates = [];

  index: number;


  constructor(private modal: NzModalService, private coreService: CoreService, private groupBy: GroupByPipe,
              private authService: AuthService, private sharingDataService: SharingDataService) {
  }

  ngOnInit(): void {
    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
    this.permission = JSON.parse(this.authService.permission) || {};
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.filter = this.coreService.getReportingTab();
    this.index = this.filter.tabIndex || 0;
    this.getTemplates();
  }

  private getTemplates(): void {
    this.coreService.post('reporting/templates', {}).subscribe({
      next: (res: any) => {
        this.loading = true;
        this.templates = res.templates;
      }, error: () => this.loading = true
    });
  }


  receiveMessage($event: any): void {
    this.sharingDataService.announceFunction({pageView : $event});
  }

  searchInResult(searchKey) {
    this.sharingDataService.announceSearchKey(searchKey);
  }

  search(): void{
    this.sharingDataService.announceFunction({search : true});
  }

  sort(sortBy): void{
    this.filter.manageList.filter.sortBy = sortBy;
    this.sharingDataService.announceFunction({sortBy : sortBy});
  }

  runReport() {
    this.sharingDataService.announceFunction({run : true});
  }

  checkRunBtn(data): void{
    this.display = data.display;
  }

}
