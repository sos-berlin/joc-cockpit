import {Component, SimpleChanges, Input } from '@angular/core';
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
  selectedDate: Date;

  constructor(public coreService: CoreService) {
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['parentLoaded'] && changes['parentLoaded'].currentValue) {
      console.log("Parent loaded detected in child...");
      this.initConf();
    }
  }

  private initConf(): void {
    const d = new Date().setHours(0, 0, 0, 0);
    this.selectedDate = new Date(d);
    console.log(this.selectedDate, ">>>")
    setTimeout(() => {
      const dom = $('#full-calendar2');
      console.log(dom, "ddd")
      if (!dom.data('calendar')) {
        dom.calendar({
          view: 'month',
          language: this.coreService.getLocale(),
          selectedDate: this.selectedDate,
          clickDay: (e) => {


          },
          renderEnd: (e) => {

          },
          rangeEnd: (e) => {

          }
        });
      }
    }, 2000)
  }
}
