// Persists the last-used Client ID across pages/sessions so a super_admin
// working between Team Management and API Management doesn't have to
// re-paste it after creating a new organization.
const KEY = 'apim-last-client-id';

export function getLastClientId() {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem(KEY) || '';
}

export function setLastClientId(clientId) {
    if (typeof window === 'undefined') return;
    if (!clientId) {
        window.localStorage.removeItem(KEY);
        return;
    }
    window.localStorage.setItem(KEY, clientId);
}
