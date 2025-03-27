import axios from 'axios';

/*
Makes an API request to the backend using Axios
If response is successful, return json of success and response data
If response is unsuccesful, return json of failure and error data
If response is not received, throw an error
*/
const requestBackend = async (type, url, token_type = "access", data = null) => {

    // Define token types with their mappings
    const token_types = {'access': "access_token",
        'refresh': "refresh_token",
        'None': null
    }
    
    // Get appropriate token type from mapping
    const tokenKey = token_types[token_type]
    
    // Retrieve token from local storage, null if it doesn't exist
    const token = localStorage.getItem(tokenKey)
    try{
        // Make axios request to url, using Authorization token as header or no headers otherwise
        console.log(type, url, token, data)
        const response = await axios({
            method: type,
            url: url,
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` }: {}),
                'Content-Type': "application/json",
                'Access-Control-Allow-Origin': '*'        
            },
            data: data ? JSON.stringify(data) : null
        })
        return {success: true, data: response.data}
    } catch (error) {
        // If response received, send error response, else throw error
        if (error.response) {
            return {success: false, data: error.response.data}
        }
        throw error;
    }
    
}

const steamAuth = async () => {
    const steamOpenIdUrl = "https://steamcommunity.com/openid/login"; // Replace with the correct OpenID URL if needed

    const params = new URLSearchParams({
        "openid.ns": "http://specs.openid.net/auth/2.0",
        "openid.mode": "checkid_setup",
        "openid.return_to": window.location.origin + "/application/profile", // Equivalent to Flask's `url_for(..., _external=True)`
        "openid.realm": window.location.origin, // Equivalent to `request.host_url`
        "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
        "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select"
    });

    window.location.href = `${steamOpenIdUrl}?${params.toString()}`;
}

const redirectBack = async () => {
    const params = new URLSearchParams(window.location.search);
    
    const steamId = params.get("openid.claimed_id"); // This contains the Steam ID
    const openidMode = params.get("openid.mode");
    const openidSig = params.get("openid.sig");

    if (steamId && openidMode === "id_res" && openidSig){
        const {success, data} = requestBackend("POST","http://127.0.0.1:5000/profile/steam/callback","access",{ steamId, openidMode, openidSig })
        return {success, data}
    }
}

export {requestBackend, steamAuth, redirectBack}