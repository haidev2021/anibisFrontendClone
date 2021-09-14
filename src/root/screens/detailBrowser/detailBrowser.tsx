

import { Route, Switch, NavLink, Link } from 'react-router-dom'
import React, { Component, Fragment, useState, useEffect, useLayoutEffect, useRef, useCallback, useContext } from 'react';
import { useHistory, useLocation } from "react-router-dom";
import Axios from 'axios';
import "./style.css";
import Detail from '../../containers/detail/detail'; import { RootContext } from '../../root';
import { ADVERT_DETAIL_API } from '../../utils/network';
import { SearchNavigator } from '../../components/searchNavigator/SearchNavigator';
import { IRootContext, TLanguage } from '../../utils/xbaseInterface.d';
import { String } from 'lodash';

export interface IDetailBrowser {
    match: any;
    lng: TLanguage;
}
export default function DetailBrowser(props: IDetailBrowser): JSX.Element {
    const {match, lng} = props;
    const rootContext: IRootContext = useContext(RootContext);
    const history = useHistory();
    const location = useLocation();
    const [currentDetailData, setCurrentDetailData] = useState(null);
    const [currentDetailPosition, setCurrentDetailPosition] = useState(-1);
    const categoryAttributesCacheRef = rootContext.categoryAttributesCacheRef;

    useEffect(() => {
        let advertId = match.params.id;
        if (rootContext.searchResultIdsRef.current != null && rootContext.searchResultIdsRef.current.length > 0) {
            setCurrentDetailPosition(rootContext.searchResultIdsRef.current.indexOf(advertId));
        }
        Axios.post(ADVERT_DETAIL_API, {
            id: advertId,
            lng: rootContext.language
        })
            .then(function (response) {
                console.log("POST '/detail' RESPONSE = ", response.data);
                setCurrentDetailData(response.data);
                window.scrollTo(0, 0);
            })
            .catch(function (error) {
                console.log("POST '/detail' ERROR:", error);
                alert("POST '/detail' ERROR:" + error);
            });
    }, [match.params.id, rootContext.language, rootContext.searchResultIdsRef]);

    const pageCount = rootContext.searchResultIdsRef.current ? rootContext.searchResultIdsRef.current.length : 0;
    const textPack = rootContext.commonTexts;
    console.log('rootContext.searchResultIdsRef', rootContext.searchResultIdsRef.current)
    console.log('rootContext DetailBrowser', rootContext)

    const onBackToListClick = useCallback(() => {
        history.push(rootContext.detailPreviousPathRef.current ? rootContext.detailPreviousPathRef.current : "/")
    },
        [history, rootContext.detailPreviousPathRef],
    )

    const onFreviousPageClick = useCallback(() => {
        const position = currentDetailPosition > 0 ? currentDetailPosition - 1 : currentDetailPosition;
        history.push("/detail/" + rootContext.searchResultIdsRef.current[position] + (location.search || ""))
    },
        [currentDetailPosition, history, location.search, rootContext.searchResultIdsRef],
    )

    const onNextPageClick = useCallback(() => {
        const position = currentDetailPosition < pageCount - 1 ? currentDetailPosition + 1 : currentDetailPosition;
        history.push("/detail/" + rootContext.searchResultIdsRef.current[position] + (location.search || ""))
    },
        [currentDetailPosition, history, location.search, pageCount, rootContext.searchResultIdsRef],
    )
    
    if (!categoryAttributesCacheRef.current.has(rootContext.language)) {
        categoryAttributesCacheRef.current.set(rootContext.language, new Map())
    }
    const cacheAttributes = currentDetailData && categoryAttributesCacheRef.current.get(lng) ? categoryAttributesCacheRef.current.get(lng).get(currentDetailData.categoryId) : null;
    let categoryAtttributtes = currentDetailData ? cacheAttributes: null;
    if (cacheAttributes) {
        console.log('resuse categoryAtttributtes cacheAttributes', cacheAttributes)
    }
    console.log('currentDetailPosition', currentDetailPosition, "pageCount", pageCount)

    const t = useCallback(function (key) {
        return textPack && textPack.has(key) ? textPack.get(key) : key;
    }, [textPack]);

    const getPopulatedCategoryPath = useCallback(function (catNamePath, catIdPath) {
        return Array.from(catNamePath, (item, index) => ({ id: catIdPath[index] as number, name: item as string}));
    }, []);

    return <div className="route-detail-browser with-nav consistent-padding">

        <div className="detail-browser-header">
            {currentDetailData && <SearchNavigator
                categoryPath={getPopulatedCategoryPath(currentDetailData.categoryNamePath, currentDetailData.categoryPath)}
                advertTitle={currentDetailData.title}
                id="search-detail-navigator"/>}

            <div id="detail-navigation-buttons">
                <button className="link-button material small white res-ib minw600" id="detail-page-back" onClick={onBackToListClick}>
                    <span className="backgrounded-span page-back-icon before">{t("apps.action.new.backtosearch")}</span></button>
                <button className="link-button material small white res-ib maxw599" id="detail-page-back" onClick={onBackToListClick}>
                    <span className="backgrounded-span page-back-icon before">{t("apps.action.back")}</span></button>

                <div className="flex-middle-space"></div>

                {currentDetailPosition > -1 && <Fragment>

                    <button className="link-button material small white mr16 res-ib minw768" id="detail-page-previous" onClick={onFreviousPageClick} disabled={currentDetailPosition == 0}>
                        <span className="backgrounded-span page-previous-icon before">{t("apps.action.new.previousadvert")}</span></button>
                    <button className="link-button material small white mr16 res-ib maxw767" id="detail-page-previous" onClick={onFreviousPageClick} disabled={currentDetailPosition == 0}>
                        <span className="backgrounded-span page-previous-icon before"></span></button>

                    <button className="link-button material small white res-ib minw768" id="detail-page-next" onClick={onNextPageClick} disabled={currentDetailPosition == pageCount - 1}>
                        <span className="backgrounded-span page-next-icon after">{t("apps.action.new.nextadvert")}</span></button>
                    <button className="link-button material small white res-ib maxw767" id="detail-page-next" onClick={onNextPageClick} disabled={currentDetailPosition == pageCount - 1}>
                        <span className="backgrounded-span page-next-icon after"></span></button>

                </Fragment>}

            </div>
        </div>

        {currentDetailData && <Detail detail={currentDetailData} lng={lng} reusedXBaseAttributes={categoryAtttributtes}/>}
    </div>;
}