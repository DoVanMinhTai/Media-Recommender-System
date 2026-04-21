package nlu.fit.movie_backend.controller;

import lombok.AllArgsConstructor;
import nlu.fit.movie_backend.service.AdminService;
import nlu.fit.movie_backend.service.MovieService;
import nlu.fit.movie_backend.service.UserService;
import nlu.fit.movie_backend.viewmodel.admin.AdminStatsResponse;
import nlu.fit.movie_backend.viewmodel.admin.AiStatusResponse;
import nlu.fit.movie_backend.viewmodel.admin.UserResponse;
import nlu.fit.movie_backend.viewmodel.movie.MoviePostVm;
import nlu.fit.movie_backend.viewmodel.movie.MoviePutVm;
import nlu.fit.movie_backend.viewmodel.movie.MovieThumbnailGetVm;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@AllArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class AdminController {
    private final MovieService movieService;
    private final UserService userService;
    private final AdminService adminService;

    @GetMapping("/statistics")
    public ResponseEntity<AdminStatsResponse> getStatistics() {
        return ResponseEntity.ok(adminService.getStatistics());
    }

    @GetMapping("/movie/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @DeleteMapping("/movie/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.deleteUser(id));
    }

    @GetMapping("/movie/movies")
    public ResponseEntity<List<MovieThumbnailGetVm>> getAllMoviesForAdmin() {
        return ResponseEntity.ok(movieService.getAllMovies());
    }

    @PostMapping("/movie/addMovie")
    public ResponseEntity<?> addMovie(@RequestBody @Validated MoviePostVm movieRequest, @RequestHeader("X-Admin-Password") String adminPassword) {
        if (!"admin123".equals(adminPassword)) {
            return ResponseEntity.status(403).body("Mật khẩu Admin không chính xác!");
        }
        return ResponseEntity.ok(movieService.addMovie(movieRequest));
    }

    @PutMapping("/movie/putMovie")
    public ResponseEntity<?> updateMovie(@RequestBody @Validated MoviePutVm request, @RequestHeader("X-Admin-Password") String adminPassword) {
        if (!"admin123".equals(adminPassword)) {
            return ResponseEntity.status(403).body("Mật khẩu Admin không chính xác!");
        }
        return ResponseEntity.ok(movieService.putMovie(request));
    }

    @DeleteMapping("/movie/{id}")
    public ResponseEntity<?> deleteMovie(@PathVariable Long id, @RequestHeader("X-Admin-Password") String adminPassword) {
        if (!"admin123".equals(adminPassword)) {
            return ResponseEntity.status(403).body("Mật khẩu Admin không chính xác!");
        }
        movieService.deleteMovie(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/ai-status")
    public ResponseEntity<AiStatusResponse> getAiStatus() {
        return ResponseEntity.ok(adminService.getAiStatus());
    }

    @PostMapping("/retrain-ai")
    public ResponseEntity<Map<String, String>> retrainAi() {
        return ResponseEntity.ok(adminService.triggerRetrain());
    }

    @PostMapping("/update-recommendations")
    public ResponseEntity<String> updateRecommendation() {
        return ResponseEntity.ok(adminService.updateRecommendation());
    }
}
