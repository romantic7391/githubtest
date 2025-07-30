import { notifications, type NotificationData } from '@mantine/notifications';
import { IconAlertCircleFilled, IconCheck, IconInfoCircle } from '@tabler/icons-react';
import { ReactNode } from 'react';
import { DEFAULT_NOTIFICATION_AUTOCLOSE_MS } from '@/lib/default.constant';

export type NotificationType = 'success' | 'error' | 'info' | 'loading';

export interface NotificationConfig {
  title: string;
  message?: ReactNode;
  type?: NotificationType;
  autoClose?: boolean | number;
  withCloseButton?: boolean;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

// 기본 알림 설정
const defaultConfig: NotificationData = {
  position: 'top-center',
  withCloseButton: true,
  autoClose: DEFAULT_NOTIFICATION_AUTOCLOSE_MS,
  message: '',
};

// 알림 타입별 설정
const notificationTypes = {
  success: {
    color: 'green' as const,
    icon: <IconCheck size={18} />,
    autoClose: DEFAULT_NOTIFICATION_AUTOCLOSE_MS,
    withCloseButton: true,
    message: '',
  },
  error: {
    color: 'red' as const,
    icon: <IconAlertCircleFilled size={18} />,
    autoClose: false,
    withCloseButton: true,
    message: '',
  },
  info: {
    color: 'blue' as const,
    icon: <IconInfoCircle size={18} />,
    autoClose: DEFAULT_NOTIFICATION_AUTOCLOSE_MS,
    withCloseButton: true,
    message: '',
  },
  loading: {
    loading: true,
    autoClose: false,
    withCloseButton: false,
    message: '',
  },
};

/**
 * 통일된 알림 표시 함수
 */
export function showNotification(config: NotificationConfig): string {
  const type = config.type || 'info';
  const typeConfig = notificationTypes[type];

  const notificationData: NotificationData = {
    ...defaultConfig,
    ...typeConfig,
    title: config.title,
    message: config.message || '',
    position: config.position || 'top-center',
    autoClose: config.autoClose !== undefined ? config.autoClose : typeConfig.autoClose,
    withCloseButton: config.withCloseButton !== undefined ? config.withCloseButton : typeConfig.withCloseButton,
  };

  return notifications.show(notificationData);
}

/**
 * 성공 알림 표시
 */
export function showSuccessNotification(
  title: string,
  message?: ReactNode,
  config?: Partial<NotificationConfig>,
): string {
  return showNotification({
    title,
    message,
    type: 'success',
    ...config,
  });
}

/**
 * 에러 알림 표시
 */
export function showErrorNotification(
  title: string,
  message?: ReactNode,
  config?: Partial<NotificationConfig>,
): string {
  return showNotification({
    title,
    message,
    type: 'error',
    ...config,
  });
}

/**
 * 정보 알림 표시
 */
export function showInfoNotification(title: string, message?: ReactNode, config?: Partial<NotificationConfig>): string {
  return showNotification({
    title,
    message,
    type: 'info',
    ...config,
  });
}

/**
 * 로딩 알림 표시
 */
export function showLoadingNotification(
  title: string,
  message?: ReactNode,
  config?: Partial<NotificationConfig>,
): string {
  return showNotification({
    title,
    message,
    type: 'loading',
    ...config,
  });
}

/**
 * 알림 업데이트
 */
export function updateNotification(id: string, config: NotificationConfig): void {
  const type = config.type || 'info';
  const typeConfig = notificationTypes[type];

  const notificationData: NotificationData = {
    ...defaultConfig,
    ...typeConfig,
    id,
    title: config.title,
    message: config.message || '',
    position: config.position || 'top-center',
    autoClose: config.autoClose !== undefined ? config.autoClose : typeConfig.autoClose,
    withCloseButton: config.withCloseButton !== undefined ? config.withCloseButton : typeConfig.withCloseButton,
  };

  notifications.update(notificationData);
}

/**
 * 성공으로 알림 업데이트
 */
export function updateToSuccess(
  id: string,
  title: string,
  message?: ReactNode,
  config?: Partial<NotificationConfig>,
): void {
  updateNotification(id, {
    title,
    message,
    type: 'success',
    ...config,
  });
}

/**
 * 에러로 알림 업데이트
 */
export function updateToError(
  id: string,
  title: string,
  message?: ReactNode,
  config?: Partial<NotificationConfig>,
): void {
  updateNotification(id, {
    title,
    message,
    type: 'error',
    ...config,
  });
}

/**
 * 모든 알림 제거
 */
export function clearAllNotifications(): void {
  notifications.clean();
}

/**
 * 특정 알림 제거
 */
export function hideNotification(id: string): void {
  notifications.hide(id);
}
