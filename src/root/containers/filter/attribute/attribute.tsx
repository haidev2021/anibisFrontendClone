import { Route, Switch, NavLink, Link } from 'react-router-dom'
import React, { Component, Fragment, useState, useEffect, useLayoutEffect, useRef, useCallback, useContext } from 'react';
import { ValidationContext } from '../../../screens/insert/insert';
import { getInputClassName } from '../../insert/helper/insertHelper';
import { RootContext } from '../../../root';
import { trans } from '../../../utils/common';
import { IXBaseAttribute, TAttributeState, TAttributeSetState, IRootContext, IValidationItemInfo } from '../../../utils/xbaseInterface.d';
const SPACE_TO_SHOW_LABEL = 40;

function getValueFromDom(event: React.ChangeEvent<HTMLInputElement>): any {
    console.log('getValueFromDom event.target.value', event.target.value)
    return event.target.type === "checkbox" ? event.target.checked : event.target.value;
}

function updateListToValidate(map: Map<number, IValidationItemInfo>, att: IXBaseAttribute, offsetY: number, hasValue: boolean) {
    const newItem: IValidationItemInfo = { name: att.name, offsetY: offsetY, hasValue: hasValue }
    map.set(att.id, newItem);
    console.log('listToValidate updateListToValidate()', map)
}
export type OffsetTopHolder = HTMLInputElement | HTMLSelectElement;

export interface IGetSet {
    get: (item: any) => any;
    set: (item: any, value: any, att: IXBaseAttribute) => void;
}

function useInputMapExtractor(att: IXBaseAttribute, usedInputMap: [TAttributeState, TAttributeSetState], initValue: any, getSets: IGetSet) {
    const ref = useRef<OffsetTopHolder>(null);
    const {get, set} = getSets;
    const validationContext = useContext(ValidationContext);
    const rootContext: IRootContext= useContext(RootContext);
    const [inputMap, setInputMap] = usedInputMap;
    const value = get(inputMap.get(att.id)) || initValue;
    const isValidating = validationContext && validationContext.isValidating;
    const listToValidate: Map<number, IValidationItemInfo> = validationContext && validationContext.info.listToValidate;
    const offsetY = (ref && ref.current) ? (ref.current.offsetTop - SPACE_TO_SHOW_LABEL) : null;
    const className = getInputClassName(value, isValidating, att.isMandatory);
    
    useEffect(() => {
        if (validationContext && att.isMandatory && offsetY != null)
            updateListToValidate(listToValidate, att, offsetY, !!value);
    }, [offsetY]);

    const onValueChange = useCallback(e => {
        const newValue = getValueFromDom(e);
        console.log('newValue', newValue)
        var newInputMap = new Map(inputMap);
        set(newInputMap.get(att.id), newValue, att);
        setInputMap(newInputMap);
        console.log('newInputMap', newInputMap.get(att.id))
        
        if (validationContext && att.isMandatory && offsetY != null)
            updateListToValidate(listToValidate, att, offsetY, !!newValue);

    }, [inputMap, setInputMap, att, validationContext, listToValidate, set, offsetY]);

    return [value, onValueChange, ref, className, rootContext];
}
export interface AttributeProps {id: number | string, att: IXBaseAttribute, usedInputMap: [TAttributeState, TAttributeSetState], getSets: IGetSet}
export function AttributeInputText(props: AttributeProps): JSX.Element {
    const {id, att, usedInputMap, getSets} = props;
    const [value, onValueChange, ref, className, rootContext] = useInputMapExtractor(att, usedInputMap, "", getSets);
    return <input ref={ref} id={"" + id} className={className} placeholder=" " onChange={onValueChange} value={value}
        required={att.isMandatory}></input>
}

export function AttributeSelect(props: AttributeProps): JSX.Element {
    const {id, att, usedInputMap, getSets} = props;
    const [value, onValueChange, ref, className, rootContext] = useInputMapExtractor(att, usedInputMap, "", getSets);
    return <select ref={ref} id={"" + id} placeholder=" " className={className} onChange={onValueChange} value={value}>
        {<option selected value={""} > {trans("apps.any",rootContext.commonTexts)} </option>}
        {att.entries && att.entries.map(entry => {
            // console.log('AttributeSelect entry.id', entry.id)
            let optionId = id + "-" + entry.id;
            return <option id={optionId} value={entry.id}>{entry.name}</option>
        })}
    </select>
}

export function AttributeSelectMulti(props: AttributeProps): JSX.Element {
    const {id, att, usedInputMap, getSets} = props;
    const [value, onValueChange, ref, className, rootContext] = useInputMapExtractor(att, usedInputMap, "", getSets);
    return <select ref={ref} id={"" + id} className={className} multiple onChange={onValueChange} value={value}>
        {<option selected value={""}> {trans("apps.any",rootContext.commonTexts)} </option>}
        {att.entries && att.entries.map(entry => {
            let optionId = id + "-" + entry.id;
            return <option id={optionId} value={entry.id}>[X] {entry.name}</option>
        })}
    </select>
}

export function AttributeCheckMark(props: AttributeProps): JSX.Element {
    const {id, att, usedInputMap, getSets} = props;
    const [value, onValueChange, ref, className, rootContext] = useInputMapExtractor(att, usedInputMap, false, getSets);
    return <label className="checkbox" htmlFor={""+id}>
        <input ref={ref} id={"" + id} type="checkbox" name="" onChange={onValueChange} checked={value} />
        {att.name}</label>
}

export function AttributeInputDate(props: AttributeProps): JSX.Element {
    const {id, att, usedInputMap, getSets} = props;
    const [value, onValueChange, ref, className, rootContext] = useInputMapExtractor(att, usedInputMap, "", getSets);
    return <input ref={ref} id={"" + id} className={className} placeholder=" " type="date" onChange={onValueChange} value={value} />
}

export function AttributeInputNumber(props: AttributeProps): JSX.Element {
    const {id, att, usedInputMap, getSets} = props;
    const [value, onValueChange, ref, className, rootContext] = useInputMapExtractor(att, usedInputMap, "", getSets);
    let range = att.numericRange;
    let max = range.maxValue;
    let min = range.minValue;
    let step = range.stepValue;
    if (range && (max - min) / step <= 100) {
        let optValue = min;
        let options = [];
        for (; optValue <= max; optValue += step) {
            let optionId = id + "-" + optValue;
            options.push(<option id={optionId} value={optValue}>{optValue + (" " + att.unit).trim()} </option>);
        }
        return <select ref={ref} id={"" + id} className={className} onChange={onValueChange} value={value}>
            {<option value=""> {trans("apps.any",rootContext.commonTexts)} </option>}
            {options}</select>
    }
    else {
        return <input ref={ref} placeholder=" " id={"" + id} className={className} type="number" step={step} min={min} max={max} onChange={onValueChange} value={value}></input>
    }
}