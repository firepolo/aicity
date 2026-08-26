export const randomString = (length: number) => Array.from({ length }).map(_ => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_"[(Math.random() * 64) | 0]).join("");
