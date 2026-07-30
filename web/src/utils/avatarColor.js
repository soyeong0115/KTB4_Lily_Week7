// 기존 js/avatar.js 포팅 — userId 기준 고정 색상 계산
const AVATAR_COLOR_VARS = ['--tag-yellow', '--tag-pink', '--tag-mint', '--tag-blue', '--tag-lilac'];

export function getAvatarColor(userId) {
    return `var(${AVATAR_COLOR_VARS[userId % AVATAR_COLOR_VARS.length]})`;
}
