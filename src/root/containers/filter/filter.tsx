import { Route, Switch, NavLink, Link } from 'react-router-dom'
import lodash from 'lodash';
import React, { Component, Fragment, useState, useEffect, useLayoutEffect, useRef, useCallback, useContext, useMemo, Dispatch, SetStateAction } from 'react';
import Axios from 'axios';
import "./filter.css";
import { USE_MOCK_DATA, mockAttList, mockEntriedAttributes } from '../insert/helper/mockdata';
import AttType, { isSelectType, isSelectMultiType, getFilterAttributeMapId, FORCE_SELECT_SINGLE, ENTRY_ID, ENTRY_IDS, INPUT_NUMBER, INPUT_TEXT, INPUT_DATE, ATT_MAP_IDS, resolveIsAttributeButtonHasData, resolveAttributeButtonReset } from './attribute/attributeFactory';
// import { InsertionContext, ValidationContext } from './insert';
import { CATEGORY_FIRST_INPUT_OFFSET_Y, formatString, trans, USED_SET_STATE_INDEX, USED_STATE_INDEX, useWindowInnerSize } from '../../utils/common';
import { XBASE_GET_SUBCATEGORIES_API, XBASE_GET_CATEGORY_PATH_BY_ID_API, XBASE_ATTRIBUTES_BY_CAT_ID_API } from '../../utils/network';
import CenterAnchoredModal from '../../components/templates/centerAnchoredModal/centerAnchoredModal';
import { LocationSearch } from './locationSearch';
import { RootContext } from '../../root';
import AttributeList from './attribute/attributeList';
import CategoryInLineList from './category/categoryInLineList';
import CategoryModal from './category/categoryModal';
import { FilterButtons } from './buttons/filterButtons';
import { InsertionContext, ValidationContext } from '../../screens/insert/insert';
import { IDetailAttribute, IXBaseAttribute, IXBaseCategory, TTextPack, TAttributeState, TAttributeSetState, IRootContext } from '../../utils/xbaseInterface.d';
export const FilterContext = React.createContext(null);
const FIXED_PRICE = 15218;
const DEFAULT_XBASE_ATTRIBUTES: IXBaseAttribute[] = [];

interface filterStateS {
    location: string;
    selectedCat: IXBaseCategory;
    parentCats: Array<IXBaseCategory>;
    xBaseAttributes: IXBaseAttribute[];
    attributes: Array<TAttributeState>;
}

interface IFilterProps {
    editInputs: any;
    isSearch: boolean;
    appearAt: string;
    onCategoryChange: (category: IXBaseCategory, flush: boolean) => void;
    onCategoryPathChange: (categoryPath: Array<IXBaseCategory>, flush: boolean) => void;
    onInputNumberChange: (attMap: TAttributeState, flush: boolean) => void;
    onInputDateChange: (attMap: TAttributeState, flush: boolean) => void;
    onInputTextChange: (attMap: TAttributeState, flush: boolean) => void;
    onSingleEntrySelectChange: (attMap: TAttributeState, flush: boolean) => void;
    onMultiEntrySelectChange: (attMap: TAttributeState, flush: boolean) => void;
    onXBaseAttributeChange: (atts: Array<IXBaseAttribute>) => void;
    textPack?: TTextPack;
    usedHomeModalOpenState?: [boolean, Dispatch<SetStateAction<boolean>>];
    onHomeCategorySelected?: (cat: IXBaseCategory) => void;
    onLocationChange?: (location: string, flush: boolean) => void;
    searchCounts?: Map<number, number>;
    commonFilter?: any;
}

export function Filter(props: IFilterProps) {
    const { editInputs,
        isSearch,
        appearAt,
        onCategoryChange,
        onCategoryPathChange,
        onInputNumberChange,
        onInputDateChange,
        onInputTextChange,
        onSingleEntrySelectChange,
        onMultiEntrySelectChange,
        onXBaseAttributeChange,
        textPack,
        usedHomeModalOpenState,
        onHomeCategorySelected,
        onLocationChange,
        searchCounts,
        commonFilter,
    } = props;

    const rootContext: IRootContext = useContext(RootContext);
    const insertionContext = useContext(InsertionContext);
    const validationContext = useContext(ValidationContext);
    const [location, setLocation] = useState<string>("");
    const [selectedCat, setSelectedCat] = useState<IXBaseCategory>(null);
    const [parentCats, setParentCats] = useState<Array<IXBaseCategory>>([]);
    const [subCats, setSubCats] = useState<Array<IXBaseCategory>>([]);
    const [categoryModalOpen, setCategoryModalOpen] = useState<boolean>(false);
    const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);
    const [xBaseAttributes, setXBaseAttributes] = useState<Array<IXBaseAttribute>>(DEFAULT_XBASE_ATTRIBUTES);
    const [singleFilterItemId, setSingleFilterItemId] = useState(null);
    const usedInputMaps: Array<[TAttributeState, TAttributeSetState]> = [
        useState<TAttributeState>(new Map()),
        useState<TAttributeState>(new Map()),
        useState<TAttributeState>(new Map()),
        useState<TAttributeState>(new Map()),
        useState<TAttributeState>(new Map())
    ];
    const currentFilterInputMapRef = useRef<Array<filterStateS>>([]);
    const [fetchAdvertFlag, setFetchAdvertFlag] = useState<boolean>(true);
    const isSearchFlow = appearAt === "search";
    const isInsertFlow = appearAt === "insert";
    const isHomeFlow = appearAt === "home";
    const isMobileSCreenSize = rootContext.isMobileSCreenSize;
    const isSubCatInline = isSearchFlow && !isMobileSCreenSize;
    const subCategoryCacheRef = rootContext.subCategoryCacheRef;
    const commonTexts = rootContext.commonTexts;
    const categoryAttributesCacheRef = rootContext.categoryAttributesCacheRef;

    const pushCurrentFilterInput = useCallback(() => {
        console.log('pushCurrentFilterInput selectedCat', selectedCat)
        currentFilterInputMapRef.current.push({
            location: location,
            selectedCat: selectedCat,
            parentCats: parentCats,
            xBaseAttributes: xBaseAttributes,
            attributes: Array.from(ATT_MAP_IDS, id => lodash.cloneDeep(usedInputMaps[id][USED_STATE_INDEX]))
        });

    }, [location, parentCats, selectedCat, usedInputMaps, xBaseAttributes]);

    const popCurrentFilterInput = useCallback((clearTopOnly?: boolean) => {
        console.log('popCurrentFilterInput', currentFilterInputMapRef.current)
        const topStack = currentFilterInputMapRef.current.pop();
        if (clearTopOnly !== true && topStack) {
            setLocation(topStack.location);
            setSelectedCat(topStack.selectedCat);
            setParentCats(topStack.parentCats);
            setXBaseAttributes(topStack.xBaseAttributes);
            console.log('topStack.attributes[INPUT_NUMBER]', topStack.attributes[INPUT_NUMBER])
            topStack.attributes.map((item, index) => usedInputMaps[index][USED_SET_STATE_INDEX](item))
        }
    }, [usedInputMaps]);

    const catMapForClick = useMemo(() => {
        let result = new Map();
        if (parentCats && subCats)
            [...parentCats, ...subCats].map(item => {
                result.set(item.id, item);
            })
        console.log('catMapForClick useMemo', result)
        return result;
    }, [parentCats, subCats]);

    useEffect(() => {
        const fetchAdvertFlag = !isMobileSCreenSize || (!categoryModalOpen && !mobileFilterOpen);
        setFetchAdvertFlag(fetchAdvertFlag);
        if (!isMobileSCreenSize)
            setSingleFilterItemId(null);
    }, [isMobileSCreenSize, categoryModalOpen, mobileFilterOpen]);

    useEffect(() => {
        if (categoryModalOpen || mobileFilterOpen)
            rootContext.usedPageYOffset[USED_SET_STATE_INDEX](window.pageYOffset);
        rootContext.usedDisableScrollY[USED_SET_STATE_INDEX](categoryModalOpen || mobileFilterOpen);
        console.log('usedDisableScrollY', categoryModalOpen, mobileFilterOpen)
    }, [categoryModalOpen, mobileFilterOpen, rootContext.usedPageYOffset, rootContext.usedDisableScrollY]);

    console.log('fetchAdvertFlag', fetchAdvertFlag)
    useEffect(() => {
        console.log('editInputs', editInputs)
        console.log('editInputs categoryId', editInputs && editInputs.categoryId)
        if (editInputs != null) {/*TODO: can improve with if(editInputs)*/
            let categoryId = editInputs.categoryId;
            if (categoryId || categoryId === 0 && isSearchFlow) {
                console.log('editInputs if')
                Axios.get(XBASE_GET_CATEGORY_PATH_BY_ID_API, {
                    params: { id: categoryId, lng: rootContext.language }
                })
                    .then(function (response) {
                        console.log('editInputs response.data = ', response.data)
                        // alert("register response = " + JSON.stringify(response.data.subCategories));
                        // subCategoryCacheRef.current[rootContext.language].set(id, response.data.subCategories);
                        let xbaseCats = response.data;
                        console.log('editInputs xbaseCats ', xbaseCats);
                        setParentCats(xbaseCats);
                        let leafCat = xbaseCats[xbaseCats.length - 1]
                        setSelectedCat(leafCat);
                        console.log('isSubCatInline ', isSubCatInline);
                        // if (isSubCatInline)
                        fetchSubCategory(leafCat, false);
                        // console.log('setSubCats getCategoryPathById 1', [])
                        if (isSearchFlow)
                            updateAttributeSection(leafCat, "useEffect editInputs");
                    })
                    .catch(function (error) {
                        console.log("catch error", error);
                        alert("catch error" + error);
                    });
            } else {
                console.log('editInputs else')
                setParentCats([]);
                setSelectedCat(null);
                // setSubCats([]);
                // console.log('setSubCats getCategoryPathById 2', [])
            }
        }
    }, [editInputs && editInputs.categoryId, rootContext.language]);


    useEffect(() => {
        if (commonFilter && commonFilter.location)
            setLocation(commonFilter.location);
    }, [commonFilter && commonFilter.location])


    function zipCityView() {
        return <LocationSearch value={location} onChange={setLocation} isSearch={true} />
    }

    const updateUsedInputMaps = useCallback(function (xBaseAttributes) {
        // console.log('updateUsedInputMaps populatedCat', populatedCat)
        // entriedAttributeMapRef.current = new Map();
        const newInputMaps = [new Map(), new Map(), new Map(), new Map(), new Map()];
        xBaseAttributes.map((att: IXBaseAttribute) => {
            let mapToUse = newInputMaps[getFilterAttributeMapId(att.type)];
            let editInput = editInputs && editInputs.attributes && editInputs.attributes.find((detailAtt: IDetailAttribute) => att.id === detailAtt.attributeId);
            console.log('updateUsedInputMaps editInput', editInput)
            let defaultInput: IDetailAttribute = {
                attributeId: att.id,
                attributeEntryIds: isInsertFlow && isSelectType(att.type) && att.defaultSelectItemId ? [att.defaultSelectItemId] : null,
                attributeEntryId: isInsertFlow && isSelectType(att.type) ? att.defaultSelectItemId : null,
                inputText: null,
                inputNumber: null,
                inputDate: '',//'2020-10-15'
            }
            mapToUse.set(att.id, editInput || defaultInput);
        });

        ATT_MAP_IDS.map(item => {
            usedInputMaps[item][USED_SET_STATE_INDEX](newInputMaps[item]);
            console.log(`updateUsedInputMaps newInputMaps[item]`, newInputMaps[item])
        })
    }, [editInputs, isInsertFlow, usedInputMaps])

    const updateAttributeSection = useCallback(function (cat: IXBaseCategory, debugInfo: string) {
        setXBaseAttributes(DEFAULT_XBASE_ATTRIBUTES);
        console.log('updateAttributeSection cat', cat, 'debugInfo', debugInfo)
        if (cat || isSearchFlow) {
            const categoryId = cat ? cat.id : 0;
            if (!categoryAttributesCacheRef.current.has(rootContext.language)) {
                categoryAttributesCacheRef.current.set(rootContext.language, new Map())
            }
            if (categoryAttributesCacheRef.current.get(rootContext.language).get(categoryId)) {
                setXBaseAttributes(categoryAttributesCacheRef.current.get(rootContext.language).get(categoryId));
            } else {
                Axios.get(XBASE_ATTRIBUTES_BY_CAT_ID_API, {
                    params: { id: categoryId, lng: rootContext.language, isSearch: isSearchFlow }
                })
                    .then(function (response) {
                        // alert("POST '/attributesByCatId' RESPONSE = " + JSON.stringify(response.data));
                        console.log("POST '/attributesByCatId' RESPONSE = ", response.data);
                        updateUsedInputMaps(response.data);
                        setXBaseAttributes(response.data);
                    })
                    .catch(function (error) {
                        console.log("POST '/attributesByCatId' ERROR:", error);
                        alert("POST '/attributesByCatId' ERROR:" + error);
                        updateUsedInputMaps([]);
                        setXBaseAttributes(DEFAULT_XBASE_ATTRIBUTES);
                    });
            }
        } else {
            updateUsedInputMaps([]);
            setXBaseAttributes(DEFAULT_XBASE_ATTRIBUTES);
        }
    }, [isSearchFlow, rootContext.language, updateUsedInputMaps]);

    const fetchSubCategory = useCallback(function (cat: IXBaseCategory, openModal?: boolean) {
        console.log('fetchSubCategoryopenModal openModal', openModal)
        setParentCats(parentCats => {
            if (!cat)
                return [];
            else {
                let found = parentCats.indexOf(cat);
                if (found >= 0) {
                    return parentCats.slice(0, found + 1);
                } else
                    return [...parentCats, cat];
            }
        });
        // setCurCatLevel(lv => (id ? lv + 1 : 0));
        const willModalOpen = (isMobileSCreenSize || isHomeFlow || isInsertFlow) && openModal !== false;
        console.log('fetchSubCategory selectedCat', selectedCat)
        if (!categoryModalOpen && willModalOpen)
            pushCurrentFilterInput();
        setCategoryModalOpen(willModalOpen);
        console.log('subCategoryCacheRef.current', subCategoryCacheRef.current, "rootContext.language", rootContext.language)
        let id = cat ? cat.id : null;
        if (!subCategoryCacheRef.current.has(rootContext.language)) {
            subCategoryCacheRef.current.set(rootContext.language, new Map())
        }
        if (subCategoryCacheRef.current.get(rootContext.language).has(id)) {
            console.log('subCategoryCacheRef.current[rootContext.language] has ', id);
            setSubCats(subCategoryCacheRef.current.get(rootContext.language).get(id));
            console.log('setSubCats subCategoryCacheRef', subCategoryCacheRef.current.get(rootContext.language).get(id))
        } else {
            // setSubCats([]);
            Axios.get(XBASE_GET_SUBCATEGORIES_API, {
                params: { id: id, lng: rootContext.language }
            })
                .then(function (response) {
                    // alert("register response = " + JSON.stringify(response.data.subCategories));
                    subCategoryCacheRef.current.get(rootContext.language).set(id, response.data.subCategories);
                    console.log('subCatMap set ', id);
                    setSubCats(response.data.subCategories);
                    console.log('setSubCats response', response.data.subCategories)
                })
                .catch(function (error) {
                    console.log("catch error", error);
                    alert("catch error" + error);
                });
        }
    }, [isInsertFlow, isMobileSCreenSize, isHomeFlow, selectedCat, categoryModalOpen, pushCurrentFilterInput, subCategoryCacheRef, rootContext.language]);

    console.log('draw subCats', subCats)

    useEffect(() => {
        if (usedHomeModalOpenState && usedHomeModalOpenState[USED_STATE_INDEX]) {
            setCategoryModalOpen(usedHomeModalOpenState[USED_STATE_INDEX]);
            fetchSubCategory(null);
            usedHomeModalOpenState[USED_SET_STATE_INDEX](false);
        }
    }, [usedHomeModalOpenState && usedHomeModalOpenState[USED_STATE_INDEX], usedHomeModalOpenState, fetchSubCategory]);

    const onCategoryClick = useCallback(function (e: React.MouseEvent<HTMLElement>, cat: IXBaseCategory) {
        e.preventDefault();
        e.stopPropagation();
        if (isInsertFlow && editInputs && editInputs.categoryPath) {
            alert("Can not modify category once posted");
            return;
        } else {
            fetchSubCategory(cat);
            if (!isInsertFlow) {
                setSelectedCat(cat);
                updateAttributeSection(cat, "updateSelectedCatFromModal");
            }
        }
    }, [editInputs, fetchSubCategory, isInsertFlow, updateAttributeSection]);

    const onRootCategoryClick = useCallback(function (e: any): void {
        onCategoryClick(e, null);
    }, [onCategoryClick]);

    const onSubCategoryClick = useCallback(function (e: any): void {
        const id = e.target.getAttribute('data-click');
        console.log('catMapForClick onCategoryClick id', id)
        console.log('catMapForClick onCategoryClick', catMapForClick.get(Number.parseInt(id)))
        onCategoryClick(e, catMapForClick.get(Number.parseInt(id)));
    }, [onCategoryClick, catMapForClick]);

    const entryIdAttMap = usedInputMaps[ENTRY_ID][USED_STATE_INDEX];
    const entryIdsAttMap = usedInputMaps[ENTRY_IDS][USED_STATE_INDEX];
    const inputNumberAttMap = usedInputMaps[INPUT_NUMBER][USED_STATE_INDEX];
    const inputTextAttMap = usedInputMaps[INPUT_TEXT][USED_STATE_INDEX];
    const inputDateAttMap = usedInputMaps[INPUT_DATE][USED_STATE_INDEX];

    useEffect(() => {
        if (onLocationChange) {
            onLocationChange(location, fetchAdvertFlag);
        }
    }, [onLocationChange, location, fetchAdvertFlag])

    useEffect(() => {
        if (onCategoryChange) {
            onCategoryChange(selectedCat, fetchAdvertFlag);
        }
    }, [onCategoryChange, selectedCat, fetchAdvertFlag])

    useEffect(() => {
        if (onCategoryPathChange) {
            onCategoryPathChange(parentCats, fetchAdvertFlag);
        }
    }, [onCategoryPathChange, parentCats, fetchAdvertFlag])

    useEffect(() => {
        if (onSingleEntrySelectChange) {
            onSingleEntrySelectChange(entryIdAttMap, fetchAdvertFlag);
        }
    }, [onSingleEntrySelectChange, entryIdAttMap, fetchAdvertFlag])

    useEffect(() => {
        if (onMultiEntrySelectChange) {
            onMultiEntrySelectChange(entryIdsAttMap, fetchAdvertFlag);
        }
    }, [onMultiEntrySelectChange, entryIdsAttMap, fetchAdvertFlag])

    useEffect(() => {
        if (onInputNumberChange) {
            onInputNumberChange(inputNumberAttMap, fetchAdvertFlag);
        }
    }, [onInputNumberChange, inputNumberAttMap, fetchAdvertFlag])

    useEffect(() => {
        if (onInputTextChange) {
            onInputTextChange(inputTextAttMap, fetchAdvertFlag);
        }
    }, [onInputTextChange, inputTextAttMap, fetchAdvertFlag])

    useEffect(() => {
        if (onInputDateChange) {
            onInputDateChange(inputDateAttMap, fetchAdvertFlag);
        }
    }, [onInputDateChange, inputDateAttMap, fetchAdvertFlag])

    useEffect(() => {
        if (onXBaseAttributeChange)
            onXBaseAttributeChange(xBaseAttributes);
    }, [onXBaseAttributeChange, xBaseAttributes])

    const onMobileFilterBottomButtonClick = useCallback(e => {
        console.log('onMobileFilterBottomButtonClick')
        popCurrentFilterInput(true);
        setMobileFilterOpen(false);
        setFetchAdvertFlag(true);
        e.stopPropagation();
    }, [popCurrentFilterInput])

    const onMobileFilterCancelClick = useCallback(e => {
        popCurrentFilterInput();
        setMobileFilterOpen(false);
        e.stopPropagation();
    }, [popCurrentFilterInput])

    // console.log('draw currentFilterInputMapRef length', currentFilterInputMapRef.current.length)

    const updateSelectedCatFromModal = useCallback(() => {
        popCurrentFilterInput(true);
        setCategoryModalOpen(false);
        let cat = parentCats.length > 0 ? parentCats[parentCats.length - 1] : null;
        console.log('updateSelectedCatFromModal setSelectedCat', cat)
        setSelectedCat(cat);
        updateAttributeSection(cat, "updateSelectedCatFromModal");
        if (onHomeCategorySelected)
            onHomeCategorySelected(cat);
        console.log("onCategoryModalCancelClick", isMobileSCreenSize);
        if (isMobileSCreenSize)
            setFetchAdvertFlag(!mobileFilterOpen);
    }, [isMobileSCreenSize, mobileFilterOpen, onHomeCategorySelected, parentCats, popCurrentFilterInput, updateAttributeSection]);

    useEffect(() => {
        if (isInsertFlow && parentCats.length > 0 && subCats.length === 0 &&
            selectedCat !== parentCats[parentCats.length - 1]) {
            updateSelectedCatFromModal();
        }
    }, [parentCats, subCats, isInsertFlow, selectedCat, updateSelectedCatFromModal]);

    console.log('render', "Filter AttributeInputText");

    const onCategoryModalCancelClick = useCallback(e => {
        e.stopPropagation();
        setCategoryModalOpen(false);
        popCurrentFilterInput();
    }, [popCurrentFilterInput])

    const getMobileFilterButtonText = useCallback(() => {
        console.log('getMobileFilterButtonText selectedCat', selectedCat)
        const count = searchCounts.get(selectedCat && selectedCat.id || 0);
        let text = count !== null && trans("apps.action.showresultsfromcategories_" + (count > 1 ? "n" : (count === 1 ? "1" : "0")), textPack) || "";
        text = count >= 1 ? formatString(text, count) : text;
        console.log('getMobileFilterButtonText', text)
        return text;
    }, [selectedCat, searchCounts, textPack])

    // let IXBaseCategoryelectorClass = "category-selector";// + (isSearchFlow ? " res-b minw1024" : "");
    console.log('draw categoryModalOpen', categoryModalOpen)

    function renderIXBaseCategoryelector() {
        if (!isSubCatInline) {
            const display = !isHomeFlow && !singleFilterItemId ? 'block' : 'none';
            return <Fragment>
                <div className="category-selector" style={{ display: display }}>
                    {!selectedCat &&
                        <label>{trans("apps.category", commonTexts)}
                            <span id="mandatory-mark">{editInputs != null ? "*" : ""}</span>
                        </label>}
                    <ul className={"category-path isMandatory" + (validationContext && validationContext.isValidating ? " isValidating" : "") +
                        (!selectedCat ? " empty" : "")} id="filter-root-category">
                        <li>
                            <a href="/prevented" className="simple-link" id={"" + 0} onClick={onRootCategoryClick}>
                                {trans("apps.inallcategories", commonTexts)}
                            </a>
                        </li>
                        {selectedCat && parentCats.map((cat, index) => {
                            let className = "simple-link secondary" + (selectedCat === cat ? " bold" : "") + " sub-category" + " level" + index;
                            return <li data-click={cat.id}>
                                <a href="/prevented" data-click={cat.id} className={className} onClick={onSubCategoryClick}>{cat.name}
                                    ({cat.id})
                                    <span className="search-count" data-click={cat.id}>{searchCounts && searchCounts.get(cat.id)}</span>
                                </a>
                            </li>
                        })}
                    </ul>
                    {insertionContext && <span id="validation-hint">{trans("apps.new.checkmandatoryfield", insertionContext.textPack)}</span>}
                </div>
            </Fragment>
        }
        else
            return <CategoryInLineList parentCats={parentCats} subCats={subCats} searchCounts={searchCounts}
                onRootCategoryClick={onRootCategoryClick} onSubCategoryClick={onSubCategoryClick}></CategoryInLineList>
    }

    function notifyRenderAllFiltersContent() {
        if (isSearchFlow && isMobileSCreenSize)
            return <CenterAnchoredModal className="all-filters" isOpen={mobileFilterOpen}
                onXClick={onMobileFilterCancelClick} onBottomButtonClick={onMobileFilterBottomButtonClick}
                bottomButtonText={getMobileFilterButtonText()} smallMarginBottom={true}>
                {renderAllFiltersContent()}
            </CenterAnchoredModal>
        else
            return renderAllFiltersContent()
    }

    function renderAllFiltersContent() {
        const headerDisplay = singleFilterItemId ? 'none' : 'flex';
        return <div id="all-filters-container" className="" style={singleFilterItemId ? { marginTop: -20 } : {}}>
            {renderIXBaseCategoryelector()}
            {(isSearchFlow || isInsertFlow) && (xBaseAttributes.length > 0) && <div className="attributes">
                <hr className="thick no-margin" style={{ display: headerDisplay }} />
                <div className="header" style={{ display: headerDisplay }}>
                    <h3 className="title">{trans("apps.filter", commonTexts)}</h3>
                    <button className="simple-link reset-attribute">{trans("apps.action.resetfilters", commonTexts)}</button>
                </div>
                <AttributeList xBaseAttributes={xBaseAttributes} usedInputMaps={usedInputMaps} singleFilterItemId={singleFilterItemId}>
                    {isSearchFlow ? zipCityView() : null}
                </AttributeList>
                <div className="mt20"></div>
            </div>}
        </div>
    }

    return <Fragment>
        <FilterContext.Provider value={{ isSearch: isSearch, categoryId: selectedCat ? selectedCat.id : 0, textPack: textPack }}>
            {/* {JSON.stringify(searchCounts)} */}
            {isSearchFlow && <FilterButtons
                selectedCat={selectedCat}
                onCategoryClick={onCategoryClick}
                setSelectedCat={setSelectedCat}
                updateAttributeSection={updateAttributeSection}
                pushCurrentFilterInput={pushCurrentFilterInput}
                setSingleFilterItemId={setSingleFilterItemId}
                setFetchAdvertFlag={setFetchAdvertFlag}
                setMobileFilterOpen={setMobileFilterOpen}
                setLocation={setLocation}
                xBaseAttributes={xBaseAttributes}
                usedInputMaps={usedInputMaps}
                commonTexts={commonTexts}
                textPack={textPack}
                location={location}
            ></FilterButtons>}

            {notifyRenderAllFiltersContent()}

            <CategoryModal
                isOpen={!isSubCatInline && categoryModalOpen}
                onXClick={onCategoryModalCancelClick}
                parentCats={parentCats}
                subCats={subCats}
                onBottomButtonClick={updateSelectedCatFromModal}
                searchCounts={searchCounts}
                onRootCategoryClick={onRootCategoryClick}
                onSubCategoryClick={onSubCategoryClick}
                bottomButtonText={isSearchFlow && !mobileFilterOpen ? getMobileFilterButtonText() : null}
                hideBottomButton={isInsertFlow && subCats.length > 0}
            ></CategoryModal>

        </FilterContext.Provider>
    </Fragment >;
}