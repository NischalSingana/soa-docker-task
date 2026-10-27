package com.klef.soa.docker.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpInputMessage;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;

import com.klef.soa.docker.configuration.GlobalExceptionHandler;
import com.klef.soa.docker.dto.PodcastEpisodeResponseDTO;
import com.klef.soa.docker.service.PodcastEpisodeService;

class PodcastEpisodeControllerTest {

    @Test
    void displayAllReturnsAnEmptyArrayForAnEmptyCatalog() throws Exception {
        PodcastEpisodeService service = mock(PodcastEpisodeService.class);
        when(service.displayAllEpisodes()).thenReturn(List.of());
        PodcastEpisodeController controller = new PodcastEpisodeController(service);

        ResponseEntity<List<PodcastEpisodeResponseDTO>> response = controller.displayAllEpisodes();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(List.of(), response.getBody());
    }

    @Test
    void unreadableRequestGetsAHelpfulClientError() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();

        ResponseEntity<Map<String, Object>> response = handler.handleUnreadableRequest(
                new HttpMessageNotReadableException("Malformed JSON", mock(HttpInputMessage.class)));

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Invalid Request Body", response.getBody().get("error"));
    }
}
