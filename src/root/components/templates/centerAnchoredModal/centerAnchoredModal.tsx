
import React, { useContext } from 'react';
import { onDummyClick, trans } from '../../../utils/common';
import { RootContext } from '../../../root';
import { NullableIRootContext } from '../../../utils/xbaseInterface.d';
export interface ICenterAnchoredModal {
    isOpen: boolean;
    onXClick: (params: any) => void;
    onBottomButtonClick?: (params: any) => void;
    bottomButtonText?: string;
    hideBottomButton?: boolean;
    children: any;
    className?: string;
    smallMarginBottom?: boolean;
}
export default function CenterAnchoredModal(props: ICenterAnchoredModal) {
    let { isOpen, onXClick, onBottomButtonClick, bottomButtonText, hideBottomButton, children, className, smallMarginBottom } = props;
    const rootContext = useContext(RootContext) as NullableIRootContext;

    // useEffect(() => {
    //     console.log('useEffect pageYOffset set', window.pageYOffset)
    //     if (isOpen && rootContext.usedPageYOffset[0] !== null)
    //         rootContext.usedPageYOffset[1](window.pageYOffset);
    //     rootContext.usedDisableScrollY[1](isOpen);
    // }, [isOpen]);

    let texts = rootContext && rootContext.commonTexts;
    onBottomButtonClick = onBottomButtonClick || onXClick;
    bottomButtonText = bottomButtonText || trans("apps.action.apply", texts);
    className = "modal-container " + className;

    return <div className={className} style={{ display: isOpen ? 'block' : 'none' }} onClick={onXClick}>
        <div className="modal-content center-anchored" onClick={onDummyClick}>

            <div className="modal-header">
                <button className="simple-link x-mark" onClick={onXClick}><span className="backgrounded-span close-icon after">{trans("apps.action.close", texts)}</span></button>
            </div>

            <div className={"modal-chunk" + (hideBottomButton === true ? ' hide-bottom-button' : '')}>
                {children}
                {/* <div id="modal-footer-buffer"></div> */}
            </div>

            <div className="modal-footer" style={{ display: hideBottomButton === true ? 'none' : 'block' }}>
                <button className={"link-button non-material small blue match-parent-width" + (smallMarginBottom ? " small-margin" : "")} onClick={onBottomButtonClick}>{bottomButtonText}</button>
            </div>
        </div>
    </div>;
}