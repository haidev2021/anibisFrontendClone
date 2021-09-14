import { Route, Switch, NavLink, Link } from 'react-router-dom'
import React, { Component, useState, useEffect, useLayoutEffect, useRef, useCallback, Fragment, useMemo, useContext } from 'react';
import "./style.css";
import Axios from 'axios';
import { USE_MOCK_DATA, mockDetail, mockTitle, mockDescription } from '../../containers/insert/helper/mockdata';
import { CATEGORY_FIRST_INPUT_OFFSET_Y, formatNumber, trans, useTextPack } from '../../utils/common';
import { ADVERT_DETAIL_API } from '../../utils/network';
import { RootContext } from '../../root';
import { Filter } from '../../containers/filter/filter';
import InsertionAddress from '../../containers/insert/address/insertionAddress';
import InsertionReview from '../../containers/insert/review/insertionReview';
import PhotoSelector from '../../containers/insert/photo/photoSelector';
import TitleDescription from '../../containers/insert/titleDescription/titleDescription';
import { IXBaseAttribute, XBaseEntryAttributeS, IInsertionAttributeInfo, TAttributeState, TXBaseAttributes, IXBaseAdvert, ILoginInfo, IXBaseCategory, IAttributeValidationInfo, IRootContext, TLanguage, TTextPackId, IDetailAttribute } from '../../utils/xbaseInterface.d';
export const ValidationContext = React.createContext(null);
export const InsertionContext = React.createContext(null);
const PRICE_TYPE = 207;
const PRICE = 1;
const FIXED_PRICE = 15218;

function getPriceText(priceNumber: number, priceEntryId: number, priceType: string) {
    let priceNumberFormatted = `CHF ${formatNumber(priceNumber)}.-`;
    if (priceNumber === 0) {
        return priceType;
    } else {
        if (priceEntryId === FIXED_PRICE) {
            return priceNumberFormatted;
        } else {
            return priceNumberFormatted + " / " + priceType;
        }
    }
    // return priceNumber == 0 ? priceType : (priceEntryId === 15218 ? priceNumber : priceNumber + "/" + priceType);
}
function updatePrice(insertionAttributeInfo: IInsertionAttributeInfo, entriedAttributeMap: TAttributeState, xBaseAttributes: TXBaseAttributes) {
    if (insertionAttributeInfo && entriedAttributeMap && xBaseAttributes && xBaseAttributes.length > 0) {
        let priceNumber = entriedAttributeMap.get(PRICE) ? entriedAttributeMap.get(PRICE).inputNumber : null;
        console.log('updatePrice priceNumber', priceNumber)
        let priceEntryId = entriedAttributeMap.get(PRICE_TYPE) ? entriedAttributeMap.get(PRICE_TYPE).attributeEntryId : null;
        console.log('updatePrice priceEntryId', priceEntryId)
        let priceTypeAtt = xBaseAttributes.find((att: IXBaseAttribute) => att.id === PRICE_TYPE);
        let allEntries = priceTypeAtt && priceTypeAtt.entries;
        let priceEntry = allEntries && allEntries.find((ent: XBaseEntryAttributeS) => ent.id === priceEntryId);
        let priceType = priceEntry && priceEntry.name || "";
        console.log('updatePrice priceType', priceType);
        insertionAttributeInfo.price = priceEntryId && priceType ? getPriceText(priceNumber, priceEntryId, priceType) : "";//help for reviews & list
    }
}
export interface IInsert {
    editAdvert: IXBaseAdvert;
    lng: TLanguage;
    loginInfo: ILoginInfo;
}
export default function Insert(props: IInsert) {
    const { editAdvert, lng, loginInfo } = props;
    const rootContext: IRootContext = useContext(RootContext);
    const [currentStep, setCurrentStep] = useState(0);
    // const advertRef = useRef({ id: 0, lng: lng });
    const [newFetchedAdvert, setNewFetchedAdvert] = useState<IXBaseAdvert>(null);
    const catAttCallbackRef = useRef<IInsertionAttributeInfo>({categoryId: 0, entriedAttributeMap: new Map(), categoryPath: [], xBaseAttributes: []});
    const [isValidating, setIsValidating] = useState<boolean>(false);
    const validationInfoRef = useRef<IAttributeValidationInfo>({ listToValidate: new Map(), firstValidateOffsetY: 0 });
    const textPack = useTextPack(rootContext, "INSERT" as TTextPackId);
    // const [listToValidate, setListToValidate] = useState(null);
    useEffect(() => {
        console.log('editAdvert', editAdvert)
        if (editAdvert && (!newFetchedAdvert || newFetchedAdvert._id !== editAdvert._id)) {
            console.log('Insert editAdvert._id', editAdvert._id);
            Axios.post(ADVERT_DETAIL_API, {
                id: editAdvert._id,
            })
                .then(function (response) {
                    console.log("POST '/detail' RESPONSE = ", response.data);
                    setNewFetchedAdvert(response.data);
                })
                .catch(function (error) {
                    console.log("POST '/detail' ERROR:", error);
                    alert("POST '/detail' ERROR:" + error);
                });
        }
    }, [editAdvert, newFetchedAdvert]);

    useEffect(() => {
        if (validationInfoRef.current.firstValidateOffsetY)
            window.scrollTo(0, validationInfoRef.current.firstValidateOffsetY);
        validationInfoRef.current.firstValidateOffsetY = null;
    }, [validationInfoRef.current.firstValidateOffsetY])

    const onCategoryChange = useCallback((category) => {
        validationInfoRef.current.listToValidate = new Map();
        console.log('listToValidate onCategoryChange', validationInfoRef.current.listToValidate)
        if (!category)
            validationInfoRef.current.listToValidate.set(-1, { name: trans("apps.category", rootContext.commonTexts), offsetY: CATEGORY_FIRST_INPUT_OFFSET_Y, hasValue: false })
        console.log('onCategoryChange', category)
        catAttCallbackRef.current.categoryId = category && category.id;
        catAttCallbackRef.current.entriedAttributeMap = new Map();
    }, [rootContext.commonTexts]);

    const onCategoryPathChange = useCallback((categoryPath: Array<IXBaseCategory>) => {
        catAttCallbackRef.current.categoryPath = Array.from(categoryPath, item => item.id);
    }, []);

    const onXBaseAttributeChange = useCallback((xBaseAttributes) => {
        catAttCallbackRef.current.xBaseAttributes = xBaseAttributes;
    }, []);

    const onAttChange = useCallback((map) => {
        console.log('onAttChange map', map)
        let newMap = catAttCallbackRef.current.entriedAttributeMap ? new Map([...catAttCallbackRef.current.entriedAttributeMap, ...map]) : map;
        catAttCallbackRef.current.entriedAttributeMap = newMap;
        updatePrice(catAttCallbackRef.current, catAttCallbackRef.current.entriedAttributeMap, catAttCallbackRef.current.xBaseAttributes)
        console.log('catAttCallbackRef.current.entriedAttributeMap', catAttCallbackRef.current.entriedAttributeMap)
    }, []);

    const setCurrentStepCbs = useMemo(() => {
        return [() => setCurrentStep(0), () => setCurrentStep(1), () => setCurrentStep(2), () => setCurrentStep(3), () => setCurrentStep(4)]
    }, []);

    const stepTitles = useMemo(() =>
        Array.from([
            "apps.insertion.step.categoryattribute",
            "apps.insertion.step.photo",
            "apps.insertion.step.titledescription",
            "apps.insertion.step.contact",
            "apps.insertion.step.previewpublish"
        ], k => trans(k, textPack)), [textPack]);

    return <InsertionContext.Provider value={{ textPack: textPack }}>
        <ValidationContext.Provider value={{ isValidating: isValidating, info: validationInfoRef.current }}>
            <div className="route-insert with-nav consistent-padding">

                {/* <nav>
                    <ul>
                        <li><a className="simple-link" onClick={function () { setCurrentStep(step => (step == 0 ? 0 : step - 1)) }}>Previous Step</a></li>
                        <li><a className="simple-link" onClick={function () { setCurrentStep(step => (step == 3 ? 3 : step + 1)) }}>Next Step</a></li>
                    </ul>
                </nav> */}

                <div className="mt36">
                    {stepTitles.map((item, index) => {
                        return <button id="insertion-step-button"
                            className={"flat-button round white " + (currentStep === index ? "selected" : "")} onClick={setCurrentStepCbs[index]}>
                            <span className="number-badge"> {index + 1} </span>
                            <span>{item}</span>
                            <span className={"backgrounded-span after " + (index < 4 ? "step-icon" : "preview-icon")}></span>
                        </button>
                    })}
                </div>

                <div id="insertion-section-arrow-container" className={currentStep === 4 ? 'in-preview-step' : ''}>
                    <div id="insertion-arrow-container">
                        {/* <button className="insert left arrow icon" onClick={function () { setCurrentStep(step => (step == 0 ? 0 : step - 1)) }}></button> */}
                    </div>
                    <div id="insertion-section-container">
                        <section className="category-attributes" style={{ display: currentStep === 0 ? 'block' : 'none' }}>
                            <h3 className="mb16 mt16">{trans("apps.insertion.title.categoryattribute", textPack)}</h3>
                            <Filter editInputs={newFetchedAdvert}
                                // lng={lng}
                                isSearch={false}
                                appearAt={"insert"}
                                onCategoryChange={onCategoryChange}
                                onCategoryPathChange={onCategoryPathChange}
                                onInputNumberChange={onAttChange}
                                onInputDateChange={onAttChange}
                                onInputTextChange={onAttChange}
                                onSingleEntrySelectChange={onAttChange}
                                onMultiEntrySelectChange={onAttChange}
                                onXBaseAttributeChange={onXBaseAttributeChange} />
                        </section>

                        <section className="photo-selector" style={{ display: currentStep === 1 ? 'block' : 'none' }}>
                            <h3 className="mb32 mt16">{trans("apps.insertion.title.photo", textPack)}</h3>
                            <PhotoSelector editAdvert={newFetchedAdvert} />
                        </section>

                        <section className="title-description-section" style={{ display: currentStep === 2 ? 'block' : 'none' }}>
                            <h3 className="mb16 mt16">{trans("apps.insertion.title.titledescription", textPack)}</h3>
                            <TitleDescription
                                editAdvert={newFetchedAdvert}></TitleDescription>
                        </section>

                        <section className="section-contact" style={{ display: currentStep === 3 ? 'block' : 'none' }}>
                            <h3 className="mb16 mt16">{trans("apps.insertion.title.contact", textPack)}</h3>
                            <InsertionAddress
                                editAdvert={newFetchedAdvert}
                                lng={lng}></InsertionAddress>
                        </section>

                        <section className="review-post" style={{ display: currentStep === 4 ? 'block' : 'none' }}>
                            <InsertionReview
                                lng={lng}
                                editAdvertId={newFetchedAdvert ? newFetchedAdvert._id : null}
                                editAdvertState={newFetchedAdvert ? newFetchedAdvert.state : null}
                                catAttData={catAttCallbackRef.current}
                                loginInfo={loginInfo}
                                usedParentIsValidating={[isValidating, setIsValidating]}
                                usedParentCurrentStep={[currentStep, setCurrentStep]}></InsertionReview>
                        </section>
                    </div>

                    <div id="insertion-arrow-container">
                        {/* <button className="insert right arrow icon" onClick={function () { setCurrentStep(step => (step == 3 ? 3 : step + 1)) }}></button> */}
                    </div>

                </div>
            </div>
        </ValidationContext.Provider></InsertionContext.Provider >;
}