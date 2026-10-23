package com.klef.soa.exam.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.klef.soa.exam.entity.PodcastEpisode;

public interface PodcastEpisodeRepository
extends JpaRepository<PodcastEpisode, Long> {

}