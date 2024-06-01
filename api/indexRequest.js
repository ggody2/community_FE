import { getServerUrl, getCookie } from '../utils/function.js';

export const getPosts = (offset, limit, sort) => {
    const result = fetch(
        `${getServerUrl()}/posts?offset=${offset}&limit=${limit}&sort=${sort}`,
        {
            headers: {
                session: getCookie('session'),
                userId: getCookie('userId'),
            },
            noCORS: true,
        },
    );
    return result;
};

export const getSearch = (offset, limit,search) => {
    const queryParams = new URLSearchParams({query:search}).toString();
    console.log("queryParams ",queryParams);
    const result = fetch(
        `${getServerUrl()}/posts/search?${queryParams}&offset=${offset}&limit=${limit}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            noCORS: true,
        },
    );
    return result;
}