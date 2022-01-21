import { FormEvent } from 'react';
import { MenuItem } from '@material-ui/core';
import { FormattedMessage as Msg } from 'react-intl';
import { useRouter } from 'next/router';

import { campaignsResource } from 'api/campaigns';
import { tasksResource } from 'api/tasks';

import FilterForm from '../../FilterForm';
import Matching from '../Matching';
import StyledSelect from '../../inputs/StyledSelect';
import TimeFrame from '../TimeFrame';
import useSmartSearchFilter from 'hooks/useSmartSearchFilter';
import { getTaskTimeFrame, getTaskStatus } from '../../utils'

import { NewSmartSearchFilter, OPERATION,
    SmartSearchFilterWithId, TASK_STATUS, TaskFilterConfig, TIME_FRAME, ZetkinSmartSearchFilter } from 'types/smartSearch';

const ANY_CAMPAIGN = 'any';
const ANY_TASK = 'any';

interface TaskProps {
    filter:  SmartSearchFilterWithId<TaskFilterConfig> | NewSmartSearchFilter;
    onSubmit: (
        filter: SmartSearchFilterWithId<TaskFilterConfig> |
        ZetkinSmartSearchFilter<TaskFilterConfig>
        ) => void;
    onCancel: () => void;
}

const Task = (
    { onSubmit, onCancel, filter: initialFilter }: TaskProps,
): JSX.Element => {
    const { orgId } = useRouter().query;

    const tasksQuery = tasksResource(orgId as string).useQuery();
    const tasks = tasksQuery?.data || [];

    const campaignsQuery = campaignsResource(orgId as string).useQuery();
    const campaigns = campaignsQuery?.data || [];

    const { filter, setConfig, setOp } = useSmartSearchFilter<TaskFilterConfig>(
        initialFilter, { completed: {} });

    // only submit if tasks exist
    const submittable = !!tasks.length;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit(filter);
    };

    const handleTimeFrameChange = (range: {after?: string; before?: string}) => {
        setConfig({
            ...filter.config,
            [getTaskStatus(filter.config)]: range,
        });
    };

    const handleMatchingChange = (matching: { max?: number; min?: number }) => {
        setConfig({
            ...filter.config,
            matching: matching,
        });
    };

    const handleTaskSelectChange = (taskValue: string) => {
        if (taskValue === ANY_TASK) {
            setConfig({ ...filter.config, task: undefined });
        }
        else {
            // When specifying a task we don't want to specify a campaign
            setConfig({ ...filter.config, campaign: undefined, task: +taskValue });
        }
    };

    const handleCampaignSelectChange = (campaignValue: string) => {
        if (campaignValue === ANY_CAMPAIGN) {
            setConfig({ ...filter.config, campaign: undefined });
        }
        else {
            setConfig({ ...filter.config, campaign: +campaignValue, task: undefined });
        }
    };

    return (
        <FilterForm
            disableSubmit={ !submittable }
            onCancel={ onCancel }
            onSubmit={ e => handleSubmit(e) }
            renderExamples={ () => (
                <>
                    <Msg id="misc.smartSearch.call_history.examples.one"/>
                    <br />
                    <Msg id="misc.smartSearch.call_history.examples.two"/>
                </>
            ) }
            renderSentence={ () => (
                <Msg id="misc.smartSearch.task.inputString" values={{
                    addRemoveSelect: (
                        <StyledSelect onChange={ e => setOp(e.target.value as OPERATION) }
                            value={ filter.op }>
                            { Object.values(OPERATION).map(o => (
                                <MenuItem key={ o } value={ o }>
                                    <Msg id={ `misc.smartSearch.call_history.addRemoveSelect.${o}` }/>
                                </MenuItem>
                            )) }
                        </StyledSelect>
                    ),
                    campaignSelect: !filter.config.task ? (
                        <>
                            <Msg id="misc.smartSearch.task.campaignSelect.in" />
                            <StyledSelect
                                onChange={ e => handleCampaignSelectChange(e.target.value) }
                                value={ filter.config.campaign || ANY_CAMPAIGN }>
                                <MenuItem key={ ANY_CAMPAIGN } value={ ANY_CAMPAIGN }>
                                    <Msg id="misc.smartSearch.task.campaignSelect.any" />
                                </MenuItem>
                                { campaigns.map(c => (
                                    <MenuItem key={ c.id } value={ c.id }>
                                        <Msg id="misc.smartSearch.task.campaignSelect.campaign" values={{ campaign: c.title }} />
                                    </MenuItem>
                                )) }
                            </StyledSelect>
                        </>) : null
                    ,
                    matchingSelect: (
                        <Matching
                            filterConfig={ filter.config.matching || {} }
                            onChange={ handleMatchingChange }
                        />
                    ),
                    taskSelect: (
                        <StyledSelect
                            onChange={ e =>
                                handleTaskSelectChange(e.target.value)
                            }
                            value={ filter.config.task || ANY_TASK }>
                            <MenuItem key={ ANY_TASK } value={ ANY_TASK }>
                                <Msg id="misc.smartSearch.task.taskSelect.any" />
                            </MenuItem>
                            { tasks.map(t => (
                                <MenuItem key={ t.id } value={ t.id }>
                                    <Msg id="misc.smartSearch.task.taskSelect.task" values={{ task: t.title }} />
                                </MenuItem>
                            )) }
                        </StyledSelect>
                    ),
                    taskStatusSelect: (
                        <StyledSelect
                            onChange={ e => setConfig({
                                ...filter.config,
                                assigned: undefined,
                                completed: undefined,
                                ignored: undefined,
                                [e.target.value]: getTaskTimeFrame(filter.config),
                            }) }
                            value={ getTaskStatus(filter.config) }>
                            { Object.values(TASK_STATUS).map( s => (
                                <MenuItem key={ s } value={ s }>
                                    <Msg id={ `misc.smartSearch.task.taskStatusSelect.${s}` } />
                                </MenuItem>
                            )) }
                        </StyledSelect>
                    ),
                    timeFrame: (
                        <TimeFrame
                            filterConfig={ getTaskTimeFrame(filter.config) }
                            onChange={ handleTimeFrameChange }
                            options={ [
                                TIME_FRAME.EVER,
                                TIME_FRAME.AFTER_DATE,
                                TIME_FRAME.BEFORE_DATE,
                                TIME_FRAME.BETWEEN,
                                TIME_FRAME.LAST_FEW_DAYS,
                                TIME_FRAME.BEFORE_TODAY,
                            ] }
                        />
                    ),
                }}
                />
            ) }
        />
    );
};

export default Task;
