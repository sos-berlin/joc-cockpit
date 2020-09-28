import {Pipe, PipeTransform} from '@angular/core';
import * as moment from 'moment-timezone';
import {DomSanitizer} from '@angular/platform-browser';

@Pipe({
  name: 'stringToDate'
})
export class StringDatePipe implements PipeTransform {
  transform(date) {
    if (!date) {
      return '-';
    }
    if (sessionStorage.preferences) {
      const n = JSON.parse(sessionStorage.preferences);
      if (!n.zone) {
        return;
      }
      return moment(date).tz(n.zone).format(n.dateFormat);
    } else {
      return moment(date).format('DD.MM.YYYY HH:mm:ss');
    }
  }
}

@Pipe({
  name: 'stringToDate1'
})
export class StringDateFormatePipe implements PipeTransform {
  transform(t: string): string {
    if (sessionStorage.preferences) {
      if (!t) return '-';
      const n = JSON.parse(sessionStorage.preferences);
      if (!n.zone) {
        return;
      }
      if (n.dateFormat.match('HH:mm')) {
        n.dateFormat = n.dateFormat.replace('HH:mm', '');
      } else if (n.dateFormat.match('hh:mm')) {
        n.dateFormat = n.dateFormat.replace('hh:mm', '');
      }

      if (n.dateFormat.match(':ss')) {
        n.dateFormat = n.dateFormat.replace(':ss', '');
      }
      if (n.dateFormat.match('A')) {
        n.dateFormat = n.dateFormat.replace('A', '');
      }
      if (n.dateFormat.match('|')) {
        n.dateFormat = n.dateFormat.replace('|', '');
      }
      n.dateFormat = n.dateFormat.trim();
      return moment(t).tz(n.zone).format(n.dateFormat);
    }
  }
}

@Pipe({
  name: 'duration'
})
export class DurationPipe implements PipeTransform {
  transform(n: any, r: any): string {
    if (sessionStorage.preferences) {
      if (!n || !r) return '-';
      const o = JSON.parse(sessionStorage.preferences);
      n = moment(n).tz(o.zone);
      r = moment(r).tz(o.zone);
      const i = moment(r).diff(n);
      if (i >= 1e3) {
        let a = i / 1e3 % 60, s = i / 6e4 % 60,
        f = i / 36e5 % 24, u = i / 864e5;
        if (u > 0) {
          if (u === 1 && f === 0) {
            return '24h ' + s + 'm ' + a + 's';
          } else {
            return u + 'd ' + f + 'h ' + s + 'm ' + a + 's';
          }
        }
        return 0 == u && 0 != f ? f + 'h ' + s + 'm ' + a + 's' : 0 == f && 0 != s ? s + 'm ' + a + 's' : 0 == u && 0 == f && 0 == s ? a + ' sec' : u + 'd ' + f + 'h ' + s + 'm ' + a + 's';
      }
      return '< 1 sec';
    }
  }
}

@Pipe({
  name: 'convertTime'
})
export class ConvertTimePipe implements PipeTransform {
  transform(e: any): string {
    e = parseInt(e, 10);
    let t = (e % 60), n = (e / 60 % 60), r = (e / 3600 % 24);
    let r1 = r > 9 ? r : '0' + r;
    let n1 = n > 9 ? n : '0' + n;
    let t1 = t > 9 ? t : '0' + t;
    return r1 + ':' + n1 + ':' + t1;
  }
}

@Pipe({
  name: 'durationFromCurrent'
})
export class DurationFromCurrentPipe implements PipeTransform {
  transform(n: any, r: any): string {
    if ((n || (n = new Date)) && (r || (r = new Date)) && sessionStorage.preferences) {
      const o = JSON.parse(sessionStorage.preferences);
      n = moment(n).tz(o.zone);
      r = moment(r).tz(o.zone);
      let i: number = Math.abs(moment(r).diff(n));
      if (i >= 1e3) {
        let a = (i / 1e3 % 60), s = (i / 6e4 % 60), f = (i / 36e5 % 24), u = (i / 864e5);
        let a1 = a > 9 ? a : '0' + a;
        let s1 = s > 9 ? s : '0' + s;
        let f1 = f > 9 ? f : '0' + f;
        return 0 == u && 0 != f1 ? f1 + ':' + s1 + ':' + a1 + 'h' : 0 == f1 && 0 != s1 ? s1 + ':' + a1 + 'min' : 0 == u && 0 == f1 && 0 == s1 ? a1 + 'sec' : u > 1 ? u + 'days' : u + 'day';
      }
      return 'never';
    }
  }
}

@Pipe({
  name: 'decodeSpace'
})
export class DecodeSpacePipe implements PipeTransform {
  transform(e: string): string {
    return e ? e.replace(/%20/g, '&nbsp;') : '';
  }
}

@Pipe({
  name: 'byteToSize'
})
export class ByteToSizePipe implements PipeTransform {
  transform(e: any): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    e = parseInt(e, 10);
    if (e == 0) return '0 Byte';
    const i: number = Math.floor(Math.log(e) / Math.log(1024));
    return parseFloat((e / Math.pow(1024, i)).toString()).toFixed(2) + ' ' + sizes[i];
  }
}

@Pipe({name: 'groupBy'})
export class GroupByPipe implements PipeTransform {
  transform(value: Array<any>, field: string): Array<any> {
    const groupedObj = value.reduce((prev, cur) => {
      if (!prev[cur[field]]) {
        prev[cur[field]] = [cur];
      } else {
        prev[cur[field]].push(cur);
      }
      return prev;
    }, {});
    return Object.keys(groupedObj).map(key => ({key, value: groupedObj[key]}));
  }
}


@Pipe({name: 'safeHtml'})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitized: DomSanitizer) {
  }

  transform(value) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}
