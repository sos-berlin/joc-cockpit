import {Component, ElementRef, inject} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef, NzModalService} from "ng-zorro-antd/modal";
import {Subscription} from "rxjs";
import html2canvas from 'html2canvas';
import {jsPDF} from 'jspdf';
import {CoreService} from "../../services/core.service";
import {GroupByPipe} from "../../pipes/core.pipe";
import {AuthService} from "../../components/guard";
import {DataService} from "../../services/data.service";


@Component({
  selector: 'app-run-modal-content',
  templateUrl: './run-dialog.html'
})
export class RunModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  submitted: any
  object: any = {
    name: '',
    size: 10,
  };
  dateFormat: any;
  isSync: boolean;
  today = new Date();
  templates = [];
  frequencies = [
    {name: 'WEEKLY'},
    {name: 'TWO_WEEKS'},
    {name: 'MONTHLY'},
    {name: 'THREE_MONTHS'},
    {name: 'SIX_MONTHS'},
    {name: 'YEARLY'},
    {name: 'THREE_YEARS'}
  ];

  constructor(public activeModal: NzModalRef, private coreService: CoreService) {
  }

  ngOnInit(): void {
    this.templates = this.modalData.templates;
    this.isSync = this.modalData.isSync;
    const preferences = this.modalData.preferences;
    this.dateFormat = this.coreService.getDateFormat(preferences.dateFormat);
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.isSync) {
      this.coreService.plainData('reporting/data/load', {
        dateFrom: this.coreService.getStringDate(this.object.dateFrom)
      }).subscribe({
        next: () => {
          this.coreService.startDataDownload();
          this.activeModal.close('Done');
        }, error: (err) => {
          console.log(err)
          this.submitted = false;
        }
      });
      return;
    }
    const obj: any = {
      name: this.object.name,
      title: this.object.title,
      templateId: this.object.templateId,
      size: this.object.size,
      frequencies: this.object.frequencies
    };
    if (this.object.dateFrom) {
      obj.dateFrom = this.coreService.getStringDate(this.object.dateFrom)
    }
    this.coreService.post('reporting/report/run', obj).subscribe({
      next: (res) => {
        console.log(res)
        this.coreService.startReport();
        this.activeModal.close('Done');
        this.submitted = false;
      }, error: (err) => {
        console.log(err)
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
  isLoading: boolean;

  dateFormat: string;

  filter: any = {};
  data: any = [];

  loading = false;

  templates = [
    {
      title: 'Top ${size} frequently failed workflows',
      id: '1',
      data: {
        chartType: 'Line',
        groupBy: 'WORKFLOW'
      }
    },
    {
      title: 'Top ${size} frequently failed jobs',
      id: '2',
      data: {
        chartType: 'Bar',
        groupBy: 'START_TIME'
      }
    },
    {
      title: 'Top ${size} with most parallel job execution',
      id: '3',
      data: {
        chartType: 'Bar',
        groupBy: 'START_TIME'
      }
    },
    {
      title: 'Top ${size} periods of low and high parallelism of job executions',
      id: '4',
      data: {
        chartType: 'Line',
        groupBy: 'JOB_NAME'
      }
    },
    {
      title: 'Total number of job executions per frequency',
      id: '5',
      data: {
        chartType: 'Line',
        groupBy: 'JOB_NAME'
      }
    },
    {
      title: 'Total number of order executions per frequency',
      id: '6',
      data: {
        chartType: 'Line',
        groupBy: 'ORDER_ID'
      }
    },
    {
      title: 'Top ${size} workflows with the longest execution time',
      id: '7',
      data: {
        chartType: 'Line',
        groupBy: 'ORDER_ID'
      }
    },
    {
      title: 'Top ${size} jobs with the longest execution time',
      id: '8',
      data: {
        chartType: 'BAR',
        isFailed: true,
        groupBy: 'JOB_NAME'
      }
    },
    {
      title: 'Top ${size} periods during which mostly orders executed',
      id: '9',
      data: {
        chartType: 'BAR',
        isFailed: true,
        groupBy: 'JOB_NAME'
      }
    },
    {
      title: 'The period during which jobs are mostly executed',
      id: '10',
      data: {
        chartType: 'BAR',
        groupBy: 'AGENT_NAME'
      }
    }];

  index: number;

  subscription: Subscription;


  constructor(private modal: NzModalService, private coreService: CoreService, private groupBy: GroupByPipe,
              private authService: AuthService, private dataService: DataService, private elementRef: ElementRef) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
  }

  ngOnInit(): void {
    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
    this.permission = JSON.parse(this.authService.permission) || {};
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.filter = this.coreService.getReportingTab();
    this.index = this.filter.tabIndex || 0;
  }


  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  tabChange($event): void {
    this.filter.tabIndex = $event.index;
  }


  private refresh(args: { eventSnapshots: any[] }): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {

      }
    }
  }


  shareReport() {
    const element = this.elementRef.nativeElement
    this.modal.create({
      nzTitle: undefined,
      nzContent: ShareModalComponent,
      nzClassName: 'lg',
      nzData: {content: element},
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  downloadReport() {
    this.modal.create({
      nzTitle: undefined,
      nzContent: RunModalComponent,
      nzFooter: null,
      nzAutofocus: null,
      nzData: {templates: this.templates, preferences: this.preferences, isSync: true},
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  runReport() {
    this.modal.create({
      nzTitle: undefined,
      nzContent: RunModalComponent,
      nzClassName: 'lg',
      nzFooter: null,
      nzAutofocus: null,
      nzData: {templates: this.templates, preferences: this.preferences},
      nzClosable: false,
      nzMaskClosable: false
    });
  }

}
