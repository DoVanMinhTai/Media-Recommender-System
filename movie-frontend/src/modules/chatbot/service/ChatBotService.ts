import { API_ENDPOINTS } from "../../../constants/ApiEndpoints";
import type { ChatPostVm } from "../model/ChatPostVm";

export async function sendMessage(chatPostVm: ChatPostVm) {
    console.log("Sending message:", chatPostVm);
    const response = await fetch(API_ENDPOINTS.CHATBOT.MESSAGE, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(chatPostVm),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Lỗi server: ${response.status}`);
    }
    
    return response;
}