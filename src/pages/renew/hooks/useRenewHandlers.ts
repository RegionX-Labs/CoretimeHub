import { useState } from 'react';

export const useRenewHandlers = () => {
  const [activeIdx, setActiveIdx] = useState<number>(0);

  return {
    activeIdx,
    setActiveIdx,
  };
};
