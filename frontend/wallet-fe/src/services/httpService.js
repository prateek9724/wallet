const apiCall = async ({endpoint ,  method, queryParams, body }) => {
    try{
        const response = await fetch(`${endpoint}?${new URLSearchParams(queryParams)}`, {
            method,
            headers: {
                "Content-Type": "application/json"
            },
            ...(body ? { body: JSON.stringify(body) } : {})
        })
        const responseBody = await response.json();
        
        if(!response.ok) 
            throw responseBody;

        return responseBody
    }catch(e){
        console.error('Error in api call' , e);
        throw e;
    }
}

export {
    apiCall
}