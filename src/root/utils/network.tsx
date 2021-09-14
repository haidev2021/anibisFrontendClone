
import Axios from 'axios';
export const USER_VALIDATE_EMAIL_API = '/user/validateemail';
export const USER_SIGNIN_API = '/user/signin';
export const USER_REGISTER_API = '/user/register';
export const USER_VERIFY_TOKEN_API = '/user/verifyToken';
export const USER_FAVORITE_ADD_REMOVE_API = '/user/favoriteAddRemove';
export const USER_FAVORITE_LOCAL_SYNC_API = '/user/favoriteLocalSync';
export const XBASE_GET_SUBCATEGORIES_API = '/xbase/getSubCategories';
export const XBASE_GET_CATEGORIES_BY_IDS_API = '/xbase/getCategoriesByIds';
export const XBASE_GET_CATEGORY_PATH_BY_ID_API = '/xbase/getCategoryPathById';
export const XBASE_ATTRIBUTES_BY_CAT_ID_API = '/xbase/attributesByCatId';
export const XBASE_COUNTRIES_API = '/xbase/countries';
export const XBASE_TEXT_PACK_API = '/xbase/textPack';
export const XBASE_LOCATION_SUGGESTION_API = '/xbase/locationSuggestion';
export const ADVERT_INSERT_API = '/advert/insert';
export const ADVERT_UPDATE_ADVERT_API = '/advert/updateAdvert';
export const ADVERT_UPDATE_ADVERT_FOR_ADMIN_API = '/advert/updateAdvertForAdmin';
export const ADVERT_DETAIL_API = '/advert/detail';
export const ADVERT_PROMOTE_API = '/advert/promote';
export const ADVERT_DELETE_API = '/advert/delete';
export const ADVERT_USER_ADVERTS_API = '/advert/userAdverts';
export const ADVERT_LASTEST_OFFERS_API = '/advert/lastestOffers';
export const ADVERT_GALLERY_API = '/advert/gallery';
export const ADVERT_SEARCH_RESULT_API = '/advert/searchResult';
export const ADVERT_SEARCH_API = '/advert/search';
export const ADVERT_MY_ADVERT_IDS_API = '/advert/myAdvertIds';
export const ADVERT_MY_ADVERT_IDS_FOR_ADMIN_API = '/advert/myAdvertIdsForAdmin';
export const ADVERT_FAVORITE_IDS_API = '/advert/favoriteIds';
export const ADVERT_SEARCH_COUNT_API = '/advert/searchCount';

export function setAuthorizationToken(token: string) {
    setHeader('Authorization', `Bearer ${token}`);
}
export function setHeader(key: string, value: string) {
    Axios.defaults.headers.common[key] = value;
}

