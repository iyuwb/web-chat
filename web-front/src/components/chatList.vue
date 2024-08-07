<template>
    <div class="chat-list">
        <div :class="item.userName === userName ? 'right' : 'left'" v-for="item in chatList" :key="item.id">
            <div class="item-card">
                <span class="user-time" v-if="item.userName === userName">
                    <span class="chat-time">{{ item.time }}</span>
                    <span class="user-name">{{ item.userName }}</span>
                </span>
                <span v-else class="user-time">
                    <span class="user-name">{{ item.userName }}</span>
                    <span class="chat-time">{{ item.time }}</span>
                </span>
                <div v-if="item.type === 'message'" class="text">
                    {{ item.data }}
                </div>
                <div v-else-if="item.type === 'image'" class="image">
                    <img @click="toggleFullScreen(item.data)" :src="item.data" alt="图片" />
                </div>
            </div>
        </div>
        <div ref="targetElement"></div>
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref, nextTick } from 'vue';
defineProps(['chatList', 'userName', 'roomId'])


const targetElement = ref();
onMounted(() => {
    scrollIntoView()
})
async function scrollIntoView() {
    await nextTick();
    targetElement.value.scrollIntoView({ behavior: 'instant', block: 'end' });
}
defineExpose({ scrollIntoView })

// 全屏图片
import { useFullScreenImage } from '@/hooks/useFullScreenImage';
const { toggleFullScreen } = useFullScreenImage();
</script>
<style scoped>
.chat-list {
    height: calc(100% - 200px);
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.chat-list::-webkit-scrollbar {
    width: 5px;
    height: 5px;
}

.chat-list::-webkit-scrollbar-thumb {
    background-color: #57969080;
}

.user-name,
.chat-time {
    font-size: 12px;
    padding: 6px;
    color: #fff;
}

.left,
.right {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0px;
    border-radius: 10px;
    max-width: 70%;
}

.chat-list .left {
    align-self: flex-start;
}

.chat-list .text {
    margin: 6px;
    padding: 6px 12px;
    border-radius: 6px;
    line-height: 32px;
    color: #666;
    background-color: #fff;
    text-align: left;
    width: fit-content;
    display: inline-block;
}

.chat-list .right {
    align-self: flex-end;
    flex-direction: row-reverse;
}

.right .item-card {
    text-align: right;
}

.right .user-time,
.left .user-time {
    display: block;
}

.chat-list .image {
    min-width: 40%;
    overflow: hidden;
    margin: 6px;
    border-radius: 6px;
    text-align: left;
    display: inline-block;
}

.chat-list .image img {
    display: block;
    object-fit: contain;
    width: 100%;
    height: 100%;
    background-color: #ccc;
}
</style>
