
import React from 'react';
import { AttributeSelect, AttributeInputText, AttributeSelectMulti, AttributeCheckMark, AttributeInputDate, AttributeInputNumber, IGetSet } from './attribute';
import moment from 'moment';
import { IXBaseAttribute, IDetailAttribute, TAttributeState, TAttributeSetState } from '../../../utils/xbaseInterface.d';

const AttType = Object.freeze({
    Undefined: 0, SelectSingle: 1, SelectMulti: 2,
    SelectMultiSearchSingle: 3, InputText: 4, InputTextSuggest: 5,
    InputInt: 6, InputDecimal: 7, InputDate: 8,
    Checkmark: 9, SelectSingleExt: 10, SelectSingleSearchMulti: 11,
});

export const INPUT_NUMBER = 0;
export const INPUT_DATE = 1;
export const ENTRY_ID = 2;
export const ENTRY_IDS = 3;
export const INPUT_TEXT = 4;
export const ATT_MAP_IDS = [0, 1, 2, 3, 4];
export default AttType;

function normaliseInteger(value: string) {
    let result = value ? Number.parseInt(value) : null;
    return result;
}

function normaliseFloat(value: string) {
    return value ? Number.parseFloat(value) : null;
}

export const attributeGetSetBase = [
    {
        get: (key = "inputNumber") => (item: any) => item && item[key],
        set: (key = "inputNumber") => (item: any, value: string, att: IXBaseAttribute) => { item[key] = (att.type === AttType.InputInt) ? normaliseInteger(value) : normaliseFloat(value) }
    },
    {
        get: (key = "inputDate") => (item: any) => item && moment(new Date(item[key])).format("YYYY-MM-DD").toString(),
        set: (key = "inputDate") => (item: any, value: string, att: IXBaseAttribute) => { item[key] = Date.parse(value); }
    },
    {
        get: (key = "attributeEntryId") => (item: any) => item && item[key],
        set: (key = "attributeEntryId") => (item: any, value: string, att: IXBaseAttribute) => { item[key] = (att.type === AttType.Checkmark) ? (value ? att.entries[0].id : null) : (value ? normaliseInteger(value) : null) }
    },
    {
        get: (key = "attributeEntryIds") => (item: any) => item && item[key],
        set: (key = "attributeEntryIds") => (item: any, value: string, att: IXBaseAttribute) => { item[key] = Array.from(value.split(","), entry => Number.parseInt(entry)) }
    },
    {
        get: (key = "inputText") => (item: any) => item && item[key],
        set: (key = "inputText") => (item: any, value: string, att: IXBaseAttribute) => { item[key] = value }
    },];

export const attributeGetSets = Array.from(attributeGetSetBase, cbs => ({ get: cbs.get(), set: cbs.set() }));

const extractGetSet = ([index, key]: [number, string]) => ({ get: attributeGetSetBase[index].get(key), set: attributeGetSetBase[index].set(key) });

export const attributeFromGetSets = Array.from([[INPUT_NUMBER, "inputNumberFrom"], [INPUT_DATE, "inputNumberFrom"]], extractGetSet);

export const attributeToGetSets = Array.from([[INPUT_NUMBER, "inputNumberTo"], [INPUT_DATE, "inputDateTo"]], extractGetSet);

export function isSelectType(type: number) {
    return type === 1 || type === 2 || type === 3 || type === 10 || type === 11;
}

export function isSelectMultiType(type: number) {
    return type === 2 || type === 3;
}

export const FORCE_SELECT_SINGLE = true;

export function getFilterAttributeMapId(attType: number) {
    if (FORCE_SELECT_SINGLE && isSelectType(attType)) {
        return ENTRY_ID;
    } else if (!FORCE_SELECT_SINGLE && isSelectMultiType(attType)) {
        return ENTRY_IDS;
    } else if (attType === AttType.Checkmark) {
        return ENTRY_ID;
    } else if (attType === AttType.InputDate) {
        return INPUT_DATE;
    } else if (attType === AttType.InputText || attType === AttType.InputTextSuggest) {
        return INPUT_TEXT;
    } else if (attType === AttType.InputInt || attType === AttType.InputDecimal) {
        return INPUT_NUMBER;
    }
}
export type AttributeElementCallback = () => JSX.Element;
export function getDetailAttributeValue(att: IDetailAttribute, type: number, selectCb: AttributeElementCallback,
    mutilSelctCb: AttributeElementCallback, checkmarkCb: AttributeElementCallback,
    dateCb: AttributeElementCallback, textCb: AttributeElementCallback, numberCb: AttributeElementCallback) {
    if (FORCE_SELECT_SINGLE && isSelectType(type) && att.attributeEntryId)
        return selectCb();
    else if (!FORCE_SELECT_SINGLE && isSelectMultiType(type) && att.attributeEntryIds)
        return mutilSelctCb();
    else if (type === AttType.Checkmark && att.attributeEntryId)
        return checkmarkCb();
    else if (type === AttType.InputDate && att.inputDate)
        return dateCb();
    else if ((type === AttType.InputText || type === AttType.InputTextSuggest) && att.inputText)
        return textCb();
    else if ((type === AttType.InputInt || type === AttType.InputDecimal) && att.inputNumber > 0)
        return numberCb();
}

export function resolveSearchAttribute(id: string | number, att: IXBaseAttribute, usedInputMaps: Array<[TAttributeState, TAttributeSetState]>, isSearch: boolean) {
    if (FORCE_SELECT_SINGLE && isSelectType(att.type)) {
        return resolveAttributeSelect(id, att, usedInputMaps[ENTRY_ID]);
    } else if (!FORCE_SELECT_SINGLE && isSelectMultiType(att.type)) {
        return resolveAttributeSelectMulti(id, att, usedInputMaps[ENTRY_IDS]);
    } else if (att.type === AttType.Checkmark) {
        return resolveAttributeCheckMark(id, att, usedInputMaps[ENTRY_ID]);
    } else if (att.type === AttType.InputDate) {
        return resolveAttributeInputDate(id, att, usedInputMaps[INPUT_DATE], isSearch);
    } else if (att.type === AttType.InputText || att.type === AttType.InputTextSuggest) {
        return resolveAttributeInputText(id, att, usedInputMaps[INPUT_TEXT]);
    } else if (att.type === AttType.InputInt || att.type === AttType.InputDecimal) {
        return resolveAttributeInputNumber(id, att, usedInputMaps[INPUT_NUMBER], isSearch);
    }
}

export function resolveIsAttributeButtonHasData(att: IXBaseAttribute, usedInputMaps: Array<[TAttributeState, TAttributeSetState]>) {
    if (att) {
        let attId = att.id;
        let mapId = getFilterAttributeMapId(att.type);
        let inputAtt = usedInputMaps[mapId][0].get(attId);
        let get = attributeGetSets[mapId] && attributeGetSets[mapId].get;
        let getFrom = attributeFromGetSets[mapId] && attributeFromGetSets[mapId].get;
        let getTo = attributeToGetSets[mapId] && attributeToGetSets[mapId].get;
        let result = get(inputAtt) || getFrom && getFrom(inputAtt) || getTo && getTo(inputAtt);
        if (att.id === 1) {
            console.log('resolveIsAttributeButtonHasData', result)
        }
        return result;
    } else {
        return false;
    }
}

export function resolveAttributeButtonReset(att: {id: number, type: number}, usedInputMaps: Array<[TAttributeState, TAttributeSetState]>) {
    console.log('resolveAttributeButtonReset', att)
    if (att) {
        let attId = att.id;
        let mapId = getFilterAttributeMapId(att.type);
        let set = attributeGetSets[mapId] && attributeGetSets[mapId].set;
        let setFrom = attributeFromGetSets[mapId] && attributeFromGetSets[mapId].set;
        let setTo = attributeToGetSets[mapId] && attributeToGetSets[mapId].set;
        console.log('resolveAttributeButtonReset', mapId, usedInputMaps[mapId])
        const [inputMap, setInputMap] = usedInputMaps[mapId];
        var newInputMap = new Map(inputMap);
        set(newInputMap.get(attId), null, att);
        if (setFrom)
            setFrom(newInputMap.get(attId), null, att);
        if (setTo)
            setTo(newInputMap.get(attId), null, att);
        setInputMap(newInputMap);
    }
}

export function resolveAttributeSelect(id: string | number, att: IXBaseAttribute, usedInputMap: [TAttributeState, TAttributeSetState]): JSX.Element {
    return <AttributeSelect id={id} att={att} usedInputMap={usedInputMap} getSets={attributeGetSets[ENTRY_ID]}></AttributeSelect>
}

export function resolveAttributeSelectMulti(id: string | number, att: IXBaseAttribute, usedInputMap: [TAttributeState, TAttributeSetState]): JSX.Element {
    return <AttributeSelectMulti id={id} att={att} usedInputMap={usedInputMap} getSets={attributeGetSets[ENTRY_IDS]}></AttributeSelectMulti>
}

export function resolveAttributeCheckMark(id: string | number, att: IXBaseAttribute, usedInputMap: [TAttributeState, TAttributeSetState]): JSX.Element {
    return <AttributeCheckMark id={id} att={att} usedInputMap={usedInputMap} getSets={attributeGetSets[ENTRY_ID]}></AttributeCheckMark>
}

export function resolveAttributeInputText(id: string | number, att: IXBaseAttribute, usedInputMap: [TAttributeState, TAttributeSetState]): JSX.Element {
    return <AttributeInputText id={id} att={att} usedInputMap={usedInputMap} getSets={attributeGetSets[INPUT_TEXT]}></AttributeInputText>
}

export function resolveAttributeInputDate(id: string | number, att: IXBaseAttribute, usedInputMap: [TAttributeState, TAttributeSetState], isFromTo: boolean): JSX.Element {
    if (isFromTo)
        return getFromToLayout(id,
            singleAttributeInputDate(id + "-from", att, usedInputMap, attributeFromGetSets[INPUT_DATE]),
            singleAttributeInputDate(id + "-to", att, usedInputMap, attributeToGetSets[INPUT_DATE]))
    else {
        return singleAttributeInputDate(id, att, usedInputMap, attributeGetSets[INPUT_DATE]);
    }
}

function singleAttributeInputDate(id: number | string, att: IXBaseAttribute, usedInputMap: [TAttributeState, TAttributeSetState], getSets: IGetSet): JSX.Element {
    return <AttributeInputDate id={id} att={att} usedInputMap={usedInputMap} getSets={getSets}></AttributeInputDate>
}

export function resolveAttributeInputNumber(id: string | number, att: IXBaseAttribute, usedInputMap: [TAttributeState, TAttributeSetState], isFromTo: boolean): JSX.Element{
    if(isFromTo)
        return getFromToLayout(id,
        singleAttributeInputNumber(id + "-from", att, usedInputMap, attributeFromGetSets[INPUT_NUMBER]),
        singleAttributeInputNumber(id + "-to", att, usedInputMap, attributeToGetSets[INPUT_NUMBER]))
    else {
    return singleAttributeInputNumber(id, att, usedInputMap, attributeGetSets[INPUT_NUMBER]);
}
}

function singleAttributeInputNumber(id: number | string, att: IXBaseAttribute, usedInputMap: [TAttributeState, TAttributeSetState], getSets: IGetSet): JSX.Element {
    return <AttributeInputNumber id={id} att={att} usedInputMap={usedInputMap} getSets={getSets}></AttributeInputNumber>
}

function getFromToLayout(id: number | string, from: JSX.Element, to: JSX.Element): JSX.Element {
    return <div id="from-to-attribute-container">
        <div id="from">  {from} </div>
        <div id="from-to-separator"></div>
        <div id="to"> {to} </div>
    </div>
}