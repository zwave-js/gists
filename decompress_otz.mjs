import {
	extractFirmwareAsync,
	fastLZDecompressSync,
	parseOTZHeader,
} from "@zwave-js/core";
import fs from "node:fs/promises";

const filename = "/path/to.otz"
const otaFilename = filename.replace(/\.otz$/, ".ota");
const binFilename = filename.replace(/\.otz$/, ".bin");

const otzHex = await fs.readFile(filename);
const { data: otzBin } = await extractFirmwareAsync(otzHex, "otz");
await fs.writeFile(otaFilename, otzBin);
const otzHeader = parseOTZHeader(otzBin);
console.log(otzHeader);
const bin = fastLZDecompressSync(otzBin.subarray(27));
await fs.writeFile(binFilename, bin);
