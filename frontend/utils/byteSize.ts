const METRIC = [
    {from: 0, to: 1e3, unit: "B", long: "bytes"},
    {from: 1e3, to: 1e6, unit: "kB", long: "kilobytes"},
    {from: 1e6, to: 1e9, unit: "MB", long: "megabytes"},
    {from: 1e9, to: 1e12, unit: "GB", long: "gigabytes"},
    {from: 1e12, to: 1e15, unit: "TB", long: "terabytes"}
];

interface IByteSizeParams {
    sizeInBytes: number,
    precision?: number
}

function byteSize( {sizeInBytes, precision = 1}: IByteSizeParams ): { value: string, unit: string } {
    const units = METRIC.find(m => m.from <= sizeInBytes && m.to > sizeInBytes);

    const valueInCurrentUnits = sizeInBytes / (units.from || 1);
    const value = valueInCurrentUnits.toFixed(precision).replace(".0", "");
    const unit = units.unit;
    return {value, unit};
}

export {byteSize};