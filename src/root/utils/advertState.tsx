
export const STATE_EXPIRED = 1;
export const STATE_DEACTAVATED = 2;
export const STATE_DELETED = 3;
export const STATE_BLOCKED = 4;
export const STATE_TO_APPROVE = 5;
export const STATE_DRAFT = 6;
export const STATE_IMPLIO_CHECK = 7;
export const STATE_TO_APPROVE_PICTURE_CHECK = 8;
export const STATE_ACTIVE = 10;
export const STATE_ACTIVE_PICTURE_CHECK = 12;
/*            "apps.active",
            "apps.inactive",
            "apps.draft",
            "apps.expired",
            "apps.inpreview",*/
export function getStateText(state: number) {
    switch (state) {
        case STATE_EXPIRED: return "apps.expired";
        case STATE_DEACTAVATED: return "apps.inactive";
        case STATE_DELETED: return "apps.deleted";
        case STATE_BLOCKED: return "apps.rejected";
        case STATE_TO_APPROVE: return "apps.inpreview";
        case STATE_DRAFT: return "apps.draft";
        case STATE_IMPLIO_CHECK: return "apps.inpreview";
        case STATE_TO_APPROVE_PICTURE_CHECK: return "apps.inpreview";
        case STATE_ACTIVE: return "apps.active";
        case STATE_ACTIVE_PICTURE_CHECK: return "apps.inpreview";
    }
}
export function getStateColor(state: number) {
    switch (state) {
        case STATE_EXPIRED: return "brown";
        case STATE_DEACTAVATED: return "red";
        case STATE_DELETED: return "gray";
        case STATE_BLOCKED: return "red";
        case STATE_TO_APPROVE: return "orange";
        case STATE_DRAFT: return "gray";
        case STATE_IMPLIO_CHECK: return "orange";
        case STATE_TO_APPROVE_PICTURE_CHECK: return "orange";
        case STATE_ACTIVE: return "green";
        case STATE_ACTIVE_PICTURE_CHECK: return "green";
    }
}