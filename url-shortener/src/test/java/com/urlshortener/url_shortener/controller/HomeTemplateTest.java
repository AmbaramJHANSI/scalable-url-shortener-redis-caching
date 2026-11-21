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

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(HomeController.class)
class HomeTemplateTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UrlShortenerService urlShortenerService;

    @MockitoBean
    private QRCodeService qrCodeService;

    @Test
    void rendersTheShorteningForm() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Destination URL")))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Custom alias")));
    }

    @Test
    void shortensUrlAndRendersTheGeneratedQrCode() throws Exception {
        String originalUrl = "https://example.com/long/path";
        String shortUrl = "http://localhost/test123";
        ShortUrl url = new ShortUrl();
        url.setShortCode("test123");
        url.setOriginalUrl(originalUrl);
        url.setCreatedAt(LocalDateTime.now());
        url.setClickCount(0L);
        when(urlShortenerService.createShortUrl(originalUrl, "", null)).thenReturn(url);
        when(qrCodeService.generateQRCode(anyString()))
                .thenReturn(new QRCodeService().generateQRCode(shortUrl));

        mockMvc.perform(post("/shorten")
                        .param("url", originalUrl)
                        .param("customAlias", ""))
                .andExpect(status().isOk())
                .andExpect(content().string(org.hamcrest.Matchers.containsString(shortUrl)))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Download QR code")));
    }
}
