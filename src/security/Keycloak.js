import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
    url: 'http://localhost:8080',
    realm: 'RankinDigital',
    clientId: 'mini_crm_frontend', 
});

export const initKeycloak = (onAuthenticatedCallback) => {
    keycloak.init({ onLoad: 'login-required' }).then(authenticated => {
        if (authenticated) {
            localStorage.setItem('keycloakToken', keycloak.token);
            if (onAuthenticatedCallback) onAuthenticatedCallback();
        } else {
            console.warn('User not authenticated');
        }
    }).catch(console.error);
};

export default keycloak;
