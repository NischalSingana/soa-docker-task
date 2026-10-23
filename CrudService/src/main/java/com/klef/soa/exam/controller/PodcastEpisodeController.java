package com.klef.soa.exam.controller;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.klef.soa.exam.entity.PodcastEpisode;
import com.klef.soa.exam.service.PodcastEpisodeService;

@RestController
@CrossOrigin(origins = "*")
public class PodcastEpisodeController 
{

private final PodcastEpisodeService service;
public PodcastEpisodeController(PodcastEpisodeService service) 
{
    this.service = service;
}

@GetMapping("/")
public String home() {
    return "Podcast Epsidode Crud Service";
}
@PostMapping("/Add")
public ResponseEntity<String> addEpisode(
        @RequestBody PodcastEpisode episode) 
{
    episode.setId(null);
    PodcastEpisode savedEpisode = service.addEpisode(episode);
    return ResponseEntity.status(201)
            .body("Podcast Episode Added Successfully. ID: "
                    + savedEpisode.getId());
}
@GetMapping("/DisplayAll")
public ResponseEntity<?> displayAllEpisodes() 
{
    List<PodcastEpisode> episodes = service.displayAllEpisodes();
    if (episodes.size() > 0) {
        return ResponseEntity.ok(episodes);
    } else {
        return ResponseEntity.status(404)
                .body("Podcast Episode Data Not Found");
    }
}
@GetMapping("/Get/{id}")
public ResponseEntity<?> getEpisodeById(@PathVariable Long id) {
    return service.getEpisodeById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.status(404).body(null));
}
@PutMapping("/Update/{id}")
public ResponseEntity<?> updateEpisode(
        @PathVariable Long id,
        @RequestBody PodcastEpisode episode) {
    PodcastEpisode updated = service.updateEpisode(id, episode);
    if (updated != null) {
        return ResponseEntity.ok(updated);
    } else {
        return ResponseEntity.status(404).body("Podcast Episode Not Found");
    }
}
@DeleteMapping("/Delete/{id}")
public ResponseEntity<String> deleteEpisode
(
        @PathVariable Long id) {
    boolean deleted = service.deleteEpisode(id);
    if (deleted) {
        return ResponseEntity.ok(
                "Podcast Episode Deleted Successfully");
    } 
    
    else 
    {
        return ResponseEntity.status(404)
                .body("Podcast Episode Not Found");
    }
}

}