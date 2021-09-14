import { Route, Switch, NavLink, Link } from 'react-router-dom'
import React, { Component, Fragment, useState, useEffect, useLayoutEffect, useRef, useCallback, useContext, SetStateAction, Dispatch } from 'react';
import Axios from 'axios';
import Slider from "react-slick";
import { useHistory } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ValidationnModal from './validationModal';
import { TITLE_FIRST_INPUT_OFFSET_Y, COMMON_LAST_INPUT_OFFSET_Y, trans } from '../../../utils/common';
import { ADVERT_INSERT_API, ADVERT_UPDATE_ADVERT_API } from '../../../utils/network';
import Detail from '../../detail/detail';
import { InsertionContext, ValidationContext } from '../../../screens/insert/insert';
import { IInsertionAttributeInfo, ILoginInfo, IValidationItemInfo, TLanguage, IDetailAttribute } from '../../../utils/xbaseInterface.d';
import { DUMMY_CATEGORY } from '../../filterableList/filterableList';

function refineForSearchAndDetail(entriedAttributes: Array<IDetailAttribute>) {
    let typeAttNo208 = entriedAttributes.shift();
    entriedAttributes.push(typeAttNo208);
    return entriedAttributes;
}

export interface IInsertionReview {
    lng: TLanguage;
    editAdvertId: string;
    editAdvertState: number;
    catAttData: IInsertionAttributeInfo;
    loginInfo: ILoginInfo;
    usedParentIsValidating: [boolean, Dispatch<SetStateAction<boolean>>];
    usedParentCurrentStep: [number, Dispatch<SetStateAction<number>>];
}

export default function InsertionReview(props: IInsertionReview): JSX.Element {
    const { lng, editAdvertId, editAdvertState, loginInfo, usedParentIsValidating, usedParentCurrentStep } = props;
    let catAttData = props.catAttData;
    const history = useHistory();
    const [validationModalInfos, setValidationModalInfos] = useState<Map<number, Array<IValidationItemInfo>>>(null);
    const [isValidationModalOpen, setIsValidationModalOpen] = useState<boolean>(false);
    const validationContext = useContext(ValidationContext);
    const insertionContext = useContext(InsertionContext);
    let detailPhotos = insertionContext.getImageUrls();
    let detailAddress = insertionContext.getAddress();
    let detailTexts = insertionContext.getTexts();
    let detailThumb = detailPhotos && detailPhotos.length > 0 ? detailPhotos[0].blogPhotosThumbnail : null;
    // let updateState = editAdvertState === STATE_ACTIVE || editAdvertState === STATE_BLOCKED ? STATE_TO_APPROVE : editAdvertState;
    if (catAttData === null)
        catAttData = {
            categoryId: 0,
            entriedAttributeMap: new Map(),
            categoryPath: [],
            xBaseAttributes: [],
        };
    let reviewDetail = {
        language: lng,
        categoryId: catAttData.categoryId,
        attributes: catAttData.entriedAttributeMap && refineForSearchAndDetail(Array.from(catAttData.entriedAttributeMap.values())),
        pictures: detailPhotos,
        contactAddress: detailAddress,
        title: detailTexts.title,
        description: detailTexts.description,
        price: catAttData.price,
        categoryPath: catAttData.categoryPath,
        thumbnail: detailThumb,
        user: loginInfo,
        state: editAdvertState,//updateState,
        // Type: 0
    }
    console.log('InsertionReview reviewDetail', reviewDetail)
    console.log('InsertionReview editAdvertId', editAdvertId)

    const validate = useCallback(function () {
        let validationMap = new Map<number, Array<IValidationItemInfo>>();
        let catAttValidation: Array<IValidationItemInfo> = [];
        console.log('listToValidate validate()', validationContext.info.listToValidate);
        let array: Array<IValidationItemInfo> = Array.from(validationContext.info.listToValidate.values()) as Array<IValidationItemInfo>;
        array.map((value: IValidationItemInfo) => {
            if (!value.hasValue)
                catAttValidation.push(value);
        });
        if (catAttValidation.length > 0)
            validationMap.set(0, catAttValidation);
        if (detailTexts.validation.length > 0)
            validationMap.set(2, detailTexts.validation);
        if (detailAddress.validation.length > 0)
            validationMap.set(3, detailAddress.validation);

        console.log('validationModalInfos', validationMap)
        return validationMap;
    }, [detailAddress.validation, detailTexts.validation, validationContext.info.listToValidate]);

    const onInsertClick = useCallback(function () {
        let validationMap = validate();
        console.log('validationMap', validationMap)
        if (validationMap.size === 0) {
            let { user, ...refindeDetail } = reviewDetail;
            if (!editAdvertId) {
                console.log("onInsertClick Axios post refindeDetail = ", refindeDetail);
                Axios.post(ADVERT_INSERT_API, refindeDetail)
                    .then(function (response) {
                        console.log("insert response = ", response);
                        history.push("/myadverts");
                    })
                    .catch(function (error) {
                        console.log(error);
                        alert("catch error " + error);
                    });
            } else {
                console.log("onInsertClick Axios post refindeDetail = ", refindeDetail);
                let updateObject = { id: editAdvertId, set: refindeDetail }
                Axios.post(ADVERT_UPDATE_ADVERT_API, updateObject)
                    .then(function (response) {
                        console.log("insert response = ", response);
                        history.push("/myadverts");
                    })
                    .catch(function (error) {
                        console.log(error);
                        alert("catch error " + error);
                    });
            }
        } else {
            setIsValidationModalOpen(true);
            setValidationModalInfos(validationMap);
            usedParentIsValidating[1](true);
        }
    }, [editAdvertId, history, reviewDetail, usedParentIsValidating, validate]);

    const onValidationModalCloseClick = useCallback(function (e) {
        e.stopPropagation();
        setIsValidationModalOpen(false);
    }, [])

    return (<div className="insertion-review">
        <div id="insertion-section-header">
            <h3 className="mb16 mt16">{trans("apps.insertion.title.previewpost", insertionContext.textPack)}</h3>
            <button className="link-button material green large" onClick={onInsertClick}>{trans("apps.action.publish", insertionContext.textPack)}</button>
        </div>
        <Detail detail={reviewDetail} reusedXBaseAttributes={catAttData.xBaseAttributes}
            isInsertionPreview={true} lng={lng}></Detail>
        <div className="post-button-container">
            <button className="link-button material green large pw100" onClick={onInsertClick}>{trans("apps.action.publish", insertionContext.textPack)}</button>
        </div>
        <ValidationnModal isOpen={isValidationModalOpen}
            // onClicks={{ close: onValidationModalCloseClick, checkStep: usedParentCurrentStep[1] }}
            onXClick={onValidationModalCloseClick}
            switchToStepScreen={usedParentCurrentStep[1]}
            validationInfos={validationModalInfos} />
        {/* <PhotoSelector></PhotoSelector> */}
        {/* <TitleDescription></TitleDescription> */}
    </div >);

}