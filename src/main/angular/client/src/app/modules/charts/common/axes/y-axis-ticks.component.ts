import {
  Component,
  Input,
  Output,
  OnChanges,
  ElementRef,
  ViewChild,
  EventEmitter,
  AfterViewInit,
  ChangeDetectionStrategy,
  SimpleChanges,
  PLATFORM_ID,
  Inject
} from '@angular/core';
import {trimLabel} from '../trim-label.helper';
import {reduceTicks} from './ticks.helper';
import {roundedRect} from '../shape.helper';
import {isPlatformBrowser} from '@angular/common';
import {Orientation} from '../types/orientation.enum';
import {TextAnchor} from '../types/text-anchor.enum';

@Component({
  standalone: false,
  selector: 'g[ngx-charts-y-axis-ticks]',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg">
      <g #ticksel>
        @for (tick of ticks; track tick) {
          <g class="tick" [attr.transform]="transform(tick)">
            <title>{{ tickFormat(tick) }}</title>
            <text
              stroke-width="0.01"
              [attr.dy]="dy"
              [attr.x]="x1"
              [attr.y]="y1"
              [attr.text-anchor]="textAnchor"
              [style.font-size]="'12px'"
            >
              {{ tickTrim(tickFormat(tick)) }}
            </text>
          </g>
        }
      </g>

      @if (referenceLineLength > 1 && refMax && refMin && showRefLines) {
        <path
          class="reference-area"
          [attr.d]="referenceAreaPath"
          [attr.transform]="gridLineTransform()"
        />
      }
      @for (tick of ticks; track tick) {
        <g [attr.transform]="transform(tick)">
          @if (showGridLines) {
            <g [attr.transform]="gridLineTransform()">
              @if (orient === Orientation.Left) {
                <line
                  class="gridline-path gridline-path-horizontal"
                  x1="0"
                  [attr.x2]="gridLineWidth"
                />
              }
              @if (orient === Orientation.Right) {
                <line
                  class="gridline-path gridline-path-horizontal"
                  x1="0"
                  [attr.x2]="-gridLineWidth"
                />
              }
            </g>
          }
        </g>
      }

      @for (refLine of referenceLines; track refLine) {
        @if (showRefLines) {
          <g [attr.transform]="transform(refLine.value)">
            <line
              class="refline-path gridline-path-horizontal"
              x1="0"
              [attr.x2]="gridLineWidth"
              [attr.transform]="gridLineTransform()"
            />
            @if (showRefLabels) {
              <g>
                <title>{{ tickTrim(tickFormat(refLine.value)) }}</title>
                <text
                  class="refline-label"
                  [attr.dy]="dy"
                  [attr.y]="-6"
                  [attr.x]="gridLineWidth"
                  [attr.text-anchor]="textAnchor"
                >
                  {{ refLine.name }}
                </text>
              </g>
            }
          </g>
        }
      }
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class YAxisTicksComponent implements OnChanges, AfterViewInit {
  @Input() scale;
  @Input() orient: Orientation;
  @Input() tickArguments: number[] = [5];
  @Input() tickValues: string[] | number[];
  @Input() tickStroke = '#ccc';
  @Input() trimTicks: boolean = true;
  @Input() maxTickLength: number = 16;
  @Input() tickFormatting;
  @Input() showGridLines: boolean = false;
  @Input() gridLineWidth: number;
  @Input() height: number;
  @Input() referenceLines;
  @Input() showRefLabels: boolean = false;
  @Input() showRefLines: boolean = false;
  @Input() doubleSideAxis: boolean = false;

  @Output() dimensionsChanged = new EventEmitter();

  innerTickSize: number = 6;
  tickPadding: number = 3;
  tickSpacing: number;
  textAnchor: TextAnchor = TextAnchor.Middle;
  dy: string;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  adjustedScale: any;
  transform: (o: any) => string;
  tickFormat: (o: any) => string;
  ticks: any[];
  width: number = 0;
  refMax: number;
  refMin: number;
  referenceLineLength: number = 0;
  referenceAreaPath: string;

  readonly Orientation = Orientation;

  @ViewChild('ticksel') ticksElement: ElementRef;

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.update();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.updateDims());
  }

  updateDims(): void {
    if (!isPlatformBrowser(this.platformId)) {
      // for SSR, use approximate value instead of measured
      this.width = this.getApproximateAxisWidth();
      this.dimensionsChanged.emit({width: this.width});
      return;
    }

    const width = parseInt(this.ticksElement.nativeElement.getBoundingClientRect().width, 10);
    if (width !== this.width) {
      this.width = width;
      this.dimensionsChanged.emit({width});
      setTimeout(() => this.updateDims());
    }
  }

  update(): void {
    const scale = this.scale;
    const sign = this.orient === Orientation.Top || this.orient === Orientation.Right ? -1 : 1;
    this.tickSpacing = Math.max(this.innerTickSize, 0) + this.tickPadding;

    this.ticks = this.getTicks();

    if (this.tickFormatting) {
      this.tickFormat = this.tickFormatting;
    } else if (scale.tickFormat) {
      // eslint-disable-next-line prefer-spread
      this.tickFormat = scale.tickFormat.apply(scale, this.tickArguments);
    } else {
      this.tickFormat = function (d) {
        if (d.constructor.name === 'Date') {
          return d.toLocaleDateString();
        }
        return d.toLocaleString();
      };
    }

    this.adjustedScale = scale.bandwidth
      ? function (d) {
        return scale(d) + scale.bandwidth() * 0.5;
      }
      : scale;

    if (this.showRefLines && this.referenceLines) {
      this.setReferencelines();
    }

    switch (this.orient) {
      case Orientation.Top:
        this.transform = function (tick) {
          return 'translate(' + this.adjustedScale(tick) + ',0)';
        };
        this.textAnchor = TextAnchor.Middle;
        this.y2 = this.innerTickSize * sign;
        this.y1 = this.tickSpacing * sign;
        this.dy = sign < 0 ? '0em' : '.71em';
        break;
      case Orientation.Bottom:
        this.transform = function (tick) {
          return 'translate(' + this.adjustedScale(tick) + ',0)';
        };
        this.textAnchor = TextAnchor.Middle;
        this.y2 = this.innerTickSize * sign;
        this.y1 = this.tickSpacing * sign;
        this.dy = sign < 0 ? '0em' : '.71em';
        break;
      case Orientation.Left:
        this.transform = function (tick) {
          return 'translate(0,' + (this.adjustedScale(tick) + (this.doubleSideAxis ? 10 : 0)) + ')';
        };
        this.textAnchor = TextAnchor.End;
        this.x2 = this.innerTickSize * -sign;
        this.x1 = this.tickSpacing * -sign;
        this.dy = '.32em';
        break;
      case Orientation.Right:
        this.transform = function (tick) {
          return 'translate(0,' + this.adjustedScale(tick) + ')';
        };
        this.textAnchor = TextAnchor.Start;
        this.x2 = this.innerTickSize * -sign;
        this.x1 = this.tickSpacing * -sign;
        this.dy = '.32em';
        break;
      default:
    }
    setTimeout(() => this.updateDims());
  }

  setReferencelines(): void {
    this.refMin = this.adjustedScale(
      Math.min.apply(
        null,
        this.referenceLines.map(item => item.value)
      )
    );
    this.refMax = this.adjustedScale(
      Math.max.apply(
        null,
        this.referenceLines.map(item => item.value)
      )
    );
    this.referenceLineLength = this.referenceLines.length;

    this.referenceAreaPath = roundedRect(0, this.refMax, this.gridLineWidth, this.refMin - this.refMax, 0, [
      false,
      false,
      false,
      false
    ]);
  }

  getTicks(): any[] {
    let ticks;
    const maxTicks = this.getMaxTicks(20);
    const maxScaleTicks = this.getMaxTicks(50);

    if (this.tickValues) {
      ticks = this.tickValues;
    } else if (this.scale.ticks) {
      ticks = this.scale.ticks.apply(this.scale, [maxScaleTicks]);
    } else {
      ticks = this.scale.domain();
      ticks = reduceTicks(ticks, maxTicks);
    }

    return ticks;
  }

  getMaxTicks(tickHeight: number): number {
    return Math.floor(this.height / tickHeight);
  }

  gridLineTransform(): string {
    return `translate(5,0)`;
  }

  tickTrim(label: string): string {
    return this.trimTicks ? trimLabel(label, this.maxTickLength) : label;
  }

  getApproximateAxisWidth(): number {
    const maxChars = Math.max(...this.ticks.map(t => this.tickTrim(this.tickFormat(t)).length));
    const charWidth = 7;
    return maxChars * charWidth;
  }
}
