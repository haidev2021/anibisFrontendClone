import React, { useCallback, useContext } from 'react';
import { useHistory } from "react-router-dom";
import { RootContext } from '../../../root';
import { addRemoveFavorite } from '../../../utils/sharedAPIResquest';
import { NullableIRootContext, TTextPack } from '../../../utils/xbaseInterface.d';

export interface IActionForm {
    advertId: string;
    textPack: TTextPack;
    phone: string;
}
export function ActionForm(props: IActionForm) {
    const { advertId, textPack, phone } = props;
    const rootContext = useContext(RootContext) as NullableIRootContext;

    let isFavorite = rootContext.favoriteIds.includes(advertId);
    let favoriteClassName = "backgrounded-span after" + (isFavorite ? " favorited-icon" : " favorite-icon");

    const onFavoriteClick = useCallback(function () {
        addRemoveFavorite(isFavorite, advertId, rootContext, () => {})
    }, [isFavorite, advertId, rootContext]);

    const t = useCallback(function (key) {
        return textPack && textPack.has(key) ? textPack.get(key) : key;
    }, [textPack]);

    return <div className="action-form">
        <div className="contact-form call-chat">
            <h3>{t("apps.action.contactseller")}</h3>
            <div className="button-container chat">
                <button className="link-button material blue large pw100 mt20" onClick={() => { }}>
                    <span className="backgrounded-span chat-icon before">{t("apps.action.contactemail")}</span>
                </button>
            </div>
            <div className="button-container phone">
                <span className="number">{phone}+12 3123</span>
                <button className="link-button material blue large pw100 mt20" onClick={() => { }}>
                    <span className="backgrounded-span phone-icon before">{t("apps.action.new.call")}</span>
                </button>
                <span className="backgrounded-span phone-cover-icon before"></span>
            </div>
        </div>
        <form className="contact-form email mt20" style={{ display: 'none' }}>
            <h3>Nachricht senden</h3>
            <ul>
                <li>
                    <label htmlFor="Name">Ihr Name</label>
                    <input className="large" id="Name" onChange={(e: any) => {}}></input>
                </li>
                <li>
                    <label htmlFor="email-content">Ihre E-Mail-Adresse</label>
                    <input className="large" id="email-address" onChange={(e: any) => {}}></input>
                </li>
                <li>
                    <label htmlFor="email-content">Ihre Nachricht</label>
                    <textarea className="large" id="email-content" onChange={(e: any) => {}}></textarea>
                </li>

            </ul>
            <label className="copy-for-sender" htmlFor="copy-for-sender">
                <input id="copy-for-sender" type="checkbox" name="" onChange={(e: any) => {}} checked={false} />
                Kopie per E-Mail an mich senden</label>
            <div className="button-container send">
                <button className="link-button material blue large pw100 mt20" onClick={() => { }}>
                    <span className="">Sender</span>
                </button>
            </div>
            <div className="form-footer">
                <span className="small">Ich bin einverstanden, dass meine Angaben und die folgende E-Mail-Korrespondenz zum Schutz vor Betrug für 6 Monate gespeichert bleiben.</span>
            </div>
        </form>
        <button className="link-button material white large left mt36" onClick={onFavoriteClick}><span className={favoriteClassName}>{t("apps.action.favorite")}</span></button>
        <button className="link-button material white large right mt36" onClick={() => { }}><span className="backgrounded-span print-icon after">{t("apps.action.print")}</span></button>
    </div>
}