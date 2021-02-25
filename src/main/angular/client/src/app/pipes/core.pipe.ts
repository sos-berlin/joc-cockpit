import {Pipe, PipeTransform} from '@angular/core';
import * as moment from 'moment-timezone';
import {DomSanitizer} from '@angular/platform-browser';

@Pipe({
  name: 'stringToDate'
})
export class StringDatePipe implements PipeTransform {
  transform(date): string {
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
  name: 'stringToTime'
})
export class StringTimePipe implements PipeTransform {
  transform(date): string {
    if (!date) {
      return '-';
    }
    if (sessionStorage.preferences) {
      const n = JSON.parse(sessionStorage.preferences);
      if (!n.zone) {
        return;
      }
      return moment(date).tz(n.zone).format('HH:mm:ss');
    } else {
      return moment(date).format('HH:mm:ss');
    }
  }
}

@Pipe({
  name: 'stringToDate1'
})
export class StringDateFormatePipe implements PipeTransform {
  transform(t: string): string {
    if (sessionStorage.preferences) {
      if (!t) {
        return '-';
      }
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
  name: 'timeInString',
  pure: false
})
export class TimeInStringFormatPipe implements PipeTransform {
  transform(t: any): string {
    if (sessionStorage.preferences) {
      if (!t) {
        return '-';
      }
      const r = JSON.parse(sessionStorage.preferences);
      if (!r.zone) {
        return;
      }
      let n = moment(new Date()).tz(r.zone);
      t = moment(t).tz(r.zone);

      let o = moment(t).diff(n);
      let minius = false;
      if (o < 0) {
        minius = true;
      }
      o = Math.abs(o);
      if (o >= 1e3) {
        const i = parseInt(((o / 1e3) % 60).toString(), 10),
          a = parseInt(((o / 6e4) % 60).toString(), 10), s = parseInt(((o / 36e5) % 24).toString(), 10),
          f = parseInt((o / 864e5).toString(), 10);
        let i1 = i > 9 ? i : '0' + i;
        let a1 = a > 9 ? a : '0' + a;
        let s1 = s > 9 ? s : '0' + s;
        if (f === 0 && s !== 0) {
          return (minius ? '-' : '') + s1 + ':' + a1 + 'h';
        } else if (s === 0 && a !== 0) {
          if (f === 1) {
            return (minius ? '-' : '') + (f * 24) + ':' + a1 + 'h';
          }
          if (f > 1) {
            return (minius ? '-' : '') + f + 'days';
          } else {
            return (minius ? '-' : '') + a1 + ':' + i1 + 'min';
          }
        } else if (f === 0 && s === 0 && a === 0) {
          return (minius ? '-' : '') + i1 + 'sec';
        } else {
          if (f > 1) {
            return (minius ? '-' : '') + f + 'days';
          } else {
          }
          return (minius ? '-' : '') + f + 'day';
        }
      }
      return '1sec';
    }
  }
}

@Pipe({
  name: 'duration'
})
export class DurationPipe implements PipeTransform {
  transform(n: any, r: any): string {
    if (!n || !r) {
      return '-';
    }
    n = moment(n);
    r = moment(r);
    const i = moment(r).diff(n);
    if (i >= 1e3) {
      let a = parseInt((i / 1e3 % 60).toString(), 10), s = parseInt((i / 6e4 % 60).toString(), 10),
        f = parseInt((i / 36e5 % 24).toString(), 10), u = parseInt((i / 864e5).toString(), 10);
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
    if (e == 0) {
      return '0 Byte';
    }
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

@Pipe({
  name: 'filter'
})
export class SearchPipe implements PipeTransform {

  static filter(items: Array<{ [key: string]: any }>, searchKey: string, includes: any): Array<{ [key: string]: any }> {
    const n = JSON.parse(sessionStorage.preferences);
    const toCompare = searchKey.toLowerCase();

    function checkInside(item: any, term: string) {

      if (typeof item === 'string' && item.toString().toLowerCase().includes(toCompare)) {
        return true;
      }
      for (let property in item) {
        if (Array.isArray(item)) {
          if (item[property] && item[property].toString().toLowerCase().includes(toCompare)) {
            return true;
          }
        }
        if (item[property] === null || item[property] == undefined || !includes.includes(property)) {
          continue;
        }
        if (typeof property === 'string' && (property.match(/date/i) || property.match(/created/i))) {
          if (n.zone) {
            const d = moment(item[property]).tz(n.zone).format(n.dateFormat);
            if (typeof d === 'string' && d.toString().toLowerCase().includes(toCompare)) {
              return true;
            }
          }
        }
        if (typeof item[property] === 'object') {
          if (checkInside(item[property], term)) {
            return true;
          }
        } else if (item[property].toString().toLowerCase().includes(toCompare)) {
          return true;
        }
      }
      return false;
    }

    return items.filter(function (item) {
      return checkInside(item, searchKey);
    });
  }

  /**
   * @param items object from array
   * @param searchKey to match
   * @param includes array of strings which will ignored during search
   */
  transform(items: any, searchKey: string, includes: any = []): any {
    if (!searchKey || !items) {
      return items;
    }

    return SearchPipe.filter(items, searchKey, includes);
  }
}

@Pipe({
  name: 'highlight'
})
export class HighlightSearch implements PipeTransform {

  transform(value: any, args: any): any {
    if (!args) {
      return value;
    }
    if (typeof value === 'string') {
      return value.replace(new RegExp(args, 'gi'),
        '<span class="highlighted">$&</span>');
    } else {
      return value;
    }
  }
}
