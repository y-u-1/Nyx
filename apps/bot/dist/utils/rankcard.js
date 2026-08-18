import { createCanvas, loadImage } from "@napi-rs/canvas";
const BG = "#0b0b0e";
const ACCENT = "#efe8d8";
const TRACK = "#242429";
const TEXT_MUTED = "#8a8a8f";
function roundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}
function drawProgressBar(ctx, x, y, w, h, progress) {
    roundedRect(ctx, x, y, w, h, h / 2);
    ctx.fillStyle = TRACK;
    ctx.fill();
    const fillWidth = Math.max(h, w * Math.min(1, Math.max(0, progress)));
    roundedRect(ctx, x, y, fillWidth, h, h / 2);
    ctx.fillStyle = ACCENT;
    ctx.fill();
}
async function drawAvatarCircle(ctx, avatarUrl, cx, cy, radius) {
    try {
        const image = await loadImage(avatarUrl);
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(image, cx - radius, cy - radius, radius * 2, radius * 2);
        ctx.restore();
    }
    catch {
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = TRACK;
        ctx.fill();
    }
}
/** /rank 繧ｳ繝槭Φ繝臥畑縺ｮ繝ｩ繝ｳ繧ｯ繧ｫ繝ｼ繝臥判蜒上ｒ逕滓・縺吶ｋ */
export async function generateRankCard({ username, avatarUrl, level, currentLevelXp, xpForNextLevel, rank }) {
    const width = 800;
    const height = 260;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
    roundedRect(ctx, 0, 0, width, height, 28);
    ctx.fillStyle = BG;
    ctx.fill();
    ctx.save();
    roundedRect(ctx, 0, 0, width, height, 28);
    ctx.clip();
    const avatarRadius = 64;
    const avatarCx = 110;
    const avatarCy = height / 2;
    await drawAvatarCircle(ctx, avatarUrl, avatarCx, avatarCy, avatarRadius);
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(avatarCx, avatarCy, avatarRadius + 4, 0, Math.PI * 2);
    ctx.stroke();
    const textX = 210;
    ctx.fillStyle = "#f5f2ea";
    ctx.font = "bold 34px sans-serif";
    ctx.fillText(username, textX, 92);
    ctx.fillStyle = TEXT_MUTED;
    ctx.font = "22px sans-serif";
    ctx.fillText(`Level ${level}  窶｢  Rank #${rank}  窶｢  ${currentLevelXp} / ${xpForNextLevel} XP`, textX, 128);
    drawProgressBar(ctx, textX, 160, width - textX - 60, 18, currentLevelXp / xpForNextLevel);
    ctx.restore();
    return canvas.toBuffer("image/png");
}
/** /leaderboard 繧ｳ繝槭Φ繝臥畑縺ｮ鬆・ｽ堺ｻ倥″繧ｹ繧ｿ繝・け繝ｪ繧ｹ繝育判蜒上ｒ逕滓・縺吶ｋ */
export async function generateLeaderboardCard(entries) {
    const width = 760;
    const rowHeight = 92;
    const rowGap = 12;
    const padding = 20;
    const height = padding * 2 + entries.length * rowHeight + (entries.length - 1) * rowGap;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, width, height);
    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const y = padding + i * (rowHeight + rowGap);
        roundedRect(ctx, padding, y, width - padding * 2, rowHeight, 16);
        ctx.fillStyle = "#141418";
        ctx.fill();
        const avatarRadius = rowHeight / 2 - 14;
        const avatarCx = padding + 16 + avatarRadius;
        const avatarCy = y + rowHeight / 2;
        await drawAvatarCircle(ctx, entry.avatarUrl, avatarCx, avatarCy, avatarRadius);
        const textX = avatarCx + avatarRadius + 24;
        ctx.fillStyle = i === 0 ? "#f4d35e" : i < 3 ? ACCENT : "#f5f2ea";
        ctx.font = "bold 24px sans-serif";
        ctx.fillText(`#${i + 1}`, textX, y + 34);
        const rankWidth = ctx.measureText(`#${i + 1}`).width;
        ctx.fillStyle = "#f5f2ea";
        ctx.font = "22px sans-serif";
        ctx.fillText(`${entry.username}  窶｢  LVL ${entry.level}`, textX + rankWidth + 16, y + 34);
        const barWidth = width - textX - padding - 16;
        drawProgressBar(ctx, textX, y + 52, barWidth, 12, entry.currentLevelXp / entry.xpForNextLevel);
    }
    return canvas.toBuffer("image/png");
}
/** 繝ｬ繝吶Ν繧｢繝・・譎ゅ↓豺ｻ莉倥☆繧句ｰ上＆縺ｪ騾夂衍繝舌ャ繧ｸ逕ｻ蜒上ｒ逕滓・縺吶ｋ */
export async function generateLevelUpImage(oldLevel, newLevel) {
    const width = 420;
    const height = 140;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
    roundedRect(ctx, 0, 0, width, height, 24);
    ctx.fillStyle = "#141418";
    ctx.fill();
    ctx.save();
    roundedRect(ctx, 0, 0, width, height, 24);
    ctx.clip();
    ctx.fillStyle = ACCENT;
    ctx.beginPath();
    ctx.moveTo(width, 0);
    ctx.lineTo(width, height);
    ctx.lineTo(width - 90, height);
    ctx.lineTo(width - 30, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = "#f5f2ea";
    ctx.font = "bold 30px sans-serif";
    ctx.fillText("Level Up!", 32, 58);
    ctx.fillStyle = ACCENT;
    ctx.font = "bold 26px sans-serif";
    ctx.fillText(`${oldLevel}  竊・ ${newLevel}`, 32, 100);
    return canvas.toBuffer("image/png");
}
//# sourceMappingURL=rankcard.js.map