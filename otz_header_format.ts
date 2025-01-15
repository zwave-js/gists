// OTZ header format:
// 0x80
// 4 bytes: compressed size
// 2 bytes: compressed CRC16
// 2 bytes: uncompressed CRC16
// 16 bytes: scrambling key
// 2 bytes: firmware descriptor CRC16
// 1 byte: fastLZ level
export interface OTZHeader {
	compressedSize: number;
	compressedCRC16: number;
	uncompressedCRC16: number;
	firmwareDescriptorCRC16: number;
	fastLZLevel: number;
	scramblingKey: Uint8Array;
}

export function parseOTZHeader(data: Uint8Array): OTZHeader {
	const bytes = Bytes.view(data);
	const compressedSize = bytes.readUInt32BE(1);
	const compressedCRC16 = bytes.readUInt16BE(5);
	const uncompressedCRC16 = bytes.readUInt16BE(7);
	const scramblingKey = bytes.subarray(9, 25);
	const firmwareDescriptorCRC16 = bytes.readUInt16BE(25);
	const fastLZLevel = (bytes[27] >> 5) + 1;
	return {
		compressedSize,
		compressedCRC16,
		uncompressedCRC16,
		firmwareDescriptorCRC16,
		fastLZLevel,
		scramblingKey,
	};
}
