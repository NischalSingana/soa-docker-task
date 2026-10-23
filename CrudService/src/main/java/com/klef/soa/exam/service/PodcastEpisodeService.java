package com.klef.soa.exam.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.klef.soa.exam.entity.PodcastEpisode;
import com.klef.soa.exam.repository.PodcastEpisodeRepository;

@Service
public class PodcastEpisodeService {

private final PodcastEpisodeRepository repository;
public PodcastEpisodeService(PodcastEpisodeRepository repository) {
    this.repository = repository;
}
public PodcastEpisode addEpisode(PodcastEpisode episode) {
    return repository.save(episode);
}
public List<PodcastEpisode> displayAllEpisodes() {
    return repository.findAll();
}
public Optional<PodcastEpisode> getEpisodeById(Long id) {
    return repository.findById(id);
}
public PodcastEpisode updateEpisode(Long id, PodcastEpisode updated) {
    return repository.findById(id).map(ep -> {
        if (updated.getEpisodeTitle() != null) ep.setEpisodeTitle(updated.getEpisodeTitle());
        if (updated.getHostName() != null) ep.setHostName(updated.getHostName());
        if (updated.getDurationMinutes() != null) ep.setDurationMinutes(updated.getDurationMinutes());
        if (updated.getReleaseDate() != null) ep.setReleaseDate(updated.getReleaseDate());
        return repository.save(ep);
    }).orElse(null);
}
public boolean deleteEpisode(Long id) {
    if (repository.existsById(id)) {
        repository.deleteById(id);
        return true;
    }
    return false;
}

}