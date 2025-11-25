'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getDictionary } from '@i18n/get-dictionary';
import type { Locale } from '@i18n/config';

export function useDictionary() {
  const params = useParams();
  const locale = (params?.lang as Locale) || 'es';
  const [dict, setDict] = useState<any>(null);

  useEffect(() => {
    getDictionary(locale).then(setDict);
  }, [locale]);

  return dict;
}
