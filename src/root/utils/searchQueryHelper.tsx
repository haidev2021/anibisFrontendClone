
import { MutableRefObject } from "react";
import queryString from 'query-string';
import { SearchAttributeS, ICommonFilter, ICategoryFilter } from "./xbaseInterface.d";
import { AnyAaaaRecord } from "dns";

const LANGUAGE = "language";
const WHITELABLE_ID = "whitelabelId";
const TEXT_RESOURCE_SECTION = "sectionOrId";
const CATEGORY_SUGGESTION_KEYWORD = "keyword";
const MODULE = "module";
const GEO_COUNTRY_CODE = "countryCode";
const GEO_ZIP = "zip";
const GEO_NAME = "name";
export const CATEGORY_ID = "cid";
const ADVERT_LANGUAGE = "lng";
const WITH_IMAGES_ONLY = "wio";
export const SEARCH_TERM = "fts";
export const SEARCH_LOCATION = "loc";
const SEARCH_DISTANCE = "sdc";
const RESULT_PAGE_INDEX = "pi";
const RESULT_PAGE_SIZE = "ps";
export const SORT_FIELD = "sf";
export const SORT_ORDER = "so";
export const ATTRIBUTE_ID_LIST = "aidl";
export const ATTRIBUTE_MULTIID_LIST = "amid";
export const ATTRIBUTE_TEXT_LIST = "atxl";
export const ATTRIBUTE_RANGE_LIST_NUMBER = "aral";
export const ATTRIBUTE_RANGE_LIST_DATE = "ardl";
const MEMBER_ID = "mid";
const USERNAME = "sun";
const SEARCH_CANTON = "sct";
const USE_ADVERT_LANGUAGE_FILTER = "ualf";
const ADVERT_TYPE = "aty";
const ADVERT_ID = "advertId";
const DEVICE_TOKEN = "DeviceToken";
const USER_SETTING_API_MEMBER_ID = "memberId";
const AUTOCOMPLETE_SEARCH_TERM = "searchTerm";
const AUTOCOMPLETE_CATEGORY_ID = "categoryId";
const AUTOCOMPLETE_NUMBER_OF_RESULTS = "numberOfResults";
export type TQuueryField = "fts" | "sf" | "so" | "loc" | "cid" | "aral" | "atxl" | "aidl" | "amid" | "ardl";

function normaliseValue(value: any) {
    return value !== null && value !== undefined ? value : "";
}

export function updateSubQueryRef(ref:MutableRefObject<Map<TQuueryField, string>>, key: TQuueryField, value: any) {
    ref.current.set(key, encodeSubQuery(key, value));
}

export function encodeSubQuery(key: string, value: any) {
    let result = "";
    let obj:any = {};
    if (value instanceof Map) {
        obj[key] = [];
        Array.from(value.values(), (att) => {
            let newValue = null;
            let attId = att.attributeId;

            if (key === ATTRIBUTE_TEXT_LIST && att.inputText) {
                newValue = `${attId}_${att.inputText}`;
            }

            //else if(att.attributeEntryIds) {
            // }
            else if (key === ATTRIBUTE_RANGE_LIST_NUMBER && (att.inputNumberFrom || att.inputNumberFrom === 0 || att.inputNumberTo || att.inputNumberTo === 0)) {
                newValue = `${attId}_${normaliseValue(att.inputNumberFrom)}_${normaliseValue(att.inputNumberTo)}`;
            }
            else if (key === ATTRIBUTE_RANGE_LIST_DATE && (att.inputDateFrom || att.inputDateTo)) {
                newValue = `${attId}_${normaliseValue(att.inputDateFrom)}_${normaliseValue(att.inputDateTo)}`;
            }
            else if (key === ATTRIBUTE_ID_LIST && att.attributeEntryId) {
                newValue = `${attId}_${att.attributeEntryId}`;
            }

            if (newValue)
                obj[key].push(newValue);
        });
        result = obj[key].length > 0 ? queryString.stringify(obj, { arrayFormat: 'comma' }) : "";
    }
    else if (value) {
        obj[key] = value;
        result = queryString.stringify(obj);
    }
    console.log('encodeSubQuery key', key, 'result', value, 'value', result)
    return result;
}

const queriableFields: Array<TQuueryField> = [SEARCH_TERM, CATEGORY_ID, SEARCH_LOCATION, ATTRIBUTE_RANGE_LIST_NUMBER,
    ATTRIBUTE_RANGE_LIST_DATE, ATTRIBUTE_ID_LIST, ATTRIBUTE_MULTIID_LIST, ATTRIBUTE_TEXT_LIST, SORT_FIELD, SORT_ORDER];
const keyboardAttributeFields: Array<TQuueryField>  = [ATTRIBUTE_RANGE_LIST_NUMBER, ATTRIBUTE_TEXT_LIST];
export interface ICompoundQuery {
    query: string;
    keyBoardInputQuery: string;
}
export function getCompoundQuery(subQueries: Map<TQuueryField, string>): ICompoundQuery {
    let filledSubQueries: Array<string> = [];
    let filledKeyBoardInputQueries: Array<string> = [];
    queriableFields.map((field: TQuueryField) => {
        const value = subQueries.get(field);
        if (value) {
            filledSubQueries.push(value);
            if (keyboardAttributeFields.includes(field))
                filledKeyBoardInputQueries.push(value);
        }
    })
    let query = filledSubQueries.join("&");
    let keyBoardInputQuery = filledKeyBoardInputQueries.join("&");
    return {query, keyBoardInputQuery}
}

function stringToData(fieldName: string, stringValue: string) {
    if (fieldName === "inputNumber")
        return Number.parseFloat(stringValue)
    else if (fieldName === "inputDate")
        return Date.parse(stringValue)
    else if (fieldName === "attributeEntryId")
        return Number.parseInt(stringValue)
    else
        return stringValue;
}

function parseSearchAttribute(toSplit: string, fieldName: string): SearchAttributeS {
    const [attributeId, input1, input2] = toSplit.split("_");
    const entriedAtt: any = { attributeId: Number.parseInt(attributeId) };
    if (input2 === undefined) {
        entriedAtt[fieldName] = stringToData(fieldName, input1);
    } else if (input2 === "") {
        entriedAtt[fieldName + "From"] = stringToData(fieldName, input1);
    } else {
        entriedAtt[fieldName + "From"] = stringToData(fieldName, input1);
        entriedAtt[fieldName + "To"] = stringToData(fieldName, input2);
    }
    console.log('parseSearchAttribute entriedAtt', entriedAtt)
    return entriedAtt as SearchAttributeS;
}

function toArray(value: any) {
    return Array.isArray(value) ? value : (value || value === 0 ? [value] : []);
}
export interface IParseSearchQueryResult {
    commonFilter: ICommonFilter, 
    categoryFilter: ICategoryFilter, 
    shortType: string; 

}
export function parseSearchQuery(query: string): IParseSearchQueryResult {
    // query = "atxl=3_%25xxx%25,33_%25yyy%25&cid=113"
    // let PRINT_EXTRA_LOGS = true;
    // console.log('/search parseSearchQuery query', query)
    const parsed = queryString.parse(query, { arrayFormat: 'comma' });

    const categoryId = parsed[CATEGORY_ID] && Number.parseInt(parsed[CATEGORY_ID] as string) || 0;

    let categoryFilter: ICategoryFilter = {
        categoryId: categoryId,
    }

    let commonFilter: ICommonFilter = { term: parsed[SEARCH_TERM] as string, location: parsed[SEARCH_LOCATION] as string };
    // console.log('parseSearchQuery commonFilter', commonFilter)
    const attributes = [
        ...Array.from(toArray(parsed[ATTRIBUTE_TEXT_LIST]), item => parseSearchAttribute(item, "inputText")),
        ...Array.from(toArray(parsed[ATTRIBUTE_RANGE_LIST_NUMBER]), item => parseSearchAttribute(item, "inputNumber")),
        ...Array.from(toArray(parsed[ATTRIBUTE_RANGE_LIST_DATE]), item => parseSearchAttribute(item, "inputDate")),
        ...Array.from(toArray(parsed[ATTRIBUTE_ID_LIST]), item => parseSearchAttribute(item, "attributeEntryId")),
    ];

    if (attributes.length > 0)
        categoryFilter.attributes = attributes;

    /*{attributes: {$all: [{$elemMatch: {attributeId: 223, inputDate: "2020-10-21"}}, {$elemMatch: {attributeId: 226, attributeEntryId: "15334"}}]}};*/

    // console.log('parseSearchQuery categoryFilter', categoryFilter);

    let shortType = parsed[SORT_FIELD] && parsed[SORT_ORDER] && `${parsed[SORT_FIELD]}|${parsed[SORT_ORDER]}`;
    // console.log('parseSearchQuery shortType', shortType)

    return { commonFilter, categoryFilter, shortType };
}