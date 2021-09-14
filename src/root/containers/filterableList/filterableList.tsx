import { Route, Switch, NavLink, Link } from 'react-router-dom'
import React, { Component, useState, useEffect, useLayoutEffect, useRef, useCallback, Fragment, useContext, useMemo, MutableRefObject, SetStateAction, Dispatch } from 'react';
import { useHistory, useLocation } from "react-router-dom";
import "../../components/advertLists/style.css";
import "./style.css";
import Axios from 'axios';
import { useTextPack, trans, parseZipCity, formatString, useWindowInnerSize } from '../../utils/common';
import { RootContext } from '../../root';
import {
    ATTRIBUTE_ID_LIST, ATTRIBUTE_MULTIID_LIST, ATTRIBUTE_RANGE_LIST_DATE, ATTRIBUTE_RANGE_LIST_NUMBER,
    ATTRIBUTE_TEXT_LIST, CATEGORY_ID, encodeSubQuery, SEARCH_LOCATION, SEARCH_TERM, SORT_FIELD, SORT_ORDER, getCompoundQuery, updateSubQueryRef, TQuueryField
} from '../../utils/searchQueryHelper';
import { TextSearch } from '../../components/textSearch/textSearch';
import { ADVERT_SEARCH_RESULT_API, ADVERT_SEARCH_COUNT_API } from '../../utils/network';
import { VerticalList } from '../../components/advertLists/list';
import { Filter } from '../filter/filter';
import { SortTypeSelector } from '../../components/sortTypeSelector/SortTypeSelector';
import Spinner from '../../components/spinner/Spinner';
import { SearchNavigator } from '../../components/searchNavigator/SearchNavigator';
import { TTextPack, ICommonFilter, ICategoryFilter, ILoginInfo, INoContent, IRootContext, TLanguage, IXBaseCountry, TTextPackId } from '../../utils/xbaseInterface.d';
const PAGE_SIZE = 20;
const ID_LIST_FETCHING = -1;
const DELAY_SEARCH_ON_KEYBOARD = 1500;
const DELAY_SEARCH_ON_MOUSE_OR_REFRESH = 200;

export const DUMMY_CATEGORY = { id: 0, name: "" };

// function refineForSearch(entriedAttributes) {
//     entriedAttributes.map(item => {
//         if (item.inputNumber === null)
//             item.inputNumber = 0;
//     });
//     return entriedAttributes;
// }

export interface IFilterableList {
    appearAt?: string;
    lng?: TLanguage;
    filterApi: string;
    localAdvertIds?: Array<string>;
    onRootSearchCountUpdate?: Dispatch<SetStateAction<any>>;    
    commonFilter: ICommonFilter;
    categoryFilter?: ICategoryFilter;
    shortType?: string;
    forFilterOnlyData?: any;
    title?: string;
    isSearchAdvert: boolean;
    children?: any;
    onItemControllerClicks?: any;
    nocontent?: INoContent;
    itemTextPack?: TTextPack;
}
export default function FilterableList(props: IFilterableList): JSX.Element {

    const {appearAt, lng, filterApi, localAdvertIds, onRootSearchCountUpdate, commonFilter, shortType
        ,categoryFilter, forFilterOnlyData, title, isSearchAdvert, children, onItemControllerClicks, nocontent, itemTextPack} = props;

    const rootContext: IRootContext = useContext(RootContext);
    const routerLocation = useLocation();
    const history = useHistory();
    const [filterResultIds, setFilterResultIds] = useState(null);
    const [searchCounts, setSearchCounts] = useState(new Map<number, number>());
    const [currentPageNumber, setCurrentPageNumber] = useState(1);
    const [currentPageDetails, setCurrentPageDetails] = useState([]);
    const [searchTerm, setSearchTerm] = useState(null);
    const [commitSearchTerm, setCommitSearchTerm] = useState(null);
    const [sortType, setSortType] = useState("dpo|d");
    const [categoryName, setCategoryName] = useState("");
    const [categoryPath, setCategoryPath] = useState([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const subQueriesRef: MutableRefObject<Map<TQuueryField, string>> = useRef<Map<TQuueryField, string>>(new Map<TQuueryField, string>());
    const previousSearchAdvertQueryRef = useRef(null);
    const previousSearchCountQueryRef = useRef(null);
    const textPack = useTextPack(rootContext, "SEARCH" as TTextPackId);
    const appearAtHome = appearAt === "home";
    const subCategoryCacheRef = rootContext.subCategoryCacheRef;
    const loginInfo = rootContext.loginInfo;
    
    useEffect(() => {
        if (currentPageNumber !== ID_LIST_FETCHING) {
            let ids = filterResultIds ? filterResultIds.slice((currentPageNumber - 1) * PAGE_SIZE, currentPageNumber * PAGE_SIZE) : [];
            console.log('searchResultIds pageIds ids', ids)
            console.log('fetchDetail pageIds', ids)
            if (ids.length > 0) {
                setIsLoading(true);
                Axios.post(ADVERT_SEARCH_RESULT_API, {
                    language: lng,
                    ids: ids,
                    debug: 'search',
                })
                    .then(function (response) {
                        console.log(`POST /fetchDetails RESPONSE = `, response.data);
                        setCurrentPageDetails(response.data);
                        setIsLoading(false);
                    })
                    .catch(function (error) {
                        console.log(`POST /fetchDetails ERROR:`, error);
                        alert(`POST /fetchDetails ERROR:` + error);
                    });
            } else {
                setCurrentPageDetails([]);
                setIsLoading(false);
            }
        }
    }, [currentPageNumber, filterResultIds, lng]);

    const onTermChange = useCallback(function (e) {
        setSearchTerm(e.target.value);
    }, []);

    const fetchAdvertIds = useCallback((debugInfo) => {
        if (appearAtHome)
            return;
        else if (!filterApi) {
            setFilterResultIds(localAdvertIds);
            return;
        }
        console.log('fetchAdvertIds debugInfo', debugInfo)
        const queryObject = getCompoundQuery(subQueriesRef.current);
        setTimeout(function () {
            let currentQueryObject = getCompoundQuery(subQueriesRef.current)
            if (queryObject.query === currentQueryObject.query && (!previousSearchAdvertQueryRef.current || queryObject.query !== previousSearchAdvertQueryRef.current.query)) {
                console.log(`filter search  ${filterApi}`, 'post search!')
                history.replace({ pathname: routerLocation.pathname, search: '?' + queryObject.query });
                setCurrentPageNumber(ID_LIST_FETCHING);
                setIsLoading(true);
                Axios.post(filterApi, {
                    language: lng,
                    query: queryObject.query,
                })
                    .then(function (response) {
                        let currentQueryObject2 = getCompoundQuery(subQueriesRef.current)
                        console.log('fetchAdvertIds ===', currentQueryObject.query === currentQueryObject2.query)
                        if (currentQueryObject.query === currentQueryObject2.query) {
                            const ids = response.data;
                            setFilterResultIds(ids);
                            console.log('isLoading ids', ids)
                            if (ids.length === 0) {
                                setIsLoading(false);
                            }
                            console.log('fetchAdvertIds', response.data)
                            rootContext.searchResultIdsRef.current = response.data;
                            setCurrentPageNumber(1);
                        }
                    })
                    .catch(function (error) {
                        alert(`filter search  ${filterApi} ERROR:` + error);
                    });
                previousSearchAdvertQueryRef.current = queryObject;
            }
            if (queryObject.query !== currentQueryObject.query) {
                console.log(`filter search  ${filterApi}`, 'not finish input yet....', queryObject.query, currentQueryObject.query)
            }
        }, previousSearchAdvertQueryRef.current && queryObject.keyBoardInputQuery !== previousSearchAdvertQueryRef.current.keyBoardInputQuery && !rootContext.isMobileSCreenSize
            ? DELAY_SEARCH_ON_KEYBOARD : DELAY_SEARCH_ON_MOUSE_OR_REFRESH);
    }, [appearAtHome, filterApi, localAdvertIds, lng, rootContext.isMobileSCreenSize, rootContext.searchResultIdsRef, history, routerLocation.pathname]);

    const fetchSearchCounts = useCallback(() => {
        const queryObject = getCompoundQuery(subQueriesRef.current);
        setTimeout(function () {
            let currentQueryObject = getCompoundQuery(subQueriesRef.current)
            if (queryObject.query === currentQueryObject.query && (!previousSearchCountQueryRef.current || queryObject.query !== previousSearchCountQueryRef.current.query)) {
                console.log('SearchCounts', 'post SearchCounts!')
                // window.history.replaceState(null, null, routerLocation.pathname + '?' + queryObject.query);
                // setCurrentPageNumber(ID_LIST_FETCHING);
                Axios.post(ADVERT_SEARCH_COUNT_API, {
                    language: lng,
                    query: queryObject.query,
                })
                    .then(function (response) {
                        let currentQueryObject2 = getCompoundQuery(subQueriesRef.current)
                        if (currentQueryObject.query === currentQueryObject2.query) {
                            console.log('SearchCounts response', response.data)
                            interface ISearchCountItem {
                                id:number;
                                count:number;
                            }
                            let searchCountArray: Array<ISearchCountItem> = response.data;
                            let searchCountMap = new Map();
                            searchCountArray.map((item: ISearchCountItem) => {
                                searchCountMap.set(item.id, item.count);
                            })
                            setSearchCounts(searchCountMap);
                            console.log('onRootSearchCountUpdate', onRootSearchCountUpdate, searchCountMap.get(0))
                            if (onRootSearchCountUpdate)
                                onRootSearchCountUpdate(searchCountMap.get(0))
                        }
                    })
                    .catch(function (error) {
                        alert(`POST ${filterApi} ERROR:` + error);
                        setSearchCounts(new Map());
                    });
                previousSearchCountQueryRef.current = queryObject;
            }
            if (queryObject.query !== currentQueryObject.query) {
                console.log('SearchCounts', 'not finish input yet....')
            }
        }, previousSearchCountQueryRef.current && queryObject.keyBoardInputQuery !== previousSearchCountQueryRef.current.keyBoardInputQuery && !rootContext.isMobileSCreenSize
            ? DELAY_SEARCH_ON_KEYBOARD : DELAY_SEARCH_ON_MOUSE_OR_REFRESH);
    }, [rootContext.isMobileSCreenSize, lng, onRootSearchCountUpdate, filterApi]);

    const onSearchTextClick = useCallback(function (e) {
        setCommitSearchTerm(searchTerm);
    }, [searchTerm]);

    const onSortTypeSelect = useCallback(function (e) {
        setSortType(e.target.value)
    }, []);

    useEffect(() => {
        updateSubQueryRef(subQueriesRef, SEARCH_TERM, commitSearchTerm)
        fetchAdvertIds("searchTerm");
    }, [commitSearchTerm, fetchAdvertIds]);

    useEffect(() => {
        if (commonFilter.term) {
            setSearchTerm(commonFilter.term);
            setCommitSearchTerm(commonFilter.term);
        }
    }, [commonFilter.term])

    useEffect(() => {
        const [sf, so] = sortType.split("|");
        updateSubQueryRef(subQueriesRef, SORT_FIELD, sf);
        updateSubQueryRef(subQueriesRef, SORT_ORDER, so);
        if(!appearAtHome) 
            fetchAdvertIds(SORT_ORDER);
        else
            fetchSearchCounts();
    }, [appearAtHome, sortType, fetchAdvertIds, fetchSearchCounts]);

    useEffect(() => {
        if (shortType)
            setSortType(shortType);
    }, [shortType])

    const dummyCategory = useMemo(() => ({
        id: 0, name: trans("apps.inallcategories", rootContext.commonTexts)
    }), [rootContext.commonTexts])


    const onLocationChange = useCallback((location, flushModalInputFlag) => {
        let { zip } = parseZipCity(location);
        console.log('on***Change onLocationChange zip = ', zip, ' flushModalInputFlag = ', flushModalInputFlag)
        updateSubQueryRef(subQueriesRef, SEARCH_LOCATION, zip);
        if (flushModalInputFlag)
            fetchAdvertIds(SEARCH_LOCATION);
        fetchSearchCounts();
    }, [fetchAdvertIds, fetchSearchCounts]);

    const onCategoryChange = useCallback((category, flushModalInputFlag) => {
        console.log('on***Change onCategoryChange', category, flushModalInputFlag)
        category = category || dummyCategory;
        setCategoryName(category.name);
        updateSubQueryRef(subQueriesRef, CATEGORY_ID, category.id);
        if (flushModalInputFlag)
            fetchAdvertIds(CATEGORY_ID);
        fetchSearchCounts();
    }, [fetchAdvertIds, fetchSearchCounts, dummyCategory]);

    const onCategoryPathChange = useCallback((categoryPath, flushModalInputFlag) => {
        console.log('on***Change categoryPath', categoryPath)
        setCategoryPath(categoryPath);
    }, []);

    const onInputNumberChange = useCallback((map, flushModalInputFlag) => {
        console.log('on***Change FilterableList onInputNumberChange map', map)
        updateSubQueryRef(subQueriesRef, ATTRIBUTE_RANGE_LIST_NUMBER, map)
        fetchSearchCounts();
        if (flushModalInputFlag)
            fetchAdvertIds(ATTRIBUTE_RANGE_LIST_NUMBER);
    }, [fetchAdvertIds, fetchSearchCounts]);

    const onInputDateChange = useCallback((map, flushModalInputFlag) => {
        console.log('FilterableList onInputDateChange map', map)
        updateSubQueryRef(subQueriesRef, ATTRIBUTE_RANGE_LIST_DATE, map)
        fetchSearchCounts();
        if (flushModalInputFlag)
            fetchAdvertIds(ATTRIBUTE_RANGE_LIST_DATE);
    }, [fetchAdvertIds, fetchSearchCounts]);

    const onInputTextChange = useCallback((map, flushModalInputFlag) => {
        console.log('on***Change FilterableList onInputTextChange map', map)
        updateSubQueryRef(subQueriesRef, ATTRIBUTE_TEXT_LIST, map)
        fetchSearchCounts();
        if (flushModalInputFlag)
            fetchAdvertIds(ATTRIBUTE_TEXT_LIST);
    }, [fetchAdvertIds, fetchSearchCounts]);

    const onSingleEntrySelectChange = useCallback((map, flushModalInputFlag) => {
        console.log('on***Change FilterableList onSingleEntrySelectChange map', map, flushModalInputFlag)
        updateSubQueryRef(subQueriesRef, ATTRIBUTE_ID_LIST, map)
        fetchSearchCounts();
        if (flushModalInputFlag)
            fetchAdvertIds(ATTRIBUTE_ID_LIST);
    }, [fetchAdvertIds, fetchSearchCounts]);

    const onMultiEntrySelectChange = useCallback((map, flushModalInputFlag) => {
        console.log('on***Change FilterableList onMultiEntrySelectChange map', map)
        updateSubQueryRef(subQueriesRef, ATTRIBUTE_MULTIID_LIST, map)
        fetchSearchCounts();
        if (flushModalInputFlag)
            fetchAdvertIds(ATTRIBUTE_MULTIID_LIST);
    }, [fetchAdvertIds, fetchSearchCounts]);

    const pageCount = filterResultIds && Math.ceil(filterResultIds.length / PAGE_SIZE);

    const onFreviousPageClick = useCallback(function () {
        setCurrentPageNumber(currentPageNumber => currentPageNumber > 1 ? currentPageNumber - 1 : 1);
    }, []);

    const onNextPageClick = useCallback(function () {
        setCurrentPageNumber(currentPageNumber => currentPageNumber < pageCount ? currentPageNumber + 1 : currentPageNumber);
    }, [pageCount]);

    const onPageButtonClick = useCallback(function (e) {
        const clickData = Number.parseInt(e.target.getAttribute('data-click'));
        setCurrentPageNumber(clickData + 1)
    }, []);

    const pageNumClassName = "link-button material white page-number";

    function renderFilter(appearAt: string) {
        return <Filter
            editInputs={categoryFilter}
            commonFilter={commonFilter}
            appearAt={appearAt}
            textPack={textPack}
            isSearch={true}
            onCategoryChange={onCategoryChange}
            onCategoryPathChange={onCategoryPathChange}
            onInputNumberChange={onInputNumberChange}
            onInputDateChange={onInputDateChange}
            onInputTextChange={onInputTextChange}
            onSingleEntrySelectChange={onSingleEntrySelectChange}
            onMultiEntrySelectChange={onMultiEntrySelectChange}
            onXBaseAttributeChange={null}
            onLocationChange={onLocationChange}
            searchCounts={searchCounts}
            usedHomeModalOpenState={forFilterOnlyData ? forFilterOnlyData.usedHomeModalOpenState : null}
            onHomeCategorySelected={forFilterOnlyData ? forFilterOnlyData.onHomeCategorySelected : null}
        ></Filter>
    }
    function renderOnlyFilter() {
        return renderFilter("home")
    }
    console.log('isLoading', isLoading)

    function renderFullContent() {
        return <Fragment>
            <SearchNavigator categoryPath={categoryPath} id="search-list-navigator"></SearchNavigator>
            <div className="filterable-list">
                <div className="filter-container">
                    <div id="text-search-mobile" className="res-b maxw1023 mt20">
                        <TextSearch value={searchTerm} onChange={onTermChange} onClick={onSearchTextClick}
                            btnText={trans("apps.action.search", rootContext.commonTexts)}></TextSearch>
                    </div>
                    {renderFilter("search")}
                </div>
                <div id="filterable-list-horizontal-separator"></div>
                <div className="list-container">
                    <h1 id="result-count">{formatString(title || trans("apps.resulttitle", textPack), filterResultIds && filterResultIds.length, categoryName)}</h1>
                    {isSearchAdvert && <div id="search-list-header">
                        <div id="search-text-sort">
                            <div className="form-item res-b minw1024">
                                <label htmlFor="contact-type">{trans("apps.search.term", textPack)}</label>
                                <TextSearch value={searchTerm} onChange={onTermChange} onClick={onSearchTextClick}
                                    btnText={trans("apps.action.search", rootContext.commonTexts)}></TextSearch>
                            </div>
                            <div></div>
                            <div id="sort-item" className="form-item">
                                <label htmlFor="sort-selector">{trans("apps.sorting", textPack)}</label>
                                <SortTypeSelector value={sortType} onChange={onSortTypeSelect} textPack={textPack} isElevantAvailable={!!searchTerm}/>
                            </div>
                        </div>
                    </div>}
                    {children}

                    <div id="loading" style={{ display: isLoading ? 'block' : 'none' }}><Spinner/></div>

                    <div style={{ display: !isLoading ? 'block' : 'none' }}>
                        <VerticalList adverts={currentPageDetails} itemClass="material-bordered" loginInfo={loginInfo}
                            onItemControllerClicks={onItemControllerClicks} textPack={itemTextPack}/>
                    </div>

                    <div className="page-navigator" style={{ display: filterResultIds && filterResultIds.length > 0 ? 'block' : 'none' }}>
                        <button className={pageNumClassName} disabled={currentPageNumber === 1}
                            onClick={onFreviousPageClick}><span className="backgrounded-span page-previous-icon before">
                                {trans("apps.action.back", rootContext.commonTexts)}
                            </span></button>
                        {(Array.from(Array(pageCount).keys()) as Array<number>).map(number => {
                            return <button className={pageNumClassName} disabled={number === currentPageNumber - 1} data-click={number}
                                onClick={onPageButtonClick}>{number + 1}</button>
                        })}
                        <button className={pageNumClassName} disabled={currentPageNumber === pageCount} onClick={onNextPageClick}>
                            <span className="backgrounded-span page-next-icon after">
                                {trans("apps.action.next", rootContext.commonTexts)}
                            </span></button>
                    </div>
                    <div style={{ display: !isLoading && filterResultIds && filterResultIds.length === 0 ? 'block' : 'none' }}>
                        <div id="no-content">
                            <div id="no-content-image">
                                <img src={require("../../files/no-results.png")} alt=""></img>
                            </div>
                            {/* <div id="no-content-image"></div> */}
                            <div id="no-content-message">
                                <h3 className="mb12">{nocontent.title}</h3>
                                <span>{nocontent.description}</span>
                                <button className="link-button material lightgray large pw100 mt16" onClick={nocontent.onButtonClick}>{nocontent.buttonText}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </Fragment >
    }
    return appearAtHome ? renderOnlyFilter() : renderFullContent();
}