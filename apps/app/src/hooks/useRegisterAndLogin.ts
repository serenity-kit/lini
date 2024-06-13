import { useState } from "react";
import * as opaque from "react-native-opaque";
import { trpc } from "../utils/trpc";
import { useLogin } from "./useLogin";

type RegisterParams = {
  userIdentifier: string;
  password: string;
};

export const useRegisterAndLogin = () => {
  const [isPending, setIsPending] = useState(false);
  const registerStartMutation = trpc.registerStart.useMutation();
  const registerFinishMutation = trpc.registerFinish.useMutation();
  const { login } = useLogin();

  const registerAndLogin = async ({
    userIdentifier,
    password,
  }: RegisterParams) => {
    setIsPending(true);
    try {
      const { clientRegistrationState, registrationRequest } =
        opaque.client.startRegistration({ password });
      const { registrationResponse } = await registerStartMutation.mutateAsync({
        userIdentifier,
        registrationRequest,
      });

      const { registrationRecord } = opaque.client.finishRegistration({
        clientRegistrationState,
        registrationResponse,
        password,
      });

      await registerFinishMutation.mutateAsync({
        userIdentifier,
        registrationRecord,
      });

      const result = await login({ userIdentifier, password });
      return result;
    } catch (_error) {
      return null;
    } finally {
      setIsPending(false);
    }
  };

  return { isPending, registerAndLogin };
};
