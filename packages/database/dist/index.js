"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const index_js_1 = require("../generated/client/index.js");
const adapter_neon_1 = require("@prisma/adapter-neon");
const serverless_1 = require("@neondatabase/serverless");
const ws_1 = __importDefault(require("ws"));
// NeonのサーバーレスドライバーはブラウザのWebSocket APIを前提にしているため、
// Node.js環境ではwsパッケージをポリフィルとして渡す必要がある。
serverless_1.neonConfig.webSocketConstructor = ws_1.default;
const globalForPrisma = globalThis;
// ネイティブのPrismaクエリエンジン(数十MB規模のバイナリ)を使わず、
// NeonのHTTP/WebSocketベースのドライバー経由でクエリを実行する。
// 無料ホストのようにディスク/メモリが極端に少ない環境でも動かせるようにするための構成。
const connectionString = process.env.DATABASE_URL;
const pool = new serverless_1.Pool({ connectionString });
const adapter = new adapter_neon_1.PrismaNeon(pool);
exports.prisma = globalForPrisma.prisma ??
    new index_js_1.PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = exports.prisma;
}
__exportStar(require("../generated/client/index.js"), exports);
//# sourceMappingURL=index.js.map