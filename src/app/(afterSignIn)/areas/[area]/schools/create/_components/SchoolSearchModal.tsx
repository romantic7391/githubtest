'use client';

import { Modal, Text, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import styles from './_styles/SchoolSearchModal.module.css';
import { useEffect } from 'react';
import { useSchoolSearchModalStore } from '@/stores/modal/school-search-modal.store';

export default function SchoolSearchModal() {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);
  const opened = useSchoolSearchModalStore((state) => state.opened);
  const close = useSchoolSearchModalStore((state) => state.close);

  useEffect(() => {
    console.log('isMobile: ', isMobile);
  }, [isMobile]);

  return (
    <Modal
      opened={opened}
      onClose={close}
      fullScreen={isMobile}
      title={
        <Text fw="bold" fz="h2">
          학교 검색
        </Text>
      }
      classNames={{
        root: styles.modal,
        header: styles['modal-header'],
        title: styles['modal-title'],
      }}
      styles={{
        header: {
          borderStartStartRadius: isMobile ? 0 : undefined,
          borderStartEndRadius: isMobile ? 0 : undefined,
        },
      }}></Modal>
  );
}
