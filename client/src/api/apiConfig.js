export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    ENDPOINTS: {
        AUTH: {
            LOGIN: "/auth/login",
            LOGOUT: "/auth/logout",
            SESSION: "/auth/session",
        },
        ADMIN: {
            DASHBOARD: "/admin/dashboard",
            COURTS: "/admin/courts",
            OFFICERS: "/admin/officers",
            READERS: "/admin/readers",
            CREATE_USER: "/admin/user",
            CREATE_COURT: "/admin/court",
            DELETE_USER: "/admin/users",
            DELETE_COURT: "/admin/courts",
            REQUESTS: "/admin/requests",
        },
        READER: {
            COURTS: "/reader/courts",
            REQUESTS: "/reader/requests",
            OFFICERS: "/reader/officers",
            REQUEST_DETAILS: "/reader/requests",
            SEND_FOR_SIGNATURE: "/reader/requests",
            DELETE_REQUEST: "/reader/requests",
            REQUEST_PDF: "/reader/requests",
        },
        OFFICER: {
            REQUESTS: "/officer/requests",
            REQUEST_PDF: "/officer/requests",
            REJECT: "/officer/requests",
            SIGN: "/officer/requests",
        },
        PUBLIC: {
            REQUEST: "/requests",
            REQUEST_PDF: "/requests",
        },
    }
}
