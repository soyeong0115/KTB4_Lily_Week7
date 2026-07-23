const AVATAR_COLOR_VARS = ['--tag-yellow', '--tag-pink', '--tag-mint', '--tag-blue', '--tag-lilac'];

// userId 기준으로 항상 같은 색을 반환 (사람마다 고정된 색상)
export function getAvatarColor(userId) {
    return `var(${AVATAR_COLOR_VARS[userId % AVATAR_COLOR_VARS.length]})`;
}
