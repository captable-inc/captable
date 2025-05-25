import { getAuthenticatorOptions } from "@/lib/authenticator";
import { db } from "@captable/db";
import { passkeyVerificationTokens } from "@captable/db";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import type { PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/types";

type CreatePasskeySigninOptions = {
  sessionId: string;
};

export const createPasskeySigninOptions = async ({
  sessionId,
}: CreatePasskeySigninOptions): Promise<PublicKeyCredentialRequestOptionsJSON> => {
  const { rpId, timeout } = getAuthenticatorOptions();

  const options = await generateAuthenticationOptions({
    rpID: rpId,
    userVerification: "preferred",
    timeout,
  });

  const { challenge } = options;

  const expiryDate = new Date(new Date().getTime() + 2 * 60000); // 2 min expiry

  // Use insert with onConflictDoUpdate for a cleaner upsert operation
  await db
    .insert(passkeyVerificationTokens)
    .values({
      id: sessionId,
      token: challenge,
      expiresAt: expiryDate,
      createdAt: new Date(),
    })
    .onConflictDoUpdate({
      target: passkeyVerificationTokens.id,
      set: {
        token: challenge,
        expiresAt: expiryDate,
        createdAt: new Date(),
      },
    });

  return options;
};
