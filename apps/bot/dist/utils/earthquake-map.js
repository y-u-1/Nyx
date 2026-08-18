import { createCanvas } from "@napi-rs/canvas";
import { scaleToColor } from "./earthquake-scale.js";
// 日本全体をおおよそ収める緯度経度の範囲(投影の基準)
const JAPAN_BOUNDS = { minLat: 24, maxLat: 46, minLng: 122, maxLng: 146 };
function project(lat, lng, bounds, width, height) {
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * width;
    const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * height;
    return { x, y };
}
/**
 * 震央・観測点をプロットした簡易マップを生成する。
 * 実際の海岸線データ(GeoJSON)は同梱していないため、現状は緯度経度の点プロットのみ。
 * Cookie Lyrixで使っていたGeoJSON資産があれば、境界線描画に差し替え可能。
 */
export async function generateEarthquakeMap({ epicenter, points }) {
    const width = 800;
    const height = 800;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#0b0b0e";
    ctx.fillRect(0, 0, width, height);
    // 観測点+震央を含むバウンディングボックスを計算し、余白を付けてズームする
    const allLats = [epicenter.lat, ...points.map((p) => p.lat)];
    const allLngs = [epicenter.lng, ...points.map((p) => p.lng)];
    const padding = 1.5; // 度単位の余白
    const bounds = {
        minLat: Math.max(JAPAN_BOUNDS.minLat, Math.min(...allLats) - padding),
        maxLat: Math.min(JAPAN_BOUNDS.maxLat, Math.max(...allLats) + padding),
        minLng: Math.max(JAPAN_BOUNDS.minLng, Math.min(...allLngs) - padding),
        maxLng: Math.min(JAPAN_BOUNDS.maxLng, Math.max(...allLngs) + padding),
    };
    // 縦横比を保つため、狭い方を広げて正方形に近づける
    const latSpan = bounds.maxLat - bounds.minLat;
    const lngSpan = bounds.maxLng - bounds.minLng;
    if (latSpan > lngSpan) {
        const diff = (latSpan - lngSpan) / 2;
        bounds.minLng -= diff;
        bounds.maxLng += diff;
    }
    else {
        const diff = (lngSpan - latSpan) / 2;
        bounds.minLat -= diff;
        bounds.maxLat += diff;
    }
    // 観測点(震度で色分けした円)
    for (const point of points) {
        const { x, y } = project(point.lat, point.lng, bounds, width, height);
        const color = scaleToColor(point.scale ?? -1);
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "#efe8d8";
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }
    // 震央(星マーク)
    const epicenterPos = project(epicenter.lat, epicenter.lng, bounds, width, height);
    drawStar(ctx, epicenterPos.x, epicenterPos.y, 18, 8, "#efe8d8");
    return canvas.toBuffer("image/png");
}
function drawStar(ctx, cx, cy, outerRadius, points, color) {
    const innerRadius = outerRadius / 2.2;
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (Math.PI / points) * i - Math.PI / 2;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        if (i === 0)
            ctx.moveTo(x, y);
        else
            ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "#0b0b0e";
    ctx.lineWidth = 2;
    ctx.stroke();
}
//# sourceMappingURL=earthquake-map.js.map