import {Component, SimpleChanges, Input} from '@angular/core';
import {NzModalRef} from "ng-zorro-antd/modal";
import {CoreService} from "../../../services/core.service";

declare const $: any;

@Component({
  selector: 'app-dependencies',
  templateUrl: './dependencies.component.html',
  styleUrl: './dependencies.component.scss'
})
export class DependenciesComponent {
  @Input() parentLoaded: boolean = false;
  @Input() schedulerId: any;
  @Input() preferences: any;
  selectedDate: Date;
  isLoaded: boolean;
  data: any;
  plansFilters: any = {filter: {}};
  constructor(public coreService: CoreService) {
  }

  ngOnInit(): void {
    const d = new Date().setHours(0, 0, 0, 0);
    this.selectedDate = new Date(d);

    this.plansFilters = this.coreService.getPlansTab();
    this.loadPlans()
    this.initConf();

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['parentLoaded'] && changes['parentLoaded'].currentValue) {
      setTimeout(() => {
        this.initConf();
      },300)
    }
  }

  ngOnDestroy(): void {
    this.plansFilters.selectedDate = this.selectedDate;
  }

  private initConf(): void {
    if (this.plansFilters.selectedDate) {
      this.selectedDate = this.plansFilters.selectedDate;
    } else {
      const d = new Date().setHours(0, 0, 0, 0);
      this.selectedDate = new Date(d);
    }
    setTimeout(() => {
      const dom = $('#full-calendar2');
      if (!dom.data('calendar')) {
        dom.calendar({
          view: 'month',
          language: this.coreService.getLocale(),
          selectedDate: this.selectedDate,
          clickDay: (e) => {
            this.selectedDate = e.date;
            this.loadPlans()
          },
          renderEnd: (e) => {

          },
          rangeEnd: (e) => {

          }
        });
      }
    }, 100)
  }

  loadPlans(): void {
    this.isLoaded = false;
    let planIds
    if(this.plansFilters.filter.calView === 'Plannable'){
      planIds = 'DailyPlan'
    }else{
      planIds = 'Global';
    }
    this.coreService.post('plans', {
      controllerId: this.schedulerId,
      planKeys: [this.coreService.getDateByFormat(this.selectedDate, this.preferences.zone, 'YYYY-MM-DD')],
      planSchemaIds: [planIds],
    }).subscribe((res) => {
      this.data = res
      this.isLoaded = true;
    });
  }

  setView(view): void {
    this.plansFilters.filter.calView = view;
    this.loadPlans();
  }
}
