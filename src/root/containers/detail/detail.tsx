
import "./detail.css";
import { Route, Switch, NavLink, Link } from 'react-router-dom'
import React, { Component, Fragment, useState, useEffect, useLayoutEffect, useRef, useCallback, useContext } from 'react';
import Axios from 'axios';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ActionForm } from './actionForm/actionForm';
import moment from 'moment';
import { MyMapComponent } from "./map/map";
import { RootContext } from '../../root';
import { useTextPack, useDocumentClientSize, formatDate } from '../../utils/common';
import { ADVERT_USER_ADVERTS_API, XBASE_ATTRIBUTES_BY_CAT_ID_API } from "../../utils/network";
import { PRINT_DEBUG_INFO } from "../../utils/config";
import { HorizontalList } from "../../components/advertLists/list";
import { getDetailAttributeValue } from "../filter/attribute/attributeFactory";
import { IXBaseAttribute, IDetailAttribute, XBaseEntryAttributeS, IXBaseAdvert, IRootContext, TLanguage, TXBaseAttributes, TTextPackId } from "../../utils/xbaseInterface.d";
const PRICE_TYPE: number = 207;
const PRICE: number = 1;
const DETAIL_HIDDEN_ATT_IDS: number[] = [PRICE, PRICE_TYPE];
export interface IDetailProps {
    reusedXBaseAttributes: TXBaseAttributes;
    detail: IXBaseAdvert;
    lng: TLanguage;
    isInsertionPreview?: boolean;
}
export default function Detail(props: IDetailProps) {
    const { reusedXBaseAttributes, detail, lng, isInsertionPreview } = props;
    const rootContext: IRootContext = useContext(RootContext);
    const textPack = useTextPack(rootContext, "DETAIL" as TTextPackId);
    const [userAdverts, setUserAdverts] = useState([]);
    const [xBaseAttributes, setXBaseAttributes] = useState(reusedXBaseAttributes);
    const [width, height] = useDocumentClientSize();
    const slider = useRef(null);
    const sliderWidth = width - 32;
    const variableWidthFlag = sliderWidth > 360;
    const arrowDisplay = sliderWidth > 360 ? "block" : "none";
    let hMargin = (sliderWidth > 360) ? 10 : 0;//(sliderWidth > 320 ? ((sliderWidth - 320) / 4) : 0)
    const categoryAttributesCacheRef = rootContext.categoryAttributesCacheRef;
    // hMargin = hMargin > 7 ? hMargin : 0;
    useEffect(() => {
        console.log('Detail detail.user', detail.user)
        Axios.post(ADVERT_USER_ADVERTS_API, {
            language: lng,
            userId: detail.user._id,
        })
            .then(function (response) {
                console.log("POST '/userAdverts' RESPONSE = ", response.data);
                setUserAdverts(response.data);
            })
            .catch(function (error) {
                console.log("POST '/userAdverts' ERROR:", error);
                alert("POST '/userAdverts' ERROR:" + error);
                setUserAdverts([]);
            });
    }, [detail.user, detail.user._id, lng])
    console.log('reusedXBaseAttributes', reusedXBaseAttributes)

    useEffect(() => {
        if (!reusedXBaseAttributes || reusedXBaseAttributes.length === 0) {
            if (detail.categoryId) {
                if (!categoryAttributesCacheRef.current.has(lng)) {
                    categoryAttributesCacheRef.current.set(lng, new Map())
                }
                if (categoryAttributesCacheRef.current.get(lng).get(detail.categoryId)) {
                    setXBaseAttributes(categoryAttributesCacheRef.current.get(lng).get(detail.categoryId));
                } else {
                    Axios.get(XBASE_ATTRIBUTES_BY_CAT_ID_API, {
                        params: { id: detail.categoryId, lng: lng, isSearch: false }
                    })
                        .then(function (response) {
                            console.log("POST '/attributesByCatId' RESPONSE = ", response.data);
                            setXBaseAttributes(response.data);

                            if (categoryAttributesCacheRef) {
                                if (!categoryAttributesCacheRef.current.get(lng)) {
                                    categoryAttributesCacheRef.current.set(lng, new Map());
                                }
                                categoryAttributesCacheRef.current.get(lng).set(detail.categoryId, response.data);
                            }
                        })
                        .catch(function (error) {
                            console.log("POST '/attributesByCatId' ERROR:", error);
                            alert("POST '/attributesByCatId' ERROR:" + error);
                            setXBaseAttributes([]);
                        });
                }
            } else {
                setXBaseAttributes([]);
            }
        }
        else
            setXBaseAttributes(reusedXBaseAttributes);
    }, [reusedXBaseAttributes, detail.categoryId, lng, categoryAttributesCacheRef])

    useEffect(() => {
        if (slider.current)
            slider.current.slickGoTo(0, true);
    }, [detail])

    console.log('detail._id', detail._id)
    console.log('detail.categoryId', detail.categoryId, lng)
    console.log('render', " Review");

    function SampleNextArrow(props: any) {
        const { className, style, onClick } = props;
        return (
            <button className="photos right arrow icon" onClick={onClick} style={{ display: arrowDisplay }}></button>
        );
    }

    function SamplePrevArrow(props: any) {
        const { className, style, onClick } = props;
        return (
            <button className="photos left arrow icon" onClick={onClick} style={{ display: arrowDisplay }}></button>
        );
    }

    const settings = {
        className: "slider variable-width",
        dots: true,
        infinite: variableWidthFlag,
        centerMode: variableWidthFlag,
        slidesToShow: 1,
        slidesToScroll: 1,
        variableWidth: variableWidthFlag,
        initialSlide: 0,
        nextArrow: <SampleNextArrow />,
        prevArrow: <SamplePrevArrow />,
    };
    let xBaseCatAttMap = new Map();
    if (xBaseAttributes)
        xBaseAttributes.map((att: IXBaseAttribute) => {
            // console.log('xBaseCatAttMap.set', att.id, att);
            xBaseCatAttMap.set(att.id, att)
        });

    console.log('xBaseCatAttMap', xBaseCatAttMap)

    let contactAddress = detail.contactAddress;//addressCallbackRef.current();

    function getAttEntryValue(att: IDetailAttribute): JSX.Element {
        let attId = att.attributeId;
        if (!DETAIL_HIDDEN_ATT_IDS.includes(attId)) {
            let type = xBaseCatAttMap.get(attId).type;
            console.log('getAttEntryValue att.attributeEntryId', att.attributeEntryId)
            return getDetailAttributeValue(att, type,
                () => {
                    const entry = xBaseCatAttMap.get(attId).entries.find((entry: XBaseEntryAttributeS) => entry.id === att.attributeEntryId);
                    return entry ? entry.name : ("ADS SINCE OLD B.E VERSION, PLEASE REPUBLISH THIS !!!!!");
                },
                () => <Fragment><li></li><li>to be implemented</li></Fragment>,
                () => <span className="backgrounded-span checkmark-icon after" />,
                () => <span>{formatDate(att.inputDate)}</span>,
                () => <span>{att.inputText}</span>,
                () => <span>{att.inputNumber}</span>,
            )
        }
        return null;
    }

    function getAttRow(att: IDetailAttribute) {
        let attId = att.attributeId;
        if (xBaseCatAttMap.get(attId)) {
            let key = xBaseCatAttMap.get(attId).name;
            let value = getAttEntryValue(att);
            console.log('getAttRow', key, value);
            return value ? <Fragment><li className="key">{key}</li><li className="value"><span>{value}</span></li></Fragment> : null;
        } else {
            return null;
        }
    }

    const t = useCallback((key) => {
        return textPack && textPack.has(key) ? textPack.get(key) : key;
    }, [textPack]);

    const printDebugInfo = useCallback(() => {
        if (PRINT_DEBUG_INFO)
            return PRINT_DEBUG_INFO ? <Fragment>{
                JSON.stringify(detail)}
                <br /><span>_____________Props{JSON.stringify(props)}</span>
                <br /><span>_____________categoryId: {JSON.stringify(detail.categoryId)}</span>
                <br /><span>_____________xBaseAttributes: {JSON.stringify(xBaseAttributes)}</span>
                <br /><span>_____________detail.attributes: {JSON.stringify(detail.attributes)}</span>
            </Fragment> : null;
    }, [props, xBaseAttributes]);

    return (
        <div className="detail">
            {printDebugInfo()}
            <div className="detail-photos" style={{ display: detail.pictures.length > 1 ? 'block' : 'none' }}>
                <Slider ref={slider} {...settings}>
                    {detail.pictures.map(imgUrls => <div>
                        <img className={variableWidthFlag ? "" : "fixed-width"} style={{ marginLeft: hMargin, marginRight: hMargin }} alt="" src={"/blogPhotosResized/" + imgUrls.blogPhotosResized} />
                    </div>)}
                </Slider>
            </div>
            <div id="detail-single-photo" style={{ display: detail.pictures.length === 1 ? 'block' : 'none' }}>
                <img alt="" src={"/blogPhotosResized/" + (detail.pictures[0] ? detail.pictures[0].blogPhotosResized : "")}></img>
            </div>

            <h1 id="detail-title">{detail.title}</h1>
            <h1 id="detail-price">{detail.price}</h1>
            <button className="link-button material blue large pw100 mtb20 res-ib maxw767" onClick={() => { }}>{t("apps.action.contactseller")}</button>
            <div className="detail-table-container advert">
                <div className="detail-table advert">
                    {xBaseAttributes && <Fragment>
                        <h3 className="first-title">{t("apps.details")}</h3>
                        <ul className="attributes">
                            {xBaseAttributes && detail.attributes && detail.attributes.map(att => {
                                return att && getAttRow(att);
                            })}
                        </ul>
                    </Fragment>}

                    <hr className="detail-block-separator thin" />
                    <h3>{t("apps.description")}</h3>
                    <div className="description">
                        <hr className="detail-column-separator thin" />
                        {detail.description.split("\n").map(p => <p>{p}<br /></p>)}
                    </div>

                    <hr className="detail-block-separator thin" />
                    <h3>{t("apps.insertion.contact")}</h3>

                    <div className="address">
                        <hr className="detail-column-separator thin" />
                        <div className="map-container mb16">
                            {/* <img src={require("./uisample/map.png")} class="pw100 mb12"></img> */}
                            <MyMapComponent
                                isMarkerShown={true}
                                googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyAj1itOIxU453LIVZywmtFpmwuKwRoTQno&v=3.exp&libraries=geometry,drawing,places"
                                loadingElement={<div style={{ height: `100%` }} />}
                                containerElement={<div style={{ height: `200px` }} />}
                                mapElement={<div style={{ height: `100%` }} />}
                            />
                        </div>
                        {contactAddress.street && <span className="block mt16">{contactAddress.street}</span>}
                        {contactAddress.zip && <span className="block">{contactAddress.zip} {contactAddress.city}</span>}
                        {contactAddress.countryCode && <span className="block">{contactAddress.countryCode}</span>}
                        <Link to="/detail" className="simple-link google-map block">{t("apps.action.openmap")}</Link>
                    </div>

                    <hr className="detail-block-separator thin" />
                    <h3>{t("apps.listings") + " " + t("apps.share")}</h3>

                    <div className="sharing">
                        <hr className="detail-column-separator thin" />
                        <button className="link-button material white large left" id="WhatsApp"><span className="backgrounded-span WhatsApp-icon after">WhatsApp</span></button>
                        <button className="link-button material white large left" ><span className="backgrounded-span Link-icon after">{t("apps.action.copylink")}</span></button>
                        <button className="link-button material white large"><span className="backgrounded-span Facebook-icon after">Facebook</span></button>
                    </div>

                    <hr className="detail-block-separator thin" />
                    <h3>{t("apps.seller")}</h3>
                    <div className="user">
                        <hr className="detail-column-separator thin" />
                        <div>
                            {/* <svg viewBox="0 0 18 22" width="50" height="25"><path fill="#693" d="M9 0L0 4v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V4L9 0zM7 16l-4-4 1.41-1.41L7 13.17l6.59-6.59L15 8l-8 8z"></path></svg> */}
                            <Link className="simple-link" to="/detail"><span className="backgrounded-span verified-icon before">{detail.user.email}</span></Link>
                            <span className="block member-since">{t("apps.registeredsince")} {detail.user.memberSince}</span>
                        </div>
                    </div>

                    {/* <hr className="detail-block-separator thin transparent" />
                    <h4 className="user-adverts-title">{t("apps.action.showmorelistings")}</h4>
                    <div className="user-adverts-link-contatiner">
                        <hr className="detail-column-separator thin transparent" />
                        <Link className="simple-link adverts">{t("apps.action.home.more")} (19)</Link>
                    </div> */}
                </div>
                <div className="contact-form-container-desktop res-b minw768">
                    <ActionForm textPack={textPack} advertId={detail._id} phone=""></ActionForm>
                </div>
            </div>

            <div className="detail-table-container user-adverts" style={{ display: (userAdverts && userAdverts.length > 0 ? 'block' : 'none') }}>
                {/* <h1>userer-table-container</h1> */}
                <div className="header">
                    <h4 className="title">{t("apps.action.showmorelistings")}</h4>
                    <Link className="simple-link" to="/detail">{`${t("apps.action.home.more")} (${userAdverts.length})`}</Link>
                </div>
                <HorizontalList advertIds={userAdverts} id="User Adverts" itemClass="material-bordered" lng={lng}></HorizontalList>
                <div className="mt20 pw100 res-b maxw767">
                    <ActionForm textPack={textPack} advertId={detail._id} phone=""></ActionForm>
                </div>
            </div>

            <div className="detail-table-container insertion-info" style={{ marginBottom: 80 }}>
                <div className="detail-table insertion-info">
                    <hr className="detail-block-separator thin" />
                    <h3>{t("apps.listings")}</h3>

                    <div className="info">
                        <hr className="detail-column-separator thin" />

                        <ul className="attributes">
                            <li className="key">{t("apps.advertedit")}</li><li className="value"><span>{formatDate(detail.modified)}</span></li>
                            <li className="key">{t("apps.advertid")}</li><li className="value"><span>{detail._id}</span></li>
                            <li className="key"><Link to="/detail" className="simple-link block">{t("apps.action.reportfraud")}</Link></li><li className="value"></li>
                            <li className="key"><Link to="/detail" className="simple-link block">{t("apps.safety")}</Link></li><li className="value"></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}


