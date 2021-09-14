import { Route, Switch, NavLink, Link } from 'react-router-dom'
import React, { Component, useState, useEffect, useLayoutEffect, useRef, useCallback, Fragment, useContext, useMemo } from 'react';
import { USE_MOCK_DATA, mockTitle, mockDescription } from '../helper/mockdata';
import { getInputClassName } from '../helper/insertHelper';
import { COMMON_LAST_INPUT_OFFSET_Y, TITLE_FIRST_INPUT_OFFSET_Y, trans } from '../../../utils/common';
import { InsertionContext, ValidationContext } from '../../../screens/insert/insert';
import { IValidationItemInfo, IXBaseAdvert } from '../../../utils/xbaseInterface.d';

export interface ITitleDescription {
    editAdvert: IXBaseAdvert;
}
export default function TitleDescription(props: ITitleDescription): JSX.Element {
    const {editAdvert} = props;
    const insertionContext = useContext(InsertionContext);
    const validationContext = useContext(ValidationContext);
    const [title, setTitle] = useState(USE_MOCK_DATA && !editAdvert ? mockTitle : "");
    const [description, setDescription] = useState(USE_MOCK_DATA && !editAdvert ? mockDescription : "");

    useEffect(() => {
        if (editAdvert) {
            let editTitle = editAdvert.title;
            if (title != editTitle) {
                setTitle(editTitle);
            }
            let editDescription = editAdvert.description;
            if (description != editDescription) {
                setDescription(editDescription);
            }
        }
    }, [editAdvert]);

    const onTitleChange = useCallback((e) => {
        setTitle(e.target.value);
    }, []);

    const onDescriptionChange = useCallback((e) => {
        setDescription(e.target.value);
    }, []);
    
    insertionContext.getTexts= useMemo(() => function () {
        let result = {
            title: title,
            description: description,
            validation: new Array<IValidationItemInfo>(),
        }
        let mandatoryTranslationMap = new Map<any, IValidationItemInfo>([
            ["title", { name: trans("apps.title", insertionContext.textPack), offsetY: TITLE_FIRST_INPUT_OFFSET_Y , hasValue: !!title}],
            ["description", { name: trans("apps.description", insertionContext.textPack), offsetY: COMMON_LAST_INPUT_OFFSET_Y, hasValue: !!description}]
        ]);
        let validation: Array<IValidationItemInfo> = [];
        Array.from(mandatoryTranslationMap.values()).map(value => {
            if (!value.hasValue)
                validation.push(value);
        });
        result.validation = validation;
        return result;
    }, [title, description, insertionContext.textPack]);

    console.log('render TitleDescription');

    return <form className="title-description-form">
        <ul>
            <li className="form-item">
                <label htmlFor="title">{trans("apps.title", insertionContext.textPack)}<span id="mandatory-mark">*</span></label>
                <input className={getInputClassName(title, validationContext.isValidating, true)} id="title" onChange={onTitleChange} value={title}></input>
                <span id="validation-hint">{trans("apps.new.checkmandatoryfield", insertionContext.textPack)}</span>
            </li>
            <li className="form-item">
                <label htmlFor="description">{trans("apps.description", insertionContext.textPack)}<span id="mandatory-mark">*</span></label>
                <textarea className={getInputClassName(description, validationContext.isValidating, true)} id="description" onChange={onDescriptionChange} value={description}></textarea>
                <span id="validation-hint">{trans("apps.new.checkmandatoryfield", insertionContext.textPack)}</span>
            </li>
            {/********/}
            {/* <p style={{ color: 'lightgray' }}>This is very interesting advert</p><p style={{ color: 'lightgray' }}>Je m'appelle Homer et je suis un beau et gentil schnauzer nain mâle couleur poivre et sel de 5 ans. Je cherche une jolie femelle schnauzer nain pour accouplement en Suisse romande. J'ai un pedigree et je viens de l'élévage Centre canin Mirador de Saint Légier, donc la femelle ne doit pas venir du même élevage pour éviter des problèmes génétiques pour les petits.</p> */}
        </ul>
    </form>
}