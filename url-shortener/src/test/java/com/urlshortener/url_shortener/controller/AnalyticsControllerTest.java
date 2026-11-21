package com.urlshortener.url_shortener.controller;

import com.urlshortener.url_shortener.entity.ShortUrl;
import com.urlshortener.url_shortener.service.QRCodeService;
import com.urlshortener.url_shortener.service.UrlShortenerService;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Base64;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup;

class AnalyticsControllerTest {

    @Test
    void qrEndpointReturnsGeneratedPngForTheSelectedShortLink() throws Exception {
        UrlShortenerService urlShortenerService = mock(UrlShortenerService.class);
        QRCodeService qrCodeService = mock(QRCodeService.class);
        String expectedShortUrl = "http://localhost/abc123";
        String qrImage = new QRCodeService().generateQRCode(expectedShortUrl);
        when(urlShortenerService.getAnalytics("abc123")).thenReturn(new ShortUrl());
        when(qrCodeService.generateQRCode(anyString())).thenReturn(qrImage);
        MockMvc mockMvc = standaloneSetup(
                new AnalyticsController(urlShortenerService, qrCodeService)
        ).build();

        MockHttpServletResponse response = mockMvc.perform(get("/dashboard/qr/abc123"))
                .andReturn()
                .getResponse();

        assertEquals(200, response.getStatus());
        assertEquals(MediaType.IMAGE_PNG_VALUE, response.getContentType());
        assertArrayEquals(Base64.getDecoder().decode(qrImage), response.getContentAsByteArray());
        verify(qrCodeService).generateQRCode(expectedShortUrl);
    }
}
