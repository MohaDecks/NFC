import { customAlphabet } from "nanoid";

const alphabet = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const generate = customAlphabet(alphabet, 8);

export function createPublicId() {
  return generate();
}
