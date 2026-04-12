import { API_ENDPOINTS } from "../../../constants/ApiEndpoints";

export async function submitOnBoarding({ preferences }: { preferences: number[] }) {
    const response = await fetch(API_ENDPOINTS.ONBOARDING.POST, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ preferences })
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Lỗi server: ${response.status}`);
    }
    return response.json();
}