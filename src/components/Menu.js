import React, {Component} from 'react';
import axios from 'axios';
import { AUTH_CONFIG } from '../Config';

const API_URL = 'https://localhost:8243/pizzashack/1.0.0';

class Menu extends Component {

    constructor(props) {
        super(props);
        this.state = {
            menuItems : []
        };
    }

    getRefreshToken(){
        return localStorage.getItem("refreshToken") || null;
    }

    logout() {

        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('idToken');
        localStorage.removeItem("refreshToken");
    }

    componentDidMount () {
        const { getAccessToken } = this.props.auth;
        const headers = { 'Authorization': `Bearer ${getAccessToken()}`}
        axios.get(`${API_URL}/menu`, { headers })
            .then(response => this.setState({ menuItems: response.data }))
            .catch(error =>{ 
                                if(error.response.status === 401 && this.getRefreshToken() !== null){

                                    var options = {
                                        method: 'POST',
                                        url: 'https://localhost:9444/oauth2/token?grant_type=refresh_token&refresh_token=' +this.getRefreshToken(),
                                        headers: {'content-type': 'application/x-www-form-urlencoded', 'Authorization': 'Basic ' + AUTH_CONFIG.encodedclientkeyClientSecret},
                                        data:{}
                                      };
                                      
                                      axios.request(options).then(response => {
                        
                                        // Set the time that the access token will expire at
                                        let expiresAt = (response.data.expires_in * 1000) + new Date().getTime();
                                        this.accessToken = response.data.access_token;
                                        this.refreshToken = response.data.refresh_token;
                                        this.expiresAt = expiresAt;
                                        
                                        localStorage.setItem('accessToken', this.accessToken);
                                        localStorage.setItem('refreshToken', this.refreshToken);
                                        localStorage.setItem('isLoggedIn', 'true');
                                        localStorage.setItem('expiresAt', this.expiresAt);
                                        this.componentDidMount ();
                                        
                                      }).catch(error => {
                                        this.logout();
                                        document.location.href="/";
                                        console.error(error);
                                      });

                                }
                                this.setState({ message: error.message })
        
                            });
    }

    render() {
        return (
            <div className="container">
                <div className="card-columns">
                        {this.state.menuItems === null && <p>Loading menu...</p>}
                        {
                            this.state.menuItems && this.state.menuItems.map(item => (
                                <div key={item.name} class="card">
                                    <div class="card-header">{item.name}</div>
                                    <div class="card-body">
                                        <p class="card-text">{item.description}</p>
                                        <a href="#" class="btn btn-primary">More...</a>
                                    </div>
                                </div>
                            ))
                        }
                </div>
            </div>
        );
    }
}

export default Menu;