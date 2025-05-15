import dayjsOrigin from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isoWeek from 'dayjs/plugin/isoWeek'; // isoWeek 플러그인 추가
import 'dayjs/locale/ko';

// dayjs 플러그인 설정
dayjsOrigin.extend(utc);
dayjsOrigin.extend(timezone);
dayjsOrigin.extend(isoWeek); // isoWeek 플러그인 적용
dayjsOrigin.locale('ko');
dayjsOrigin.tz.setDefault('Asia/Seoul');

const dayjs = (...args: Parameters<typeof dayjsOrigin>) => dayjsOrigin(...args).tz('Asia/Seoul');

export default dayjs;
