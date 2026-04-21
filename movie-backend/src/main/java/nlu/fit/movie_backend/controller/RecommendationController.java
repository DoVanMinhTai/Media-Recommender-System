package nlu.fit.movie_backend.controller;

import lombok.AllArgsConstructor;
import nlu.fit.movie_backend.service.RecommendationService;
import nlu.fit.movie_backend.viewmodel.movie.MovieThumbnailGetVm;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/recommendation")
@AllArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class RecommendationController {
    private final RecommendationService recommendationService;

    @PostMapping("/update")
    public ResponseEntity<?> updateRecommendations() {
        try {
            new ProcessBuilder("python", "scripts/cf_precompute.py")
                .directory(new java.io.File("F:/project_SW/Media-Recommender-System/movie-recommendation"))
                .start();

            new ProcessBuilder("python", "scripts/sync_postgres_to_es.py")
                .directory(new java.io.File("F:/project_SW/Media-Recommender-System/movie-recommendation"))
                .start();
                
            return ResponseEntity.ok(Map.of("message", "Data synchronization and AI training started in background."));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to start synchronization: " + e.getMessage());
        }
    }

    @GetMapping("/cf/user/{userId}")
    public ResponseEntity<List<MovieThumbnailGetVm>> getCollaborativeFiltering(@PathVariable Long userId, @RequestParam(defaultValue = "10") int limit) {
        System.out.println(recommendationService.getCollaborativeFiltering(userId,limit));
        return ResponseEntity.ok(recommendationService.getCollaborativeFiltering(userId, limit));
    }

    @GetMapping("/cf/similar/{movieId}")
    public ResponseEntity<List<MovieThumbnailGetVm>> getSimilarMoviesCF(@PathVariable Long movieId, @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(recommendationService.getSimilarMoviesCF(movieId, limit));
    }

    @GetMapping("/cbf/search")
    public ResponseEntity<List<MovieThumbnailGetVm>> searchCBF(@RequestParam String query, @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(recommendationService.searchMoviesCBF(query, limit));
    }

    @GetMapping("/cbf/similar/{movieId}")
    public ResponseEntity<List<MovieThumbnailGetVm>> getSimilarCBF(@PathVariable Long movieId, @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(recommendationService.getSimilarMoviesCBF(movieId, limit));
    }

    @GetMapping("/cbf/trending")
    public ResponseEntity<List<MovieThumbnailGetVm>> getTrendingCBF(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(recommendationService.getTrendingCBF(limit));
    }
}
