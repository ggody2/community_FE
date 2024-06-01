import CommentItem from '../component/comment/comment.js';
import Dialog from '../component/dialog/dialog.js';
import Header from '../component/header/header.js';
import {
    authCheck,
    getCookie,
    getServerUrl,
    prependChild,
    padTo2Digits,
} from '../utils/function.js';
import {
    getPost,
    deletePost,
    writeComment,
    getComments,
    updateLikeCnt,
} from '../api/boardRequest.js';
import {
    getChatStatus,
    chatReq,
    chatReqApprove,
} from '../api/chatRequest.js';

let pageData = null;
let myInfo = null;

const DEFAULT_PROFILE_IMAGE = '/public/image/profile/default.jpg';
const MAX_COMMENT_LENGTH = 1000;
const HTTP_NOT_AUTHORIZED = 401;
const HTTP_OK = 200;

const getQueryString = name => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
};

const getBoardDetail = async postId => {
    const response = await getPost(postId);
    if (!response.ok)
        return new Error('게시글 정보를 가져오는데 실패하였습니다.');

    const data = await response.json();
    console.log("data.data[0] ",data.data[0]);
    return data.data[0];
};

const likeBtnElement = document.querySelector('.likeBtn');
const setLikeCount = (likeCnt)=> {
    const likeCountElement = document.querySelector('.likeCount h3');
    if (likeCnt == '0') {
    likeBtnElement.textContent = '🩶';
    } else {
        likeBtnElement.textContent = '❤️';
    } 
    if (likeCnt.includes('K') || likeCnt.includes('M')) {
        likeCountElement.textContent = likeCnt;
    } else {
        likeCountElement.textContent = (
            parseInt(likeCnt, 10)
        ).toLocaleString();
    }
}

// 조아요 버튼 클릭
likeBtnElement.addEventListener('click', async () => {
    try {
        const postId = getQueryString('id');
        const newLikeCnt = await updateLikeCnt(postId);
        console.log("조아요 클릭!! ",newLikeCnt.data);
        setLikeCount(newLikeCnt.data);
    } catch(error) {
        console.error(error);
    }
})

const setBoardDetail = data => {
    // 헤드 정보
    const titleElement = document.querySelector('.title');
    const createdAtElement = document.querySelector('.createdAt');
    const imgElement = document.querySelector('.img');
    const nicknameElement = document.querySelector('.nickname');

    titleElement.textContent = data.post_title;
    const date = new Date(data.created_at);
    const formattedDate = `${date.getFullYear()}-${padTo2Digits(date.getMonth() + 1)}-${padTo2Digits(date.getDate())} ${padTo2Digits(date.getHours())}:${padTo2Digits(date.getMinutes())}:${padTo2Digits(date.getSeconds())}`;
    createdAtElement.textContent = formattedDate;
    imgElement.src =
        data.profileImage !== undefined
            ? `${getServerUrl()}${data.profileImage}`
            : `${getServerUrl()}${DEFAULT_PROFILE_IMAGE}`;

    nicknameElement.textContent = data.nickname;

    // 바디 정보
    const contentImgElement = document.querySelector('.contentImg');
    if (data.filePath) {
        console.log("data.filePath ",data.filePath);
        const img = document.createElement('img');
        img.src = getServerUrl() + data.filePath;
        contentImgElement.appendChild(img);
    }
    const contentElement = document.querySelector('.content');
    contentElement.textContent = data.post_content;

    // 조회수
    const viewCountElement = document.querySelector('.viewCount h3');
    // hits에 K, M 이 포함되어 있을 경우 그냥 출력
    // 포함되어 있지 않다면 + 1
    if (data.hits.includes('K') || data.hits.includes('M')) {
        viewCountElement.textContent = data.hits;
    } else {
        viewCountElement.textContent = (
            parseInt(data.hits, 10) + 1
        ).toLocaleString();
    }

    //댓글수
    const commentCountElement = document.querySelector('.commentCount h3');
    commentCountElement.textContent = data.comment_count.toLocaleString();

    setLikeCount(data.like);
};

// 채팅버튼 클릭
const chatBtn = document.querySelector('.chat_req');
const changeStatus = async(roomId) => {
    switch (chatBtn.innerHTML) {
        case 'chat⚡':
            const otherId = pageData.user_id;
            window.location.href = `chat-room.html?roomId=${roomId}&otherId=${otherId}`;
            break;
        case '📤':
            const result = await chatReq(myInfo.userId,pageData.user_id);
            chatBtn.innerHTML = '⛔';
            console.log("click~~~ ",result);
            break;
        case '⭕':
            const result2 = await chatReqApprove(roomId);
            chatBtn.innerHTML = 'chat⚡';
            console.log("result2 !!!! ",result2.ok);
            if(result2.ok)
                chatBtn.innerHTML = 'chat⚡';
            break;
    }
    
}
const setChatBtn = (data) => {
    console.log("data ~~~~ ",data);
    if(!data) {
        chatBtn.innerHTML = '📤';
            chatBtn.addEventListener('click', () => changeStatus(0));
            return;
    }
    switch (data.status) {
        case 'accepted':
            chatBtn.innerHTML = 'chat⚡';
            chatBtn.addEventListener('click', () => changeStatus(data.room_id));
            break;
        case 'declined':
            chatBtn.innerHTML = 'chat❌';
            chatBtn.disabled = true;
            break;
        case 'request':
            if (data.user1_id==myInfo.userId) {
                chatBtn.innerHTML = '⛔';
                chatBtn.disabled = true;
            } else {
                chatBtn.innerHTML = '⭕';
                chatBtn.disabled = false;
                chatBtn.addEventListener('click', async () => {
                    await changeStatus(data.room_id);
                });
            }
            break;
        default:

    }
}

// 사용자id==게시글id
const setBoardModify = async (data, myInfo) => {
    if (myInfo.idx === data.writerId) {
        const modifyElement = document.querySelector('.hidden');
        modifyElement.classList.remove('hidden');
        chatBtn.hidden = true;

        const modifyBtnElement = document.querySelector('#deleteBtn');
        const postId = getQueryString('id');
        modifyBtnElement.addEventListener('click', () => {
            Dialog(
                '게시글을 삭제하시겠습니까?',
                '삭제한 내용은 복구 할 수 없습니다.',
                async () => {
                    const response = await deletePost(postId);
                    if (response.ok) {
                        window.location.href = '/';
                    } else {
                        Dialog('삭제 실패', '게시글 삭제에 실패하였습니다.');
                    }
                },
            );
        });

        const modifyBtnElement2 = document.querySelector('#modifyBtn');
        modifyBtnElement2.addEventListener('click', () => {
            window.location.href = `/html/board-modify.html?post_id=${data.post_id}`;
        });
    }
};

const getBoardComment = async id => {
    const response = await getComments(id);
    if (!response.ok) return [];
    const data = await response.json();
    if (data.status != HTTP_OK) return [];
    return data.data;
};

const setBoardComment = (data, myInfo) => {
    const commentListElement = document.querySelector('.commentList');
    if (commentListElement) {
        data.map(event => {
            const item = CommentItem(
                event,
                myInfo.userId,
                event.post_id,
                event.comment_id,
            );
            commentListElement.appendChild(item);
        });
    }
};

// 댓글 등록
const addComment = async () => {
    const comment = document.querySelector('textarea').value;
    const pageId = getQueryString('id');
    console.log("comment,pageId : ",comment,pageId);
    const response = await writeComment(pageId, comment);

    if (response.ok) {
        window.location.reload();
    } else {
        Dialog('댓글 등록 실패', '댓글 등록에 실패하였습니다.');
    }
};

const inputComment = async () => {
    const textareaElement = document.querySelector(
        '.commentInputWrap textarea',
    );
    const commentBtnElement = document.querySelector('.commentInputBtn');

    if (textareaElement.value.length > MAX_COMMENT_LENGTH) {
        textareaElement.value = textareaElement.value.substring(
            0,
            MAX_COMMENT_LENGTH,
        );
    }
    if (textareaElement.value === '') {
        commentBtnElement.disabled = true;
        commentBtnElement.style.backgroundColor = '#ACA0EB';
    } else {
        commentBtnElement.disabled = false;
        commentBtnElement.style.backgroundColor = '#7F6AEE';
    }
};

const init = async () => {
    try {
        const myInfoResult = await authCheck();
        if (myInfoResult.status !== HTTP_OK) {
            throw new Error('사용자 정보를 불러오는데 실패하였습니다.');
        }

        myInfo = myInfoResult.data;
        const commentBtnElement = document.querySelector('.commentInputBtn');
        const textareaElement = document.querySelector(
            '.commentInputWrap textarea',
        );
        textareaElement.addEventListener('input', inputComment);
        commentBtnElement.addEventListener('click', addComment);
        commentBtnElement.disabled = true;

        const data = await authCheck();
        if (data.status === HTTP_NOT_AUTHORIZED) {
            window.location.href = '/html/login.html';
        }
        const profileImage =
            data.data.profileImagePath === undefined
                ? `${getServerUrl()}${DEFAULT_PROFILE_IMAGE}`
                : `${getServerUrl()}${data.data.profileImagePath}`;

        prependChild(document.body, Header('Community', 2, profileImage));

        const pageId = getQueryString('id');

        pageData = await getBoardDetail(pageId);
        if (parseInt(pageData.user_id, 10) === parseInt(myInfo.userId, 10)) {
            setBoardModify(pageData, myInfo);
        } else {
            const chatState = await getChatStatus(pageData.user_id,myInfo.userId);
            if (!chatState) {
                chatBtn.innerHTML = '????';
            } else {
                const data = await chatState.json();
                if(!data.data) {
                    setChatBtn(data.data);
                    console.log("정보 ::: ",data.data);
                } else {
                    setChatBtn(data.data[0]);
                    console.log("정보 ::: ",data.data[0]);
                }
            }
        } 
        setBoardDetail(pageData);
        getBoardComment(pageId).then(data => setBoardComment(data, myInfo));
    } catch (error) {
        console.error(error);
    }
};


init();