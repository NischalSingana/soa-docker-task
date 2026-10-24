package com.klef.soa.docker.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.klef.soa.docker.dto.PodcastEpisodeRequestDTO;
import com.klef.soa.docker.dto.PodcastEpisodeResponseDTO;
import com.klef.soa.docker.entity.PodcastEpisode;
import com.klef.soa.docker.repository.PodcastEpisodeRepository;
import com.klef.soa.docker.service.PodcastEpisodeService;

@Service
public class PodcastEpisodeServiceImpl implements PodcastEpisodeService {

    private final PodcastEpisodeRepository repository;

    public PodcastEpisodeServiceImpl(PodcastEpisodeRepository repository) {
        this.repository = repository;
    }

    @Override
    public PodcastEpisodeResponseDTO addEpisode(PodcastEpisodeRequestDTO request) {
        PodcastEpisode episode = new PodcastEpisode();
        episode.setId(null); // Ensure ID is automatically generated
        episode.setEpisodeTitle(request.getEpisodeTitle().trim());
        episode.setHostName(request.getHostName().trim());
        episode.setDurationMinutes(request.getDurationMinutes());
        episode.setReleaseDate(request.getReleaseDate().trim());

        PodcastEpisode saved = repository.save(episode);
        return PodcastEpisodeResponseDTO.fromEntity(saved);
    }

    @Override
    public PodcastEpisode addEpisodeEntity(PodcastEpisode episode) {
        episode.setId(null); // Force database/backend generated ID
        return repository.save(episode);
    }

    @Override
    public List<PodcastEpisodeResponseDTO> displayAllEpisodes() {
        return repository.findAll()
                .stream()
                .map(PodcastEpisodeResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public boolean deleteEpisode(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return true;
        }
        return false;
    }

    @Override
    public PodcastEpisodeResponseDTO getEpisodeById(Long id) {
        return repository.findById(id)
                .map(PodcastEpisodeResponseDTO::fromEntity)
                .orElse(null);
    }

    @Override
    public PodcastEpisodeResponseDTO updateEpisode(Long id, PodcastEpisodeRequestDTO request) {
        return repository.findById(id).map(ep -> {
            if (request.getEpisodeTitle() != null) ep.setEpisodeTitle(request.getEpisodeTitle().trim());
            if (request.getHostName() != null) ep.setHostName(request.getHostName().trim());
            if (request.getDurationMinutes() != null) ep.setDurationMinutes(request.getDurationMinutes());
            if (request.getReleaseDate() != null) ep.setReleaseDate(request.getReleaseDate().trim());
            PodcastEpisode updated = repository.save(ep);
            return PodcastEpisodeResponseDTO.fromEntity(updated);
        }).orElse(null);
    }
}
