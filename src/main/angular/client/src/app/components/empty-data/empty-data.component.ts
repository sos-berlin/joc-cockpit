import { Component, OnInit,Input } from '@angular/core';

@Component({
  selector: 'app-empty-data',
  template: `
    <nz-empty
      [nzNotFoundImage]="
        'assets/images/empty.svg'
      "
      [nzNotFoundContent]="contentTpl"
    >
      <ng-template #contentTpl>
        <span class="text-u-c" >  {{title | translate}} </span>
      </ng-template>
    </nz-empty>
  `,
})
export class EmptyDataComponent implements OnInit {

  @Input() title: string;
  constructor() { }

  ngOnInit() {
    if(!this.title){
      this.title = 'message.noDataAvailable';
    }
  }

}
