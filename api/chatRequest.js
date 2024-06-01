import { getServerUrl, getCookie } from '../utils/function.js';

export const getChatStatus = async(user1_id, user2_id) => {
    const result = fetch(
        `${getServerUrl()}/chat/status/${user1_id}/${user2_id}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            noCORS: true,
        },
    );
    return result;
};

export const sendChat = async(sendData) => {
    console.log("chatRequest :: ",sendData);
    const result = await fetch(`${getServerUrl()}/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            room_id : sendData.room_id,
            sender_id : sendData.sender_id,
            message_text : sendData.message_text,
        }),
    });
    return result;
}

export const chatList = async(room_id) => {
    console.log("chatList :: ",room_id);
    const result = await fetch(`${getServerUrl()}/chat/${room_id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return result.json();
}

export const pageUserInfo = async(user_id) => {
    console.log("pageUser ",user_id);
    const result = await fetch(`${getServerUrl()}/users/${user_id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return result.json();
}

export const chatReq = async(login_user,page_user) => {
    console.log("pageUser : ",page_user, " user : ",login_user);
    const result = await fetch(`${getServerUrl()}/chat/request`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user1_id : login_user,
            user2_id : page_user,
        }),
    });
    return result;
}

export const chatReqApprove = async(roomId) => {
    console.log("chatReqApprove roomId ::: ", roomId);
    const result = await fetch(`${getServerUrl()}/chat/approve`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            room_id : roomId,
        })
    })
    return result;
}

export const updateLike = async(message_id) => {
    console.log("더블클릭 message_id ::: ", message_id);
    const result = await fetch(`${getServerUrl()}/chat/dblclick`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message_id
        })
    })
    return result;
}

export const getChatRoomList = async(user_id) => {
    console.log("chatRequest.js  ~~ ",user_id);
    //console.log(`${getServerUrl()}/chat/list/${user_id}`);
    const result = await fetch(`${getServerUrl()}/chat/list/${user_id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    return result;
}