type Record = any;

enum Type {
  STRING,
  NUMBER,
  OBJECT, // ObjectStats.
  ARRAY_NUMBER, // NumericArrayStats.
  ARRAY_STRING, // StringArrayStats.
  ARRAY_OBJECT // ObjectArrayStats.
};

interface Histogram {
}

interface ObjectRecord {
  [key: string]: Record;
}

// [{a: ["1", "2"], b: 4}, {a: ["2", "3"], b: 5}] = {a: ["1", "2", "3", "4"], b: [4, 5]}
type ArrayStats = StringArrayStats | NumberArrayStats;

interface ObjectArrayStats {
  keyCount: {[key: string]: number};
  keyStats: {[key: string]: ArrayStats};
  // When aggregating array of objects, the following types are created:
  // NUMBER ==> ARRAY_NUMBER (NumberArrayStats),
  // STRING ==> ARRAY_STRING (StringArrayStats),
  // OBJECT ==> ARRAY_OBJECT (ObjectArrayStats),
  // ARRAY_NUMBER ==> ARRAY_NUMBER (combine all number[]) (NumericArrayStats).
  // ARRAY_STRING ==> ARRAY_STRING (combine all string[]), (StringArrayStats).
  // ARRAY_OBJECT ==> ARRAY_OBJECT (combine all object[]), (ObjectArrayStats).
}

interface ObjectStats {
  numKeys: number;
  arrayKeyStats: {[key: string]: ArrayStats};
}

interface StringArrayStats extends GeneralArrayStats {
  minLength: number;
  maxLength: number;
  avgLength: number;
  // Only for repetitive strings.
  histogram?: Histogram;
}

interface NumberArrayStats extends GeneralArrayStats {
  min: number;
  max: number;
  median: number;
  mean: number;
  // For both repetitive and non-repetitive numbers.
  histogram: Histogram;
}

interface GeneralArrayStats {
  numNonMissing: number;
  numMissing: number;
  numUnique: number;
}

function getAllFields(records: Record[]) {
  let keyCount: ObjectRecord = {};
  // Find all the keys and how many records have it.
  for (let i = 0; i < records.length; ++i) {
    let record = records[i];
    for (let key in record) {
      if (record[key] == null) {
        continue;
      }
      if (!(key in keyCount)) {
        keyCount[key] = 0;
      }
      keyCount[key]++;
    }
  }
  console.log(keyCount);
}

function analyzeObject(record: {[key: string]: Record}) {

}

function analyzeStringArray(record: string[]) {

}

function analyzeNumberArray(record: number[]) {

}

function analyzeObjectArray(record: ObjectRecord[]) {

}

function analyze(record: Record) {
  if (record.constructor === Array) {
    // We are dealing with Array.
    let records = <Record[]> record;
    if (records.length == 0) {
      // Empty array. Nothing to analyze.
      return null;
    } else if (typeof records[0] == "string") {
      // string[].
      return analyzeStringArray(record);
    } else if (typeof records[0] == "number") {
      // number[].
      return analyzeNumberArray(record);
    } else {
      // object[].
      return analyzeObjectArray(record);
    }
  } else if (typeof record == "string") {
    return null;
  } else if (typeof record == "number") {
    return null;
  } else { // We are deadling with object.
    return analyzeObject(record);
  }
}

function parseLineSeparatedJson(text: string): Record[] {
  let rows = text.split("\n");
  let dataPoints: Record[] = [];
  for (let i = 0; i < rows.length; ++i) {
    if (rows[i] == "") {
      continue;
    }
    try {
      dataPoints.push(JSON.parse(rows[i]));
    } catch (err) {
      console.warn("Failed parsing", rows[i], "into JSON");
      ; // continue
    }
  }
  return dataPoints;
}

d3.text("world_bank.json", function(error, text) {
  let records = parseLineSeparatedJson(text);
  analyze(records);
});