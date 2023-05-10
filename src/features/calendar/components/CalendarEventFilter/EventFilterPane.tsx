import { Box, Button } from '@mui/material';
import { useSelector, useStore } from 'react-redux';

import CheckboxFilterList from './CheckboxFilterList';
import EventInputFilter from './EventInputFilter';
import EventTypesModel from 'features/events/models/EventTypesModel';
import messageIds from 'features/calendar/l10n/messageIds';
import PaneHeader from 'utils/panes/PaneHeader';
import { RootState } from 'core/store';
import useModel from 'core/useModel';
import { ZetkinActivity } from 'utils/types/zetkin';
import ZUIFuture from 'zui/ZUIFuture';
import {
  ACTION_FILTER_OPTIONS,
  EventFilterOptions,
  FilterCategoryType,
  filterTextUpdated,
  filterUpdated,
  STATE_FILTER_OPTIONS,
} from 'features/events/store';
import { Msg, useMessages } from 'core/i18n';

interface EventFilterPaneProps {
  orgId: number;
}
const EventFilterPane = ({ orgId }: EventFilterPaneProps) => {
  const messages = useMessages(messageIds);
  const store = useStore<RootState>();
  const state = useSelector((state: RootState) => state.events.filters);
  const typesModel = useModel((env) => new EventTypesModel(env, orgId));

  const disableReset =
    state.selectedActions.length === 0 &&
    state.selectedStates.length === 0 &&
    state.selectedTypes.length === 0 &&
    state.text === '';

  const handleCheckBox = (
    e: React.ChangeEvent<HTMLInputElement>,
    filterCategory: FilterCategoryType
  ) => {
    const { name } = e.target;
    store.dispatch(
      filterUpdated({
        filterCategory,
        selectedFilterValue: [name as EventFilterOptions],
      })
    );
  };

  const handleSelectNone = (filterCategory: FilterCategoryType) => {
    store.dispatch(
      filterUpdated({
        filterCategory,
        selectedFilterValue: [],
      })
    );
  };

  const resetFilters = () => {
    const filterCategories: FilterCategoryType[] = [
      'selectedActions',
      'selectedStates',
      'selectedTypes',
    ];
    filterCategories.map((filterCategory) =>
      store.dispatch(
        filterUpdated({
          filterCategory: filterCategory,
          selectedFilterValue: [],
        })
      )
    );
    store.dispatch(filterTextUpdated({ filterText: '' }));
  };

  return (
    <>
      <PaneHeader title={messages.eventFilter.filter()} />
      <Button
        color="warning"
        disabled={disableReset}
        onClick={resetFilters}
        size="small"
        variant="outlined"
      >
        <Msg id={messageIds.eventFilter.reset} />
      </Button>
      <Box sx={{ mt: 2 }}>
        <EventInputFilter
          onDebounce={(value: string) =>
            store.dispatch(filterTextUpdated({ filterText: value }))
          }
          placeholder={messages.eventFilter.type()}
          reset={disableReset}
          userText={state.text}
        />
        <Box display="flex" flexDirection="column" sx={{ mt: 2 }}>
          <CheckboxFilterList
            filterCategory={'selectedActions'}
            onClickAll={(filterCategory) => {
              store.dispatch(
                filterUpdated({
                  filterCategory,
                  selectedFilterValue: Object.values(ACTION_FILTER_OPTIONS),
                })
              );
            }}
            onClickCheckbox={(e, value) => handleCheckBox(e, value)}
            onClickNone={(filterCategory) => handleSelectNone(filterCategory)}
            options={Object.values(ACTION_FILTER_OPTIONS).map((value) => ({
              label: messages.eventFilter.filterOptions.actionFilters[value](),
              value,
            }))}
            state={state.selectedActions}
            title={messages.eventFilter.filterOptions.actionFilters.title()}
          />
          <CheckboxFilterList
            filterCategory={'selectedStates'}
            onClickAll={(filterCategory) => {
              store.dispatch(
                filterUpdated({
                  filterCategory,
                  selectedFilterValue: Object.values(STATE_FILTER_OPTIONS),
                })
              );
            }}
            onClickCheckbox={(e, value) => handleCheckBox(e, value)}
            onClickNone={(filterCategory) => handleSelectNone(filterCategory)}
            options={Object.values(STATE_FILTER_OPTIONS).map((value) => ({
              label: messages.eventFilter.filterOptions.stateFilters[value](),
              value,
            }))}
            state={state.selectedStates}
            title={messages.eventFilter.filterOptions.stateFilters.title()}
          />
          <ZUIFuture future={typesModel.getTypes()}>
            {(data) => {
              return (
                <CheckboxFilterList
                  filterCategory={'selectedTypes'}
                  onClickAll={(filterCategory) => {
                    store.dispatch(
                      filterUpdated({
                        filterCategory,
                        selectedFilterValue: data.map(
                          (value: ZetkinActivity) => `${value.id}`
                        ),
                      })
                    );
                  }}
                  onClickCheckbox={(e, value) => handleCheckBox(e, value)}
                  onClickNone={(filterCategory) =>
                    handleSelectNone(filterCategory)
                  }
                  options={data
                    .map((value: ZetkinActivity) => ({
                      label: value.title,
                      value: `${value.id}`,
                    }))
                    .sort((a, b) =>
                      a.label.toLowerCase().localeCompare(b.label.toLowerCase())
                    )}
                  state={state.selectedTypes}
                  title={messages.eventFilter.filterOptions.eventTypes.title()}
                />
              );
            }}
          </ZUIFuture>
        </Box>
      </Box>
    </>
  );
};

export default EventFilterPane;
