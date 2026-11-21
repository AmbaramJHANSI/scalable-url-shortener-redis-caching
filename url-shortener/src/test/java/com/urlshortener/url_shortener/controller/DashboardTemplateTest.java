package com.urlshortener.url_shortener.controller;

import com.urlshortener.url_shortener.entity.ShortUrl;
import com.urlshortener.url_shortener.service.QRCodeService;
import com.urlshortener.url_shortener.service.UrlShortenerService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AnalyticsController.class)
class DashboardTemplateTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UrlShortenerService urlShortenerService;

    @MockitoBean
    private QRCodeService qrCodeService;

    @Test
    void rendersLinkRowsAndDatabaseBackedAnalytics() throws Exception {
        ShortUrl url = new ShortUrl();
        url.setShortCode("test123");
        url.setOriginalUrl("https://example.com/path");
        url.setCreatedAt(LocalDateTime.now());
        url.setExpiresAt(LocalDateTime.now().plusDays(1));
        url.setClickCount(3L);
        when(urlShortenerService.getTotalUrls()).thenReturn(1L);
        when(urlShortenerService.getTotalClicks()).thenReturn(3L);
        when(urlShortenerService.getActiveUrls()).thenReturn(1L);
        when(urlShortenerService.getExpiredUrls()).thenReturn(0L);
        when(urlShortenerService.getTopUrls()).thenReturn(List.of(url));
        when(urlShortenerService.getAllUrls()).thenReturn(List.of(url));

        mockMvc.perform(get("/dashboard"))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("test123")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("http://localhost/test123")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("data-active=\"1\"")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("3.0")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Clicks per URL")));
    }
}
