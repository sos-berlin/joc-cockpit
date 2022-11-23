import {NgModule} from '@angular/core';
import {ChartCommonModule} from './common/chart-common.module';
import {BarChartModule} from './bar-chart/bar-chart.module';
import {PieChartModule} from './pie-chart/pie-chart.module';

@NgModule({
  exports: [
    ChartCommonModule,
    BarChartModule,
    PieChartModule
  ]
})
export class ChartsModule {
  constructor() {
  }
}
