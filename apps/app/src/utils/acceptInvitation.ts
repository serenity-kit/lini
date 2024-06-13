import * as sodium from "react-native-libsodium";

export const acceptInvitation = ({
  ciphertext,
  nonce,
  seed,
  sessionKey,
}: {
  ciphertext: string;
  nonce: string;
  seed: string;
  sessionKey: Uint8Array;
}) => {
  const { privateKey, publicKey } = sodium.crypto_box_seed_keypair(
    sodium.from_base64(seed)
  );
  const invitation = sodium.crypto_secretbox_open_easy(
    sodium.from_base64(ciphertext),
    sodium.from_base64(nonce),
    sessionKey
  );

  const { boxCiphertext } = JSON.parse(sodium.to_string(invitation));
  const listKey = sodium.crypto_box_seal_open(
    sodium.from_base64(boxCiphertext),
    publicKey,
    privateKey
  );
  return { listKey };
};
