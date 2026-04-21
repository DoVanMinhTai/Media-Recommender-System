package nlu.fit.movie_backend.repository.jpa;

import nlu.fit.movie_backend.model.WatchHistory;
import nlu.fit.movie_backend.repository.jpa.MediaContentRepository;
import nlu.fit.movie_backend.repository.jpa.UserRepository;
import nlu.fit.movie_backend.repository.jpa.WatchHistoryRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WatchHistoryRepository extends JpaRepository<WatchHistory,Long> {

    boolean existsByUserIdAndMediaContentId(Long userId, Long mediaContentId);

    Optional<WatchHistory> findByUserIdAndMediaContentId(Long userId, Long mediaContentId);
}
