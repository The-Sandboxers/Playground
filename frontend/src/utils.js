import axios from 'axios';

/*
Makes an API request to the backend using Axios
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
                'Content-Type': "application/json"        
            },
            data: data ? JSON.stringify(data) : null
        })
        return response.data
    } catch (error) {
        console.error("API Request Error:", error.response?.data || error.message)
        throw error;
    }
    
}

export {requestBackend}