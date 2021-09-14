import { Route, Switch, NavLink, Link, useHistory, useLocation } from 'react-router-dom'
import React, { Component, Fragment, useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo, useContext } from 'react';
import "./style.css";
import { getStateText, getStateColor, STATE_ACTIVE, STATE_DEACTAVATED, STATE_TO_APPROVE } from '../../utils/advertState';
import Slider from 'react-slick';
import Axios from 'axios';
import { formatDate, trans, useDocumentClientSize } from '../../utils/common';
import { RootContext } from '../../root';
import moment from 'moment';
import { ADVERT_SEARCH_RESULT_API } from '../../utils/network';
import { IXBaseAdvert, ILoginInfo, NullableIRootContext, IRootContext, TTextPack, TLanguage } from '../../utils/xbaseInterface.d';

function useSlideToScroll(itemCount: number): number {
    const [width, height] = useDocumentClientSize();
    const result = Math.min(Math.floor(width >= 1040 ? 4 : (width >= 600 ? (width - 16) / 244 : (width - 16) / 172)), itemCount);
    console.log('useSlideToScroll', `result=${result}`);
    return result;
}

const PAGE_SIZE = 20;
const ID_LIST_FETCHING = -1;
export interface IHorizontalList {
    advertIds: string[]; 
    lng: TLanguage; 
    itemClass: string; 
    id: string;
}
export function HorizontalList(props: IHorizontalList): JSX.Element {
    let { advertIds, lng, itemClass, id } = props;
    const slideToScroll: number = useSlideToScroll(advertIds.length);
    const [adverts, setAdverts] = useState<any[]>([]);
    const [currentPageNumber, setCurrentPageNumber] = useState<number>(ID_LIST_FETCHING);
    const fetchedPagesRef = useRef<number[]>([]);

    useEffect(() => {
        setCurrentPageNumber(1);
        fetchedPagesRef.current = [];
    }, [advertIds])

    useEffect(() => {
        if (currentPageNumber !== ID_LIST_FETCHING && !fetchedPagesRef.current.includes(currentPageNumber)) {
            let ids = advertIds.slice((currentPageNumber - 1) * PAGE_SIZE, currentPageNumber * PAGE_SIZE);
            console.log(`HorizontalList ${id} ids`, ids, lng)
            if (ids.length > 0)
                Axios.post(ADVERT_SEARCH_RESULT_API, {
                    language: lng,
                    ids: ids,
                    debug: 'non-search',
                })
                    .then(function (response) {
                        console.log(`POST HorizontalList  ${id} RESPONSE = `, response.data);
                        setAdverts(adverts => [...adverts, ...response.data]);
                        fetchedPagesRef.current.push(currentPageNumber);
                    })
                    .catch(function (error) {
                        console.log(`POST HorizontalList  ${id} ERROR:`, error);
                        alert(`POST HorizontalList  ${id} ERROR:` + error);
                    });
        }
    }, [advertIds, currentPageNumber, id, lng]);

    console.log(`HorizontalList  ${id} adverts`, adverts)

    function SampleNextArrow(props: any): JSX.Element {
        const { className, style, onClick } = props;
        return <button className="right arrow icon" onClick={onClick}></button>;
    }

    function SamplePrevArrow(props: any): JSX.Element {
        const { className, style, onClick } = props;
        return <button className="left arrow icon" onClick={onClick}></button>;
    }

    const settings = {
        className: "slider variable-width",
        dots: !true,
        infinite: !true,
        centerMode: !true,
        slidesToShow: slideToScroll,
        slidesToScroll: slideToScroll,
        variableWidth: true,
        nextArrow: <SampleNextArrow />,
        prevArrow: <SamplePrevArrow />,
        beforeChange: (current: any, next: any): any => {
            setTimeout(() => {
                console.log('next', next)
                setCurrentPageNumber(next === 0 ? 1 : Math.floor(next / PAGE_SIZE) + 2);
            }, 1000);
        }
    };
    console.log('currentPageNumber', currentPageNumber)
    return <div className="horizontal-list">
        {/* <h3>{title}</h3> */}
        {/* <button className="left arrow icon"></button> */}
        {/* <div className="scroll-container res-b maxw599">
            <ul>
                {adverts.map((advert, index) => {
                    return <li>
                        <AdvertItem className={"card advert-item " + itemClass}
                            advert={advert}>
                        </AdvertItem>
                    </li>
                })}
            </ul>
        </div> */}
        {/* <button className="right arrow icon"></button> */}
        <div className="res-bx minw600x">
            <Slider {...settings}>{
                adverts.map((advert, index) => {
                    return <div key={advert._id}>
                        <AdvertItem className={"card advert-item " + itemClass} advert={advert} />
                    </div>;
                })}
            </Slider>
        </div>
    </div>
}

interface VerticalListPropsS {
    onItemControllerClicks: any;
    adverts: IXBaseAdvert[];
    itemClass: string;
    loginInfo: ILoginInfo;
    textPack: TTextPack;
}

export function VerticalList(props: VerticalListPropsS): JSX.Element | null {
    const { onItemControllerClicks, adverts, itemClass, loginInfo, textPack } = props;
    console.log('render VerticalList', "vertical-list" + (onItemControllerClicks ? " my-advert" : ""))
    return <div className={"vertical-list" + (onItemControllerClicks ? " my-advert" : "")}>
        <ul>
            {adverts && adverts.map((advert, index) => {
                return <li>
                    <AdvertItem className={"advert-item " + itemClass}
                        isVerticalList={true} loginInfo={loginInfo}
                        advert={advert}
                        onItemControllerClicks={onItemControllerClicks} textPack={textPack} />
                </li>
            })}
        </ul>
    </div>
}

interface GridListPropsS {
    id: string;
    adverts: IXBaseAdvert[];
    itemClass: string;
}
export function GridList(props: GridListPropsS): JSX.Element | null {
    const { id, adverts, itemClass } = props;
    console.log('render GridList')
    return <div className="grid-list" id={id}>
        <ul>
            {adverts && adverts.map((advert, index) => {
                return <li>
                    <AdvertItem className={"noncard advert-item " + itemClass}
                        advert={advert} />
                </li>
            })}
        </ul>
    </div>
}

function isAdminPage(loginInfo: ILoginInfo | undefined): boolean {
    return loginInfo ? loginInfo.role === "admin" : false;
}

function showButtonUpdate(state: number, loginInfo: ILoginInfo | undefined): boolean { return state !== STATE_TO_APPROVE && !isAdminPage(loginInfo) };
function showButtonPromote(state: number, loginInfo: ILoginInfo | undefined): boolean { return state === STATE_ACTIVE && !isAdminPage(loginInfo) };
function showButtonEnable(state: number, loginInfo: ILoginInfo | undefined): boolean { return state === STATE_DEACTAVATED && !isAdminPage(loginInfo) };
function showButtonDisable(state: number, loginInfo: ILoginInfo | undefined): boolean { return state === STATE_ACTIVE && !isAdminPage(loginInfo) };
function showButtonDelete(state: number, loginInfo: ILoginInfo | undefined): boolean { return !isAdminPage(loginInfo) };
function showButtonApprove(state: number, loginInfo: ILoginInfo | undefined): boolean { return state === STATE_TO_APPROVE && isAdminPage(loginInfo) };
function showButtonReject(state: number, loginInfo: ILoginInfo | undefined): boolean { return state === STATE_TO_APPROVE && isAdminPage(loginInfo) };

interface AdvertItemPropsS {
    className: string;
    isVerticalList?: boolean;
    loginInfo?: ILoginInfo;
    advert: IXBaseAdvert | null;
    onItemControllerClicks?: any;
    textPack?: TTextPack;
}
export interface AdvertItemObjectS {
    advert: IXBaseAdvert;
    className: string;
}

export function AdvertItem(props: AdvertItemPropsS): JSX.Element | null {
    const { className, isVerticalList, loginInfo, advert, onItemControllerClicks, textPack } = props;
    const location = useLocation();
    const [controlShowed, setControlShowed] = useState<boolean>(false);
    const history = useHistory();
    const rootContext: IRootContext = useContext(RootContext);
    console.log('AdvertItem textPack', textPack)

    const onAdvertClick = useCallback(
        function (e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('location', location)
            if (rootContext) {
                rootContext.detailPreviousPathRef.current = location.pathname + location.search;
                console.log('location detailPreviousPath', rootContext.detailPreviousPathRef.current);
            }
            if (advert)
                history.push("/detail/" + advert._id + (location.search || ""))
        }, [location, rootContext, advert, history]);

    const onControlClick = useCallback(function (e) {
        e.preventDefault();
        const clickData = e.target.getAttribute('data-click')
        const callback = onItemControllerClicks[clickData];
        if (advert && callback) {
            let itemObject: AdvertItemObjectS = { advert: advert, className: className };
            if (callback)
                callback(itemObject);
            console.log('onControlClick', callback, itemObject)
        }
        e.stopPropagation();
    }, [advert, className, onItemControllerClicks]);

    const onEditClick = useCallback(function (e) {
        e.preventDefault();
        setControlShowed(true);
        e.stopPropagation();
    }, []);

    const onControlCancelClick = useCallback(function (e) {
        e.preventDefault();
        setControlShowed(false);
        e.stopPropagation();
    }, []);

    useEffect(() => {
        setControlShowed(false);
    }, [advert])

    const isMyAdvert = onItemControllerClicks && (onItemControllerClicks.onItemUpdateClick || onItemControllerClicks.onItemPromoteClick ||
        onItemControllerClicks.onItemDisEnableClick ||
        onItemControllerClicks.onItemDisEnableClick ||
        onItemControllerClicks.onItemDeleteClick ||
        onItemControllerClicks.onItemApproveClick ||
        onItemControllerClicks.onItemRejectClick);
    const isFavorite = onItemControllerClicks && onItemControllerClicks.onFavoriteRemoveClick;
    if (!advert) {
        return null;
    } else {
        return <Link to="/detail" onClick={onAdvertClick}><div className={className}>
            <div className="info" style={{ marginLeft: controlShowed ? -150 : 0, position: 'relative' }}>
                {advert.thumbnail && <img className="thumb" src={'/blogPhotosThumbnail/' + advert.thumbnail} alt="."></img>}
                {!advert.thumbnail && <div className="thumb"></div>}
                <div className="texts">
                    {isVerticalList && <div className="header">
                        <span className="address">{advert.contactAddress && `${advert.contactAddress.zip} ${advert.contactAddress.city}`}</span>
                        <span className="separator">{"\u00B7"}</span>
                        <span className="category">{advert.categoryName}</span>
                        <span className="separator">{"\u00B7"}</span>
                        <span className="posted">{formatDate(advert.posted)}</span>
                        {/* {advert._id} */}
                    </div>}
                    <div className="title">{advert.title}</div>
                    {isVerticalList && <li className="brief-description">{advert.briefDescription}</li>}
                    <div className="price">{advert.price}</div>
                    {isMyAdvert && <div className="footer">
                        <span>{trans("apps.statsviews", textPack)}: {advert.hits}</span>
                        <span className="separator">{"\u00B7"}</span>
                        <span>{trans("apps.statsrequests", textPack)}: 0</span>
                        <span className="separator">{"\u00B7"}</span>
                        <span id="status-badge" style={{ backgroundColor: getStateColor(advert.state) }}>{trans(getStateText(advert.state), textPack)}</span>
                    </div>}
                </div>
                {isMyAdvert && <button className="link-button material gray large" id="edit-advert"
                    onClick={onEditClick}><span className="backgrounded-span edit-icon after"></span></button>}
                {isFavorite && <button className="link-button material gray large" id="remove-favorite-list" data-click="onFavoriteRemoveClick"
                    onClick={onControlClick}><span className="backgrounded-span favorite-remove-icon after"></span></button>}
            </div>

            {isMyAdvert && <div className="control-buttons" style={{ marginRight: !controlShowed ? -150 : 0 }}><ul>
                <li style={{ display: showButtonUpdate(advert.state, loginInfo) ? 'block' : 'none' }}>
                    <button className="link-button material blue-text white smallest" data-click="onItemUpdateClick"
                        onClick={onControlClick}>
                        {trans("apps.action.edit", textPack)}</button>
                </li>
                <li style={{ display: showButtonPromote(advert.state, loginInfo) ? 'block' : 'none' }}>
                    <button className="link-button material green-text white smallest" data-click="onItemPromoteClick"
                        onClick={onControlClick}>
                        {trans("apps.action.upgradead", textPack)}</button>
                </li>
                <li style={{ display: showButtonDisable(advert.state, loginInfo) ? 'block' : 'none' }}>
                    <button className="link-button material black-text white smallest" data-click="onItemDisEnableClick"
                        onClick={onControlClick}>
                        {trans("apps.action.pause", textPack)}</button>
                </li>
                <li style={{ display: showButtonEnable(advert.state, loginInfo) ? 'block' : 'none' }}>
                    <button className="link-button material green-text white smallest" data-click="onItemDisEnableClick"
                        onClick={onControlClick}>
                        {trans("apps.action.activate", textPack)}</button>
                </li>
                <li style={{ display: showButtonDelete(advert.state, loginInfo) ? 'block' : 'none' }}>
                    <button className="link-button material red-text white smallest" data-click="onItemDeleteClick"
                        onClick={onControlClick}>
                        {trans("apps.action.deletelisting", textPack)}</button>
                </li>
                <li style={{ display: showButtonApprove(advert.state, loginInfo) ? 'block' : 'none' }}>
                    <button className="link-button material green-text white smallest" data-click="onItemApproveClick"
                        onClick={onControlClick}>
                        {trans("apps.action.approve", textPack)}</button>
                </li>
                <li style={{ display: showButtonReject(advert.state, loginInfo) ? 'block' : 'none' }}>
                    <button className="link-button material red-text white smallest" data-click="onItemRejectClick"
                        onClick={onControlClick}>
                        {trans("apps.action.reject", textPack)}</button>
                </li>
                <li>
                    <button className="link-button material gray large" id="cancel-edit" onClick={onControlCancelClick}><span className="backgrounded-span close-icon after"></span></button>
                </li>
            </ul></div>}
        </div></Link>
    }
}