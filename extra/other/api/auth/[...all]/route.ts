import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler({
    baseURL: "http://localhost:7000"
});
