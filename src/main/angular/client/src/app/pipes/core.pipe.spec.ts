/* tslint:disable:no-unused-variable */

import {
  StringDatePipe, StringTimePipe, StringDateFormatePipe, TimeInStringFormatPipe, DurationPipe, ConvertTimePipe,
  DurationFromCurrentPipe, DecodeSpacePipe, GroupByPipe, SearchPipe, HighlightSearch, OrderPipe
} from "./core.pipe";

describe("StringDatePipe", () => {
  let pipe: StringDatePipe;

  beforeEach(() => {
    pipe = new StringDatePipe();
  });

  it("create an instance", () => {
    expect(pipe).toBeTruthy();
  });

});

describe("StringTimePipe", () => {
  let pipe: StringTimePipe;

  beforeEach(() => {
    pipe = new StringTimePipe();
  });

  it("create an instance", () => {
    expect(pipe).toBeTruthy();
  });
});

describe("StringDateFormatePipe", () => {
  let pipe: StringDateFormatePipe;

  beforeEach(() => {
    pipe = new StringDateFormatePipe();
  });

  it("create an instance", () => {
    expect(pipe).toBeTruthy();
  });

});

describe("TimeInStringFormatPipe", () => {
  let pipe: TimeInStringFormatPipe;

  beforeEach(() => {
    pipe = new TimeInStringFormatPipe();
  });

  it("create an instance", () => {
    expect(pipe).toBeTruthy();
  });

});

describe("DurationPipe", () => {
  let pipe: DurationPipe;

  beforeEach(() => {
    pipe = new DurationPipe();
  });

  it("create an instance", () => {
    expect(pipe).toBeTruthy();
  });

});

describe("ConvertTimePipe", () => {
  let pipe: ConvertTimePipe;

  beforeEach(() => {
    pipe = new ConvertTimePipe();
  });

  it("create an instance", () => {
    expect(pipe).toBeTruthy();
  });

});

describe("DurationFromCurrentPipe", () => {
  let pipe: DurationFromCurrentPipe;

  beforeEach(() => {
    pipe = new DurationFromCurrentPipe();
  });

  it("create an instance", () => {
    expect(pipe).toBeTruthy();
  });

});

describe("DecodeSpacePipe", () => {
  let pipe: DecodeSpacePipe;

  beforeEach(() => {
    pipe = new DecodeSpacePipe();
  });

  it("create an instance", () => {
    expect(pipe).toBeTruthy();
  });

});

describe("GroupByPipe", () => {
  let pipe: GroupByPipe;

  beforeEach(() => {
    pipe = new GroupByPipe();
  });

  it("create an instance", () => {
    expect(pipe).toBeTruthy();
  });

});

describe("SearchPipe", () => {
  let pipe: SearchPipe;

  beforeEach(() => {
    pipe = new SearchPipe();
  });

  it("create an instance", () => {
    expect(pipe).toBeTruthy();
  });

  it("should return empty array", () => {
    const array = [{value: 'Order'}, {value: 'Workflow'}, {value: 'Job'}];
    expect(pipe.transform(array, "agent")).toEqual([]);
  });

  it("should return single object array", () => {
    const array = [{value: 'Order'}, {value: 'Workflow'}, {value: 'Job'}];
    expect(pipe.transform(array, "work")).toEqual([{value: 'Workflow'}]);
  });

});

describe("HighlightSearch", () => {
  let pipe: HighlightSearch;

  beforeEach(() => {
    pipe = new HighlightSearch();
  });

  it("create an instance", () => {
    expect(pipe).toBeTruthy();
  });

});

describe("OrderPipe", () => {
  let pipe: OrderPipe;

  beforeEach(() => {
    pipe = new OrderPipe();
  });

  it("create an instance", () => {
    expect(pipe).toBeTruthy();
  });

  it("should return empty array", () => {
    expect(pipe.transform([], "anything")).toEqual([]);
  });

  it("should return array with one element", () => {
    const array = [{id: 1}];
    expect(pipe.transform(array, "id")).toEqual(array);
  });

  it("should return array as it is", () => {
    const alreadySortedArray = [{id: 1}, {id: 2}];
    expect(pipe.transform(alreadySortedArray, "id")).toEqual(
      alreadySortedArray
    );
  });

  it("should order by id", () => {
    const numbers = [{id: 3}, {id: 2}, {id: 1}];
    const sortedNumbers = [{id: 1}, {id: 2}, {id: 3}];

    expect(pipe.transform(numbers, "id")).toEqual(sortedNumbers);
  });

  it("should order by a", () => {
    const arrayA = [{a: 2}, {a: null}, {a: 1}, {a: 3}];
    const arrayB = [{a: 1}, {a: 2}, {a: 3}, {a: null}];

    expect(pipe.transform(arrayA, "a")).toEqual(arrayB);
  });

  it("should order strings too", () => {
    const array = [{string: "abc"}, {string: "aaa"}, {string: "b"}];
    const arraySorted = [{string: "aaa"}, {string: "abc"}, {string: "b"}];

    expect(pipe.transform(array, "string")).toEqual(arraySorted);
  });

  it("should order case-insensitively strings too", () => {
    const array = [{string: "Abc"}, {string: "aaa"}, {string: "b"}];
    const arraySorted = [{string: "aaa"}, {string: "Abc"}, {string: "b"}];

    expect(pipe.transform(array, "string", false, true)).toEqual(arraySorted);
  });

  it("should not revert ordered array", () => {
    const array = [{value: 10}, {value: 1}, {value: 5}];
    const arraySorted = [{value: 1}, {value: 5}, {value: 10}];

    expect(pipe.transform(array, "value", false)).toEqual(arraySorted);
  });

  it("should revert ordered array", () => {
    const array = [{value: 10}, {value: 1}, {value: 5}];
    const arraySortedAndReverse = [{value: 10}, {value: 5}, {value: 1}];

    expect(pipe.transform(array, "value", true)).toEqual(arraySortedAndReverse);
  });

  it("should work with not defined as well", () => {
    let array;
    expect(pipe.transform(array, "value")).toEqual(array);
  });

  it("should array without expression", () => {
    const array = [3, 2, 1];
    const sortedArray = [1, 2, 3];

    expect(pipe.transform(array)).toEqual(sortedArray);
  });

  it("should chars array without expression", () => {
    const array = ["b", "c", "a"];
    const sortedArray = ["a", "b", "c"];

    expect(pipe.transform(array)).toEqual(sortedArray);
  });

  it("should ordered by array", () => {
    const array = [
      {values: [10, 0]},
      {values: [1, 2]},
      {values: [0, -1, 1]},
    ];
    const arraySorted = [
      {values: [0, -1, 1]},
      {values: [1, 2]},
      {values: [10, 0]},
    ];

    expect(pipe.transform(array, "values")).toEqual(arraySorted);
  });
});
