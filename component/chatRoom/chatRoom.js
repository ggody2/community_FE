import { padTo2Digits, getServerUrl } from '../../utils/function.js';

const ChatItem = (
    room_id,
    message_text,
    nickname,
    imgUrl,
    sent_at,
    user_id,
) => {
    // 파라미터 값이 없으면 리턴
    if (
        room_id === undefined,
        user_id === undefined,
        !message_text,
        !nickname,
        !imgUrl,
        !user_id
    ) {
        return;
    }

    const otherId = user_id;
    // 날짜 포맷 변경 YYYY-MM-DD hh:mm:ss
    const dateObj = new Date(sent_at);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();

    const formattedDate = `${year}-${padTo2Digits(month)}-${padTo2Digits(day)} ${padTo2Digits(hours)}:${padTo2Digits(minutes)}`;
    const API_HOST = getServerUrl();

    console.log("ChatItem params:", { room_id, sent_at, message_text, nickname });
    console.log("Formatted date:", formattedDate);
    console.log("Image URL:", imgUrl);

    return `
    <a href="/html/chat-room.html?roomId=${room_id}&otherId=${otherId}">
        <div class="chatItem">
            <picture class="img">
                <img src="${`${API_HOST}${imgUrl}`}" alt="img">
            </picture>
            <div class="text">
                <h2 class="title">${nickname}</h2>
                <div class="info">
                    <h3 class="views">${message_text}</h3>
                    <p class="date">${formattedDate}</p>
                </div>
            </div>
        </div>
    </a>
`;
};

export default ChatItem;