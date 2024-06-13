import * as sodium from "react-native-libsodium";
import { encryptAead } from "secsync";

type Params = {
  value: string;
  key: Uint8Array;
};

export const encryptString = ({ value, key }: Params) => {
  // @ts-expect-error not matching libsodium types
  const { ciphertext, publicNonce } = encryptAead(value, "", key, sodium);
  const ciphertextUint8Array = sodium.from_base64(ciphertext);
  const commitment = ciphertextUint8Array.slice(0, 32);
  const ciphertextWithoutCommitment = ciphertextUint8Array.slice(32);

  return {
    ciphertext: sodium.to_base64(ciphertextWithoutCommitment),
    nonce: publicNonce,
    commitment: sodium.to_base64(commitment),
  };
};
