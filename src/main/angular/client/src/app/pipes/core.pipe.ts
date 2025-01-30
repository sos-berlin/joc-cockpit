import {Pipe, PipeTransform} from '@angular/core';
import * as moment from 'moment-timezone';
import {DomSanitizer} from '@angular/platform-browser';

@Pipe({
  name: 'preferredDate'
})
export class PreferredDatePipe implements PipeTransform {
  transform(date: string): string {
    return convertToPreferredTimeZone(date);
  }
}

function convertToPreferredTimeZone(date: string): string {
  if (!date) {
    return '-';
  }

  const preferences = sessionStorage.getItem('preferences');
  if (preferences) {
    const n = JSON.parse(preferences);
    if (!n.zone) {
      return '';
    }
    const inputFormat = 'YYYY-MM-DD HH:mm:ss';
    const dateMoment = moment.utc(date, inputFormat);
    const preferredDate = dateMoment.tz(n.zone);
    return preferredDate.format(n.dateFormat);
  } else {
    return moment.utc(date).format('DD.MM.YYYY HH:mm:ss');
  }
}

@Pipe({
  name: 'stringToDate'
})
export class StringDatePipe implements PipeTransform {
  transform(date: string): string {
    if (!date) {
      return '-';
    }
    if (sessionStorage['preferences']) {
      const n = JSON.parse(sessionStorage['preferences']);
      if (!n.zone) {
        return '';
      }
      const dateY = new Date(date);
      if (dateY.getFullYear() === 10000) {
        return 'common.label.never'
      } else {
        return moment(date).tz(n.zone).format(n.dateFormat);
      }
    } else {
      return moment(date).format('DD.MM.YYYY HH:mm:ss');
    }
  }
}

@Pipe({
  name: 'stringToTime'
})
export class StringTimePipe implements PipeTransform {
  transform(date: string): string {
    if (!date) {
      return '-';
    }
    if (sessionStorage['preferences']) {
      const n = JSON.parse(sessionStorage['preferences']);
      if (!n.zone) {
        return '';
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
  transform(t: string, skip = false): string {
    if (sessionStorage['preferences']) {
      if (!t) {
        return '-';
      }
      const n = JSON.parse(sessionStorage['preferences']);
      if (!n.zone) {
        return t;
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

      if (skip) {
        return moment(t).format(n.dateFormat);
      } else {
        return moment(t).tz(n.zone).format(n.dateFormat);
      }
    } else {
      return t;
    }
  }
}

@Pipe({
  name: 'timeInString',
  pure: false
})
export class TimeInStringFormatPipe implements PipeTransform {
  transform(t: any): string {
    if (sessionStorage['preferences']) {
      if (!t) {
        return '-';
      }
      const r = JSON.parse(sessionStorage['preferences']);
      if (!r.zone) {
        return '';
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
        const i = parseInt(((o / 1e3) % 60).toString(), 10);
        const a = parseInt(((o / 6e4) % 60).toString(), 10);
        const s = parseInt(((o / 36e5) % 24).toString(), 10);
        const f = parseInt((o / 864e5).toString(), 10);
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
    } else {
      return '';
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
    let t = (e % 60);
    let n = (e / 60 % 60);
    let r = (e / 3600 % 24);
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
    if ((n || (n = new Date)) && (r || (r = new Date)) && sessionStorage['preferences']) {
      const o = JSON.parse(sessionStorage['preferences']);
      n = moment(n).tz(o.zone);
      r = moment(r).tz(o.zone);
      let i: number = Math.abs(moment(r).diff(n));
      if (i >= 1e3) {
        let a = (i / 1e3 % 60);
        let s = (i / 6e4 % 60);
        let f = (i / 36e5 % 24);
        let u = (i / 864e5);
        let a1 = a > 9 ? a : '0' + a;
        let s1 = s > 9 ? s : '0' + s;
        let f1 = f > 9 ? f : '0' + f;
        return 0 == u && 0 != f1 ? f1 + ':' + s1 + ':' + a1 + 'h' : 0 == f1 && 0 != s1 ? s1 + ':' + a1 + 'min' : 0 == u && 0 == f1 && 0 == s1 ? a1 + 'sec' : u > 1 ? u + 'days' : u + 'day';
      }
      return 'never';
    } else {
      return '';
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

  transform(value: string): any {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}

@Pipe({
  name: 'filter'
})
export class SearchPipe implements PipeTransform {

  static filter(items: Array<{ [key: string]: any }>, searchKey: string, includes: any): Array<{ [key: string]: any }> {
    const n = JSON.parse(sessionStorage['preferences']);
    const toCompare = searchKey.toLowerCase();

    function checkInside(item: any, term: string) {

      if (typeof item === 'string' && item.toString().toLowerCase().includes(toCompare)) {
        return true;
      }
      let property: any;
      for (property in item) {
        if (Array.isArray(item)) {
          if (item[property] && item[property].toString().toLowerCase().includes(toCompare)) {
            return true;
          }
        }
        if (typeof property == 'string' && item[property] === null || item[property] == undefined || !includes.includes(property)) {
          continue;
        }
        if ((property.match(/date/i) || property.match(/created/i))) {
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

    return items.filter((item) => {
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
    if (typeof value === 'number') {
      value = value.toString();
    }
    if (typeof value === 'string') {
      return value.replace(new RegExp(args, 'gi'),
        '<span class="highlighted">$&</span>');
    } else {
      return value;
    }
  }
}

@Pipe({
  name: "orderBy",
  pure: false
})
export class OrderPipe implements PipeTransform {

  static isString(value: any): boolean {
    return typeof value === "string" || value instanceof String;
  }

  static caseInsensitiveSort(a: any, b: any) {
    if (OrderPipe.isString(a) && OrderPipe.isString(b)) {
      return a.localeCompare(b);
    }
    return OrderPipe.defaultCompare(a, b);
  }

  static defaultCompare(a: any, b: any) {
    if (a && a instanceof Date) {
      a = a.getTime();
    }
    if (b && b instanceof Date) {
      b = b.getTime();
    }

    if (a === b) {
      return 0;
    }
    if (a == null) {
      return 1;
    }
    if (b == null) {
      return -1;
    }
    return a > b ? 1 : -1;
  }

  static parseExpression(expression: string): string[] {
    expression = expression.replace(/\[(\w+)]/g, ".$1");
    expression = expression.replace(/^\./, "");
    return expression.split(".");
  }

  static getValue(object: any, expression: string[]): any {
    for (let i = 0, n = expression.length; i < n; ++i) {
      if (!object) {
        return;
      }
      const k = expression[i];
      if (!(k in object)) {
        return;
      }
      if (typeof object[k] === "function") {
        object = object[k]();
      } else {
        object = object[k];
      }
    }

    return object;
  }

  static setValue(object: any, value: any, expression: string[]) {
    let i;
    for (i = 0; i < expression.length - 1; i++) {
      object = object[expression[i]];
    }

    object[expression[i]] = value;
  }

  transform(
    value: any | any[],
    expression?: any,
    reverse?: boolean | undefined,
    isCaseInsensitive: boolean = false,
    comparator?: Function
  ): any {
    if (!value) {
      return value;
    }

    if (Array.isArray(expression)) {
      return this.multiExpressionTransform(
        value,
        expression.slice(),
        reverse,
        isCaseInsensitive,
        comparator
      );
    }

    if (Array.isArray(value)) {
      return this.sortArray(
        value.slice(),
        expression,
        reverse,
        isCaseInsensitive,
        comparator
      );
    }

    if (typeof value === "object") {
      return this.transformObject(
        Object.assign({}, value),
        expression,
        reverse,
        isCaseInsensitive
      );
    }

    return value;
  }

  private sortArray<Type>(
    array: Type[],
    expression?: any,
    reverse?: boolean,
    isCaseInsensitive?: boolean,
    comparator?: Function
  ): Type[] {
    const isDeepLink = expression && expression.indexOf(".") !== -1;

    if (isDeepLink) {
      expression = OrderPipe.parseExpression(expression);
    }

    let compareFn: Function;

    if (comparator && typeof comparator === "function") {
      compareFn = comparator;
    } else {
      compareFn = isCaseInsensitive
        ? OrderPipe.caseInsensitiveSort
        : OrderPipe.defaultCompare;
    }

    const sortedArray: any[] = array.sort((a: any, b: any): number => {
      if (!expression) {
        return compareFn(a, b);
      }

      if (!isDeepLink) {
        if (a && b) {
          return compareFn(a[expression], b[expression]);
        }
        return compareFn(a, b);
      }

      return compareFn(
        OrderPipe.getValue(a, expression),
        OrderPipe.getValue(b, expression)
      );
    });

    if (reverse) {
      return sortedArray.reverse();
    }

    return sortedArray;
  }

  private transformObject(
    value: any | any[],
    expression?: any,
    reverse?: boolean,
    isCaseInsensitive?: boolean
  ): any {
    const parsedExpression = OrderPipe.parseExpression(expression);
    let lastPredicate: any = parsedExpression.pop();
    let oldValue = OrderPipe.getValue(value, parsedExpression);

    if (!Array.isArray(oldValue)) {
      parsedExpression.push(lastPredicate);
      lastPredicate = null;
      oldValue = OrderPipe.getValue(value, parsedExpression);
    }

    if (!oldValue) {
      return value;
    }

    OrderPipe.setValue(
      value,
      this.transform(oldValue, lastPredicate, reverse, isCaseInsensitive),
      parsedExpression
    );
    return value;
  }

  private multiExpressionTransform(
    value: any,
    expressions: any[],
    reverse: boolean | undefined,
    isCaseInsensitive: boolean = false,
    comparator?: Function
  ): any {
    return expressions.reverse().reduce((result: any, expression: any) => {
      return this.transform(
        result,
        expression,
        reverse,
        isCaseInsensitive,
        comparator
      );
    }, value);
  }
}

@Pipe({
  name: 'stringToLink'
})
export class StringToLinkPipe implements PipeTransform {
  transform(text: string): string {
    if (!text) {
      return text;
    }
    return this.convertTitleToLink(text);
  }

  isLinkValid(link: string): boolean {
    const pattern = /^(ftp|http|https):\/\/[^ "]+$/;
    return pattern.test(link);
  }

  convertTitleToLink(text: string): string {
    const pattern = /(.+?)?\s*\[(.*?)\]\((.*?)\)(.*)/;
    const match = text.match(pattern);
    if (match) {
      const groups = match.slice(1).map((group) => group?.trim());
      const [title, anchorText, link, remainingText] = groups;
      if (this.isLinkValid(link)) {
        return `${title || ''} <a class="primary-text-hover-color text-u-l" target="_blank" href="${link}">${anchorText}</a> ${remainingText || ''}`;
      }
    }
    return text;
  }
}

@Pipe({
  name: 'secondsToTime'
})
export class SecondsToTimePipe implements PipeTransform {
  transform(seconds: number): string {
    if (!seconds) {
      return '0s';
    }
    const days = Math.floor(seconds / (3600 * 24));
    seconds -= days * 3600 * 24;
    const hrs = Math.floor(seconds / 3600);
    seconds -= hrs * 3600;
    const mnts = Math.floor(seconds / 60);
    seconds -= mnts * 60;
    // if value is less than 1 min then return only seconds
    if (days === 0 && hrs === 0 && mnts === 0) {
      return seconds + 's';
    } else if (days === 0 && hrs === 0) {
      return this.convertToDecimal(mnts, seconds) + 'm';
    } else if (days === 0 && hrs != 0 && mnts != 0 && seconds === 0) {
      return this.convertToDecimal(hrs, mnts) + 'h';
    } else if (days === 0 && hrs != 0 && mnts != 0 && seconds !== 0) {
      return hrs + 'h ' + mnts + 'm ' + seconds + 's';
    } else if (days === 0 && hrs != 0 && mnts == 0 && seconds !== 0) {
      return hrs + 'h ' + seconds + 's';
    } else if (days === 0 && hrs != 0 && mnts == 0 && seconds === 0) {
      return hrs + 'h';
    } else if (days === 0 && hrs === 0 && mnts !== 0 && seconds === 0) {
      return mnts + 'm';
    }
    return days + 'd ' + hrs + 'h ' + mnts + 'm ' + seconds + 's';
  }

  // write a function to return 2hours 30 minutes to 2.5 hours
  private convertToDecimal(hours, minutes) {
    return (hours + minutes / 60).toFixed(2);
  }
}


@Pipe({ name: 'noRoundNumber' })
export class NoRoundNumberPipe implements PipeTransform {
  transform(value: number, decimals: number = 2): string {
    if (value || value === 0) {
      return value.toFixed(decimals);
    }
    return '0';
  }
}
