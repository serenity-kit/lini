import * as sodium from "react-native-libsodium";
import { decryptAead } from "secsync";

type Params = {
  ciphertext: string;
  nonce: string;
  commitment: string;
  key: Uint8Array;
};

export const decryptString = ({
  ciphertext,
  nonce,
  commitment,
  key,
}: Params) => {
  const ciphertextUint8Array = new Uint8Array([
    ...sodium.from_base64(commitment),
    ...sodium.from_base64(ciphertext),
  ]);
  const rawValue = decryptAead(
    ciphertextUint8Array,
    "",
    key,
    nonce,
    // @ts-expect-error not matching libsodium types
    sodium
  );

  return sodium.to_string(rawValue);
};
