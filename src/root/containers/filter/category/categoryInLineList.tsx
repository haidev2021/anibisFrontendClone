
import { Route, Switch, NavLink, Link } from 'react-router-dom'
import React, { Component, Fragment, useState, useEffect, useLayoutEffect, useRef, useCallback, useContext } from 'react';
import globalVar, { onDummyClick, trans } from '../../../utils/common';
import { RootContext } from '../../../root';
import { PRINT_DEBUG_INFO } from '../../../utils/config';
import './style.css';
import { IXBaseCategory, IRootContext } from '../../../utils/xbaseInterface.d';

export interface ICategoryInLineList {
    parentCats: Array<IXBaseCategory>;
    subCats: Array<IXBaseCategory>;
    searchCounts: Map<number, number>;
    onRootCategoryClick: (e: any) => void;
    onSubCategoryClick: (e: any) => void;
}
export default function CategoryInLineList(props: ICategoryInLineList) {
    const { parentCats, subCats, searchCounts, onRootCategoryClick, onSubCategoryClick } = props;
    const rootContext: IRootContext = useContext(RootContext);
    let texts = rootContext.commonTexts;

    const printDebugInfo = useCallback(() => {
        if (PRINT_DEBUG_INFO)
            JSON.stringify(subCats);
    }, [subCats]);

    return <div>
        {printDebugInfo()}
        <ul className="category-list inline" >
            {<h3>{trans("apps.categories", texts)}</h3>}
            <li className="mt12">
                <a href="/prevented" className={`simple-link  bold ${(parentCats.length === 0 && " secondary no-hover-color")}`} onClick={onRootCategoryClick}>
                    {trans("apps.inallcategories", texts)}
                </a>
            </li>
            {parentCats.map((cat, index) => {
                let isSelected = index === parentCats.length - 1;
                let className = `simple-link secondary no-hover-color sub-category${index} ${isSelected && " bold"}`;
                return <Fragment>
                    <li data-click={cat.id} >
                        <a data-click={cat.id} href="/prevented" className={className} onClick={onSubCategoryClick}>
                            {cat.name} 
                            {/* ({cat.id}) */}
                            <span className="search-count" data-click={cat.id}>{searchCounts && searchCounts.get(cat.id)}</span>
                        </a>
                    </li>
                </Fragment>
            })}
            {subCats.map(cat => {
                return <li data-click={cat.id} >
                    <a data-click={cat.id} href="/prevented" className={`simple-link secondary no-hover-color sub-category${parentCats.length}`} onClick={onSubCategoryClick}>
                        {cat.name}
                        {/* ({cat.id}) */}
                        <span className="search-count" data-click={cat.id}>{searchCounts && searchCounts.get(cat.id)}</span>
                    </a>
                </li>
            })}
        </ul>
    </div>
}