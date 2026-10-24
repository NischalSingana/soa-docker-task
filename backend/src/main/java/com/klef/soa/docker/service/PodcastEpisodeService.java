package com.klef.soa.docker.service;

import java.util.List;

import com.klef.soa.docker.dto.PodcastEpisodeRequestDTO;
import com.klef.soa.docker.dto.PodcastEpisodeResponseDTO;
import com.klef.soa.docker.entity.PodcastEpisode;

public interface PodcastEpisodeService {

    PodcastEpisodeResponseDTO addEpisode(PodcastEpisodeRequestDTO request);

    PodcastEpisode addEpisodeEntity(PodcastEpisode episode);

    List<PodcastEpisodeResponseDTO> displayAllEpisodes();

    boolean deleteEpisode(Long id);

    PodcastEpisodeResponseDTO getEpisodeById(Long id);

    PodcastEpisodeResponseDTO updateEpisode(Long id, PodcastEpisodeRequestDTO request);
}
