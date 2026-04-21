package nlu.fit.movie_backend.service;

import lombok.AllArgsConstructor;
import nlu.fit.movie_backend.config.ServiceUrlConfig;
import nlu.fit.movie_backend.repository.jpa.ItemSimilarityRepository;
import nlu.fit.movie_backend.repository.jpa.MovieRepository;
import nlu.fit.movie_backend.viewmodel.movie.MovieThumbnailGetVm;

import nlu.fit.movie_backend.viewmodel.recommendation.MovieSimilarCBFResponse;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Limit;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class RecommendationService {
    private final ServiceUrlConfig serviceUrlConfig;
    private final RestClient restClient;
    private final MovieRepository movieRepository;
    private final ItemSimilarityRepository itemSimilarityRepository;

    public List<MovieThumbnailGetVm> getCollaborativeFiltering(Long userId, int limit) {
        return itemSimilarityRepository.findPersonalizedCFPrecomputed(userId, limit).stream()
                .map(item -> new MovieThumbnailGetVm(item.getId(), item.getTitle(), item.getBackdropPath()))
                .collect(Collectors.toList());
    }

    public List<MovieThumbnailGetVm> getSimilarMoviesCF(Long movieId, int limit) {
        return itemSimilarityRepository.findSimilarMoviesPrecomputed(movieId, limit).stream()
                .map(item -> new MovieThumbnailGetVm(item.getId(), item.getTitle(), item.getBackdropPath()))
                .collect(Collectors.toList());
    }

    public String updateRecommendations() {
        try {
            ProcessBuilder processBuilder = new ProcessBuilder("python", "scripts/cf_precompute.py");
            processBuilder.directory(new java.io.File("F:/project_SW/Media-Recommender-System/movie-recommendation"));
            processBuilder.start();
            return "Pre-computation started in background.";
        } catch (Exception e) {
            return "Failed to start pre-computation: " + e.getMessage();
        }
    }

    public List<MovieThumbnailGetVm> searchMoviesCBF(String query, int topN) {
        final URI url = UriComponentsBuilder.fromHttpUrl(serviceUrlConfig.recommendation())
                .path("/api/v1/cbf/search")
                .queryParam("query", query)
                .queryParam("top_n", topN)
                .build().toUri();
        return restClient.get().uri(url).retrieve().body(new ParameterizedTypeReference<List<MovieThumbnailGetVm>>() {
        });
    }

    public List<MovieThumbnailGetVm> getSimilarMoviesCBF(Long movieId, int topN) {
        final URI url = UriComponentsBuilder.fromHttpUrl(serviceUrlConfig.recommendation())
                .path("/api/v1/cbf/similar/{movieId}")
                .queryParam("top_n", topN)
                .buildAndExpand(movieId).toUri();

        MovieSimilarCBFResponse response = restClient.get().uri(url).retrieve().body(MovieSimilarCBFResponse.class);

        if (response != null && response.recommendations() != null) {
            List<Long> ids = response.recommendations().stream()
                    .map(item -> Long.parseLong(item.movie_id()))
                    .toList();
            return movieRepository.findAllByIdIn(ids, Limit.of(topN)).stream()
                    .map(m -> new MovieThumbnailGetVm(m.getId(), m.getTitle(), m.getBackdropPath()))
                    .toList();
        }
        return new ArrayList<>();
    }

    public List<MovieThumbnailGetVm> getTrendingCBF(int topN) {
        final URI url = UriComponentsBuilder.fromHttpUrl(serviceUrlConfig.recommendation())
                .path("/api/v1/cbf/trending")
                .queryParam("top_n", topN)
                .build().toUri();
        return restClient.get().uri(url).retrieve().body(new ParameterizedTypeReference<List<MovieThumbnailGetVm>>() {});
    }
}
