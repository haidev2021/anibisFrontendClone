import { Route, Switch, NavLink, Link } from 'react-router-dom'
import React, { Component, useState, useEffect, useLayoutEffect, useRef, useCallback, Fragment, useMemo, useContext, MutableRefObject } from 'react';
import { useHistory } from "react-router-dom";
import Axios from 'axios';
import FilterableList from '../../containers/filterableList/filterableList';
import { STATE_ACTIVE, STATE_DEACTAVATED, STATE_TO_APPROVE, STATE_BLOCKED } from '../../utils/advertState';
import ConfirmationModal from '../../components/myAdverts/confirmationModal';
import { RootContext } from '../../root';
import { trans, useTextPack } from '../../utils/common';
import { ADVERT_DELETE_API, ADVERT_MY_ADVERT_IDS_FOR_ADMIN_API, ADVERT_PROMOTE_API, ADVERT_UPDATE_ADVERT_API, ADVERT_UPDATE_ADVERT_FOR_ADMIN_API, USER_FAVORITE_ADD_REMOVE_API } from '../../utils/network';
import { AdvertItemObjectS } from '../../components/advertLists/list';
import { ILoginInfo, IXBaseAdvert, IRootContext, TLanguage, TTextPackId } from '../../utils/xbaseInterface.d';
const MODAL_NONE = -1;
const MODAL_PROMOTION_OPTIONS = 0;
const MODAL_PROMOTION_SUCCESS = 1;
const MODAL_DELETE = 2;
const MODAL_DIS_ENABLE = 3;

function handleUpdateAdvertForAdmin(history: any, advertItemObject: AdvertItemObjectS, state: number) {
    console.log('onItemApproveClick', advertItemObject);
    Axios.post(ADVERT_UPDATE_ADVERT_FOR_ADMIN_API, { id: advertItemObject.advert._id, set: { state: state } })
        .then(response => {
            console.log('/updateAdvertForAdmin response.data ', response.data);
            history.go(0);
        })
        .catch(error => {
            console.log("/updateAdvertForAdmin catch error", error);
            alert("catch error" + error);
        })
}
export interface IMyAdverts {
    editAdvertRef?: MutableRefObject<IXBaseAdvert>;
    filterApi: string;
    loginInfo: ILoginInfo;
    lng: TLanguage;
}
export default function MyAdverts(props: IMyAdverts) {
    const { editAdvertRef, filterApi, loginInfo, lng } = props;
    const rootContext: IRootContext = useContext(RootContext);
    const textPack = useTextPack(rootContext, "MY_ADVERTS" as TTextPackId);
    const [advertItemObject, setAdvertItemObject] = useState<AdvertItemObjectS>(null);
    const [modalContentId, setModalContentId] = useState(MODAL_NONE);
    const history = useHistory();

    const onModalCloseClick = useCallback(function (e) {
        e.stopPropagation();
        setModalContentId(MODAL_NONE);
    }, [])
    const onPromoConfirmClick = useCallback(function (e) {
        if (advertItemObject.advert) {
            console.log('onPromoConfirmClick advertItemObject', advertItemObject.advert)
            Axios.post(ADVERT_PROMOTE_API, { id: advertItemObject.advert._id })
                .then(response => {
                    console.log('/promote response.data ', response.data);
                    setModalContentId(MODAL_PROMOTION_SUCCESS);
                    setTimeout(function () {
                        setModalContentId(MODAL_NONE);
                    }, 650);
                })
                .catch(error => {
                    console.log("/promote catch error", error);
                    alert("catch error" + error);
                })
        }
    }, [advertItemObject])

    const onItemControllerClicks = useMemo(() => ({
        onItemPromoteClick: function (advertItemObject: AdvertItemObjectS): void {
            console.log('onItemPromoteClick', advertItemObject);
            setModalContentId(MODAL_PROMOTION_OPTIONS);
            setAdvertItemObject(advertItemObject);
        },
        onItemDeleteClick: function (advertItemObject: AdvertItemObjectS): void {
            console.log('onItemDeleteClick', advertItemObject);
            setModalContentId(MODAL_DELETE);
            setAdvertItemObject(advertItemObject);
        },
        onItemDisEnableClick: function (advertItemObject: AdvertItemObjectS): void {
            console.log('onItemDisEnableClick', advertItemObject);
            setModalContentId(MODAL_DIS_ENABLE);
            setAdvertItemObject(advertItemObject);
        },
        onItemUpdateClick: function (advertItemObject: AdvertItemObjectS): void {
            editAdvertRef.current = advertItemObject.advert;
            history.push('/insert');
        },
        onItemApproveClick: function (advertItemObject: AdvertItemObjectS): void {
            handleUpdateAdvertForAdmin(history, advertItemObject, STATE_ACTIVE);
        },
        onItemRejectClick: function (advertItemObject: AdvertItemObjectS): void {
            handleUpdateAdvertForAdmin(history, advertItemObject, STATE_BLOCKED);
        }
    }), [history, editAdvertRef]);

    const onDeleteConfirmClick = useCallback(function () {
        console.log('onDeleteConfirmClick advertItemObject.advert._id', advertItemObject.advert)
        if (advertItemObject.advert) {
            Axios.post(ADVERT_DELETE_API, { id: advertItemObject.advert._id })
                .then(response => {
                    console.log('/delete response.data ', response.data);
                    setModalContentId(MODAL_NONE);
                    history.go(0);
                })
                .catch(error => {
                    console.log("/delete catch error", error);
                    alert("catch error" + error);
                })
        }
    }, [advertItemObject && advertItemObject.advert, history]);

    const onEnDisableConfirmClick = useCallback(function () {

        if (advertItemObject.advert) {
            console.log('onEnDisableConfirmClick advertItemObject.advert._id', advertItemObject.advert)
            let newState = advertItemObject.advert.state === STATE_DEACTAVATED ? STATE_ACTIVE : STATE_DEACTAVATED;
            Axios.post(ADVERT_UPDATE_ADVERT_API, { id: advertItemObject.advert._id, set: { state: newState } })
                .then(response => {
                    console.log('/delete response.data ', response.data);
                    setModalContentId(MODAL_NONE);
                    history.go(0);
                })
                .catch(error => {
                    console.log("/delete catch error", error);
                    alert("catch error" + error);
                })
        }
    }, [advertItemObject && advertItemObject.advert, history]);

    const nocontent = useMemo(() => {
        return {
            title: trans("apps.nolistings", rootContext.commonTexts),
            description: trans("apps.nolistings.description", rootContext.commonTexts),
            buttonText: trans("apps.action.newad", rootContext.commonTexts),
            onButtonClick: (e: any): void => {},
        }
    }, [rootContext.commonTexts]);


    const t = useCallback(function (key) {
        return textPack && textPack.has(key) ? textPack.get(key) : key;
    }, [textPack]);

    console.log('render after onItemDeleteClick', advertItemObject)

    return <div className="my-adverts route-insert filterable-list-container with-nav consistent-padding">
        <FilterableList categoryFilter={null} commonFilter={{}} isSearchAdvert={false} filterApi={filterApi}
            lng={lng} itemTextPack={textPack}
            title={t("apps.action.deeplink.mylistings.ios") + " (%s)"}
            onItemControllerClicks={onItemControllerClicks} nocontent={nocontent}>
        </FilterableList>
        {advertItemObject && <ConfirmationModal modalContentId={modalContentId} advertObject={advertItemObject} textPack={textPack}
            onClicks={{ close: onModalCloseClick, promotion: onPromoConfirmClick, delete: onDeleteConfirmClick, enDisable: onEnDisableConfirmClick }}/>}
    </div >
}