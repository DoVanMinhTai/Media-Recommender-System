package nlu.fit.movie_backend.controller;

import lombok.AllArgsConstructor;
import nlu.fit.movie_backend.service.ChatbotService;
import nlu.fit.movie_backend.viewmodel.chatbot.ChatPostVm;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/chatbot")
@AllArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class ChatBotController {
    private final ChatbotService chatbotService;

    @PostMapping("/message")
    public ResponseEntity<String> sendMessage(@RequestBody ChatPostVm chatPostVm) {
        try {
            String jsonResponse = chatbotService.sendMessage(chatPostVm);
            return ResponseEntity.ok(jsonResponse);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"status\": \"error\", \"message\": \"Đã có lỗi xảy ra: " + e.getMessage() + "\"}");
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getMessages(@RequestParam Long userId) {
        return ResponseEntity.ok(chatbotService.getMessages(userId));
    }
}
