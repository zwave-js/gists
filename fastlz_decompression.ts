export function fastLZDecompressSync(input: Uint8Array): Uint8Array {
	const output: Uint8Array = new Uint8Array(input.length * 2);

	let inp = 0;
	let out = 0;
	let level: 1 | 2;
	switch (input[inp] >>> 5) {
		case 0:
			level = 1;
			break;
		case 1:
			level = 2;
			break;
		default:
			throw new Error(
				`Unsupported FastLZ block format ${input[inp] >>> 5}`,
			);
	}

	while (inp < input.length) {
		const { bytesRead, bytesWritten } = fastLZDecompressBlock(
			level,
			input,
			inp,
			output,
			out,
			inp === 0,
		);
		inp += bytesRead;
		out += bytesWritten;
	}

	return output.subarray(0, out);
}

const FASTLZ_MAX_OFFSET_L1 = 8191; // 13 bits 1s

function fastLZDecompressBlock(
	level: 1 | 2,
	input: Uint8Array,
	inp: number,
	output: Uint8Array,
	out: number,
	isFirstBlock: boolean,
): {
	bytesRead: number;
	bytesWritten: number;
} {
	let bytesRead = 0;
	let bytesWritten = 0;

	const instruction = isFirstBlock ? 0 : input[inp] >>> 5;
	const ctrl = input[inp] & 0b11111;
	inp++;
	bytesRead++;

	if (instruction === 0b000) {
		// Literal run: 000LLLLL
		const len = ctrl + 1;
		output.set(input.subarray(inp, inp + len), out);
		bytesRead += len;
		bytesWritten += len;
	} else {
		let matchLen: number = instruction + 2;
		let offset: number = ctrl << 8;

		// Level 1:
		// Long match: 111OOOOO LLLLLLLL OOOOOOOO
		// Short match: LLLOOOOO OOOOOOOO

		// Level 2:
		// Long match: 111OOOOO LLLLLLLL [... LLLLLLLL] OOOOOOOO [QQQQQQQQ QQQQQQQQ]
		// Short match: LLLOOOOO OOOOOOOO [QQQQQQQQ QQQQQQQQ]

		if (instruction === 0b111) {
			if (level === 1) {
				matchLen += input[inp++];
				bytesRead++;
			} else {
				let code: number;
				do {
					code = input[inp++];
					bytesRead++;
					matchLen += code;
				} while (code === 0xff);
			}
		}

		offset += input[inp++];
		bytesRead++;

		if (level === 2 && offset === FASTLZ_MAX_OFFSET_L1) {
			// Offset extended by another 2 bytes
			offset += input[inp++] << 8;
			offset += input[inp++];
			bytesRead += 2;
		}

		// Offset is a back reference from the last written byte
		let src = out - offset - 1;
		for (let i = 0; i < matchLen; i++) {
			output[out++] = output[src++];
		}
		bytesWritten += matchLen;
	}

	return { bytesRead, bytesWritten };
}
