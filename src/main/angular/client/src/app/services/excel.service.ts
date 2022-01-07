import {Injectable} from '@angular/core';
import {saveAs} from 'file-saver';
import {utils, write, WorkSheet, WorkBook} from 'xlsx';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable()
export class ExcelService {
  constructor() {
  }

  static saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    saveAs(data, fileName + EXCEL_EXTENSION);
  }

  exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: WorkSheet = utils.json_to_sheet(json);
    const workbook: WorkBook = {Sheets: {data: worksheet}, SheetNames: ['data']};
    const excelBuffer: any = write(workbook, {bookType: 'xlsx', type: 'array'});
    ExcelService.saveAsExcelFile(excelBuffer, excelFileName);
  }

}
