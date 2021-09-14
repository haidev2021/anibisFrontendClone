import { MutableRefObject, Dispatch, SetStateAction } from "react";

export interface IDetailAttribute {
    attributeId: number;
    attributeEntryIds: number[];
    attributeEntryId: number;
    inputText: string;
    inputNumber: number;
    inputDate: string;
}

export interface SearchAttributeS {
    attributeId: number;
    attributeEntryIds?: number[];
    attributeEntryId?: number;
    inputText?: string;
    inputNumberFrom?: number;
    inputNumberTo?: number;
    inputDateFrom?: number;
    inputDateTo?: number;
}

export interface IXBaseCategory {
    name: string;
    id: number;
}

export interface XBaseEntryAttributeS {
    id: number;
    parentId: number;
    attributeId: number;
    name: string;
}

export interface XBaseNumericRangeS {
    numericRangeId: number;
    stringFormat: string;
    stepValue: number;
    minValue: number;
    maxValue: number;
    isDescending: number;
    isInteger: number;
    isDynamic: number;
}

export interface IXBaseAttribute {
    id: number;
    type: number;
    name?: string;
    isInSummary?: boolean;
    isMainSearch?: boolean;
    isMandatory?: boolean;
    sortOrder?: number;
    parentId?: number;
    defaultSelectItemId?: number;
    unit?: string;
    numericRange?: XBaseNumericRangeS;
    entries?: XBaseEntryAttributeS[];
}

export type TXBaseAttributes = Array<IXBaseAttribute>;

export interface XBasePictureS {
    blogPhotosThumbnail: string;
    blogPhotosResized: string
}

export interface XBaseContactAddressS {
    street: string;
    zip: string;
    city: string;
    phone: string;
    countryCode: string;
    allowEMail: false;
    latitude: number;
    longitude: number
    contactType: number;
}

export interface XBaseUserS {
    _id: string;
    email: string;
    memberSince: string
}


export interface IXBaseAdvert {
    _id?: string;
    userId?: string;
    language: TLanguage;
    categoryId: number;
    attributes: IDetailAttribute[];
    pictures: XBasePictureS[];
    contactAddress: XBaseContactAddressS;
    title: string;
    description: string;
    price: string;
    categoryPath: number[];
    thumbnail: string;
    modified?: string;
    posted?: string;
    expiring?: string;
    hits?: number;
    contacts?: number;
    user: XBaseUserS;
    state: number;
    categoryName?: string;
    briefDescription?: string;
}
// export interface IXBaseReviewAdvert {
//     language: TLanguage;
//     categoryId: number;
//     attributes: IDetailAttribute[];
//     pictures: XBasePictureS[];
//     contactAddress: XBaseContactAddressS;
//     title: string;
//     description: string;
//     price: string;
//     categoryPath: number[];
//     thumbnail: string;
//     user: XBaseUserS;
//     state: number;
// }
export interface ILoginInfo {
    email: string;
    memberSince: string;
    token: string;
    _id: string;
    role: string;
}

export type TTextPack = Map<string, string>

export interface IRootContext {
    favoriteIds: string[];
    setFavoriteIds: any;
    loginInfo: ILoginInfo;
    setLoginInfo: any;
    language: TLanguage;
    setLanguage: any;
    commonTexts: TTextPack;
    dummyCategory: IXBaseCategory;
    isMobileSCreenSize: boolean;
    usedDisableScrollY: [boolean, any];
    usedPageYOffset: [number, any];
    searchResultIdsRef: MutableRefObject<string[]>;
    detailPreviousPathRef: MutableRefObject<string>;
    countryListRef: MutableRefObject<Map<TLanguage, Array<IXBaseCountry>>>;
    categoryAttributesCacheRef: MutableRefObject<Map<TLanguage, Map<number, Array<IXBaseAttribute>>>>,
    subCategoryCacheRef: MutableRefObject<Map<TLanguage, Map<number, Array<IXBaseCategory>>>>,
}

export type NullableIRootContext = IRootContext | null;

export interface IXBaseCountry {
    shortCode: string;
    name: string;
}

export type TLanguage = "en" | "de" | "fr" | "it";

export type TTextPackId = "DETAIL" | "SEARCH" | "HOME" | "INSERT" | "LOGIN_REGISTER" | "MY_ADVERTS" | "ACCOUNT";

export type TAttributeState = Map<number, IDetailAttribute>;

export type TAttributeSetState = Dispatch<SetStateAction<TAttributeState>>

export interface IEmailStatus {
    email: string;
    memberSince: string;
}

export interface IInsertionAttributeInfo {
    categoryId: number;
    entriedAttributeMap: TAttributeState;
    categoryPath: Array<number>;
    xBaseAttributes: TXBaseAttributes;
    price?: string;
}


export interface ICommonFilter {
    term?: string;
    location?: string;
}
export interface ICategoryFilter {
    categoryId?: number;
    attributes?: Array<SearchAttributeS>;
}

export interface INoContent {
    title: string,
    description: string,
    buttonText: string,
    onButtonClick: (e: any) => void,
}

export interface IValidationItemInfo {
    name: string;
    offsetY: number;
    hasValue: boolean;
}
export interface IAttributeValidationInfo {
    listToValidate: Map<number, IValidationItemInfo>;
    firstValidateOffsetY: number;
}