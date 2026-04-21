package nlu.fit.movie_backend.service;

import lombok.RequiredArgsConstructor;
import nlu.fit.movie_backend.config.ServiceUrlConfig;
import nlu.fit.movie_backend.model.User;
import nlu.fit.movie_backend.repository.jpa.*;
import nlu.fit.movie_backend.viewmodel.admin.*;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final MediaContentRepository mediaContentRepository;
    private final UserRepository userRepository;
    private final RateRepository rateRepository;
    private final ModelRegistryRepository modelRegistryRepository;
    private final TrainingJobRepository trainingJobRepository;
    private final WatchHistoryRepository watchHistoryRepository;
    private final RecommendationService recommendationService;
    private final RestClient restClient;
    private final ServiceUrlConfig serviceUrlConfig;

    public AdminStatsResponse getStatistics() {
        long totalUsers = userRepository.count();
        long totalMedia = mediaContentRepository.count();
        long totalRatings = rateRepository.count();
        long viewsToday = watchHistoryRepository.count();

        List<MovieResponse> recentMovies = mediaContentRepository.findTop5ByOrderByIdDesc()
                .stream()
                .map(m -> new MovieResponse(m.getId(), m.getTitle(), m.getReleaseDate().getYear()))
                .toList();
        return new AdminStatsResponse(
                totalUsers,
                totalMedia,
                totalRatings,
                viewsToday,
                recentMovies
        );
    }

    public List<UserResponse> getAllUsers() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<User> users = userRepository.findAll(pageable);
        return users.stream().map(user -> new UserResponse(user.getId(), user.getEmail(), user.getEmail())).toList();
    }

    public AiStatusResponse getAiStatus() {
        var activeModelOpt = modelRegistryRepository.findByIsActiveTrue();
        ActiveModelDto activeModel = activeModelOpt.map(m -> new ActiveModelDto(
                m.getModelName(), m.getVersion(), m.getRmse(),
                m.getMae(), m.getF1Score(), m.getModelPath()
        )).orElse(null);

        List<JobLogDto> recentJobs = trainingJobRepository.findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(j -> new JobLogDto(j.getId(), j.getJobStatus(),
                        j.getCreatedAt() != null ? j.getCreatedAt().toString() : "",
                        j.getErrorMessage(), j.getContentBasedTime(),j.getCollaboratingTime()))
                .toList();

        JobLogDto currentJob = recentJobs.stream()
                .filter(j -> "PENDING".equals(j.status()))
                .findFirst()
                .orElse(null);

        return new AiStatusResponse(activeModel, recentJobs, currentJob);
    }

    public Map<String, String> triggerRetrain() {
        try {
            Map<String, Object> response = restClient.post()
                    .uri(serviceUrlConfig.recommendation() + "/retrainingmodel")
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (request, res) -> {
                        throw new RuntimeException("FastAPI Error: " + res.getStatusCode());
                    })
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});

            if (response != null && response.containsKey("job_id")) {
                return Map.of(
                        "job_id", response.get("job_id").toString(),
                        "status", "started"
                );
            }
            throw new RuntimeException("Không nhận được Job ID từ AI Service");

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi gọi AI Service: " + e.getMessage());
        }
    }

    public String updateRecommendation() {
        return recommendationService.updateRecommendations();
    }
}
