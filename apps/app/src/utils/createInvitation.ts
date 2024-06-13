import * as sodium from "react-native-libsodium";

type Params = {
  listKey: Uint8Array;
  sessionKey: Uint8Array;
};

export const createInvitation = ({ listKey, sessionKey }: Params) => {
  const seed = sodium.crypto_secretbox_keygen();
  const { publicKey } = sodium.crypto_box_seed_keypair(seed);

  const boxCiphertext = sodium.crypto_box_seal(listKey, publicKey);

  const invitation = JSON.stringify({
    boxCiphertext: sodium.to_base64(boxCiphertext),
  });

  const sessionNonce = sodium.randombytes_buf(
    sodium.crypto_secretbox_NONCEBYTES
  );
  const sessionCiphertext = sodium.crypto_secretbox_easy(
    invitation,
    sessionNonce,
    sessionKey
  );

  return {
    ciphertext: sodium.to_base64(sessionCiphertext),
    nonce: sodium.to_base64(sessionNonce),
    seed: sodium.to_base64(seed),
  };
};
