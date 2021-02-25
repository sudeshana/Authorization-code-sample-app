import queryString from 'query-string';
import { AUTH_CONFIG } from '../Config';
var axios = require("axios").default;

export default class Auth {
    authorizationCode;
    accessToken;
    refreshToken = this.getRefreshToken();
    idToken;
    expiresAt = this.getExpiresAt();

    constructor() {
        this.isAuthenticated = this.isAuthenticated.bind(this);
        this.login = this.login.bind(this);
        this.handleAuthentication = this.handleAuthentication.bind(this);
        this.logout = this.logout.bind(this);
    }

    login() {
        //var url = AUTH_CONFIG.authUrl + "?response_type=id_token token&client_id=" + AUTH_CONFIG.clientId + "&scope=openid&nonce=13e2312637dg136e1&";
        var url = AUTH_CONFIG.authUrl + "?response_type=code&client_id=" + AUTH_CONFIG.clientId + "&scope=openid&&state=fa04438a996f&";
        var redirectUrl = "redirect_uri=" + AUTH_CONFIG.callbackUrl;
        url = url + redirectUrl;
        window.location.href = url;
    }

    handleAuthentication() {
        console.log("handling the response received from APIM");
        console.log(queryString);
        const authResult = queryString.parse(window.location.search);
        console.log(authResult);

        if (authResult && authResult.code && authResult.state){
            this.authorizationCode = authResult.code;
            localStorage.setItem('authorizationCode', this.authorizationCode);

            var options = {
                method: 'POST',
                url: 'https://localhost:9444/oauth2/token?grant_type=authorization_code&code=' +this.authorizationCode+'&redirect_uri=' +AUTH_CONFIG.callbackUrl,
                headers: {'content-type': 'application/x-www-form-urlencoded', 'Authorization': 'Basic ' + AUTH_CONFIG.encodedclientkeyClientSecret},
                data:{}
              };
              
              axios.request(options).then(response => {
                console.log(response.data);

                

                // Set the time that the access token will expire at
                let expiresAt = (response.data.expires_in * 1000) + new Date().getTime();

                console.log(expiresAt);

                //console.log(response.data.access_token);
                //console.log(response.data.id_token);
                this.accessToken = response.data.access_token;
                this.refreshToken = response.data.refresh_token;
                this.idToken = response.data.id_token;
                this.expiresAt = expiresAt;
                console.log(this.expiresAt);
                localStorage.setItem('accessToken', this.accessToken);
                localStorage.setItem('refreshToken', this.refreshToken);
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('expiresAt', this.expiresAt);
                //this.isAuthenticated();
                window.location.reload(false);
              }).catch(error => {
                console.error(error);
              });


        }else{
            console.log("An error occurred while authentication.");
            alert(`Error: Check the console for further details.`);
        }

       /* if(authResult && authResult.access_token && authResult.id_token) {
            // Set isLoggedIn flag in localStorage
            localStorage.setItem('isLoggedIn', 'true');

            // Set the time that the access token will expire at
            let expiresAt = (authResult.expires_in * 1000) + new Date().getTime();
            this.accessToken = authResult.access_token;
            this.idToken = authResult.id_token;
            this.expiresAt = expiresAt;

            localStorage.setItem('accessToken', this.accessToken);
        } else {
            console.log("An error occurred while authentication.");
            alert(`Error: Check the console for further details.`);
        }*/
    }

    logout() {
        // Remove tokens and expiry time
        this.accessToken = null;
        this.idToken = null;
        this.expiresAt = 0;
    
        // Remove isLoggedIn flag and other token flags from localStorage
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('idToken');
    }

    isAuthenticated() {
        // Check whether the current time is past the
        // access token's expiry time
        /*let expiresAt = this.expiresAt;
        console.log('expiresAt,', expiresAt);
        console.log('now,', new Date().getTime());
        console.log(new Date().getTime() < expiresAt);
        return new Date().getTime() < expiresAt; */
        return JSON.parse(localStorage.getItem('isLoggedIn')) === true; 
    }

    getAccessToken() {
        return localStorage.getItem("accessToken");
    }

    getAuthorizationCode() {
        return localStorage.getItem("authorizationCode");
    }

    getExpiresAt(){
        return localStorage.getItem('expiresAt') || 0;
    }

    getRefreshToken(){
        return localStorage.getItem("refreshToken") || null;
    }
  

}
