import { Component, OnInit } from '@angular/core';

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
        <span class="text-u-c" >  {{'message.noDataAvailable' | translate}} </span>
      </ng-template>
    </nz-empty>
  `,
})
export class EmptyDataComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
