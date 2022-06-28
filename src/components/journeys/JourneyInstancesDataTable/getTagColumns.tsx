import { FormattedMessage, IntlShape } from 'react-intl';
import {
  GridCellParams,
  GridColDef,
  GridFilterItem,
} from '@mui/x-data-grid-pro';

import FilterValueSelect from './FilterValueSelect';
import TagChip from 'components/organize/TagManager/components/TagChip';
import {
  JourneyTagColumnData,
  JourneyTagColumnType,
  JourneyTagGroupColumn,
  JourneyUnsortedTagsColumn,
  makeJourneyTagColumn,
} from 'utils/journeyInstanceUtils';
import { ZetkinJourneyInstance, ZetkinTag } from 'types/zetkin';

const has = (
  col: JourneyTagGroupColumn | JourneyUnsortedTagsColumn,
  item: GridFilterItem
) => {
  return (params: GridCellParams) => {
    if (!item.value) {
      return true;
    }

    const tags = col.tagsGetter(params.row as ZetkinJourneyInstance);

    return !!tags.find((tag) => {
      return tag.id.toString() === item.value;
    });
  };
};

const doesNotHave = (
  col: JourneyTagGroupColumn | JourneyUnsortedTagsColumn,
  item: GridFilterItem
) => {
  return (params: GridCellParams) => {
    if (!item.value) {
      return true;
    }

    const tags = col.tagsGetter(params.row as ZetkinJourneyInstance);

    return !!tags.find((tag) => {
      return tag.id.toString() !== item.value;
    });
  };
};

const getTagColumns = (
  intl: IntlShape,
  journeyInstances: ZetkinJourneyInstance[],
  tagColumns: JourneyTagColumnData[]
): GridColDef[] => {
  const colDefs: GridColDef[] = [];

  tagColumns.forEach((colData) => {
    fetch;
    const col = makeJourneyTagColumn(colData);

    if (col.type == JourneyTagColumnType.TAG_GROUP) {
      const tagsById: Record<string, ZetkinTag> = {};
      journeyInstances
        .flatMap((instance) => col.tagsGetter(instance))
        .forEach((tag) => (tagsById[tag.id.toString()] = tag));
      const uniqueTags = Object.values(tagsById).sort((t0, t1) =>
        t0.title.localeCompare(t1.title)
      );

      colDefs.push({
        field: `tagGroup${col.group.id}`,
        filterOperators: [
          {
            InputComponent: FilterValueSelect,
            InputComponentProps: {
              labelMessageId: 'misc.journeys.journeyInstancesFilters.tagLabel',
              options: uniqueTags,
            },
            getApplyFilterFn: (item) => has(col, item),
            label: intl.formatMessage({
              id: 'misc.journeys.journeyInstancesFilters.hasOperator',
            }),
            value: 'has',
          },
          {
            InputComponent: FilterValueSelect,
            InputComponentProps: {
              labelMessageId: 'misc.journeys.journeyInstancesFilters.tagLabel',
              options: uniqueTags,
            },
            getApplyFilterFn: (item) => doesNotHave(col, item),
            label: intl.formatMessage({
              id: 'misc.journeys.journeyInstancesFilters.doesNotHaveOperator',
            }),
            value: 'doesNotHave',
          },
        ],
        headerName: col.group.title,
        renderCell: (params) => {
          return col
            .tagsGetter(params.row as ZetkinJourneyInstance)
            .map((tag) => (
              <TagChip key={tag.id} size="small" tag={tag as ZetkinTag} />
            ));
        },
        valueFormatter: (params) =>
          col
            .tagsGetter(params.row as ZetkinJourneyInstance)
            .map((tag) => tag.title)
            .join(', '),
      });
    } else if (col.type == JourneyTagColumnType.VALUE_TAG) {
      colDefs.push({
        field: `valueTag${col.tag.id}`,
        headerName: col.tag.title,
        valueGetter: (params) =>
          col.valueGetter(params.row as ZetkinJourneyInstance),
      });
    } else if (col.type == JourneyTagColumnType.UNSORTED) {
      const tagsById: Record<string, ZetkinTag> = {};
      journeyInstances
        .flatMap((instance) => col.tagsGetter(instance))
        .forEach((tag) => (tagsById[tag.id.toString()] = tag));
      const uniqueTags = Object.values(tagsById).sort((t0, t1) =>
        t0.title.localeCompare(t1.title)
      );

      colDefs.push({
        field: 'tagsFree',
        filterOperators: [
          {
            InputComponent: FilterValueSelect,
            InputComponentProps: {
              labelMessageId: 'misc.journeys.journeyInstancesFilters.tagLabel',
              options: uniqueTags,
            },
            getApplyFilterFn: (item) => has(col, item),
            label: intl.formatMessage({
              id: 'misc.journeys.journeyInstancesFilters.hasOperator',
            }),
            value: 'has',
          },
          {
            InputComponent: FilterValueSelect,
            InputComponentProps: {
              labelMessageId: 'misc.journeys.journeyInstancesFilters.tagLabel',
              options: uniqueTags,
            },
            getApplyFilterFn: (item) => doesNotHave(col, item),
            label: intl.formatMessage({
              id: 'misc.journeys.journeyInstancesFilters.doesNotHaveOperator',
            }),
            value: 'doesNotHave',
          },
        ],
        renderCell: (params) =>
          col
            .tagsGetter(params.row as ZetkinJourneyInstance)
            .map((tag) => (
              <TagChip key={tag.id} size="small" tag={tag as ZetkinTag} />
            )),
        renderHeader: () => (
          <div className="MuiDataGrid-columnHeaderTitle">
            <FormattedMessage
              id={`pages.organizeJourneyInstances.columns.tagsFree`}
            />
          </div>
        ),
        valueGetter: (params) =>
          col
            .tagsGetter(params.row as ZetkinJourneyInstance)
            .map((tag) => tag.title)
            .join(', '),
      });
    }
  });

  return colDefs;
};

export default getTagColumns;
