


import { Route, Switch, NavLink, Link } from 'react-router-dom'
import './style.css'
import React, { Component, Fragment, useState, useEffect, useLayoutEffect, useRef, useCallback, useContext, useMemo, Dispatch, SetStateAction } from 'react';
import "../filter.css";
import { resolveIsAttributeButtonHasData, resolveAttributeButtonReset } from '../attribute/attributeFactory';
import { trans } from '../../../utils/common';
import { IXBaseCategory, TAttributeState, TAttributeSetState, IXBaseAttribute, TTextPack } from '../../../utils/xbaseInterface.d';

export interface IFilterButtons {
    selectedCat: IXBaseCategory;
    onCategoryClick: (e: React.MouseEvent<HTMLButtonElement>, cat: IXBaseCategory) => void;
    setSelectedCat: Dispatch<SetStateAction<IXBaseCategory>>;
    updateAttributeSection: (cat: IXBaseCategory, debugInfo: string) => void;
    pushCurrentFilterInput: () => void,
    setSingleFilterItemId: Dispatch<SetStateAction<any>>;
    setFetchAdvertFlag: Dispatch<SetStateAction<boolean>>;
    setMobileFilterOpen: Dispatch<SetStateAction<boolean>>;
    setLocation: Dispatch<SetStateAction<string>>;
    xBaseAttributes: Array<IXBaseAttribute>;
    usedInputMaps: Array<[TAttributeState, TAttributeSetState]>;
    commonTexts: TTextPack;
    textPack: TTextPack;
    location: string;
}
export function FilterButtons(props: IFilterButtons) {
    const {
        selectedCat, onCategoryClick, setSelectedCat, updateAttributeSection, pushCurrentFilterInput,
        setSingleFilterItemId, setFetchAdvertFlag, setMobileFilterOpen, setLocation, xBaseAttributes,
        usedInputMaps, commonTexts, textPack, location
    } = props;

    const onCategoryButtonClick = useCallback(e => {
        console.log('onCategoryButtonClick selectedCat', selectedCat)
        onCategoryClick(e, selectedCat);
        e.stopPropagation();
    }, [selectedCat, onCategoryClick])

    const onCategoryResetButtonClick = useCallback(e => {
        // fetchSubCategory(null, false);//to check if bugs
        setSelectedCat(null);
        updateAttributeSection(null, "onCategoryResetButtonClick");
        e.stopPropagation();
    }, [updateAttributeSection, setSelectedCat])//fetchSubCategory,

    const onFilterItemButtonClick = useCallback(e => {
        const clickData = e.target.getAttribute('data-click');
        console.log('onFilterItemButtonClick', clickData)
        pushCurrentFilterInput();
        switch (clickData) {
            case "city":
                setSingleFilterItemId("city");
                break;
            default:
                const id = clickData.split("-")[0];
                setSingleFilterItemId(id);
                break;
        }
        setFetchAdvertFlag(false);
        setMobileFilterOpen(true);
        e.stopPropagation();
    }, [pushCurrentFilterInput, setFetchAdvertFlag, setMobileFilterOpen, setSingleFilterItemId])

    const onFilterItemResetButtonClick = useCallback(e => {
        const clickData = e.target.getAttribute('data-click');
        switch (clickData) {
            case "city":
                // setSingleFilterItemId("city");
                setLocation("");
                e.stopPropagation();
                break;
            default:
                // setSingleFilterItemId(clickData);
                const [id, type] = clickData.split("-");
                if (id && type) {
                    resolveAttributeButtonReset({ id: Number.parseInt(id), type: Number.parseInt(type) }, usedInputMaps)
                    e.stopPropagation();
                }
                break;
        }
    }, [setLocation, usedInputMaps])

    const onAllFilterButtonClick = useCallback(e => {
        pushCurrentFilterInput();
        setSingleFilterItemId(null);
        setFetchAdvertFlag(false);
        setMobileFilterOpen(true);
        e.stopPropagation();
    }, [pushCurrentFilterInput, setFetchAdvertFlag, setMobileFilterOpen, setSingleFilterItemId])

    function renderResetableButton(clickData: string, label: string, hasData: boolean, onClick: (e:any) => void, onResetClick: (e:any) => void) {
        return <button data-click={clickData} className={"filter-button flat-button small " + (hasData ? "blue" : "white")} onClick={onClick}>
            {label}
            <div className="children-separator" style={{ display: !hasData ? 'none' : 'inline-block' }}></div>
            <button data-click={clickData} style={{ display: !hasData ? 'none' : 'inline-block' }} className="simple-link" onClick={onResetClick}>
                <span data-click={clickData} className="backgrounded-span white-close-icon before" onClick={onResetClick}></span>
            </button>
        </button>
    }

    const topFiveCatAtts = [xBaseAttributes[0], xBaseAttributes[1], xBaseAttributes[2], xBaseAttributes[3], xBaseAttributes[4]];
    let firstCatAttHasData = resolveIsAttributeButtonHasData(xBaseAttributes[0], usedInputMaps);
    return <ul id="mobile-filter-buttons" className="res-b maxw1023 mt20">

        {renderResetableButton("category", !selectedCat || !selectedCat.id ? trans("apps.inallcategories", commonTexts) : selectedCat.name,
            !!(selectedCat && selectedCat.id), onCategoryButtonClick, onCategoryResetButtonClick)}

        {topFiveCatAtts[0] && topFiveCatAtts[0].id === 1 &&
            renderResetableButton(`${topFiveCatAtts[0].id}-${topFiveCatAtts[0].type}`, topFiveCatAtts[0].name, firstCatAttHasData, onFilterItemButtonClick, onFilterItemResetButtonClick)}

        {renderResetableButton("city", trans("apps.advertcity", textPack), !!location, onFilterItemButtonClick, onFilterItemResetButtonClick)}

        {topFiveCatAtts.map(att => {
            let hasData = resolveIsAttributeButtonHasData(att, usedInputMaps);
            return att && att.id !== 1 &&
                renderResetableButton(`${att.id}-${att.type}`, att.name, hasData, onFilterItemButtonClick, onFilterItemResetButtonClick)
        })
        }
        <button id="all-filters-button" className="flat-button small white" onClick={onAllFilterButtonClick}>
            <span className="backgrounded-span filter-icon before">{trans("apps.allfilter", textPack)}</span>
        </button>
    </ul>;
}