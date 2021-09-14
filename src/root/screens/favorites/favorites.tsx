import { Route, Switch, NavLink, Link } from 'react-router-dom'
import React, { Component, useState, useEffect, useLayoutEffect, useRef, useCallback, Fragment, useContext, useMemo } from 'react';
import Axios from 'axios';
import { useHistory } from "react-router-dom";
import "./style.css";
import { RootContext } from '../../root';
import { trans, useTextPack } from '../../utils/common';
import { ADVERT_FAVORITE_IDS_API } from '../../utils/network';
import FilterableList from '../../containers/filterableList/filterableList';
import { addRemoveFavorite } from '../../utils/sharedAPIResquest';
import { ILoginInfo, IRootContext, TLanguage } from '../../utils/xbaseInterface.d';
import { IAdvertItemObjectClicks } from '../../components/myAdverts/confirmationModal';
import { AdvertItemObjectS } from '../../components/advertLists/list';

export interface IFavorites {
    lng: TLanguage;
    loginInfo: ILoginInfo;
}
export default function Favorites(props: IFavorites): JSX.Element {
    const { lng, loginInfo } = props;
    const rootContext: IRootContext = useContext(RootContext);
    const history = useHistory();

    const onItemControllerClicks = useMemo(() => ({
        onFavoriteRemoveClick: function (advertItemObject: AdvertItemObjectS) {
            addRemoveFavorite(true, advertItemObject.advert._id, rootContext, () => history.go(0))
        }
    }), [history, rootContext]);

    const nocontent = useMemo(() => {
        return {
            title: trans("apps.nolistings", rootContext.commonTexts),
            description: trans("apps.nolistings.description", rootContext.commonTexts),
            buttonText: trans("apps.action.nav.search", rootContext.commonTexts),
            onButtonClick: (e: any) => {},
        }
    }, [rootContext.commonTexts]);

    const onLoginClick = useCallback((e) => {
        e.preventDefault();
        history.push("/login");
    }, [history])

    return <div className="my-adverts route-insert filterable-list-container with-nav consistent-padding">
        <FilterableList categoryFilter={null} commonFilter={{}} isSearchAdvert={false} filterApi={rootContext.loginInfo ? ADVERT_FAVORITE_IDS_API : null}
            lng={lng} localAdvertIds={rootContext.favoriteIds}
            onItemControllerClicks={onItemControllerClicks} nocontent={nocontent} title={trans("apps.home.favorites.label", rootContext.commonTexts) + " (%s)"}>
            {!rootContext.loginInfo && rootContext.favoriteIds.length > 0 && <div id="login-to-sync">
                <span>{trans("apps.favourites.signintosync.message", rootContext.commonTexts)}</span>
                <button className="link-button non-material large blue" onClick={onLoginClick}>{trans("apps.action.nav.login", rootContext.commonTexts)}</button>
            </div>}
        </FilterableList>
    </div >
}