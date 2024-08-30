import { ProgressButton } from "@/components"
import { useCoretimeApi, useRelayApi } from "@/contexts/apis";
import { Stack } from "@mui/material"
import { useState } from "react";
import { useToast } from '@/contexts/toast';
import { useAccounts } from "@/contexts/account";
import { RenewableParachain } from "@/hooks";
import { useSubmitExtrinsic } from "@/hooks/submitExtrinsic";

interface RenewActionProps {
  parachain: RenewableParachain,
}

export const RenewAction = ({ parachain }: RenewActionProps) => {
  const [working, setWorking] = useState(false);

  const {
    state: { activeAccount, activeSigner },
  } = useAccounts();
  const {
    state: { api: coretimeApi, isApiReady: isCoretimeReady, decimals, symbol },
  } = useCoretimeApi();

  const { toastError, toastInfo, toastSuccess } = useToast();
  const { submitExtrinsicWithFeeInfo } = useSubmitExtrinsic();

  const handleRenew = () => {
    if (!activeAccount || !coretimeApi || !isCoretimeReady || !activeSigner) return;

    const { core } = parachain;

    const txRenewal = coretimeApi.tx.broker.renew(core);
    submitExtrinsicWithFeeInfo(symbol, decimals, txRenewal, activeAccount.address, activeSigner, {
      ready: () => {
        setWorking(true);
        toastInfo('Transaction was initiated');
      },
      inBlock: () => toastInfo('In Block'),
      finalized: () => setWorking(false),
      success: () => {
        toastSuccess('Successfully renewed the selected parachain');
      },
      fail: () => {
        toastError(`Failed to renew the selected parachain`);
      },
      error: (e) => {
        toastError(`Failed to renew the selected parachain ${e}`);
        setWorking(false);
      },
    });
  };

  return (
    <>
      <Stack direction='row' gap='1rem' marginTop='2em' justifyContent='center'>
        <ProgressButton label='Renew' onClick={handleRenew} loading={working} width='200px' />
      </Stack>
    </>
  )
}
