
import React, { useContext } from 'react';
import { STATE_DEACTAVATED} from '../../utils/advertState';
import { trans } from '../../utils/common';
import { RootContext } from '../../root';
import CenterAnchoredModal from '../templates/centerAnchoredModal/centerAnchoredModal';
import { AdvertItem, AdvertItemObjectS } from '../advertLists/list';
import { IRootContext, TTextPack } from '../../utils/xbaseInterface.d';
const MODAL_NONE = -1;
const MODAL_PROMOTION_OPTIONS = 0;
const MODAL_PROMOTION_SUCCESS = 1;
const MODAL_DELETE = 2;
const MODAL_DIS_ENABLE = 3;

export interface IAdvertItemObjectClicks {
    close?: (e: any) => void;
    promotion?: (e: any) => void;
    delete?: (e: any) => void;
    enDisable?: (e: any) => void;
}
export interface ConfirmationModalS {
    modalContentId: number;
    advertObject: AdvertItemObjectS;
    onClicks: IAdvertItemObjectClicks;
    textPack: TTextPack;
}
export default function ConfirmationModal(props: ConfirmationModalS): JSX.Element {
    const { modalContentId, advertObject, onClicks, textPack } = props;
    const rootContext: IRootContext = useContext(RootContext);
    let texts = rootContext ? (rootContext as IRootContext).commonTexts : new Map();
    let advert = advertObject.advert;
    let advertClassName = advertObject.className;
    let onXClick = onClicks.close;
    let onPromoConfirmClick = onClicks.promotion;
    let onDeleteConfirmClick = onClicks.delete;
    let onEnDisableConfirmClick = onClicks.enDisable;

    // let $close = trans("apps.action.close", texts);
    console.log('ConfirmationModal textPack', textPack)

    return <CenterAnchoredModal className="validation" isOpen={modalContentId !== MODAL_NONE} onXClick={onXClick} hideBottomButton={true}>
        <div className="vertical-list my-advert">
            <AdvertItem className={advertClassName || ""} advert={advert} isVerticalList={true} textPack={textPack}></AdvertItem>
        </div>
        <div className="purchase-promotion" style={{ display: modalContentId === MODAL_PROMOTION_OPTIONS ? 'block' : 'none' }}>
            <h3 className="block">{trans("apps.confirmation.promoteadvert", textPack)}</h3>
            <label><input type="checkbox" checked={true}></input>Top-listing</label>
            <label><input type="checkbox" checked={true}></input>Gallery</label>
            <button className="link-button material blue large block pw100 p20" onClick={onPromoConfirmClick}>{trans("apps.action.next", texts)}</button>
        </div>

        <div className="promote-success" style={{ display: modalContentId === MODAL_PROMOTION_SUCCESS ? 'block' : 'none' }}>
            <div className="promote-success-message">
                <span className="backgrounded-span success-icon before">{trans("apps.message.promotesuccess", textPack)}</span>
            </div>
        </div>

        <div style={{ display: modalContentId === MODAL_DELETE ? 'block' : 'none' }}>
            <h3 className="block">{trans("apps.confirmation.deleteadvert", textPack)}</h3>
            <div className="space-between-buttons-container">
                <button className="link-button material white large block p20" id="delete" onClick={onDeleteConfirmClick}>{trans("apps.action.deletelisting", textPack)}</button>
                <button className="link-button material blue large block p20" onClick={onXClick}>{trans("apps.action.cancel", texts)}</button>
            </div>
        </div>

        <div style={{ display: modalContentId === MODAL_DIS_ENABLE ? 'block' : 'none' }}>
            <h3 className="block">{trans(advert && advert.state === STATE_DEACTAVATED ? "apps.confirmation.activate" : "apps.confirmation.deactivate", textPack)}</h3>
            <div className="space-between-buttons-container">
                <button className="link-button material white large block p20" id="delete" onClick={onEnDisableConfirmClick}>
                    {advert && advert.state === STATE_DEACTAVATED ? trans("apps.action.activate", textPack) : trans("apps.action.pause", textPack)}</button>
                <button className="link-button material blue large block p20" onClick={onXClick}>{trans("apps.action.cancel", texts)}</button>
            </div>
        </div>
    </CenterAnchoredModal>
}