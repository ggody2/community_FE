import ChatItem from '../component/chatRoom/chatRoom.js';
import Dialog from '../component/dialog/dialog.js';
import Header from '../component/header/header.js';
import {
    authCheck,
    prependChild,
    getServerUrl,
    getCookie,
    deleteCookie,
    validNickname,
} from '../utils/function.js';
import {
    getChatRoomList,
} from '../api/chatRequest.js';

const DEFAULT_PROFILE_IMAGE = '/public/image/profile/default.jpg';
const HTTP_NOT_AUTHORIZED = 401;
const SCROLL_THRESHOLD = 0.9;
const INITIAL_OFFSET = 5;
const ITEMS_PER_LOAD = 5;
const HTTP_OK = 200;
const HTTP_CREATED = 201;

const setChatItem = chatData => {
    const chatList = document.querySelector('.chatList');
    if (!chatList) {
        console.error('Chat list element not found.');
        return;
    }
    chatList.innerHTML = '';
    if (chatList && chatData) {
        const itemsHtml = chatData
            .map(data =>
                ChatItem(
                    data.room_id,
                    data.message_text,
                    data.nickname,
                    data.profileImagePath,
                    data.sent_at,
                    data.user_id,
                ),
            )
            .join('');
        chatList.innerHTML += ` ${itemsHtml}`;
    }
};

const init = async () => {
    try {
        const data = await authCheck();
        const userId = data.data.userId;
        console.log("userId!!! ", userId);
        if (data.status === HTTP_NOT_AUTHORIZED) {
            window.location.href = '/html/login.html';
            return;
        }

        const profileImagePath =
            data.data.profileImagePath ?? DEFAULT_PROFILE_IMAGE;
        const fullProfileImagePath = `${getServerUrl()}${profileImagePath}`;
        prependChild(
            document.body,
            Header('', 2, fullProfileImagePath),
        );

        const response = await getChatRoomList(userId);
        if (!response.ok) {
            throw new Error('Failed to fetch chat room list.');
        }

        const chatList = await response.json();
        console.log("chatList ??? ", chatList.data);
        
        setChatItem(chatList.data);
    } catch (error) {
        console.error('Initialization failed:', error);
    }
};

init();