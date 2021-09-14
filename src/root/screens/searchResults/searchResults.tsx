import { Route, Switch, NavLink, Link } from 'react-router-dom'
import React, { Component, useState, useEffect, useLayoutEffect, useRef, useCallback, Fragment, useMemo, useContext } from 'react';
import { useHistory, useLocation } from "react-router-dom";
import Axios from 'axios';
import FilterableList from '../../containers/filterableList/filterableList';
import { STATE_ACTIVE, STATE_DEACTAVATED, STATE_TO_APPROVE, STATE_BLOCKED } from '../../utils/advertState';
import ConfirmationModal from '../../components/myAdverts/confirmationModal';
import { RootContext } from '../../root';
import { trans, useTextPack } from '../../utils/common';
import queryString from 'query-string';
import { ADVERT_SEARCH_API } from '../../utils/network';
import { parseSearchQuery } from '../../utils/searchQueryHelper';
import { ILoginInfo, IRootContext, TLanguage } from '../../utils/xbaseInterface.d';

export interface ISearchResults {
    lng: TLanguage;
    loginInfo: ILoginInfo;
}
export default function SearchResults(props: ISearchResults): JSX.Element {
    const { loginInfo, lng } = props;
    const rootContext: IRootContext = useContext(RootContext);
    const location = useLocation();

    const nocontent = useMemo(() => {
        return {
            title: trans("apps.noresults.createnotification", rootContext.commonTexts),
            description: trans("apps.noresults.createnotification.description", rootContext.commonTexts),
            buttonText: trans("apps.notification.enable", rootContext.commonTexts),
            onButtonClick: (e: any) => { },
        }
    }, [rootContext.commonTexts]);

    const query = location.search;
    const queryParsed = parseSearchQuery(query);
    console.log('queryParsed.shortType', queryParsed.shortType)
    console.log(`SearchResults query`, query)
    return <div className="my-adverts route-insert filterable-list-container with-nav consistent-padding">
        <FilterableList categoryFilter={queryParsed.categoryFilter} commonFilter={queryParsed.commonFilter} shortType={queryParsed.shortType || "dpo|d"}
            isSearchAdvert={true} filterApi={ADVERT_SEARCH_API}
            lng={lng} nocontent={nocontent}>
        </FilterableList>
    </div >
}