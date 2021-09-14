import { Route, Switch, NavLink, Link } from 'react-router-dom'
import React, { Component, useState, useEffect, useLayoutEffect, useRef, useCallback, Fragment, useMemo, useContext, Dispatch, SetStateAction } from 'react';
import { useHistory, useLocation } from "react-router-dom";
import Axios from 'axios';
import FilterableList from '../filterableList/filterableList';
import { ADVERT_SEARCH_API } from '../../utils/network';
import { IXBaseCategory, TLanguage } from '../../utils/xbaseInterface.d';

export interface IHomeCategorySelector {
    lng: TLanguage;
    usedHomeModalOpenState: [boolean, Dispatch<SetStateAction<boolean>>];
    onHomeCategorySelected: (cat: IXBaseCategory) => void;
    onRootSearchCountUpdate: Dispatch<SetStateAction<number | string>>;
}
export default function HomeCategorySelector(props: IHomeCategorySelector): JSX.Element {
    const {lng, usedHomeModalOpenState, onHomeCategorySelected, onRootSearchCountUpdate} = props;
    return <div className="my-adverts route-insert filterable-list-container with-nav consistent-padding">
        <FilterableList shortType={"dpo|d"} commonFilter={{}} nocontent={null}
            isSearchAdvert={true} appearAt="home" filterApi={ADVERT_SEARCH_API}
            lng={lng}
            forFilterOnlyData={{
                usedHomeModalOpenState: usedHomeModalOpenState,
                onHomeCategorySelected: onHomeCategorySelected,
            }}
            onRootSearchCountUpdate={onRootSearchCountUpdate}>
        </FilterableList>
    </div >
}