import { NgModule } from '@angular/core';
import { ChartCommonModule } from '../common/chart-common.module';
import { PieLabelComponent } from './pie-label.component';
import { PieArcComponent } from './pie-arc.component';
import { PieChartComponent } from './pie-chart.component';
import { PieSeriesComponent } from './pie-series.component';

@NgModule({
  imports: [ChartCommonModule],
  declarations: [
    PieLabelComponent,
    PieArcComponent,
    PieChartComponent,
    PieSeriesComponent
  ],
  exports: [
    PieLabelComponent,
    PieArcComponent,
    PieChartComponent,
    PieSeriesComponent
  ]
})
export class PieChartModule {}
