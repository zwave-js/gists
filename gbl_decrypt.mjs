import crypto from "node:crypto";

const nonce = // bytes 4..15 of the encryption init tag (0xFA0606FA)
const ciphertext = // contents of the encrypted program data tag (0xF90707F9)
const key = // Get somewhere, e.g. from controller firmware at offset 0x7E286

const iv = Buffer.concat([
	Buffer.from([0x02]),
	nonce,
	Buffer.from([0, 0, 1]),
]);

const cipher = crypto.createDecipheriv("aes-128-ctr", key, iv);
let plaintext = cipher.update(ciphertext);
plaintext = Buffer.concat([plaintext, cipher.final()]);

console.log(plaintext.toString("hex"));

