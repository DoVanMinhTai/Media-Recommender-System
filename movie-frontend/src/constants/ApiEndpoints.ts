const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const API_ENDPOINTS = {
    ADMIN: {
        DASHBOARD: `${BASE_URL}/admin/statistics`,
        AI_STATUS: `${BASE_URL}/admin/ai-status`,
        RETRAIN_AI: `${BASE_URL}/admin/retrain-ai`,
        UPDATE_RECOMMENDATIONS: `${BASE_URL}/admin/update-recommendations`,
    },
    AUTH: {
        REGISTER: `${BASE_URL}/auth/register`,
        LOGIN: `${BASE_URL}/auth/login`,
        EXIST_EMAIL: `${BASE_URL}/auth/exist-email`,
        GET_PROFILE: `${BASE_URL}/auth/profile`,
    },
    CATEGORY: {
        GET_ALL: `${BASE_URL}/category/genres`,
    },
    CHATBOT: {
        MESSAGE: `${BASE_URL}/chatbot/message`,
    },
    HOMEPAGE: {
        TRENDING: `${BASE_URL}/movie/movies/trending?limit=10`,
        HERO_MOVIE: `${BASE_URL}/movie/movies/hero`,
        PREFERRED_GENRES: `${BASE_URL}/movie/movies/preferredGenres?limit=10`,
        TOP10: `${BASE_URL}/movie/movies/top10`,
    },
    MOVIE: {
        GENRES: `${BASE_URL}/movie/movies/genres`,
        FILTER: `${BASE_URL}/movie/movies/`,
    },
    MEDIA_CONTENT: {
        GET_BY_ID: (movieId: number) => `${BASE_URL}/mediacontent/${movieId}`,
    },
    USER: {
        CAN_RATE: (movieId: number) => `${BASE_URL}/user/api/checkWatchHistory/${movieId}`,
        RATING: (movieId: number) => `${BASE_URL}/user/api/rating/${movieId}`,
        RATE: `${BASE_URL}/user/api/rateMovie`,
        WATCH: `${BASE_URL}/user/api/watch`,
        GET_FAVORITES: `${BASE_URL}/user/api/getAllFavorites`,
        ADD_FAVORITE: `${BASE_URL}/user/api/favorites/add`,
        REMOVE_FAVORITE: (movieId: number) => `${BASE_URL}/user/api/favorites/${movieId}`,
    },
    SEARCH: {
        SUGGEST: `${BASE_URL}/search/suggest`,
        ALL: `${BASE_URL}/search/all`,
    },
    ONBOARDING: {
        POST: `${BASE_URL}/user/onboarding`,
    },
    RECOMMENDATION: {
        CF: {
            USER: (userId: number) => `${BASE_URL}/recommendation/cf/user/${userId}`,
            SIMILAR: (movieId: number) => `${BASE_URL}/recommendation/cf/similar/${movieId}`,
        },
        CBF: {
            SEARCH: `${BASE_URL}/recommendation/cbf/search`,
            SIMILAR: (movieId: number) => `${BASE_URL}/recommendation/cbf/similar/${movieId}`,
            TRENDING: `${BASE_URL}/recommendation/cbf/trending`,
        }
    }
} as const;
