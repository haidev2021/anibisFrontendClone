import { Route, Switch, NavLink, Link } from 'react-router-dom'
import React, { Component, useState, useEffect, useLayoutEffect, useRef, useCallback, Fragment, useMemo, useContext, SetStateAction, Dispatch } from 'react';
// import { ValidationContext } from './insert';
import CenterAnchoredModal from '../../../components/templates/centerAnchoredModal/centerAnchoredModal';
import { InsertionContext, ValidationContext } from '../../../screens/insert/insert';
import { trans } from '../../../utils/common';
import { IValidationItemInfo } from '../../../utils/xbaseInterface.d';
// import InsertionReview from './insertionReview';

export interface IValidationnModal {
    isOpen: boolean;
    onXClick: (e: any) => void;
    switchToStepScreen: Dispatch<SetStateAction<number>>;
    validationInfos: Map<number, Array<IValidationItemInfo>>;
}
export default function ValidationnModal(props: IValidationnModal): JSX.Element {
    const {isOpen, onXClick, switchToStepScreen, validationInfos} = props;
    const validationContext = useContext(ValidationContext);
    const insertionContext = useContext(InsertionContext);
    let checkStep = switchToStepScreen;
    console.log('validationInfos', validationInfos)
    
    const onValidationClick = useCallback(function (e) {
        e.preventDefault();
        const validationStep = Number.parseInt(e.target.getAttribute('data-validationStep'));
        const pos = Number.parseInt(e.target.getAttribute('data-pos'));
        console.log('onValidationClick', validationStep, pos)
        onXClick(e);
        checkStep(validationStep);
        if (validationContext)
            validationContext.info.firstValidateOffsetY = pos;
        console.log('validationContext.info.firstValidateOffsetY', validationContext.info.firstValidateOffsetY)
    }, [checkStep, onXClick, validationContext]);

    return <CenterAnchoredModal isOpen={isOpen} onXClick={onXClick}>
        <span>{trans("apps.validationtitle", insertionContext.textPack)}</span>
        <ul id="validation-links">
            {validationInfos && [0, 1, 2, 3, 4].map((validationStep) => {
                let v = validationInfos.get(validationStep);
                return <li key={validationStep} style={{ display: v ? 'block' : 'none' }}>
                    {v && <a className="simple-link" data-validationStep={validationStep} data-pos={v[0].offsetY} onClick={onValidationClick}>
                        {Array.from(v, item => `${item.name}`).join(", ")}{/**(${item.offsetY}) */}
                    </a>}
                    <hr className="thin transparent"></hr>
                </li>
                // <InsertionReview></InsertionReview>
            })}
        </ul>
    </CenterAnchoredModal>
}