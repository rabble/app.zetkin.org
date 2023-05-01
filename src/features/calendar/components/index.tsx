import { Box } from '@mui/system';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { useState } from 'react';

import CalendarDayView from './CalendarDayView';
import CalendarMonthView from './CalendarMonthView';
import CalendarNavBar from './CalendarNavBar';
import CalendarWeekView from './CalendarWeekView';
import CampaignActivitiesModel from 'features/campaigns/models/CampaignActivitiesModel';
import useModel from 'core/useModel';
import ZUIFuture from 'zui/ZUIFuture';

export enum TimeScale {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

const Calendar = () => {
  const [focusDate, setFocusDate] = useState<Date>(new Date());
  const [selectedTimeScale, setSelectedTimeScale] = useState<TimeScale>(
    TimeScale.MONTH
  );

  const { orgId } = useRouter().query;
  const model = useModel(
    (env) => new CampaignActivitiesModel(env, parseInt(orgId as string))
  );

  return (
    <ZUIFuture future={model.getAllActivities()}>
      {(data) => {
        return (
          <Box
            display="flex"
            flexDirection="column"
            height={'100%'}
            padding={2}
          >
            <CalendarNavBar
              focusDate={focusDate}
              onChangeFocusDate={(date) => {
                setFocusDate(date);
              }}
              onChangeTimeScale={(timeScale) => {
                setSelectedTimeScale(timeScale);
              }}
              onStepBackward={() => {
                setFocusDate(
                  dayjs(focusDate).subtract(1, selectedTimeScale).toDate()
                );
              }}
              onStepForward={() => {
                setFocusDate(
                  dayjs(focusDate).add(1, selectedTimeScale).toDate()
                );
              }}
              timeScale={selectedTimeScale}
            />

            <Box
              display="flex"
              flexDirection="column"
              flexGrow={1}
              marginTop={2}
              overflow="auto"
            >
              {selectedTimeScale === TimeScale.DAY && (
                <CalendarDayView activities={data} focusDate={focusDate} />
              )}
              {selectedTimeScale === TimeScale.WEEK && (
                <CalendarWeekView focusDate={focusDate} />
              )}
              {selectedTimeScale === TimeScale.MONTH && (
                <CalendarMonthView focusDate={focusDate} />
              )}
            </Box>
          </Box>
        );
      }}
    </ZUIFuture>
  );
};

export default Calendar;
