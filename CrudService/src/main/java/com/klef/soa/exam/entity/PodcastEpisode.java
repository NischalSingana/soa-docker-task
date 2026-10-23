package com.klef.soa.exam.entity;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity

public class PodcastEpisode {
	

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
private String episodeTitle;
private String hostName;
private Integer durationMinutes;
private String releaseDate;
public PodcastEpisode() {
}
public Long getId() 
{
  return id;
}
public void setId(Long id) 
{
    this.id = id;
}
public String getEpisodeTitle() 

{
	
  return episodeTitle;
}
public void setEpisodeTitle(String episodeTitle) 
{
	
    this.episodeTitle = episodeTitle;
}
public String getHostName() 
{
	
    return hostName;
}
public void setHostName(String hostName) 
{
	
    this.hostName = hostName;
}
public Integer getDurationMinutes() 
{
    return durationMinutes;
}
public void setDurationMinutes(Integer durationMinutes) 
{
    this.durationMinutes = durationMinutes;
}
public String getReleaseDate() 
{
    return releaseDate;
}
public void setReleaseDate(String releaseDate) 
{
    this.releaseDate = releaseDate;
}

@Override
public String toString() {
    return "PodcastEpisode [id=" + id
            + ", episodeTitle=" + episodeTitle
            + ", hostName=" + hostName
            + ", durationMinutes=" + durationMinutes
            + ", releaseDate=" + releaseDate + "]";
}


}