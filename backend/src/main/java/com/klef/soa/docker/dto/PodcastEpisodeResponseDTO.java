package com.klef.soa.docker.dto;

import com.klef.soa.docker.entity.PodcastEpisode;

public class PodcastEpisodeResponseDTO {

    private Long id;
    private String episodeTitle;
    private String hostName;
    private Integer durationMinutes;
    private String releaseDate;

    public PodcastEpisodeResponseDTO() {
    }

    public PodcastEpisodeResponseDTO(Long id, String episodeTitle, String hostName, Integer durationMinutes, String releaseDate) {
        this.id = id;
        this.episodeTitle = episodeTitle;
        this.hostName = hostName;
        this.durationMinutes = durationMinutes;
        this.releaseDate = releaseDate;
    }

    public static PodcastEpisodeResponseDTO fromEntity(PodcastEpisode episode) {
        return new PodcastEpisodeResponseDTO(
                episode.getId(),
                episode.getEpisodeTitle(),
                episode.getHostName(),
                episode.getDurationMinutes(),
                episode.getReleaseDate()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEpisodeTitle() {
        return episodeTitle;
    }

    public void setEpisodeTitle(String episodeTitle) {
        this.episodeTitle = episodeTitle;
    }

    public String getHostName() {
        return hostName;
    }

    public void setHostName(String hostName) {
        this.hostName = hostName;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public String getReleaseDate() {
        return releaseDate;
    }

    public void setReleaseDate(String releaseDate) {
        this.releaseDate = releaseDate;
    }
}
