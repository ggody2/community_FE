import Header from '../component/header/header.js';

import {
    authCheck,
    getCookie,
    getServerUrl,
    prependChild,
    padTo2Digits,
} from '../utils/function.js';
import {
    sendChat,chatList,pageUserInfo,updateLike,
} from '../api/chatRequest.js';

const DEFAULT_PROFILE_IMAGE = '/public/image/profile/default.jpg';
const MAX_COMMENT_LENGTH = 1000;
const HTTP_NOT_AUTHORIZED = 401;
const HTTP_OK = 200;

const myInfoResult = await authCheck();
        if (myInfoResult.status !== HTTP_OK) {
            throw new Error('사용자 정보를 불러오는데 실패하였습니다.');
        }
const myInfo = myInfoResult.data;
console.log("myInfo !!! ",myInfo);

const getQueryString = name => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// 상대 이름과 아이디
const setUserInfo = (info) => {
    const userProfileElement = document.querySelector('.chat-header img');
    const userNameElement = document.querySelector('.user-info h3');
    const userMailElement = document.querySelector('.user-info p');

    userProfileElement.src = info.profile_image === undefined
        ? `${getServerUrl()}${DEFAULT_PROFILE_IMAGE}`
        : `${getServerUrl()}${info.profile_image}`;
    userNameElement.textContent = info.nickname;
    userMailElement.textContent = info.email;
};

const socket = io('http://localhost:8080');
const roomId = getQueryString('roomId');
const otherId = getQueryString('otherId');
// 채팅방 입장
socket.emit('joinRoom', roomId);

// 메시지 수신
socket.on('chatMessage', (data) => {
    const messageElement = document.createElement('div');
    console.log("수신 ::: ",data);
    messageElement.className = 'message';
    if (data.senderId === myInfo.userId) {
        messageElement.classList.add('sent');
    }
    messageElement.textContent = `${data.message}`;
    document.getElementById('messages').appendChild(messageElement);
    document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
    addDoubleClickEvent(messageElement, data);
});

// 메시지 전송
document.getElementById('sendMessage').addEventListener('click', async() => {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value;
    console.log("보낸 메시지 : ",message);
    const sendData = {
        room_id : roomId,
        sender_id : myInfo.userId,
        message_text : message
    }
    const sendResult = await sendChat(sendData);
    console.log("sendResult !! ",sendResult);
    if (message.trim() !== '') {
        socket.emit('chatMessage', { roomId, message, senderId: myInfo.userId });
        console.log("전송 ", { roomId, message, senderId: myInfo.userId });
        messageInput.value = '';
    }
});

// 채팅방 나가기
document.getElementById('leaveChat').addEventListener('click', () => {
    socket.emit('leaveRoom', roomId);
    window.location.href = 'index.html';
});

// 메시지 조아요
const addDoubleClickEvent = (chatElement,chatData) => {
    chatElement.addEventListener('dblclick',async() => {
        console.log("dblclick!!! ",chatElement,chatData);
        const result = await updateLike(chatData.message_id);
        console.log("dblclick ~~ ",result);
        if (result.ok) {
            chatData.chat_like = !chatData.chat_like; 
            const heartIcon = chatElement.nextElementSibling;
            if (chatData.chat_like) {
                if (!heartIcon || !heartIcon.classList.contains('heart-icon')) {
                    const heart = document.createElement('div');
                    heart.className = "heart-icon";
                    heart.textContent = '❤️';
                    chatElement.parentNode.appendChild(heart);

                    if (chatElement.classList.contains('sent')) {
                        heart.classList.add('sent');
                    }
                }
            } else {
                if (heartIcon && heartIcon.classList.contains('heart-icon')) {
                    heartIcon.remove();
                }
            }
        } else {
            console.log("더블클릭 실패!!!");
        }
    })

}

const init = async() => {
    const profileImage =
        myInfoResult.data.profileImagePath === undefined
            ? `${getServerUrl()}${DEFAULT_PROFILE_IMAGE}`
            : `${getServerUrl()}${myInfoResult.data.profileImagePath}`;
    //prependChild(document.body,Header('', 1, profileImage));

    try {
        // pageUser 정보
        const pageUserInfoResult = await pageUserInfo(otherId);
        setUserInfo(pageUserInfoResult);
        console.log("pageUser ::: ",pageUserInfoResult);

        // DB => chat내용
        const chatListResult = await chatList(roomId);
        console.log("Chat All List : ",chatListResult);

        const messagesContainer = document.getElementById('messages');
        let prevMonth = null;
        let prevDay = null;
        let prevTime = 0;
        
        chatListResult.data.forEach(message => {
            const dateString = message.sent_at;
            const dateObj = new Date(dateString);
            const year = dateObj.getFullYear();
            const month = dateObj.getMonth() + 1;
            const day = dateObj.getDate();
            const hours = dateObj.getHours();
            const minutes = dateObj.getMinutes();

            const datePart = `${month}월 ${day}일`;
            const timePart = `${padTo2Digits(hours)}:${padTo2Digits(minutes)}`;

            const currentTime = dateObj.getTime();
            let timeDiff = 0;

            if (prevTime) {
                timeDiff = (currentTime - prevTime) / (1000 * 60); // 분 단위로 시간 차이 계산
            }

            if (prevMonth != month || prevDay != day ) {
                const dateHeader = document.createElement('p');
                dateHeader.className = 'day-time';
                dateHeader.textContent = datePart + " " + timePart;
                messagesContainer.appendChild(dateHeader);         
            } else if ( timeDiff > 30) {
                const dateHeader = document.createElement('p');
                dateHeader.className = 'day-time';
                dateHeader.textContent = timePart;
                messagesContainer.appendChild(dateHeader);  
            }
            prevMonth = month;
            prevDay = day;
            prevTime = currentTime;
            console.log(prevMonth, prevDay, prevTime);

            const messageWrapper = document.createElement('div');
            messageWrapper.className = 'message-wrapper';

            const messageElement = document.createElement('div');
            messageElement.className = 'message';
            messageElement.textContent = message.message_text;

            // 내가 보낸 메시지인지
            if (message.sender_id == myInfo.userId) {
                messageElement.classList.add('sent');
            } 
            messageWrapper.appendChild(messageElement);

             // 조아요메시지인지
            if (message.chat_like) {
                const heart = document.createElement('div');
                heart.className = "heart-icon";
                heart.textContent = '❤️';
                messageWrapper.appendChild(heart);

                if (messageElement.classList.contains('sent')) {
                    heart.classList.add('sent');
                }
            }

            messagesContainer.appendChild(messageWrapper);
            addDoubleClickEvent(messageElement,message);
        });


        // 스크롤을 최하단으로
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }catch(error) {
        console.log("error ",error);
    }
}

init();
