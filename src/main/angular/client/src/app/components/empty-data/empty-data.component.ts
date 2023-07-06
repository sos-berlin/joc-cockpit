import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-empty-data',
  template: `
    <nz-empty
      [nzNotFoundImage]="
        'assets/images/empty.svg'
      "
      [nzNotFoundContent]="contentTpl"
      title="">
      <ng-template #contentTpl>
        <span class="text-u-c">  {{title | translate}} </span>
      </ng-template>
    </nz-empty>
  `,
})
export class EmptyDataComponent {
  @Input() title: string;

  ngOnInit(): void {
    if (!this.title) {
      this.title = 'common.message.noDataAvailable';
    }
  }
}
