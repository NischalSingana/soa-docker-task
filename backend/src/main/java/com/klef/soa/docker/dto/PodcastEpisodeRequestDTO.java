package com.klef.soa.docker.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class PodcastEpisodeRequestDTO {

    @NotBlank(message = "Episode title cannot be blank")
    @Size(min = 2, max = 150, message = "Episode title must be between 2 and 150 characters")
    private String episodeTitle;

    @NotBlank(message = "Host name cannot be blank")
    @Size(min = 2, max = 100, message = "Host name must be between 2 and 100 characters")
    private String hostName;

    @NotNull(message = "Duration in minutes is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    @Max(value = 600, message = "Duration cannot exceed 600 minutes")
    private Integer durationMinutes;

    @NotBlank(message = "Release date cannot be blank")
    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "Release date must be in YYYY-MM-DD format")
    private String releaseDate;

    public PodcastEpisodeRequestDTO() {
    }

    public PodcastEpisodeRequestDTO(String episodeTitle, String hostName, Integer durationMinutes, String releaseDate) {
        this.episodeTitle = episodeTitle;
        this.hostName = hostName;
        this.durationMinutes = durationMinutes;
        this.releaseDate = releaseDate;
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
