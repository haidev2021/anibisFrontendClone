import React from 'react';
import { trans } from '../../utils/common';
import { TTextPack } from '../../utils/xbaseInterface.d';
export interface ISortTypeSelector {
    value: string;
    onChange: (params: any) => void;
    textPack: TTextPack;
    isElevantAvailable: boolean;
}
export function SortTypeSelector(props: ISortTypeSelector) {
    const { value, onChange, textPack, isElevantAvailable } = props;
    return <select id="sort-selector" className="large" value={value} onChange={onChange}>
        <option value="pri|a">{trans("apps.sort.pri.asc", textPack)}</option>
        <option value="pri|d">{trans("apps.sort.pri.desc", textPack)}</option>
        <option value="dpo|d">{trans("apps.sort.dpo.desc", textPack)}</option>
        {isElevantAvailable && <option value="ftw|d">{trans("apps.sort.ftw.asc", textPack)}</option>}
    </select>
}