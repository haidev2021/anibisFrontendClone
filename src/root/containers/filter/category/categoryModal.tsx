
import { Route, Switch, NavLink, Link } from 'react-router-dom'
import React, { Component, Fragment, useState, useEffect, useLayoutEffect, useRef, useCallback, useContext, useMemo } from 'react';
import globalVar, { trans } from '../../../utils/common';
import { RootContext } from '../../../root';
import CategoryInLineList from './categoryInLineList';
import CenterAnchoredModal from '../../../components/templates/centerAnchoredModal/centerAnchoredModal';
import './style.css';
import { IXBaseCategory, IRootContext } from '../../../utils/xbaseInterface.d';

export interface ICategoryModal {
    isOpen: boolean;
    onXClick: (e: any) => void;
    parentCats: Array<IXBaseCategory>;
    subCats: Array<IXBaseCategory>;
    onBottomButtonClick: (e: any) => void;
    searchCounts: Map<number, number>;
    onRootCategoryClick: (e: any) => void;
    onSubCategoryClick: (e: any) => void;
    bottomButtonText: string;
    hideBottomButton: boolean;
}
export default function CategoryModal(props: ICategoryModal) {
    const { isOpen, onXClick, parentCats, subCats, onBottomButtonClick, searchCounts, onRootCategoryClick, onSubCategoryClick, bottomButtonText, hideBottomButton } = props;
    const rootContext: IRootContext = useContext(RootContext);
    let texts = rootContext.commonTexts;

    return <CenterAnchoredModal className="category-modal" isOpen={isOpen} onXClick={onXClick} onBottomButtonClick={onBottomButtonClick}
        bottomButtonText={bottomButtonText} hideBottomButton={hideBottomButton}>
        <ul className="category-list" >
            {parentCats.length === 0 && <h3>{trans("apps.categories", texts)} A–Z</h3>}
            <li>
                <a href="/prevented" className={"simple-link" + (parentCats.length === 0 ? " secondary no-hover-color" : "")} onClick={onRootCategoryClick}>
                    {trans("apps.inallcategories", texts)}
                    {parentCats.length === 0 && <span className="category-selected-icon" />}
                </a>
            </li>
            <hr className="thin no-margin" />
            {parentCats.map((cat, index) => {
                let isSelected = index === parentCats.length - 1;
                let className = "simple-link parent-category" + (isSelected ? " secondary no-hover-color" : "");
                return <Fragment>
                    <li data-click={cat.id}>
                        <a href="/prevented" data-click={cat.id} className={className} onClick={onSubCategoryClick}>
                            <span data-click={cat.id}>
                                {cat.name} 
                                {/* ({cat.id}) */}
                            <span className="search-count" data-click={cat.id}>{searchCounts && searchCounts.get(cat.id)}</span>
                            </span>
                            {isSelected && <span className="category-selected-icon" />}
                        </a>
                    </li>
                    <hr className="thin no-margin" />
                </Fragment>
            })}
            {subCats.map(cat => {
                return <li data-click={cat.id}>
                    <a href="/prevented" data-click={cat.id} className="simple-link sub-category" onClick={onSubCategoryClick}>
                        <span data-click={cat.id}>
                            {cat.name} 
                            {/* ({cat.id}) */}
                            <span className="search-count" data-click={cat.id}>{searchCounts && searchCounts.get(cat.id)}</span>
                        </span>
                        <span className="sub-category-icon" />
                    </a>
                </li>
            })}
        </ul>
    </CenterAnchoredModal>
}