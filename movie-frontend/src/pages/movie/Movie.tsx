import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getMovieDetailById, getMovieSimilarById } from "../../modules/moviedetail/services/MovieService";
import type { Movie } from "../../modules/moviedetail/model/MovieVm";
import { MovieHero } from "../../modules/moviedetail/components/MovieHero";
import { MovieInfo } from "../../modules/moviedetail/components/MovieInfo";
import { EpisodesSelector } from "../../modules/moviedetail/components/EpisodesSelector";
import { SimilarMovies } from "../../modules/moviedetail/components/SimilarMovies";
import VideoOverlay from "../../modules/moviedetail/components/VideoOverlay";
import type { MovieThumbnailVm } from "../../modules/moviedetail/model/MovieThumbnailVm";
import type { PageAbleResponse } from "../../common/services/ApiClientService";
import { RatingSection } from "../../modules/moviedetail/components/RatingSection";

export default function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const [movieDetail, setMovieDetail] = useState<Movie | null>(null);
  const [similarMovies, setSimilarMovies] = useState<MovieThumbnailVm[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      getMovieDetailById(Number(id)).then((data: PageAbleResponse) => {
        if (data && data.content && data.content.length > 0) {
          const movieData = data.content[0].movieDetailVm;
          setMovieDetail(movieData);
        }
      });

      getMovieSimilarById(Number(id)).then((data) => {
        setSimilarMovies(data);
      });
    }
  }, [id]);

  function handlePlay() {
    setIsPlaying(true);
  }
  return (<>
    {/*
    MovieHero: banner, trailer or backdrop, addtolist, mute/unmute 
    MovieInfo: title, year, duration, genres, description, cast, director, rating
    EpisodesSelector: if TV show, list of episodes to select
    SimilarMovies: list of similar movies
    VideoOverlay: video player overlay
    */}
    <MovieHero movie={movieDetail} onPlayClick={() => handlePlay()} />
    <MovieInfo movie={movieDetail} />
    {
      movieDetail && movieDetail.seasons && (
        <EpisodesSelector movie={movieDetail} />
      )
    }
    {movieDetail?.id &&
        < RatingSection mediaId={movieDetail?.id} />
  }
    <SimilarMovies similarMovies={similarMovies} />
    {isPlaying && <VideoOverlay movie={movieDetail} episode={undefined} onClose={function (): void {
      throw new Error("Function not implemented.");
    }} />}
  </>);
}